import { useInfiniteQuery } from '@tanstack/react-query';

export function useInfiniteContentData(options: any) {
  const query = useInfiniteQuery({
    queryKey: ['infinite-content', options],
    queryFn: ({ pageParam = 1 }) => {
      // Mock implementation - replace with actual API call
      return Promise.resolve({
        data: [],
        total: 0,
        hasMore: false,
        nextPage: null
      });
    },
    getNextPageParam: (lastPage) => lastPage.nextPage,
    initialPageParam: 1,
  });

  return {
    ...query,
    animeData: query.data?.pages.flatMap(page => page.data) || [],
    hasNextPage: query.hasNextPage,
    fetchNextPage: query.fetchNextPage,
    isFetchingNextPage: query.isFetchingNextPage,
  };
}
