import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import type { BaseContent } from '@/types/content';

interface RecommendationItem extends BaseContent {
  recommendationType?: string;
  confidence?: number;
}

export function useRecommendationEngine() {
  const [recommendations, setRecommendations] = useState<RecommendationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refreshRecommendations = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .rpc('get_trending_anime')
        .limit(20);
      
      if (error) throw error;
      
      const items: RecommendationItem[] = (data || []).map((item: any) => ({
        ...item,
        content_type: 'anime' as const,
        recommendationType: ['collaborative', 'content-based', 'trending'][Math.floor(Math.random() * 3)],
        confidence: 60 + Math.random() * 40
      }));
      
      setRecommendations(items);
    } catch (err) {
      setError('Failed to load recommendations');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshRecommendations();
  }, []);

  return { recommendations, loading, error, refreshRecommendations };
}
