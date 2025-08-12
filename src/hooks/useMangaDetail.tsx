import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { logger } from '@/utils/logger';
interface MangaDetail {
  // Title fields
  id: string;
  anilist_id: number;
  title: string;
  title_english?: string;
  title_japanese?: string;
  synopsis: string; // Required to match Manga type
  image_url: string; // Required to match Manga type
  score?: number;
  anilist_score?: number;
  rank?: number;
  popularity?: number;
  year?: number;
  num_users_voted?: number;
  color_theme?: string;
  created_at: string;
  updated_at: string;
  // Manga detail fields
  chapters?: number;
  volumes?: number;
  published_from?: string;
  published_to?: string;
  status: string;
  type: string;
  next_chapter_date?: string;
  next_chapter_number?: number;
  last_sync_check: string;
  // Related data arrays
  genres?: Array<{ id: string; name: string; type?: string; created_at?: string }>;
  authors?: Array<{ id: string; name: string; created_at?: string }>;
  // Consolidated data from edge function
  recommendations?: any[];
  streaming_availability?: any;
  user_list_status?: any;
  related_titles?: any[];
}
interface UseMangaDetailResult {
  manga: MangaDetail | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}
export const useMangaDetail = (mangaId: string): UseMangaDetailResult => {
  const { user } = useAuth();
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['manga-detail-consolidated', mangaId, user?.id],
    queryFn: async () => {
      if (!mangaId) {
        throw new Error('Manga ID is required');
      }
      logger.debug(`🚀 Fetching consolidated manga details for: ${mangaId}`);
      const { data, error } = await supabase.functions.invoke('get-content-details', {
        body: {
          contentId: mangaId,
          contentType: 'manga',
          includeRecommendations: true
        }
      });
      if (error) {
        logger.debug('❌ Consolidated manga detail error:', error);
        throw new Error(error.message || 'Failed to fetch manga details');
      }
      const payload = data?.data || data;
      if (!payload) {
        logger.debug('⚠️ No manga found for ID:', mangaId);
        throw new Error('Manga not found');
      }
      // Transform the data to match the expected interface
      const transformedData: MangaDetail = {
        // Title fields
        id: payload.id,
        anilist_id: payload.anilist_id,
        title: payload.title,
        title_english: payload.title_english,
        title_japanese: payload.title_japanese,
        synopsis: payload.synopsis || '',
        image_url: payload.image_url || '',
        score: payload.score,
        anilist_score: payload.anilist_score,
        rank: payload.rank,
        popularity: payload.popularity,
        year: payload.year,
        color_theme: payload.color_theme,
        num_users_voted: 0,
        created_at: payload.created_at,
        updated_at: payload.updated_at,
        // Manga detail fields (from manga_details join)
        chapters: payload.manga_details?.[0]?.chapters,
        volumes: payload.manga_details?.[0]?.volumes,
        published_from: payload.manga_details?.[0]?.published_from,
        published_to: payload.manga_details?.[0]?.published_to,
        status: payload.manga_details?.[0]?.status || 'Unknown',
        type: payload.manga_details?.[0]?.type || 'Manga',
        next_chapter_date: payload.manga_details?.[0]?.next_chapter_date,
        next_chapter_number: payload.manga_details?.[0]?.next_chapter_number,
        last_sync_check: payload.manga_details?.[0]?.last_sync_check,
        // Extract genres and authors
        genres: payload.title_genres?.map((tg: any) => tg.genres).filter(Boolean) || [],
        authors: payload.title_authors?.map((ta: any) => ta.authors).filter(Boolean) || [],
        // Add consolidated data from edge function
        recommendations: payload.recommendations || [],
        streaming_availability: null,
        user_list_status: payload.user_list_status,
        related_titles: payload.related_titles || []
      };
      logger.debug('✅ Successfully transformed consolidated manga:', transformedData.title);
      return transformedData;
    },
    enabled: !!mangaId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    retry: 2
  });
  return {
    manga: data || null,
    loading: isLoading,
    error: error?.message || null,
    refetch
  };
};