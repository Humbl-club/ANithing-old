import React, { memo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { 
  Newspaper, 
  ExternalLink, 
  Clock, 
  TrendingUp, 
  MessageSquare,
  ChevronRight,
  Calendar,
  Bookmark,
  Share2
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';

interface NewsItem {
  id: string;
  title: string;
  excerpt: string;
  content?: string;
  imageUrl: string;
  publishedAt: string;
  category: 'announcement' | 'news' | 'feature' | 'community';
  tags: string[];
  externalUrl?: string;
  commentsCount: number;
  isBookmarked?: boolean;
}

interface NewsAndUpdatesProps {
  className?: string;
}

const NewsAndUpdates = memo(({ className = '' }: NewsAndUpdatesProps) => {
  const [selectedCategory, setSelectedCategory] = useState<'all' | NewsItem['category']>('all');

  // Mock news data - in real app this would come from a CMS or API
  const { data: newsItems = [], isLoading } = useQuery({
    queryKey: ['news-updates'],
    queryFn: async (): Promise<NewsItem[]> => {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      return [
        {
          id: '1',
          title: 'New Features: Enhanced Recommendation System',
          excerpt: 'Discover anime perfectly tailored to your taste with our improved AI-powered recommendation engine.',
          imageUrl: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400',
          publishedAt: '2024-01-15T10:00:00Z',
          category: 'feature',
          tags: ['recommendations', 'ai', 'personalization'],
          commentsCount: 45,
          isBookmarked: false
        },
        {
          id: '2',
          title: 'Winter 2024 Anime Season Overview',
          excerpt: 'Get ready for an amazing winter season with these must-watch anime series hitting your screens.',
          imageUrl: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400',
          publishedAt: '2024-01-12T15:30:00Z',
          category: 'news',
          tags: ['seasonal', 'winter2024', 'preview'],
          commentsCount: 128,
          isBookmarked: true
        },
        {
          id: '3',
          title: 'Community Milestone: 100K Active Users!',
          excerpt: 'Celebrating our growing community of anime enthusiasts. Thank you for making this journey incredible!',
          imageUrl: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=400',
          publishedAt: '2024-01-10T09:00:00Z',
          category: 'community',
          tags: ['milestone', 'community', 'celebration'],
          commentsCount: 89,
          isBookmarked: false
        },
        {
          id: '4',
          title: 'Platform Maintenance Notice',
          excerpt: 'Scheduled maintenance on January 20th to improve performance and add new features.',
          imageUrl: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=400',
          publishedAt: '2024-01-08T14:00:00Z',
          category: 'announcement',
          tags: ['maintenance', 'performance', 'updates'],
          commentsCount: 23,
          isBookmarked: false
        },
        {
          id: '5',
          title: 'Mobile App Beta Now Available',
          excerpt: 'Experience Anilisting on the go with our new mobile app beta. Download and share your feedback!',
          imageUrl: 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=400',
          publishedAt: '2024-01-05T11:00:00Z',
          category: 'feature',
          tags: ['mobile', 'beta', 'app'],
          commentsCount: 167,
          isBookmarked: true
        }
      ];
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
  });

  const categories = {
    all: { label: 'All', icon: Newspaper, count: newsItems.length },
    feature: { label: 'Features', icon: TrendingUp, count: newsItems.filter(item => item.category === 'feature').length },
    news: { label: 'News', icon: Newspaper, count: newsItems.filter(item => item.category === 'news').length },
    announcement: { label: 'Announcements', icon: Calendar, count: newsItems.filter(item => item.category === 'announcement').length },
    community: { label: 'Community', icon: MessageSquare, count: newsItems.filter(item => item.category === 'community').length }
  };

  const filteredNews = selectedCategory === 'all' 
    ? newsItems 
    : newsItems.filter(item => item.category === selectedCategory);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  const getCategoryColor = (category: NewsItem['category']) => {
    const colors = {
      feature: 'text-blue-400 bg-blue-400/10',
      news: 'text-green-400 bg-green-400/10',
      announcement: 'text-yellow-400 bg-yellow-400/10',
      community: 'text-purple-400 bg-purple-400/10'
    };
    return colors[category] || 'text-muted-foreground bg-muted/10';
  };

  if (isLoading) {
    return <NewsAndUpdatesSkeleton />;
  }

  return (
    <section className={`py-16 ${className}`}>
      <div className="container mx-auto mobile-safe-padding space-y-8">
        {/* Section Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-primary rounded-xl">
              <Newspaper className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-3xl font-bold text-gradient-primary">News & Updates</h2>
              <p className="text-muted-foreground">
                Stay updated with the latest anime news and platform updates
              </p>
            </div>
          </div>
          
          <Button variant="outline" className="glass-button">
            View All News
            <ChevronRight className="w-4 h-4 ml-2" />
          </Button>
        </div>

        {/* Category Filters */}
        <div className="flex flex-wrap gap-3">
          {(Object.keys(categories) as (keyof typeof categories)[]).map((category) => {
            const config = categories[category];
            const Icon = config.icon;
            const isActive = selectedCategory === category;

            return (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                  isActive
                    ? 'bg-gradient-primary text-white'
                    : 'glass-card hover:bg-white/5'
                }`}
              >
                <Icon className="w-4 h-4" />
                {config.label}
                <span className="px-1.5 py-0.5 bg-white/20 rounded-full text-xs">
                  {config.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* News Grid */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Featured Article */}
          {filteredNews.length > 0 && (
            <div className="lg:col-span-2 space-y-6">
              <h3 className="text-xl font-semibold">Featured</h3>
              <FeaturedNewsCard news={filteredNews[0]} formatDate={formatDate} getCategoryColor={getCategoryColor} />
            </div>
          )}

          {/* Recent Articles */}
          <div className="space-y-6">
            <h3 className="text-xl font-semibold">Recent Updates</h3>
            <div className="space-y-4">
              {filteredNews.slice(1, 5).map((news) => (
                <NewsCard 
                  key={news.id} 
                  news={news} 
                  formatDate={formatDate} 
                  getCategoryColor={getCategoryColor}
                  compact
                />
              ))}
            </div>
          </div>
        </div>

        {/* All Articles */}
        {filteredNews.length > 5 && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-semibold">All Articles</h3>
              <div className="text-sm text-muted-foreground">
                {filteredNews.length} articles
              </div>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredNews.slice(5).map((news) => (
                <NewsCard 
                  key={news.id} 
                  news={news} 
                  formatDate={formatDate} 
                  getCategoryColor={getCategoryColor}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
});

interface NewsCardProps {
  news: NewsItem;
  formatDate: (date: string) => string;
  getCategoryColor: (category: NewsItem['category']) => string;
  compact?: boolean;
}

const FeaturedNewsCard = memo(({ news, formatDate, getCategoryColor }: NewsCardProps) => (
  <div className="glass-card overflow-hidden hover:bg-white/5 transition-all duration-300 cursor-pointer group">
    <div className="md:flex">
      <div className="md:w-2/5">
        <div className="aspect-video md:aspect-square md:h-full">
          <img 
            src={news.imageUrl} 
            alt={news.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        </div>
      </div>
      <div className="p-6 md:w-3/5 space-y-4">
        <div className="flex items-center gap-3">
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(news.category)}`}>
            {news.category}
          </span>
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <Clock className="w-4 h-4" />
            {formatDate(news.publishedAt)}
          </div>
        </div>
        
        <div className="space-y-2">
          <h4 className="text-xl font-bold group-hover:text-primary transition-colors line-clamp-2">
            {news.title}
          </h4>
          <p className="text-muted-foreground line-clamp-3">
            {news.excerpt}
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          {news.tags.slice(0, 3).map((tag) => (
            <span key={tag} className="px-2 py-1 bg-muted/20 rounded text-xs">
              #{tag}
            </span>
          ))}
        </div>

        <div className="flex items-center justify-between pt-2">
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <MessageSquare className="w-4 h-4" />
              {news.commentsCount}
            </div>
            <button className="flex items-center gap-1 hover:text-primary transition-colors">
              <Share2 className="w-4 h-4" />
              Share
            </button>
          </div>
          
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" className="p-2">
              <Bookmark className={`w-4 h-4 ${news.isBookmarked ? 'fill-current text-primary' : ''}`} />
            </Button>
            {news.externalUrl && (
              <Button variant="ghost" size="sm" className="p-2">
                <ExternalLink className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  </div>
));

const NewsCard = memo(({ news, formatDate, getCategoryColor, compact }: NewsCardProps) => (
  <div className={`glass-card overflow-hidden hover:bg-white/5 transition-all duration-300 cursor-pointer group ${
    compact ? 'flex gap-4 p-4' : 'space-y-4'
  }`}>
    <div className={compact ? 'w-20 h-20 flex-shrink-0' : 'aspect-video'}>
      <img 
        src={news.imageUrl} 
        alt={news.title}
        className="w-full h-full object-cover rounded-lg group-hover:scale-105 transition-transform duration-300"
      />
    </div>
    
    <div className={compact ? 'flex-1 min-w-0 space-y-2' : 'p-4 space-y-3'}>
      <div className="flex items-center gap-2 text-xs">
        <span className={`px-2 py-1 rounded-full font-medium ${getCategoryColor(news.category)}`}>
          {news.category}
        </span>
        <span className="text-muted-foreground">{formatDate(news.publishedAt)}</span>
      </div>
      
      <h4 className={`font-semibold group-hover:text-primary transition-colors ${
        compact ? 'text-sm line-clamp-2' : 'line-clamp-2'
      }`}>
        {news.title}
      </h4>
      
      {!compact && (
        <p className="text-sm text-muted-foreground line-clamp-2">
          {news.excerpt}
        </p>
      )}

      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <div className="flex items-center gap-1">
          <MessageSquare className="w-3 h-3" />
          {news.commentsCount}
        </div>
        {news.isBookmarked && (
          <Bookmark className="w-3 h-3 fill-current text-primary" />
        )}
      </div>
    </div>
  </div>
));

const NewsAndUpdatesSkeleton = () => (
  <section className="py-16">
    <div className="container mx-auto mobile-safe-padding space-y-8">
      {/* Header Skeleton */}
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 bg-muted/20 rounded-xl animate-pulse" />
        <div className="space-y-2">
          <div className="h-8 w-48 bg-muted/20 rounded animate-pulse" />
          <div className="h-4 w-64 bg-muted/20 rounded animate-pulse" />
        </div>
      </div>

      {/* Category Filters Skeleton */}
      <div className="flex gap-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-10 w-24 bg-muted/20 rounded-full animate-pulse" />
        ))}
      </div>

      {/* News Grid Skeleton */}
      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="h-6 w-24 bg-muted/20 rounded animate-pulse" />
          <div className="glass-card overflow-hidden">
            <div className="md:flex">
              <div className="md:w-2/5 aspect-video md:aspect-square bg-muted/20 animate-pulse" />
              <div className="p-6 md:w-3/5 space-y-4">
                <div className="flex gap-3">
                  <div className="h-6 w-16 bg-muted/20 rounded-full animate-pulse" />
                  <div className="h-6 w-20 bg-muted/20 rounded animate-pulse" />
                </div>
                <div className="space-y-2">
                  <div className="h-6 w-full bg-muted/20 rounded animate-pulse" />
                  <div className="h-4 w-5/6 bg-muted/20 rounded animate-pulse" />
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="space-y-6">
          <div className="h-6 w-32 bg-muted/20 rounded animate-pulse" />
          <div className="space-y-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="glass-card flex gap-4 p-4">
                <div className="w-16 h-16 bg-muted/20 rounded animate-pulse" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-16 bg-muted/20 rounded-full animate-pulse" />
                  <div className="h-4 w-full bg-muted/20 rounded animate-pulse" />
                  <div className="h-3 w-3/4 bg-muted/20 rounded animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  </section>
);

NewsAndUpdates.displayName = 'NewsAndUpdates';
FeaturedNewsCard.displayName = 'FeaturedNewsCard';
NewsCard.displayName = 'NewsCard';

export { NewsAndUpdates };