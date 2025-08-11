import React, { useState, useEffect, useMemo, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Star, TrendingUp, Heart, Shuffle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { OptimizedImage } from "./OptimizedImage";

interface RecommendationItem {
  id: string;
  title: string;
  image_url?: string;
  score?: number;
  popularity?: number;
  content_type: string;
  reason: string;
  genres?: string[];
}

interface RecommendationEngineProps {
  userId?: string;
  contentType?: 'anime' | 'manga' | 'all';
  basedOnTitle?: {
    id: string;
    title: string;
    genres?: string[];
    studios?: string[];
  };
  limit?: number;
  onItemClick?: (item: RecommendationItem) => void;
}

export const RecommendationEngine = React.memo(({ 
  userId, 
  contentType = 'all', 
  basedOnTitle, 
  limit = 6,
  onItemClick 
}: RecommendationEngineProps) => {
  const [recommendations, setRecommendations] = useState<RecommendationItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [recommendationType, setRecommendationType] = useState<'popular' | 'similar' | 'trending' | 'mixed'>('mixed');

  // Memoize recommendation generation
  const generateRecommendations = useCallback(async () => {
    setIsLoading(true);
    
    try {
      let results: RecommendationItem[] = [];

      switch (recommendationType) {
        case 'popular':
          results = await getPopularRecommendations();
          break;
        case 'similar':
          results = await getSimilarRecommendations();
          break;
        case 'trending':
          results = await getTrendingRecommendations();
          break;
        default:
          results = await getMixedRecommendations();
      }

      setRecommendations(results.slice(0, limit));
    } catch (error) {
      console.error('Error generating recommendations:', error);
    } finally {
      setIsLoading(false);
    }
  }, [recommendationType, limit]);

  // Get popular recommendations
  const getPopularRecommendations = async (): Promise<RecommendationItem[]> => {
    const query = supabase
      .from('titles')
      .select('id, title, image_url, score, popularity, content_type')
      .order('popularity', { ascending: false })
      .limit(limit * 2);

    if (contentType !== 'all') {
      query.eq('content_type', contentType);
    }

    const { data } = await query;

    return data?.map(item => ({
      ...item,
      reason: 'Popular with community',
      genres: []
    })) || [];
  };

  // Get similar recommendations based on a title
  const getSimilarRecommendations = async (): Promise<RecommendationItem[]> => {
    if (!basedOnTitle) return getPopularRecommendations();

    // Find titles with similar genres
    const { data: baseGenres } = await supabase
      .from('title_genres')
      .select('genre_id')
      .eq('title_id', basedOnTitle.id);

    if (!baseGenres || baseGenres.length === 0) {
      return getPopularRecommendations();
    }

    const genreIds = baseGenres.map(g => g.genre_id);

    // Find other titles with similar genres
    const { data: similarTitles } = await supabase
      .from('title_genres')
      .select(`
        title_id,
        titles!inner(id, title, image_url, score, popularity, content_type)
      `)
      .in('genre_id', genreIds)
      .neq('title_id', basedOnTitle.id)
      .limit(limit * 3);

    // Count genre matches for scoring
    const titleScores = new Map<string, number>();
    similarTitles?.forEach(item => {
      const titleId = item.titles.id;
      titleScores.set(titleId, (titleScores.get(titleId) || 0) + 1);
    });

    // Get unique titles and sort by similarity score
    const uniqueTitles = Array.from(new Map(
      similarTitles?.map(item => [item.titles.id, item.titles]) || []
    ).values());

    return uniqueTitles
      .sort((a, b) => (titleScores.get(b.id) || 0) - (titleScores.get(a.id) || 0))
      .map(title => ({
        ...title,
        reason: `Similar to ${basedOnTitle.title}`,
        genres: []
      }));
  };

  // Get trending recommendations
  const getTrendingRecommendations = async (): Promise<RecommendationItem[]> => {
    // For now, use recent high-scoring titles as "trending"
    const query = supabase
      .from('titles')
      .select('id, title, image_url, score, popularity, content_type')
      .gte('score', 7)
      .order('updated_at', { ascending: false })
      .limit(limit * 2);

    if (contentType !== 'all') {
      query.eq('content_type', contentType);
    }

    const { data } = await query;

    return data?.map(item => ({
      ...item,
      reason: 'Currently trending',
      genres: []
    })) || [];
  };

  // Get mixed recommendations
  const getMixedRecommendations = async (): Promise<RecommendationItem[]> => {
    const [popular, similar, trending] = await Promise.all([
      getPopularRecommendations().then(items => items.slice(0, 2)),
      getSimilarRecommendations().then(items => items.slice(0, 2)),
      getTrendingRecommendations().then(items => items.slice(0, 2))
    ]);

    return [...popular, ...similar, ...trending].slice(0, limit);
  };

  useEffect(() => {
    generateRecommendations();
  }, [recommendationType, contentType, basedOnTitle]);

  // Memoize type icon rendering
  const getTypeIcon = useCallback((type: typeof recommendationType) => {
    switch (type) {
      case 'popular': return <Star className="w-4 h-4" />;
      case 'similar': return <Heart className="w-4 h-4" />;
      case 'trending': return <TrendingUp className="w-4 h-4" />;
      default: return <Sparkles className="w-4 h-4" />;
    }
  }, []);

  // Memoize type label rendering
  const getTypeLabel = useCallback((type: typeof recommendationType) => {
    switch (type) {
      case 'popular': return 'Popular';
      case 'similar': return 'Similar';
      case 'trending': return 'Trending';
      default: return 'Mixed';
    }
  }, []);

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5" />
            Recommendations
            {basedOnTitle && (
              <span className="text-sm font-normal text-muted-foreground">
                based on {basedOnTitle.title}
              </span>
            )}
          </CardTitle>
          
          <div className="flex gap-1">
            {(['popular', 'similar', 'trending', 'mixed'] as const).map((type) => (
              <Button
                key={type}
                variant={recommendationType === type ? "default" : "outline"}
                size="sm"
                onClick={() => setRecommendationType(type)}
                className="text-xs"
              >
                {getTypeIcon(type)}
                <span className="ml-1 hidden sm:inline">
                  {getTypeLabel(type)}
                </span>
              </Button>
            ))}
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: limit }).map((_, i) => (
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {recommendations.map((item) => (
              <Card 
                key={item.id}
                className="group hover:shadow-lg transition-all cursor-pointer"
                onClick={() => onItemClick?.(item)}
              >
                <div className="aspect-[3/4] relative overflow-hidden rounded-t-lg">
                  <OptimizedImage
                    src={item.image_url || ''}
                    alt={item.title}
                    className="w-full h-full group-hover:scale-105 transition-transform duration-300"
                  />
                  
                  {item.score && (
                    <Badge 
                      className="absolute top-2 left-2 bg-black/80 text-white"
                    >
                      <Star className="w-3 h-3 mr-1" />
                      {item.score.toFixed(1)}
                    </Badge>
                  )}
                </div>
                
                <CardContent className="p-3">
                  <h4 className="font-medium text-sm line-clamp-2 mb-1">
                    {item.title}
                  </h4>
                  
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>{item.reason}</span>
                    <Badge variant="outline" className="text-xs">
                      {item.content_type}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <Sparkles className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">
              No recommendations available
            </p>
            <Button
              variant="outline"
              size="sm"
              className="mt-2"
              onClick={() => setRecommendationType('popular')}
            >
              <Shuffle className="w-4 h-4 mr-2" />
              Try Popular
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
});
