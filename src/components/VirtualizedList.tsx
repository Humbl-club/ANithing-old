import React, { useMemo, useCallback, useRef } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import { cn } from '@/lib/utils';

interface VirtualizedListProps<T> {
  items: T[];
  itemHeight?: number;
  height: number;
  renderItem: (item: T, index: number) => React.ReactNode;
  onLoadMore?: () => void;
  hasNextPage?: boolean;
  isLoading?: boolean;
  className?: string;
  overscan?: number;
  gap?: number;
  columns?: number;
}

/**
 * High-performance virtualized list component optimized for 10k+ items
 * Uses @tanstack/react-virtual for efficient rendering
 */
export function VirtualizedList<T>({
  items,
  itemHeight = 200,
  height,
  renderItem,
  onLoadMore,
  hasNextPage = false,
  isLoading = false,
  className,
  overscan = 10,
  gap = 8,
  columns = 1
}: VirtualizedListProps<T>) {
  const parentRef = useRef<HTMLDivElement>(null);
  
  // Calculate virtual items based on columns
  const virtualItems = useMemo(() => {
    if (columns === 1) return items;
    
    // Group items into rows for multi-column layout
    const rows = [];
    for (let i = 0; i < items.length; i += columns) {
      rows.push(items.slice(i, i + columns));
    }
    return rows;
  }, [items, columns]);
  
  const virtualizer = useVirtualizer({
    count: virtualItems.length,
    getScrollElement: () => parentRef.current,
    estimateSize: useCallback(() => itemHeight + gap, [itemHeight, gap]),
    overscan,
    measureElement: (element) => {
      // Use actual measured height when available
      return element.getBoundingClientRect().height;
    }
  });
  
  // Infinite scrolling logic
  const handleScroll = useCallback((event: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = event.currentTarget;
    const scrollPercent = (scrollTop + clientHeight) / scrollHeight;
    
    // Trigger load more when 80% scrolled
    if (scrollPercent > 0.8 && hasNextPage && !isLoading && onLoadMore) {
      onLoadMore();
    }
  }, [hasNextPage, isLoading, onLoadMore]);
  
  const virtualizedItems = virtualizer.getVirtualItems();
  
  return (
    <div
      ref={parentRef}
      className={cn(
        'w-full overflow-auto',
        className
      )}
      style={{
        height: `${height}px`
      }}
      onScroll={handleScroll}
    >
      <div
        style={{
          height: `${virtualizer.getTotalSize()}px`,
          width: '100%',
          position: 'relative'
        }}
      >
        {virtualizedItems.map((virtualItem) => {
          const item = virtualItems[virtualItem.index];
          
          return (
            <div
              key={virtualItem.key}
              data-index={virtualItem.index}
              ref={virtualizer.measureElement}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                transform: `translateY(${virtualItem.start}px)`,
              }}
            >
              {columns === 1 ? (
                // Single column layout
                <div style={{ marginBottom: `${gap}px` }}>
                  {renderItem(item as T, virtualItem.index)}
                </div>
              ) : (
                // Multi-column grid layout
                <div 
                  className="grid gap-2"
                  style={{ 
                    gridTemplateColumns: `repeat(${columns}, 1fr)`,
                    marginBottom: `${gap}px`
                  }}
                >
                  {(item as T[]).map((gridItem, colIndex) => (
                    <div key={`${virtualItem.index}-${colIndex}`}>
                      {renderItem(gridItem, virtualItem.index * columns + colIndex)}
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
        
        {/* Loading indicator at bottom */}
        {isLoading && (
          <div 
            style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              height: '60px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <div className="flex items-center space-x-2">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
              <span className="text-sm text-muted-foreground">Loading more...</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Enhanced grid virtualization for content cards
export function VirtualizedGrid<T>({
  items,
  itemHeight = 300,
  height,
  renderItem,
  onLoadMore,
  hasNextPage = false,
  isLoading = false,
  className,
  columns = 4,
  gap = 16
}: VirtualizedListProps<T>) {
  return (
    <VirtualizedList
      items={items}
      itemHeight={itemHeight}
      height={height}
      renderItem={renderItem}
      onLoadMore={onLoadMore}
      hasNextPage={hasNextPage}
      isLoading={isLoading}
      className={className}
      columns={columns}
      gap={gap}
      overscan={5} // Lower overscan for grid to save memory
    />
  );
}

// Performance-optimized component for large datasets
export const MemoizedVirtualizedList = React.memo(VirtualizedList) as typeof VirtualizedList;
export const MemoizedVirtualizedGrid = React.memo(VirtualizedGrid) as typeof VirtualizedGrid;

// Hook for virtual list state management
export function useVirtualList<T>({
  items,
  pageSize = 50,
  loadMore
}: {
  items: T[];
  pageSize?: number;
  loadMore?: () => Promise<T[]>;
}) {
  const [allItems, setAllItems] = React.useState<T[]>(items);
  const [isLoading, setIsLoading] = React.useState(false);
  const [hasNextPage, setHasNextPage] = React.useState(true);
  
  const handleLoadMore = useCallback(async () => {
    if (isLoading || !hasNextPage || !loadMore) return;
    
    setIsLoading(true);
    try {
      const newItems = await loadMore();
      
      if (newItems.length < pageSize) {
        setHasNextPage(false);
      }
      
      setAllItems(prev => [...prev, ...newItems]);
    } catch (error) {
      console.error('Failed to load more items:', error);
    } finally {
      setIsLoading(false);
    }
  }, [isLoading, hasNextPage, loadMore, pageSize]);
  
  // Update items when prop changes
  React.useEffect(() => {
    setAllItems(items);
  }, [items]);
  
  return {
    items: allItems,
    isLoading,
    hasNextPage,
    loadMore: handleLoadMore
  };
}