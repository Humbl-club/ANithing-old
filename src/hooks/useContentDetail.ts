import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { BaseContent } from '@/types/content.types';

/**
 * Generic content detail hook - replaces useAnimeDetail and useMangaDetail
 * Saves ~200 lines of duplicate code
*/
export function useContentDetail<T extends BaseContent>(
  contentId: string,
  contentType: 'anime' | 'manga'
) {
  return useQuery({
    queryKey: ['content', contentType, contentId],
    queryFn: async () => {
      // Handle both UUID and AniList ID formats
      const isUuid = contentId && contentId.includes('-')
      
      let query = supabase
        .from('titles')
        .select(`
          *,
          ${contentType === 'anime' ? 'anime_details(*)' : 'manga_details(*)'},
          title_genres(genres(*)),
          ${contentType === 'anime' ? 'title_studios(studios(*))' : 'title_authors(authors(*))'}
        `)
        .eq('content_type', contentType)
      
      if (isUuid) {
        query = query.eq('id', contentId)
      } else {
        // Assume it's an AniList ID (numeric)
        query = query.eq('anilist_id', parseInt(contentId))
      }

      const { data, error } = await query.single();

      if (error) throw error;
      return data as T;
    },
    enabled: !!contentId,
  });
}

// Convenience hooks for backwards compatibility
export const useAnimeDetail = (id: string) => useContentDetail(id, 'anime');
export const useMangaDetail = (id: string) => useContentDetail(id, 'manga');