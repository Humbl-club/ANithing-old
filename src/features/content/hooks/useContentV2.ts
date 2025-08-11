import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { dataService, type ListParams, type DomainTitle } from '@/core/services/DataService';
/**
 * Unified content hook using DataService
 * Replaces useContentData, useSimpleContentData, useInfiniteContentData
*/
export function useContent(params: ListParams = {}) {
  const { data, isLoading, error } = useQuery({
    queryKey: ['content', params],
    queryFn: () => dataService.listTitles(params),
    staleTime: 5 * 60 * 1000
  });
  return {
    items: data?.items || [],
    total: data?.total || 0,
    isLoading,
    error: error as Error | null
  };
}
/**
 * Hook for fetching single content item
*/
export function useContentDetail(id: string) {
  const { data, isLoading, error } = useQuery({
    queryKey: ['content-detail', id],
    queryFn: () => dataService.getTitle(id),
    enabled: !!id,
    staleTime: 10 * 60 * 1000
  });
  return {
    content: data,
    isLoading,
    error: error as Error | null
  };
}
/**
 * Hook for searching content
*/
export function useContentSearch(
  query: string,
  options?: { contentType?: 'anime' | 'manga' | 'both'; limit?: number }
) {
  const { data, isLoading, error } = useQuery({
    queryKey: ['content-search', query, options],
    queryFn: () => dataService.searchTitles(query, options),
    enabled: query.length >= 2,
    staleTime: 2 * 60 * 1000
  });
  return {
    results: data?.items || [],
    total: data?.total || 0,
    hasMore: data?.hasMore || false,
    isSearching: isLoading,
    error: error as Error | null
  };
}