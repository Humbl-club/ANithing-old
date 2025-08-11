import { useMemo, useEffect, useRef, useCallback, memo } from 'react';
import { AnimeCard } from '@/shared/components/AnimeCard';
import { VirtualizedList } from '@/shared/components/VirtualizedList';
import { type AnimeContent, type MangaContent } from '@/types/api.types';
import { useInView } from 'framer-motion';
interface ContentGridProps {
  content: (AnimeContent | MangaContent)[];
  contentType: 'anime' | 'manga';
  loading?: boolean;
  hasMore?: boolean;
  onLoadMore?: () => void;
  className?: string;
  enableVirtualization?: boolean;
  gridCols?: number;
}
const ITEM_HEIGHT = 420; // Card height + margin
const ITEMS_PER_ROW = 4; // Default grid columns
export const ContentGrid = memo(function ContentGrid({
  content,
  contentType,
  loading = false,
  hasMore = false,
  onLoadMore,
  className = '',
  enableVirtualization = true,
  gridCols = ITEMS_PER_ROW
}: ContentGridProps) {
  const loadMoreRef = useRef(null);
  const isInView = useInView(loadMoreRef);
  
  // Memoize onLoadMore callback to prevent effect re-runs
  const stableOnLoadMore = useCallback(() => {
    if (onLoadMore && !loading) {
      onLoadMore();
    }
  }, [onLoadMore, loading]);
  
  // Trigger load more when scroll reaches bottom
  useEffect(() => {
    if (isInView && hasMore && stableOnLoadMore) {
      stableOnLoadMore();
    }
  }, [isInView, hasMore, stableOnLoadMore]);
  
  // Group items into rows for virtualization - use stable reference
  const groupedContent = useMemo(() => {
    const rows = [];
    const contentLength = content.length;
    for (let i = 0; i < contentLength; i += gridCols) {
      rows.push(content.slice(i, Math.min(i + gridCols, contentLength)));
    }
    return rows;
  }, [content.length, gridCols]); // Only re-compute when length changes
  
  // Memoize render functions
  const renderContentCard = useCallback((item: AnimeContent | MangaContent) => {
    const key = `${contentType}-${item.id}`;
    return <AnimeCard key={key} anime={item as any} />;
  }, [contentType]);
  
  const renderRow = useCallback((row: (AnimeContent | MangaContent)[], index: number) => (
    <div 
      key={`row-${index}`}
      className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-${gridCols} gap-6 mb-6`}
    >
      {row.map(renderContentCard)}
    </div>
  ), [gridCols, renderContentCard]);
  // Use virtualization for large lists
  const shouldVirtualize = enableVirtualization && content.length > 20;
  return (
    <div className={`w-full ${className}`}>
      {shouldVirtualize ? (
        <VirtualizedList
          items={groupedContent}
          renderItem={renderRow}
          itemHeight={ITEM_HEIGHT}
          containerHeight={800}
          overscan={2}
          className="w-full"
        />
      ) : (
        <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-${gridCols} gap-6`}>
          {content.map(renderContentCard)}
        </div>
      )}
      {/* Infinite scroll trigger */}
      {hasMore && (
        <div ref={loadMoreRef} className="h-20 flex items-center justify-center">
          {loading && (
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          )}
        </div>
      )}
    </div>
  );
});

// Optimized version for specific content types with memoization
export const AnimeGrid = memo((props: Omit<ContentGridProps, 'contentType'>) => (
  <ContentGrid {...props} contentType="anime" />
));

export const MangaGrid = memo((props: Omit<ContentGridProps, 'contentType'>) => (
  <ContentGrid {...props} contentType="manga" />
));
// Default export for lazy loading
export default ContentGrid;