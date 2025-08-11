import { supabase } from '@/lib/supabaseClient';
import type { RecommendationItem, SmartRecommendation } from '@/types/recommendations';

export const recommendationService = {
  recommendations: [] as SmartRecommendation[],
  loading: false,
  error: null as string | null,
  userProfile: null as any,

  async refreshRecommendations() {
    this.loading = true;
    try {
      // Fetch recommendations logic
      const { data, error } = await supabase
        .rpc('get_trending_anime')
        .limit(10);
      
      if (error) throw error;
      
      this.recommendations = (data || []).map((item: any) => ({
        ...item,
        content_type: 'anime' as const,
        confidence: Math.random() * 100
      }));
    } catch (error) {
      this.error = 'Failed to fetch recommendations';
      console.error('Error fetching recommendations:', error);
    } finally {
      this.loading = false;
    }
  },

  dismissRecommendation(id: number) {
    this.recommendations = this.recommendations.filter(r => r.id !== id);
  }
};

export function useSmartRecommendations() {
  return recommendationService;
}
