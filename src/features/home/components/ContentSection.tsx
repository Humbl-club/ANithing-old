import React, { Suspense, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { AnimeCard } from '@/shared/components/AnimeCard';
import { ChevronRight, Loader2, RefreshCw, AlertCircle } from 'lucide-react';
import { InfiniteScroll, useInfiniteScroll } from './InfiniteScroll';
import type { DomainTitle } from '@/repositories/contentRepository';

interface ContentSectionProps {
  title: string;
  subtitle: string;
  icon: React.ComponentType<{ className?: string }>;
  items: DomainTitle[];
  viewAllPath: string;
  getDisplayName: (content: DomainTitle) => string;
  onItemClick: (content: DomainTitle) => void;
  className?: string;
  // Enhanced props
  enableInfiniteScroll?: boolean;
  onLoadMore?: (offset: number, limit: number) => Promise<DomainTitle[]>;
  hasError?: boolean;
  error?: Error;
  onRetry?: () => void;
  isLoading?: boolean;
  emptyMessage?: string;
  maxDisplayItems?: number;
}
export function ContentSection({
  title,
  subtitle,
  icon: Icon,
  items,
  viewAllPath,
  getDisplayName,
  onItemClick,
  className = "",
  enableInfiniteScroll = false,
  onLoadMore,
  hasError = false,
  error,
  onRetry,
  isLoading = false,
  emptyMessage = "No content available",
  maxDisplayItems = 12
}: ContentSectionProps) {
  const navigate = useNavigate();
  const [showAll, setShowAll] = useState(false);
  
  // Use infinite scroll hook if enabled
  const infiniteScroll = useInfiniteScroll(
    enableInfiniteScroll ? items : [],
    onLoadMore || (() => Promise.resolve([])),
    12
  );

  // Determine what items to display
  const displayItems = enableInfiniteScroll 
    ? infiniteScroll.data 
    : showAll 
      ? items 
      : items.slice(0, maxDisplayItems);

  // Show error state
  if (hasError && error) {
    return (
      <section className={`py-12 md:py-16 ${className}`}>
        <div className="container mx-auto mobile-safe-padding">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Icon className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h2 className="text-2xl md:text-3xl font-bold">{title}</h2>
                <p className="text-sm md:text-base text-muted-foreground">{subtitle}</p>
              </div>
            </div>
          </div>
          
          <div className="glass-card p-8 text-center space-y-4">
            <div className="w-12 h-12 mx-auto bg-red-500/10 rounded-full flex items-center justify-center">
              <AlertCircle className="w-6 h-6 text-red-500" />
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-2">Failed to Load Content</h3>
              <p className="text-muted-foreground mb-4">
                There was an error loading {title.toLowerCase()}. Please try again.
              </p>
              <div className="text-xs text-muted-foreground/70 font-mono bg-muted/10 p-2 rounded mb-4">
                {error.message}
              </div>
            </div>
            <div className="flex gap-3 justify-center">
              {onRetry && (
                <Button onClick={onRetry} variant="outline" className="gap-2">
                  <RefreshCw className="w-4 h-4" />
                  Try Again
                </Button>
              )}
              <Button variant="ghost" onClick={() => window.location.reload()}>
                Refresh Page
              </Button>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className={`py-12 md:py-16 ${className}`}>
      <div className="container mx-auto mobile-safe-padding">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Icon className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h2 className="text-2xl md:text-3xl font-bold">{title}</h2>
              <p className="text-sm md:text-base text-muted-foreground">
                {subtitle} • {displayItems.length} items
                {isLoading && <Loader2 className="w-4 h-4 inline ml-2 animate-spin" />}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {!enableInfiniteScroll && items.length > maxDisplayItems && (
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => setShowAll(!showAll)}
                className="text-muted-foreground hover:text-foreground"
              >
                {showAll ? 'Show Less' : `Show All (${items.length})`}
              </Button>
            )}
            
            <Button 
              variant="outline" 
              className="group"
              onClick={() => navigate(viewAllPath)}
            >
              View All
              <ChevronRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>
        </div>

        {/* Empty state */}
        {displayItems.length === 0 && !isLoading && (
          <div className="text-center py-12 text-muted-foreground">
            <Icon className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>{emptyMessage}</p>
          </div>
        )}

        {/* Content */}
        {enableInfiniteScroll && onLoadMore ? (
          <InfiniteScroll
            hasMore={infiniteScroll.hasMore}
            isLoading={infiniteScroll.isLoading}
            onLoadMore={infiniteScroll.loadMore}
          >
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6">
              {displayItems.map((item, index) => (
                <div key={`${item.id}-${index}`} className="group">
                  <AnimeCard 
                    content={item} 
                    onClick={() => onItemClick(item)}
                    getDisplayName={getDisplayName}
                  />
                </div>
              ))}
            </div>
          </InfiniteScroll>
        ) : (
          <Suspense fallback={<ContentSectionSkeleton />}>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6">
              {displayItems.map((item, index) => (
                <div key={`${item.id}-${index}`} className="group">
                  <AnimeCard 
                    content={item} 
                    onClick={() => onItemClick(item)}
                    getDisplayName={getDisplayName}
                  />
                </div>
              ))}
            </div>
            
            {/* Show More button for non-infinite scroll */}
            {!showAll && items.length > maxDisplayItems && !enableInfiniteScroll && (
              <div className="text-center mt-8">
                <Button 
                  variant="outline" 
                  onClick={() => setShowAll(true)}
                  className="px-8"
                >
                  Show {items.length - maxDisplayItems} More Items
                </Button>
              </div>
            )}
          </Suspense>
        )}
      </div>
    </section>
  );
}
function ContentSectionSkeleton() {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6">
      {Array.from({ length: 12 }).map((_, i) => (
        <div key={i} className="h-[400px] bg-muted/20 animate-pulse rounded-lg" />
      ))}
    </div>
  );
}