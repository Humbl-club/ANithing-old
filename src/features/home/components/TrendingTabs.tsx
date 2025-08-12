import React, { memo, useState, useCallback, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { AnimeCard } from '@/shared/components/AnimeCard';
import { 
  TrendingUp, 
  Calendar, 
  Clock, 
  Flame, 
  ChevronRight, 
  Filter,
  Grid3X3,
  List,
  RefreshCw
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { dataService } from '@/core/services/DataService';
import { useNamePreference } from '@/hooks/useNamePreference';
import { useNavigate } from 'react-router-dom';
import type { DomainTitle } from '@/repositories/contentRepository';

interface TrendingTabsProps {
  onItemClick?: (content: DomainTitle) => void;
}

type TimeRange = 'day' | 'week' | 'month';
type ContentType = 'anime' | 'manga' | 'all';
type ViewMode = 'grid' | 'list';

interface TrendingData {
  day: DomainTitle[];
  week: DomainTitle[];
  month: DomainTitle[];
}

const TrendingTabs = memo(({ onItemClick }: TrendingTabsProps) => {
  const navigate = useNavigate();
  const { getDisplayName } = useNamePreference();
  const [activeTimeRange, setActiveTimeRange] = useState<TimeRange>('day');
  const [contentType, setContentType] = useState<ContentType>('all');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');

  // Fetch trending content for different time ranges
  const { data: trendingData, isLoading, error, refetch } = useQuery({
    queryKey: ['trending-content', contentType],
    queryFn: async (): Promise<TrendingData> => {
      try {
        const sections = await dataService.getHomeSections();
        
        // For demo purposes, we'll simulate different time ranges
        // In a real app, these would be separate API calls with different parameters
        const baseAnime = sections.trendingAnime;
        const baseManga = sections.trendingManga;
      
      let allContent: DomainTitle[] = [];
      
      switch (contentType) {
        case 'anime':
          allContent = baseAnime;
          break;
        case 'manga':
          allContent = baseManga;
          break;
        case 'all':
          allContent = [...baseAnime, ...baseManga];
          break;
      }

      // Simulate different trending data for different time ranges
      const shuffled = [...allContent].sort(() => Math.random() - 0.5);
      
      return {
        day: shuffled.slice(0, 24),
        week: shuffled.slice(12, 36),
        month: shuffled.slice(6, 30)
      };
      } catch (error) {
        console.error('Error fetching trending content:', error);
        throw error;
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const currentData = useMemo(() => {
    return trendingData?.[activeTimeRange] || [];
  }, [trendingData, activeTimeRange]);

  const handleItemClick = useCallback((content: DomainTitle) => {
    if (onItemClick) {
      onItemClick(content);
    } else {
      const type = content.content_type || 'anime';
      navigate(`/${type}/${content.id}`);
    }
  }, [onItemClick, navigate]);

  const timeRangeConfig = {
    day: {
      label: 'Today',
      icon: Flame,
      subtitle: 'Hottest right now',
      color: 'text-orange-500',
      bgColor: 'bg-orange-500/10'
    },
    week: {
      label: 'This Week',
      icon: TrendingUp,
      subtitle: 'Weekly favorites',
      color: 'text-primary',
      bgColor: 'bg-primary/10'
    },
    month: {
      label: 'This Month',
      icon: Calendar,
      subtitle: 'Monthly top picks',
      color: 'text-secondary',
      bgColor: 'bg-secondary/10'
    }
  };

  const contentTypeConfig = {
    all: { label: 'All', emoji: '🔥' },
    anime: { label: 'Anime', emoji: '📺' },
    manga: { label: 'Manga', emoji: '📚' }
  };

  if (isLoading) {
    return <TrendingTabsSkeleton />;
  }

  if (error) {
    return <TrendingTabsError error={error} onRetry={refetch} />;
  }

  return (
    <section className="py-16">
      <div className="container mx-auto mobile-safe-padding space-y-8">
        {/* Section Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-primary rounded-xl">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-3xl font-bold text-gradient-primary">Trending Now</h2>
              <p className="text-muted-foreground">
                {timeRangeConfig[activeTimeRange].subtitle} • {currentData.length} titles
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            {/* View Mode Toggle */}
            <div className="flex bg-muted/20 rounded-lg p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-md transition-all ${
                  viewMode === 'grid' 
                    ? 'bg-primary text-primary-foreground' 
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <Grid3X3 className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-md transition-all ${
                  viewMode === 'list' 
                    ? 'bg-primary text-primary-foreground' 
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <List className="w-4 h-4" />
              </button>
            </div>
            
            <Button variant="outline" className="glass-button">
              <Filter className="w-4 h-4 mr-2" />
              Filters
            </Button>
            
            <Button 
              variant="outline" 
              className="glass-button"
              onClick={() => navigate('/trending')}
            >
              View All
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        </div>

        {/* Content Type Tabs */}
        <div className="flex flex-wrap gap-2">
          {(Object.keys(contentTypeConfig) as ContentType[]).map((type) => (
            <button
              key={type}
              onClick={() => setContentType(type)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                contentType === type
                  ? 'bg-gradient-primary text-white'
                  : 'glass-card hover:bg-white/5'
              }`}
            >
              {contentTypeConfig[type].emoji} {contentTypeConfig[type].label}
            </button>
          ))}
        </div>

        {/* Time Range Tabs */}
        <div className="flex flex-wrap gap-4">
          {(Object.keys(timeRangeConfig) as TimeRange[]).map((range) => {
            const config = timeRangeConfig[range];
            const Icon = config.icon;
            
            return (
              <button
                key={range}
                onClick={() => setActiveTimeRange(range)}
                className={`flex items-center gap-3 p-4 rounded-xl transition-all duration-300 ${
                  activeTimeRange === range
                    ? 'glass-card border-2 border-primary/50 bg-primary/5'
                    : 'glass-card hover:bg-white/5 hover:border-white/10'
                }`}
              >
                <div className={`p-2 rounded-lg ${config.bgColor}`}>
                  <Icon className={`w-5 h-5 ${config.color}`} />
                </div>
                <div className="text-left">
                  <div className="font-semibold">{config.label}</div>
                  <div className="text-xs text-muted-foreground">{config.subtitle}</div>
                </div>
                {activeTimeRange === range && (
                  <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                )}
              </button>
            );
          })}
        </div>

        {/* Content Grid/List */}
        <div className="space-y-6">
          {/* Quick Stats Bar */}
          <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Updated {new Date().toLocaleTimeString('en-US', { 
                hour: '2-digit', 
                minute: '2-digit' 
              })}
            </div>
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              {currentData.filter(item => item.score >= 8.0).length} highly rated
            </div>
            <div className="flex items-center gap-2">
              <Flame className="w-4 h-4" />
              {Math.floor(Math.random() * 50 + 10)}k discussions
            </div>
          </div>

          {/* Content Display */}
          {viewMode === 'grid' ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6">
              {currentData.map((item, index) => (
                <div key={item.id} className="group relative">
                  <div className="absolute top-2 left-2 z-10">
                    <div className="flex items-center gap-1 px-2 py-1 bg-black/80 rounded-full text-xs font-bold">
                      <TrendingUp className="w-3 h-3" />
                      #{index + 1}
                    </div>
                  </div>
                  <AnimeCard
                    content={item}
                    onClick={() => handleItemClick(item)}
                    getDisplayName={getDisplayName}
                    className="transition-all duration-300 group-hover:scale-105 group-hover:-translate-y-2"
                  />
                  {item.score && (
                    <div className="absolute bottom-2 right-2 px-2 py-1 bg-black/80 rounded-full text-xs font-bold text-yellow-400">
                      ★ {item.score.toFixed(1)}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {currentData.map((item, index) => (
                <div key={item.id} className="glass-card p-4 hover:bg-white/5 transition-all duration-300 group cursor-pointer"
                     onClick={() => handleItemClick(item)}>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/20 text-primary font-bold text-sm">
                        #{index + 1}
                      </div>
                      <div className="w-16 h-24 rounded-lg overflow-hidden">
                        <img 
                          src={item.cover_image} 
                          alt={getDisplayName(item)}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                        />
                      </div>
                    </div>
                    <div className="flex-1 min-w-0 space-y-1">
                      <h3 className="font-semibold line-clamp-1 group-hover:text-primary transition-colors">
                        {getDisplayName(item)}
                      </h3>
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {item.description?.replace(/<[^>]*>/g, '').substring(0, 100)}...
                      </p>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span>{item.year}</span>
                        <span className="capitalize">{item.status}</span>
                        {item.score && (
                          <span className="text-yellow-400">★ {item.score.toFixed(1)}</span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Load More */}
        <div className="text-center">
          <Button 
            variant="outline" 
            className="px-8 py-3 glass-button hover:bg-primary/10 hover:border-primary/30"
            onClick={() => navigate('/trending')}
          >
            View All Trending Content
            <ChevronRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </div>
    </section>
  );
});

const TrendingTabsSkeleton = () => (
  <section className="py-16">
    <div className="container mx-auto mobile-safe-padding space-y-8">
      {/* Header Skeleton */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-muted/20 rounded-xl animate-pulse" />
          <div className="space-y-2">
            <div className="h-8 w-48 bg-muted/20 rounded animate-pulse" />
            <div className="h-4 w-32 bg-muted/20 rounded animate-pulse" />
          </div>
        </div>
      </div>

      {/* Tabs Skeleton */}
      <div className="flex gap-2">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-10 w-24 bg-muted/20 rounded-full animate-pulse" />
        ))}
      </div>

      <div className="flex gap-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="glass-card p-4 w-48">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-muted/20 rounded-lg animate-pulse" />
              <div className="space-y-2">
                <div className="h-4 w-20 bg-muted/20 rounded animate-pulse" />
                <div className="h-3 w-24 bg-muted/20 rounded animate-pulse" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Content Grid Skeleton */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6">
        {Array.from({ length: 18 }).map((_, i) => (
          <div key={i} className="h-[400px] bg-muted/20 rounded-lg animate-pulse" />
        ))}
      </div>
    </div>
  </section>
);

const TrendingTabsError = ({ error, onRetry }: { error: Error; onRetry: () => void }) => (
  <section className="py-16">
    <div className="container mx-auto mobile-safe-padding">
      <div className="glass-card p-8 text-center space-y-6">
        <div className="w-16 h-16 mx-auto bg-red-500/10 rounded-full flex items-center justify-center">
          <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        </div>
        <div>
          <h3 className="text-xl font-semibold mb-2">Failed to Load Trending Content</h3>
          <p className="text-muted-foreground mb-4">
            There was an error loading the trending content. Please try again.
          </p>
          <div className="text-sm text-muted-foreground/70 font-mono bg-muted/10 p-2 rounded">
            {error.message}
          </div>
        </div>
        <div className="flex gap-3 justify-center">
          <Button onClick={onRetry} variant="outline" className="gap-2">
            <RefreshCw className="w-4 h-4" />
            Try Again
          </Button>
          <Button variant="ghost" onClick={() => window.location.reload()}>
            Refresh Page
          </Button>
        </div>
      </div>
    </div>
  </section>
);

TrendingTabs.displayName = 'TrendingTabs';

export { TrendingTabs };