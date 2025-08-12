import React, { useEffect, useRef, useCallback, memo } from 'react';
import { Loader2 } from 'lucide-react';

interface InfiniteScrollProps {
  hasMore: boolean;
  isLoading: boolean;
  onLoadMore: () => void;
  threshold?: number; // Distance from bottom to trigger load (in pixels)
  className?: string;
  loadingComponent?: React.ReactNode;
  children: React.ReactNode;
}

const InfiniteScroll = memo(({
  hasMore,
  isLoading,
  onLoadMore,
  threshold = 300,
  className = '',
  loadingComponent,
  children
}: InfiniteScrollProps) => {
  const loadingRef = useRef<HTMLDivElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  const handleLoadMore = useCallback(() => {
    if (hasMore && !isLoading) {
      onLoadMore();
    }
  }, [hasMore, isLoading, onLoadMore]);

  // Set up intersection observer
  useEffect(() => {
    const element = loadingRef.current;
    if (!element) return;

    observerRef.current = new IntersectionObserver(
      (entries) => {
        const first = entries[0];
        if (first.isIntersecting) {
          handleLoadMore();
        }
      },
      {
        threshold: 0.1,
        rootMargin: `${threshold}px`,
      }
    );

    observerRef.current.observe(element);

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [handleLoadMore, threshold]);

  return (
    <div className={className}>
      {children}
      
      {/* Loading trigger element */}
      {hasMore && (
        <div
          ref={loadingRef}
          className="flex items-center justify-center py-8"
        >
          {isLoading && (
            loadingComponent || (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Loading more...</span>
              </div>
            )
          )}
        </div>
      )}
      
      {/* End message */}
      {!hasMore && !isLoading && (
        <div className="text-center py-8 text-muted-foreground">
          <p>You've reached the end!</p>
        </div>
      )}
    </div>
  );
});

InfiniteScroll.displayName = 'InfiniteScroll';

// Hook for infinite scroll functionality
export const useInfiniteScroll = (
  initialData: any[] = [],
  fetchMore: (offset: number, limit: number) => Promise<any[]>,
  limit: number = 20
) => {
  const [data, setData] = React.useState(initialData);
  const [isLoading, setIsLoading] = React.useState(false);
  const [hasMore, setHasMore] = React.useState(true);
  const [error, setError] = React.useState<Error | null>(null);

  const loadMore = useCallback(async () => {
    if (isLoading || !hasMore) return;

    setIsLoading(true);
    setError(null);

    try {
      const newData = await fetchMore(data.length, limit);
      
      if (newData.length === 0 || newData.length < limit) {
        setHasMore(false);
      }
      
      setData(prev => [...prev, ...newData]);
    } catch (err) {
      setError(err as Error);
      console.error('Error loading more data:', err);
    } finally {
      setIsLoading(false);
    }
  }, [data.length, fetchMore, limit, isLoading, hasMore]);

  const reset = useCallback(() => {
    setData([]);
    setHasMore(true);
    setError(null);
    setIsLoading(false);
  }, []);

  const refresh = useCallback(async () => {
    reset();
    try {
      setIsLoading(true);
      const newData = await fetchMore(0, limit);
      setData(newData);
      setHasMore(newData.length >= limit);
    } catch (err) {
      setError(err as Error);
    } finally {
      setIsLoading(false);
    }
  }, [fetchMore, limit, reset]);

  return {
    data,
    isLoading,
    hasMore,
    error,
    loadMore,
    reset,
    refresh
  };
};

export { InfiniteScroll };