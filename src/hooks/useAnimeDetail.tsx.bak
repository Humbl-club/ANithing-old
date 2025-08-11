import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { logger } from '@/utils/logger';
interface AnimeDetail {
  // Title fields
  id: string;
  anilist_id: number;
  title: string;
  title_english?: string;
  title_japanese?: string;
  synopsis: string; // Required to match Anime type
  image_url: string; // Required to match Anime type
  score?: number;
  anilist_score?: number;
  rank?: number;
  popularity?: number;
  year?: number;
  color_theme?: string;
  num_users_voted?: number;
  created_at: string;
  updated_at: string;
  external_links?: Array<{
    id: number;
    url: string;
    site: string;
    siteId?: number;
    type: string;
    language?: string;
    color?: string;
    icon?: string;
  }>;
  // Anime detail fields
  episodes?: number;
  aired_from?: string;
  aired_to?: string;
  season?: string;
  status: string;
  type: string;
  trailer_url?: string;
  trailer_site?: string;
  trailer_id?: string;
  next_episode_date?: string;
  next_episode_number?: number;
  last_sync_check: string;
  // Related data arrays
  genres?: Array<{ id: string; name: string; type?: string; created_at?: string }>;
  studios?: Array<{ id: string; name: string; created_at?: string }>;
  // Consolidated data from edge function
  recommendations?: any[];
  streaming_availability?: any;
  user_list_status?: any;
  related_titles?: any[];
}
interface UseAnimeDetailResult {
  anime: AnimeDetail | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}
export const useAnimeDetail = (animeId: string): UseAnimeDetailResult => {
  const { user } = useAuth();
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['anime-detail-consolidated', animeId, user?.id],
    queryFn: async () => {
      if (!animeId) {
        throw new Error('Anime ID is required');
      }
      logger.debug(`🚀 Fetching consolidated anime details for: ${animeId}`);
      const { data, error } = await supabase.functions.invoke('get-content-details', {
        body: {
          content_id: animeId,
          type: 'anime',
          user_id: user?.id
        }
      });
      if (error) {
        logger.debug('❌ Consolidated anime detail error:', error);
        throw new Error(error.message || 'Failed to fetch anime details');
      }
      const payload = (data && 'data' in (data as any)) ? (data as any).data : data;
      if (!payload?.content) {
        logger.debug('⚠️ No anime found for ID:', animeId);
        throw new Error('Anime not found');
      }
      // Transform the data to match the expected interface
      const transformedData: AnimeDetail = {
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
        external_links: Array.isArray(payload.content.external_links) ? payload.content.external_links : [],
        // Anime detail fields (from anime_details join)
        episodes: payload.content.anime_details?.[0]?.episodes,
        aired_from: payload.content.anime_details?.[0]?.aired_from,
        aired_to: payload.content.anime_details?.[0]?.aired_to,
        season: payload.content.anime_details?.[0]?.season,
        status: payload.content.anime_details?.[0]?.status || 'Unknown',
        type: payload.content.anime_details?.[0]?.type || 'TV',
        trailer_url: payload.content.anime_details?.[0]?.trailer_url,
        trailer_site: payload.content.anime_details?.[0]?.trailer_site,
        trailer_id: payload.content.anime_details?.[0]?.trailer_id,
        next_episode_date: payload.content.anime_details?.[0]?.next_episode_date,
        next_episode_number: payload.content.anime_details?.[0]?.next_episode_number,
        last_sync_check: payload.content.anime_details?.[0]?.last_sync_check,
        // Extract genres and studios
        genres: payload.content.title_genres?.map((tg: any) => tg.genres).filter(Boolean) || [],
        studios: payload.content.title_studios?.map((ts: any) => ts.studios).filter(Boolean) || [],
        // Add consolidated data from edge function
        recommendations: payload.recommendations || [],
        streaming_availability: null,
        user_list_status: payload.user_list_status,
        related_titles: payload.related_titles || []
      };
      logger.debug('✅ Successfully transformed consolidated anime:', transformedData.title);
      return transformedData;
    },
    enabled: !!animeId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    retry: 2
  });
  return {
    anime: data || null,
    loading: isLoading,
    error: error?.message || null,
    refetch
  };
};
