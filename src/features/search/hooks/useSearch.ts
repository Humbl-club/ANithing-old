import { useState, useCallback, useRef, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useDebounce } from '@/hooks/useDebounce';
import { escapeLikeQuery } from '@/utils/simpleSecurity';
import type { DomainTitle } from '@/repositories/contentRepository';
export interface SearchOptions {
  contentType?: 'anime' | 'manga' | 'both';
  limit?: number;
  debounceMs?: number;
  minQueryLength?: number;
  enableCache?: boolean;
  sortBy?: 'relevance' | 'popularity' | 'score' | 'title';
}
export interface SearchResult<T> {
  items: T[];
  total: number;
  hasMore: boolean;
  isSearching: boolean;
  error: Error | null;
}
export interface UseSearchReturn<T> {
  results: SearchResult<T>;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  clearSearch: () => void;
  loadMore: () => void;
  refetch: () => void;
}
/**
 * Unified search hook that consolidates all search functionality
 * Replaces: useSearch, useOptimizedSearch, useUnifiedSearch, useConsolidatedSearch
*/
export function useSearch<T = DomainTitle>(
  options: SearchOptions = {}
): UseSearchReturn<T> {
  const {
    contentType = 'both',
    limit = 20,
    debounceMs = 300,
    minQueryLength = 2,
    enableCache = true,
    sortBy = 'relevance'
  } = options;
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const abortControllerRef = useRef<AbortController | null>(null);
  // Debounce the search query
  const debouncedQuery = useDebounce(searchQuery, debounceMs);
  // Build the search query key for React Query
  const queryKey = ['search', contentType, debouncedQuery, page, sortBy];
  // Search function
  const searchFn = async ({ signal }: { signal?: AbortSignal }) => {
    // Don't search if query is too short
    if (debouncedQuery.length < minQueryLength) {
      return { items: [], total: 0, hasMore: false };
    }
    // Cancel previous request if exists
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    // Create new abort controller
    abortControllerRef.current = new AbortController();
    try {
      let query = supabase
        .from('titles')
        .select(`
          *,
          anime_details (*),
          manga_details (*),
          title_genres!inner (
            genres!inner (name)
          )
        `, { count: 'exact' })
        .or(`title.ilike.%${escapeLikeQuery(debouncedQuery)}%,title_english.ilike.%${escapeLikeQuery(debouncedQuery)}%,title_japanese.ilike.%${escapeLikeQuery(debouncedQuery)}%`)
        .range((page - 1) * limit, page * limit - 1);
      // Apply content type filter
      if (contentType !== 'both') {
        query = query.eq('content_type', contentType);
      }
      // Apply sorting
      switch (sortBy) {
        case 'popularity':
          query = query.order('popularity', { ascending: false, nullsFirst: false });
          break;
        case 'score':
          query = query.order('score', { ascending: false, nullsFirst: false });
          break;
        case 'title':
          query = query.order('title', { ascending: true });
          break;
        case 'relevance':
        default:
          // Relevance is handled by the database's text search
          query = query.order('popularity', { ascending: false, nullsFirst: false });
      }
      const { data, error, count } = await query.abortSignal(signal || abortControllerRef.current.signal);
      if (error) throw error;
      return {
        items: (data || []) as T[],
        total: count || 0,
        hasMore: count ? (page * limit < count) : false
      };
    } catch (error: any) {
      if (error.name === 'AbortError') {
        // Request was cancelled, return previous results
        return { items: [], total: 0, hasMore: false };
      }
      throw error;
    }
  };
  // Use React Query for caching and state management
  const {
    data,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey,
    queryFn: searchFn,
    enabled: debouncedQuery.length >= minQueryLength,
    staleTime: enableCache ? 5 * 60 * 1000 : 0, // 5 minutes
    gcTime: enableCache ? 10 * 60 * 1000 : 0, // 10 minutes
    retry: 1,
    retryDelay: 1000
  });
  // Clear search
  const clearSearch = useCallback(() => {
    setSearchQuery('');
    setPage(1);
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    // Clear cache for this search
    queryClient.invalidateQueries({ queryKey: ['search'] });
  }, [queryClient]);
  // Load more results
  const loadMore = useCallback(() => {
    if (data?.hasMore) {
      setPage(prev => prev + 1);
    }
  }, [data?.hasMore]);
  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);
  return {
    results: {
      items: data?.items || [],
      total: data?.total || 0,
      hasMore: data?.hasMore || false,
      isSearching: isLoading,
      error: error as Error | null
    },
    searchQuery,
    setSearchQuery,
    clearSearch,
    loadMore,
    refetch
  };
}
/**
 * Hook for searching anime specifically
*/
export function useAnimeSearch(options?: Omit<SearchOptions, 'contentType'>) {
  return useSearch({ ...options, contentType: 'anime' });
}
/**
 * Hook for searching manga specifically
*/
export function useMangaSearch(options?: Omit<SearchOptions, 'contentType'>) {
  return useSearch({ ...options, contentType: 'manga' });
}
/**
 * Hook for global search across all content
*/
export function useGlobalSearch(options?: SearchOptions) {
  return useSearch({ ...options, contentType: 'both' });
}