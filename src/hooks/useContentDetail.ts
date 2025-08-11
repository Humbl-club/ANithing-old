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
      const { data, error } = await supabase
        .from('titles')
        .select(`
          *,
          ${contentType === 'anime' ? 'anime_details(*)' : 'manga_details(*)'},
          title_genres(genres(*)),
          ${contentType === 'anime' ? 'title_studios(studios(*))' : 'title_authors(authors(*))'}
        `)
        .eq('id', contentId)
        .single();

      if (error) throw error;
      return data as T;
    },
    enabled: !!contentId,
  });
}

// Convenience hooks for backwards compatibility
export const useAnimeDetail = (id: string) => useContentDetail(id, 'anime');
export const useMangaDetail = (id: string) => useContentDetail(id, 'manga');