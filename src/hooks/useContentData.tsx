import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useRef, useEffect, useState } from 'react';
import { animeService, mangaService, AnimeContent, MangaContent } from '@/services/api';
import { queryKeys } from '@/utils/queryKeys';
import { generateUUID } from '@/utils/uuid';
import { supabase } from '@/integrations/supabase/client';
import { logger } from '@/utils/logger';
import { listTitles, DomainTitle } from '@/repositories/contentRepository';
export interface PaginationInfo {
  current_page: number;
  per_page: number;
  total: number;
  total_pages: number;
  has_next_page: boolean;
  has_prev_page: boolean;
}
export interface UseContentDataOptions {
  contentType: 'anime' | 'manga';
  filters?: {
    search?: string;
    genre?: string;
    status?: string;
    type?: string;
    year?: string;
    season?: string;
    sort_by?: string;
    order?: 'asc' | 'desc';
  };
  page?: number;
  limit?: number;
  autoFetch?: boolean;
}
export interface UseContentDataReturn<T> {
  data: T[];
  loading: boolean;
  error: Error | null;
  pagination: PaginationInfo | null;
  refetch: () => Promise<void>;
  syncFromExternal: (pages?: number) => Promise<void>;
  syncImages?: (limit?: number) => Promise<void>;
  clearCache: () => void;
}
// Overloaded function signatures for type safety
export function useContentData(options: UseContentDataOptions & { contentType: 'anime' }): UseContentDataReturn<AnimeContent>;
export function useContentData(options: UseContentDataOptions & { contentType: 'manga' }): UseContentDataReturn<MangaContent>;
// Implementation
export function useContentData(options: UseContentDataOptions): UseContentDataReturn<AnimeContent | MangaContent> {
  const queryClient = useQueryClient();
  const abortControllerRef = useRef<AbortController | null>(null);
  const [requestId] = useState(() => generateUUID());
  const {
    contentType,
    filters = {},
    page = 1,
    limit = 20,
    autoFetch = true
  } = options;
  const {
    search,
    genre,
    status,
    type,
    year,
    season,
    sort_by = 'score',
    order = 'desc'
  } = filters;
  // Create query key for caching
  const queryKey = [
    'content',
    contentType, 
    page, 
    limit, 
    search, 
    genre, 
    status, 
    type, 
    year, 
    season, 
    sort_by, 
    order,
    requestId // Add requestId for deduplication
  ];
  function mapDomainToContent(d: DomainTitle): AnimeContent | MangaContent {
    const base = {
      id: d.id,
      anilist_id: d.anilist_id,
      title: d.title,
      title_english: d.title_english,
      title_japanese: d.title_japanese,
      synopsis: d.synopsis,
      image_url: d.image_url,
      score: d.anilist_score ?? d.score ?? 0,
      anilist_score: d.anilist_score ?? undefined,
      rank: d.rank ?? undefined,
      popularity: d.popularity ?? undefined,
      favorites: d.favorites ?? 0,
      year: d.year ?? undefined,
      color_theme: d.color_theme ?? undefined,
      genres: d.genres ?? [],
      members: d.popularity ?? 0,
      created_at: (d as any).created_at ?? new Date().toISOString(),
      updated_at: (d as any).updated_at ?? new Date().toISOString(),
      type: (d.details as any)?.type ?? (d.content_type === 'anime' ? 'TV' : 'Manga'),
      status: (d.details as any)?.status ?? 'Unknown',
    } as any;
    if (d.content_type === 'anime') {
      return {
        ...base,
        studios: d.studios ?? [],
        episodes: (d.details as any)?.episodes ?? 0,
        aired_from: (d.details as any)?.aired_from,
        aired_to: (d.details as any)?.aired_to,
        season: (d.details as any)?.season,
        trailer_url: (d.details as any)?.trailer_url,
        next_episode_date: (d.details as any)?.next_episode_date,
      } as AnimeContent;
    }
    return {
      ...base,
      authors: d.authors ?? [],
      chapters: (d.details as any)?.chapters ?? 0,
      volumes: (d.details as any)?.volumes ?? 0,
      published_from: (d.details as any)?.published_from,
      published_to: (d.details as any)?.published_to,
      next_chapter_date: (d.details as any)?.next_chapter_date,
    } as MangaContent;
  }
  const fetchContent = async () => {
    // Properly dispose of previous controller to prevent memory leaks
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null; // Explicitly clear reference
    }
    abortControllerRef.current = new AbortController();
    const startTime = performance.now();
    try {
      // Prefer repository for shared selection/paging/search/sort
      const sortMap: Record<string, 'popularity' | 'anilist_score' | 'updated_at' | 'year'> = {
        score: 'anilist_score',
        anilist_score: 'anilist_score',
        popularity: 'popularity',
        updated_at: 'updated_at',
        year: 'year',
      };
      const sort = sortMap[sort_by] ?? 'popularity';
      const { items, total } = await listTitles(supabase as any, {
        contentType,
        page,
        pageSize: limit,
        sort,
        order: (order as 'asc' | 'desc') ?? 'desc',
        search: search?.trim() || undefined,
        // Note: advanced filters (genre/status/type/year/season) will be added in repo incrementally
      });
      const data = items.map(mapDomainToContent);
      const totalCount = total ?? data.length;
      const totalPages = Math.ceil(totalCount / limit) || 1;
      const duration = Math.round(performance.now() - startTime);
      logger.debug(`✅ useContentData (repository) completed in ${duration}ms`, {
        contentType,
        itemsReturned: data.length,
        totalCount,
        requestId,
      });
      return {
        data: data as (AnimeContent | MangaContent)[],
        pagination: {
          current_page: page,
          per_page: limit,
          total: totalCount,
          total_pages: totalPages,
          has_next_page: page < totalPages,
          has_prev_page: page > 1,
        },
      };
    } catch (error: any) {
      // Fallback to legacy direct query if repository path fails
      logger.warn('useContentData: repository path failed, falling back to direct query', { error: error?.message });
      // Build the base select for relationships
      const baseSelect = `
          *,
          ${contentType === 'anime' ? 'anime_details!inner(*)' : 'manga_details!inner(*)'},
          title_genres(genres(name)),
          ${contentType === 'anime' ? 'title_studios(studios(name))' : 'title_authors(authors(name))'}
        `;
      const genreSelect = `
          *,
          ${contentType === 'anime' ? 'anime_details!inner(*)' : 'manga_details!inner(*)'},
          title_genres!inner(genres!inner(name)),
          ${contentType === 'anime' ? 'title_studios(studios(name))' : 'title_authors(authors(name))'}
        `;
      let query = supabase
        .from('titles')
        .select(genre && genre !== 'all' ? genreSelect : baseSelect)
        // Ensure we only fetch the requested content type and use the index
        .eq('content_type', contentType)
        .abortSignal(abortControllerRef.current!.signal);
      // Filters
      if (genre && genre !== 'all') {
        query = query.eq('title_genres.genres.name', genre);
      }
      if (year && year !== 'all') {
        query = query.eq('year', parseInt(year));
      }
      if (status && status !== 'all') {
        const statusColumn = contentType === 'anime' ? 'anime_details.status' : 'manga_details.status';
        query = query.eq(statusColumn, status);
      }
      if (type && type !== 'all') {
        const typeColumn = contentType === 'anime' ? 'anime_details.type' : 'manga_details.type';
        query = query.eq(typeColumn, type);
      }
      if (contentType === 'anime' && season && season !== 'all') {
        query = query.eq('anime_details.season', season);
      }
      if (search && search.trim()) {
        const searchTerm = search.trim();
        query = query.or(`title.ilike.%${searchTerm}%,title_english.ilike.%${searchTerm}%,title_japanese.ilike.%${searchTerm}%`);
      }
      // Sorting
      const sortColumn = sort_by || 'score';
      const sortOrder = order || 'desc';
      query = query.order(sortColumn, { ascending: sortOrder === 'asc', nullsFirst: sortColumn === 'score' ? false : undefined });
      // Pagination
      const from = (page - 1) * limit;
      const to = from + limit - 1;
      query = query.range(from, to);
      const { data, error: legacyError, count } = await query;
      if (legacyError) throw legacyError;
      const totalCount = count || data?.length || 0;
      const totalPages = Math.ceil((totalCount || 0) / limit) || 1;
      return {
        data: (data || []) as unknown as (AnimeContent | MangaContent)[],
        pagination: {
          current_page: page,
          per_page: limit,
          total: totalCount,
          total_pages: totalPages,
          has_next_page: page < totalPages,
          has_prev_page: page > 1,
        }
      };
    }
  };
  const queryFn = async () => {
    return await fetchContent();
  };
  // Cleanup on unmount - prevent memory leaks
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
        abortControllerRef.current = null; // Explicit cleanup
      }
    };
  }, []);
  // React Query hook
  const {
    data: queryResult,
    isLoading: loading,
    error,
    refetch: queryRefetch,
  } = useQuery({
    queryKey,
    queryFn,
    enabled: autoFetch,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    retry: (failureCount, error: any) => {
      if (error?.message?.includes('empty')) return false;
      return failureCount < 3;
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000),
    meta: {
      errorMessage: `Failed to load ${contentType}. Please check your connection and try again.`
    }
  });
  // Refetch function
  const refetch = async () => {
    await queryRefetch();
  };
  // Clear React Query cache function
  const clearCache = () => {
    queryClient.clear();
    logger.debug('useContentData: React Query cache cleared');
  };
  // Sync from external API
  const syncFromExternal = async (pages = 1) => {
    const response = contentType === 'anime'
      ? await animeService.syncAnime(pages)
      : await mangaService.syncManga(pages);
    if (response.success) {
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.content.lists(),
        predicate: (query) => query.queryKey[2] === contentType
      });
    } else {
      throw new Error(response.error || 'Sync failed');
    }
  };
  // Sync images (optional feature)
  const syncImages = async (limit = 10) => {
    const response = contentType === 'anime'
      ? await animeService.syncAnimeImages(limit)
      : await mangaService.syncMangaImages(limit);
    if (response.success) {
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.content.lists(),
        predicate: (query) => query.queryKey[2] === contentType
      });
    } else {
      throw new Error(response.error || 'Image sync failed');
    }
  };
  logger.debug(`📊 useContentData: Final return data for ${contentType}:`, {
    dataLength: queryResult?.data?.length || 0,
    loading,
    error: (error as any)?.message,
    pagination: queryResult?.pagination,
    timestamp: new Date().toISOString()
  });
  return {
    data: queryResult?.data || [],
    loading,
    error: error as Error | null,
    pagination: queryResult?.pagination || null,
    refetch,
    syncFromExternal,
    syncImages,
    clearCache
  };
}