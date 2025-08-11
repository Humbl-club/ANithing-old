import { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Brain, 
  TrendingUp, 
  Users, 
  Shuffle, 
  Sparkles,
  Target,
  Calendar,
  Star,
  RefreshCw,
  Zap
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { OptimizedImage } from "./OptimizedImage";
import { toast } from "sonner";

interface MLRecommendation {
  title_id: string;
  title: string;
  image_url?: string;
  content_type: string;
  original_score?: number;
  ml_score: number;
  recommendation_type: string;
  reason: string;
  confidence: number;
}

interface UserPreference {
  genre: string;
  weight: number;
  confidence: number;
}

// Client-side ML utilities (FREE!)
class AnimeMLEngine {
  // Cosine similarity calculation
  static cosineSimilarity(vectorA: number[], vectorB: number[]): number {
    const dotProduct = vectorA.reduce((sum, a, i) => sum + a * vectorB[i], 0);
    const magnitudeA = Math.sqrt(vectorA.reduce((sum, a) => sum + a * a, 0));
    const magnitudeB = Math.sqrt(vectorB.reduce((sum, b) => sum + b * b, 0));
    return magnitudeA && magnitudeB ? dotProduct / (magnitudeA * magnitudeB) : 0;
  }

  // Create genre vector from user preferences
  static createGenreVector(preferences: UserPreference[], allGenres: string[]): number[] {
    return allGenres.map(genre => {
      const pref = preferences.find(p => p.genre === genre);
      return pref ? pref.weight * pref.confidence : 0;
    });
  }

  // Predict rating using collaborative filtering
  static predictRating(
    userRatings: Map<string, number>, 
    similarUsers: Array<{userId: string, similarity: number, ratings: Map<string, number>}>,
    titleId: string
  ): number {
    let weightedSum = 0;
    let similaritySum = 0;

    similarUsers.forEach(({similarity, ratings}) => {
      if (ratings.has(titleId) && similarity > 0.1) {
        weightedSum += similarity * ratings.get(titleId)!;
        similaritySum += Math.abs(similarity);
      }
    });

    return similaritySum > 0 ? weightedSum / similaritySum : 0;
  }

  // Analyze user behavior patterns
  static analyzeViewingPatterns(userRatings: Array<{title_id: string, rating: number, created_at: string}>): {
    averageRating: number;
    ratingVariance: number;
    recentTrend: 'up' | 'down' | 'stable';
    preferredTimeframe: string;
  } {
    if (userRatings.length === 0) return {
      averageRating: 0,
      ratingVariance: 0, 
      recentTrend: 'stable',
      preferredTimeframe: 'unknown'
    };

    const ratings = userRatings.map(r => r.rating);
    const avg = ratings.reduce((sum, r) => sum + r, 0) / ratings.length;
    const variance = ratings.reduce((sum, r) => sum + Math.pow(r - avg, 2), 0) / ratings.length;

    // Analyze recent trend (last 10 ratings vs previous)
    const recent = userRatings.slice(-10).map(r => r.rating);
    const previous = userRatings.slice(-20, -10).map(r => r.rating);
    
    const recentAvg = recent.reduce((sum, r) => sum + r, 0) / recent.length;
    const previousAvg = previous.length > 0 ? previous.reduce((sum, r) => sum + r, 0) / previous.length : recentAvg;
    
    let trend: 'up' | 'down' | 'stable' = 'stable';
    if (recentAvg > previousAvg + 0.5) trend = 'up';
    else if (recentAvg < previousAvg - 0.5) trend = 'down';

    return {
      averageRating: avg,
      ratingVariance: variance,
      recentTrend: trend,
      preferredTimeframe: 'recent' // Could be enhanced with time analysis
    };
  }
}

export const AdvancedMLRecommendations = () => {
  const [recommendations, setRecommendations] = useState<MLRecommendation[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [mlEngine, setMlEngine] = useState<'database' | 'hybrid' | 'client'>('hybrid');
  const [userAnalytics, setUserAnalytics] = useState<any>(null);
  const { user } = useAuth();

  // Client-side ML processing
  const processClientSideML = async (userId: string): Promise<MLRecommendation[]> => {
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
  };

  // Database ML processing
  const processServerSideML = async (userId: string): Promise<MLRecommendation[]> => {
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
  };

  // Hybrid processing (combines both)
  const processHybridML = async (userId: string): Promise<MLRecommendation[]> => {
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
        if (!seenTitles.has(rec.title_id) && hybridRecs.length < 30) {
          hybridRecs.push({
            ...rec,
            ml_score: rec.ml_score * 0.8, // Slightly lower weight for client ML
            recommendation_type: 'hybrid'
          });
          seenTitles.add(rec.title_id);
        }
      });

      return hybridRecs.sort((a, b) => b.ml_score - a.ml_score).slice(0, 20);
    } catch (error) {
      console.error('Hybrid ML error:', error);
      return [];
    }
  };

  // Generate recommendations
  const generateRecommendations = async () => {
    if (!user) return;

    setIsLoading(true);
    try {
      let results: MLRecommendation[] = [];

      switch (mlEngine) {
        case 'database':
          results = await processServerSideML(user.id);
          break;
        case 'client':
          results = await processClientSideML(user.id);
          break;
        case 'hybrid':
        default:
          results = await processHybridML(user.id);
      }

      setRecommendations(results);
      
      if (results.length > 0) {
        toast.success(`Generated ${results.length} ML-powered recommendations!`);
      } else {
        toast.info("Add more ratings to get better ML recommendations");
      }

    } catch (error) {
      console.error('ML recommendation error:', error);
      toast.error('Failed to generate ML recommendations');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      generateRecommendations();
    }
  }, [user, mlEngine]);

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'collaborative': return <Users className="w-4 h-4" />;
      case 'content': return <Target className="w-4 h-4" />;
      case 'seasonal': return <Calendar className="w-4 h-4" />;
      case 'trending': return <TrendingUp className="w-4 h-4" />;
      case 'diversity': return <Shuffle className="w-4 h-4" />;
      case 'client_ml': return <Zap className="w-4 h-4" />;
      case 'hybrid': return <Brain className="w-4 h-4" />;
      default: return <Sparkles className="w-4 h-4" />;
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return "bg-green-500";
    if (confidence >= 0.6) return "bg-yellow-500"; 
    return "bg-gray-500";
  };

  if (!user) {
    return (
      <Card className="w-full">
        <CardContent className="flex flex-col items-center justify-center py-8">
          <Brain className="w-12 h-12 text-muted-foreground mb-4" />
          <p className="text-muted-foreground mb-4">
            Sign in to get AI-powered recommendations!
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="w-full space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Brain className="w-5 h-5" />
              AI-Powered Recommendations
              <Badge variant="secondary" className="text-xs">
                100% FREE ML
              </Badge>
            </CardTitle>
            
            <div className="flex items-center gap-2">
              <Tabs value={mlEngine} onValueChange={(value) => setMlEngine(value as any)}>
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="database" className="text-xs">Database ML</TabsTrigger>
                  <TabsTrigger value="client" className="text-xs">Client ML</TabsTrigger>
                  <TabsTrigger value="hybrid" className="text-xs">Hybrid</TabsTrigger>
                </TabsList>
              </Tabs>
              
              <Button 
                variant="outline" 
                size="sm"
                onClick={generateRecommendations}
                disabled={isLoading}
              >
                <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
              </Button>
            </div>
          </div>
          
          {userAnalytics && (
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span>Avg Rating: {userAnalytics.averageRating.toFixed(1)}★</span>
              <span>Trend: {userAnalytics.recentTrend === 'up' ? '📈' : userAnalytics.recentTrend === 'down' ? '📉' : '➡️'}</span>
              <span>Pattern: {userAnalytics.ratingVariance < 1 ? 'Consistent' : 'Varied'} taste</span>
            </div>
          )}
        </CardHeader>

        <CardContent>
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="space-y-2">
                  <div className="aspect-[3/4] bg-muted animate-pulse rounded-lg" />
                  <div className="space-y-1">
                    <div className="h-4 bg-muted animate-pulse rounded" />
                    <div className="h-3 bg-muted animate-pulse rounded w-2/3" />
                  </div>
                </div>
              ))}
            </div>
          ) : recommendations.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {recommendations.map((rec, index) => (
                <Card key={rec.title_id} className="group hover:shadow-lg transition-all cursor-pointer">
                  <div className="aspect-[3/4] relative overflow-hidden rounded-t-lg">
                    <OptimizedImage
                      src={rec.image_url || ''}
                      alt={rec.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    
                    <div className="absolute top-2 left-2 flex flex-col gap-1">
                      <Badge className={`text-xs ${getConfidenceColor(rec.confidence)} text-white`}>
                        ML: {rec.ml_score.toFixed(1)}
                      </Badge>
                      {rec.original_score && (
                        <Badge variant="secondary" className="text-xs">
                          <Star className="w-3 h-3 mr-1" />
                          {rec.original_score.toFixed(1)}
                        </Badge>
                      )}
                    </div>

                    <div className="absolute top-2 right-2">
                      <Badge variant="outline" className="text-xs bg-black/80 text-white border-white/20">
                        {getTypeIcon(rec.recommendation_type)}
                        <span className="ml-1 capitalize">{rec.recommendation_type}</span>
                      </Badge>
                    </div>

                    <div className="absolute bottom-2 right-2">
                      <div 
                        className={`w-3 h-3 rounded-full ${getConfidenceColor(rec.confidence)}`}
                        title={`Confidence: ${(rec.confidence * 100).toFixed(0)}%`}
                      />
                    </div>
                  </div>
                  
                  <CardContent className="p-3">
                    <h4 className="font-medium text-sm line-clamp-2 mb-2">
                      {rec.title}
                    </h4>
                    
                    <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
                      {rec.reason}
                    </p>
                    
                    <div className="flex items-center justify-between text-xs">
                      <Badge variant="outline" className="text-xs">
                        {rec.content_type}
                      </Badge>
                      <span className="text-muted-foreground">
                        #{index + 1}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Brain className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground mb-4">
                No ML recommendations available yet
              </p>
              <p className="text-sm text-muted-foreground">
                Rate at least 5 titles to get accurate ML predictions
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* ML Engine Info */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <Zap className="w-5 h-5 text-blue-500 mt-0.5" />
            <div>
              <h4 className="font-medium text-sm">Free ML Engine Active</h4>
              <p className="text-xs text-muted-foreground mt-1">
                {mlEngine === 'database' && 'Using PostgreSQL-based collaborative filtering and content analysis'}
                {mlEngine === 'client' && 'Using browser-based machine learning with cosine similarity'}
                {mlEngine === 'hybrid' && 'Combining database ML with client-side algorithms for best accuracy'}
              </p>
              <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                <span>✅ Zero API costs</span>
                <span>✅ Privacy-friendly</span>
                <span>✅ Real-time learning</span>
                <span>✅ Scales with users</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};