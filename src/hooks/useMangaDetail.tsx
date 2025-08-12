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
      const payload = (data && 'data' in (data as any)) ? (data as any).data : data;
      if (!payload?.content) {
        logger.debug('⚠️ No manga found for ID:', mangaId);
        throw new Error('Manga not found');
      }
      // Transform the data to match the expected interface
      const transformedData: MangaDetail = {
        // Title fields
        id: payload.content.id,
        anilist_id: payload.content.anilist_id,
        title: payload.content.title,
        title_english: payload.content.title_english,
        title_japanese: payload.content.title_japanese,
        synopsis: payload.content.synopsis || '',
        image_url: payload.content.image_url || '',
        score: payload.content.score,
        anilist_score: payload.content.anilist_score,
        rank: payload.content.rank,
        popularity: payload.content.popularity,
        year: payload.content.year,
        color_theme: payload.content.color_theme,
        num_users_voted: 0,
        created_at: payload.content.created_at,
        updated_at: payload.content.updated_at,
        // Manga detail fields (from manga_details join)
        chapters: payload.content.manga_details?.[0]?.chapters,
        volumes: payload.content.manga_details?.[0]?.volumes,
        published_from: payload.content.manga_details?.[0]?.published_from,
        published_to: payload.content.manga_details?.[0]?.published_to,
        status: payload.content.manga_details?.[0]?.status || 'Unknown',
        type: payload.content.manga_details?.[0]?.type || 'Manga',
        next_chapter_date: payload.content.manga_details?.[0]?.next_chapter_date,
        next_chapter_number: payload.content.manga_details?.[0]?.next_chapter_number,
        last_sync_check: payload.content.manga_details?.[0]?.last_sync_check,
        // Extract genres and authors
        genres: payload.content.title_genres?.map((tg: any) => tg.genres).filter(Boolean) || [],
        authors: payload.content.title_authors?.map((ta: any) => ta.authors).filter(Boolean) || [],
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