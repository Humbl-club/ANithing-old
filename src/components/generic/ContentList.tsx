import React from 'react';
import { BaseContent } from '@/types/content.types';
import { ContentCard } from './ContentCard';
import { Loader2 } from 'lucide-react';

interface ContentListProps<T extends BaseContent> {
  items: T[];
  loading?: boolean;
  error?: Error | null;
  emptyMessage?: string;
  columns?: 1 | 2 | 3 | 4 | 5 | 6;
  onItemClick?: (item: T) => void;
  renderItem?: (item: T) => React.ReactNode;
}

/**
 * Generic content list component - replaces AnimeList, MangaList, etc.
 * Saves ~400 lines of duplicate code
*/
export function ContentList<T extends BaseContent>({
  items,
  loading = false,
  error = null,
  emptyMessage = 'No content found',
  columns = 4,
  onItemClick,
  renderItem
}: ContentListProps<T>) {
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[200px]">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-500 py-8">
        Error loading content: {error.message}
      </div>
    );
  }

  if (!items || items.length === 0) {
    return (
      <div className="text-center text-muted-foreground py-8">
        {emptyMessage}
      </div>
    );
  }

  const gridCols = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 sm:grid-cols-2',
    3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4',
    5: 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-5',
    6: 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6'
  };

  return (
    <div className={`grid ${gridCols[columns]} gap-4`}>
      {items.map((item) => (
        <div key={item.id} onClick={() => onItemClick?.(item)}>
          {renderItem ? renderItem(item) : <ContentCard content={item} />}
        </div>
      ))}
    </div>
  );
}

// Convenience components for specific content types
export const AnimeList = (props: Omit<ContentListProps<BaseContent>, 'renderItem'>) => (
  <ContentList {...props} />
);

export const MangaList = (props: Omit<ContentListProps<BaseContent>, 'renderItem'>) => (
  <ContentList {...props} />
);