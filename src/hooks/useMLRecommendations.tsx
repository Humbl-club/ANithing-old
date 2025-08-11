import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { AnimeMLEngine } from "@/utils/ml-engine";
import type { MLRecommendation } from "@/types/ml";

export function useMLRecommendations() {
  const [isLoading, setIsLoading] = useState(false);
  const [userAnalytics, setUserAnalytics] = useState<any>(null);

  // Client-side ML processing
  const processClientSideML = useCallback(async (userId: string): Promise<MLRecommendation[]> => {
    try {
      // Get user's rating history
      const { data: userRatings } = await supabase
        .from('reviews')
        .select('title_id, rating, created_at')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (!userRatings || userRatings.length < 3) {
        return []; // Need minimum ratings for ML
      }

      // Analyze user patterns
      const patterns = AnimeMLEngine.analyzeViewingPatterns(userRatings);
      setUserAnalytics(patterns);

      // Get similar users (simplified for client-side)
      const { data: allRatings } = await supabase
        .from('reviews')
        .select('user_id, title_id, rating')
        .neq('user_id', userId)
        .limit(1000); // Limit for performance

      if (!allRatings) return [];

      // Calculate user similarities
      const userRatingsMap = new Map(userRatings.map(r => [r.title_id, r.rating]));
      const otherUsersRatings = new Map<string, Map<string, number>>();
      
      allRatings.forEach(rating => {
        if (!otherUsersRatings.has(rating.user_id)) {
          otherUsersRatings.set(rating.user_id, new Map());
        }
        otherUsersRatings.get(rating.user_id)!.set(rating.title_id, rating.rating);
      });

      // Find top similar users
      const similarUsers: Array<{userId: string, similarity: number, ratings: Map<string, number>}> = [];
      
      otherUsersRatings.forEach((otherRatings, otherUserId) => {
        const commonTitles = Array.from(userRatingsMap.keys()).filter(titleId => 
          otherRatings.has(titleId)
        );
        
        if (commonTitles.length >= 3) {
          const userVector = commonTitles.map(titleId => userRatingsMap.get(titleId)!);
          const otherVector = commonTitles.map(titleId => otherRatings.get(titleId)!);
          const similarity = AnimeMLEngine.cosineSimilarity(userVector, otherVector);
          
          if (similarity > 0.3) {
            similarUsers.push({ userId: otherUserId, similarity, ratings: otherRatings });
          }
        }
      });

      similarUsers.sort((a, b) => b.similarity - a.similarity);

      // Get unrated titles
      const { data: unratedTitles } = await supabase
        .from('titles')
        .select('id, title, image_url, content_type, score')
        .not('id', 'in', `(${Array.from(userRatingsMap.keys()).join(',') || 'NULL'})`)
        .gte('score', 6.0)
        .limit(100);

      if (!unratedTitles) return [];

      // Predict ratings for unrated titles
      const predictions: MLRecommendation[] = unratedTitles.map(title => {
        const predictedRating = AnimeMLEngine.predictRating(
          userRatingsMap,
          similarUsers.slice(0, 10),
          title.id
        );

        const confidence = Math.min(
          similarUsers.filter(u => u.ratings.has(title.id)).length / 5,
          1.0
        );

        return {
          title_id: title.id,
          title: title.title,
          image_url: title.image_url,
          content_type: title.content_type,
          original_score: title.score,
          ml_score: predictedRating * confidence + (title.score || 0) / 10 * (1 - confidence),
          recommendation_type: 'client_ml',
          reason: `Predicted ${predictedRating.toFixed(1)}★ based on ${similarUsers.length} similar users`,
          confidence
        };
      }).filter(pred => pred.ml_score > 3.0)
        .sort((a, b) => b.ml_score - a.ml_score)
        .slice(0, 20);

      return predictions;

    } catch (error) {
      console.error('Client-side ML error:', error);
      return [];
    }
  }, []);

  // Database ML processing
  const processServerSideML = useCallback(async (userId: string): Promise<MLRecommendation[]> => {
    try {
      const { data, error } = await supabase.rpc('get_smart_recommendations', {
        target_user_id: userId,
        limit_count: 20,
        include_diverse: true,
        include_seasonal: true
      });

      if (error) {
        console.error('Database ML error:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Server-side ML error:', error);
      return [];
    }
  }, []);

  // Hybrid processing (combines both)
  const processHybridML = useCallback(async (userId: string): Promise<MLRecommendation[]> => {
    try {
      const [serverRecs, clientRecs] = await Promise.all([
        processServerSideML(userId),
        processClientSideML(userId)
      ]);

      // Merge and deduplicate
      const seenTitles = new Set();
      const hybridRecs: MLRecommendation[] = [];

      // Prioritize server recommendations (more sophisticated)
      serverRecs.forEach(rec => {
        if (!seenTitles.has(rec.title_id)) {
          hybridRecs.push(rec);
          seenTitles.add(rec.title_id);
        }
      });

      // Add unique client recommendations
      clientRecs.forEach(rec => {
        if (!seenTitles.has(rec.title_id) && hybridRecs.length < 20) {
          hybridRecs.push({
            ...rec,
            recommendation_type: 'hybrid'
          });
          seenTitles.add(rec.title_id);
        }
      });

      return hybridRecs;
    } catch (error) {
      console.error('Hybrid ML error:', error);
      return [];
    }
  }, [processServerSideML, processClientSideML]);

  return {
    isLoading,
    setIsLoading,
    userAnalytics,
    processClientSideML,
    processServerSideML,
    processHybridML
  };
}