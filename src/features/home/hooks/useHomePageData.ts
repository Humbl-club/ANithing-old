import { useQuery } from '@tanstack/react-query';
import { dataService } from '@/core/services/DataService';
import { logger } from '@/utils/logger';
/**
 * Updated home page data hook using the unified DataService
 * This replaces the old useHomePageData hook
*/
export function useHomePageData() {
  const { 
    data, 
    isLoading, 
    error,
    refetch
  } = useQuery({
    queryKey: ['home-sections-v2'],
    queryFn: async () => {
      try {
        const sections = await dataService.getHomeSections();
        logger.debug('🏠 Homepage sections loaded:', {
          trendingAnime: sections.trendingAnime.length,
          recentAnime: sections.recentAnime.length,
          trendingManga: sections.trendingManga.length,
          recentManga: sections.recentManga.length
        });
        return sections;
      } catch (error) {
        logger.error('Failed to load home sections:', error);
        throw error;
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    retry: 2
  });
  return {
    sections: data || {
      trendingAnime: [],
      recentAnime: [],
      trendingManga: [],
      recentManga: []
    },
    isLoading,
    error: error as Error | null,
    refetch
  };
}