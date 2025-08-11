import React, { useRef, useMemo } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
interface VirtualizedListProps<T> {
  items: T[];
  renderItem: (item: T, index: number) => React.ReactNode;
  itemHeight: number;
  containerHeight?: number;
  overscan?: number;
  className?: string;
}
export const VirtualizedList = React.memo(<T,>({
  items,
  renderItem,
  itemHeight,
  containerHeight = 600,
  overscan = 5,
  className = ''
}: VirtualizedListProps<T>) => {
  const parentRef = useRef<HTMLDivElement>(null);
  // Memoize virtualizer options
  const virtualizerOptions = useMemo(() => ({
    count: items.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => itemHeight,
    overscan,
  }), [items.length, itemHeight, overscan]);

  const virtualizer = useVirtualizer(virtualizerOptions);
  return (
    <div
      ref={parentRef}
      className={`w-full overflow-auto ${className}`}
      style={{ height: `${containerHeight}px` }}
    >
      <div
        style={{
          height: `${virtualizer.getTotalSize()}px`,
          width: '100%',
          position: 'relative',
        }}
      >
        {virtualizer.getVirtualItems().map((virtualItem) => (
          <div
            key={virtualItem.key}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: `${virtualItem.size}px`,
              transform: `translateY(${virtualItem.start}px)`,
            }}
          >
            {renderItem(items[virtualItem.index], virtualItem.index)}
          </div>
        ))}
      </div>
    </div>
  );
}) as <T>(props: VirtualizedListProps<T>) => JSX.Element;
