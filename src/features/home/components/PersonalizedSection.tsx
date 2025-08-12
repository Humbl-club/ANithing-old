import React, { memo, useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { AnimeCard } from '@/shared/components/AnimeCard';
import { 
  User, 
  Play, 
  BookOpen, 
  Clock, 
  TrendingUp, 
  Star, 
  ChevronRight, 
  RefreshCw,
  Settings
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { dataService } from '@/core/services/DataService';
import { useAuth } from '@/hooks/useAuth';
import { useNamePreference } from '@/hooks/useNamePreference';
import { useNavigate } from 'react-router-dom';
import type { DomainTitle } from '@/repositories/contentRepository';

interface PersonalizedSectionProps {
  onItemClick?: (content: DomainTitle) => void;
}

interface UserStats {
  totalWatched: number;
  totalPlanned: number;
  hoursWatched: number;
  averageScore: number;
  favoriteGenres: string[];
}

interface PersonalizedData {
  continueWatching: DomainTitle[];
  recommendations: DomainTitle[];
  becauseYouWatched: {
    basedOn: DomainTitle;
    recommendations: DomainTitle[];
  }[];
  stats: UserStats;
}

const PersonalizedSection = memo(({ onItemClick }: PersonalizedSectionProps) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { getDisplayName } = useNamePreference();
  const [refreshKey, setRefreshKey] = useState(0);

  // Fetch personalized data for logged-in users
  const { data: personalizedData, isLoading, error, refetch } = useQuery({
    queryKey: ['personalized-content', user?.id, refreshKey],
    queryFn: async (): Promise<PersonalizedData> => {
      if (!user) throw new Error('User not authenticated');
      
      // For now, we'll simulate personalized data based on trending content
      // In a real app, this would come from user's watch history and preferences
      const sections = await dataService.getHomeSections();
      
      // Mock user stats
      const stats: UserStats = {
        totalWatched: 127,
        totalPlanned: 43,
        hoursWatched: 2840,
        averageScore: 8.2,
        favoriteGenres: ['Action', 'Drama', 'Slice of Life', 'Romance']
      };

      // Mock continue watching (would come from user's current progress)
      const continueWatching = sections.trendingAnime.slice(0, 6);

      // Mock recommendations based on "viewing history"
      const recommendations = sections.trendingAnime.slice(6, 12);

      // Mock "because you watched" sections
      const becauseYouWatched = [
        {
          basedOn: sections.trendingAnime[0],
          recommendations: sections.trendingAnime.slice(1, 5)
        },
        {
          basedOn: sections.trendingAnime[5],
          recommendations: sections.trendingAnime.slice(6, 10)
        }
      ];

      return {
        continueWatching,
        recommendations,
        becauseYouWatched,
        stats
      };
    },
    enabled: !!user,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const handleRefresh = useCallback(() => {
    setRefreshKey(prev => prev + 1);
    refetch();
  }, [refetch]);

  const handleItemClick = useCallback((content: DomainTitle) => {
    if (onItemClick) {
      onItemClick(content);
    } else {
      const type = content.content_type || 'anime';
      navigate(`/${type}/${content.id}`);
    }
  }, [onItemClick, navigate]);

  // Show login prompt for non-authenticated users
  if (!user) {
    return <PersonalizedLoginPrompt />;
  }

  if (isLoading || !personalizedData) {
    return <PersonalizedSectionSkeleton />;
  }

  if (error) {
    return <PersonalizedSectionError error={error} onRetry={refetch} />;
  }

  return (
    <section className="py-16 bg-gradient-to-b from-background/50 to-background">
      <div className="container mx-auto mobile-safe-padding space-y-12">
        {/* Section Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-primary rounded-xl">
              <User className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-3xl font-bold text-gradient-primary">
                Welcome back, {user.user_metadata?.display_name || user.email?.split('@')[0]}!
              </h2>
              <p className="text-muted-foreground">Personalized just for you</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button onClick={handleRefresh} variant="outline" className="glass-button">
              <RefreshCw className="w-4 h-4" />
            </Button>
            <Button variant="outline" className="glass-button" onClick={() => navigate('/profile')}>
              <Settings className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* User Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="glass-card p-6 text-center space-y-2">
            <div className="p-3 bg-primary/10 rounded-lg inline-block">
              <Play className="w-6 h-6 text-primary" />
            </div>
            <div className="text-2xl font-bold text-gradient-primary">
              {personalizedData.stats.totalWatched}
            </div>
            <div className="text-sm text-muted-foreground">Completed</div>
          </div>
          <div className="glass-card p-6 text-center space-y-2">
            <div className="p-3 bg-accent/10 rounded-lg inline-block">
              <BookOpen className="w-6 h-6 text-accent" />
            </div>
            <div className="text-2xl font-bold text-accent">
              {personalizedData.stats.totalPlanned}
            </div>
            <div className="text-sm text-muted-foreground">Plan to Watch</div>
          </div>
          <div className="glass-card p-6 text-center space-y-2">
            <div className="p-3 bg-secondary/10 rounded-lg inline-block">
              <Clock className="w-6 h-6 text-secondary" />
            </div>
            <div className="text-2xl font-bold text-secondary">
              {Math.round(personalizedData.stats.hoursWatched / 24)}d
            </div>
            <div className="text-sm text-muted-foreground">Watch Time</div>
          </div>
          <div className="glass-card p-6 text-center space-y-2">
            <div className="p-3 bg-yellow-500/10 rounded-lg inline-block">
              <Star className="w-6 h-6 text-yellow-500" />
            </div>
            <div className="text-2xl font-bold text-yellow-500">
              {personalizedData.stats.averageScore}
            </div>
            <div className="text-sm text-muted-foreground">Avg Score</div>
          </div>
        </div>

        {/* Continue Watching */}
        {personalizedData.continueWatching.length > 0 && (
          <ContentSubsection
            title="Continue Watching"
            subtitle="Pick up where you left off"
            icon={Play}
            items={personalizedData.continueWatching}
            onItemClick={handleItemClick}
            getDisplayName={getDisplayName}
            viewAllPath="/my-list?status=watching"
          />
        )}

        {/* Personalized Recommendations */}
        {personalizedData.recommendations.length > 0 && (
          <ContentSubsection
            title="Recommended for You"
            subtitle="Based on your watching history and preferences"
            icon={TrendingUp}
            items={personalizedData.recommendations}
            onItemClick={handleItemClick}
            getDisplayName={getDisplayName}
            viewAllPath="/recommendations"
            showProgress={false}
          />
        )}

        {/* Because You Watched Sections */}
        {personalizedData.becauseYouWatched.map((section, index) => (
          <ContentSubsection
            key={section.basedOn.id}
            title={`Because you watched ${getDisplayName(section.basedOn)}`}
            subtitle="You might also like these"
            icon={Star}
            items={section.recommendations}
            onItemClick={handleItemClick}
            getDisplayName={getDisplayName}
            showProgress={false}
            className={index % 2 === 1 ? 'bg-muted/5 py-8 rounded-2xl' : ''}
          />
        ))}

        {/* Favorite Genres */}
        <div className="glass-card p-8 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-bold">Your Favorite Genres</h3>
              <p className="text-muted-foreground">Based on your viewing history</p>
            </div>
            <Button variant="outline" className="glass-button">
              <Settings className="w-4 h-4 mr-2" />
              Customize
            </Button>
          </div>
          <div className="flex flex-wrap gap-3">
            {personalizedData.stats.favoriteGenres.map((genre, index) => (
              <div
                key={genre}
                className={`px-4 py-2 rounded-full border transition-all duration-300 hover:scale-105 cursor-pointer ${
                  index === 0 
                    ? 'bg-gradient-primary text-white border-primary' 
                    : 'glass-card border-primary/20 hover:border-primary/40'
                }`}
              >
                {genre}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
});

interface ContentSubsectionProps {
  title: string;
  subtitle: string;
  icon: React.ComponentType<{ className?: string }>;
  items: DomainTitle[];
  onItemClick: (content: DomainTitle) => void;
  getDisplayName: (content: DomainTitle) => string;
  viewAllPath?: string;
  showProgress?: boolean;
  className?: string;
}

const ContentSubsection = memo(({
  title,
  subtitle,
  icon: Icon,
  items,
  onItemClick,
  getDisplayName,
  viewAllPath,
  showProgress = true,
  className = ''
}: ContentSubsectionProps) => {
  const navigate = useNavigate();

  return (
    <div className={`space-y-6 ${className}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Icon className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="text-xl font-bold">{title}</h3>
            <p className="text-sm text-muted-foreground">{subtitle}</p>
          </div>
        </div>
        {viewAllPath && (
          <Button
            variant="outline"
            className="group glass-button"
            onClick={() => navigate(viewAllPath)}
          >
            View All
            <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
          </Button>
        )}
      </div>
      
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {items.map((item) => (
          <div key={item.id} className="group relative">
            <AnimeCard
              content={item}
              onClick={() => onItemClick(item)}
              getDisplayName={getDisplayName}
              className="transition-all duration-300 group-hover:scale-105 group-hover:-translate-y-2"
            />
            {showProgress && (
              <div className="absolute bottom-2 left-2 right-2 bg-black/80 rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="bg-primary h-1 rounded-full" style={{ width: `${Math.random() * 80 + 10}%` }} />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
});

const PersonalizedLoginPrompt = () => {
  const navigate = useNavigate();

  return (
    <section className="py-16">
      <div className="container mx-auto mobile-safe-padding">
        <div className="glass-card p-12 text-center space-y-6">
          <div className="p-4 bg-gradient-primary rounded-full inline-block">
            <User className="w-8 h-8 text-white" />
          </div>
          <div className="space-y-4">
            <h2 className="text-2xl font-bold">Unlock Your Personalized Experience</h2>
            <p className="text-muted-foreground max-w-md mx-auto">
              Sign in to get personalized recommendations, track your progress, 
              and discover anime based on your unique taste.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              onClick={() => navigate('/auth?mode=signin')}
              className="px-8 py-3"
              size="lg"
            >
              Sign In
            </Button>
            <Button
              onClick={() => navigate('/auth?mode=signup')}
              variant="outline"
              className="px-8 py-3 glass-button"
              size="lg"
            >
              Create Account
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            Free forever • No spam • Your data stays private
          </p>
        </div>
      </div>
    </section>
  );
};

const PersonalizedSectionSkeleton = () => (
  <section className="py-16">
    <div className="container mx-auto mobile-safe-padding space-y-12">
      {/* Header Skeleton */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-muted/20 rounded-xl animate-pulse" />
          <div className="space-y-2">
            <div className="h-8 w-64 bg-muted/20 rounded animate-pulse" />
            <div className="h-4 w-32 bg-muted/20 rounded animate-pulse" />
          </div>
        </div>
      </div>

      {/* Stats Skeleton */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="glass-card p-6 text-center space-y-2">
            <div className="w-12 h-12 bg-muted/20 rounded-lg mx-auto animate-pulse" />
            <div className="h-6 w-8 bg-muted/20 rounded mx-auto animate-pulse" />
            <div className="h-4 w-16 bg-muted/20 rounded mx-auto animate-pulse" />
          </div>
        ))}
      </div>

      {/* Content Sections Skeleton */}
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-muted/20 rounded-lg animate-pulse" />
              <div className="space-y-2">
                <div className="h-6 w-48 bg-muted/20 rounded animate-pulse" />
                <div className="h-4 w-32 bg-muted/20 rounded animate-pulse" />
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {Array.from({ length: 6 }).map((_, j) => (
              <div key={j} className="h-[300px] bg-muted/20 rounded-lg animate-pulse" />
            ))}
          </div>
        </div>
      ))}
    </div>
  </section>
);

const PersonalizedSectionError = ({ error, onRetry }: { error: Error; onRetry: () => void }) => (
  <section className="py-16">
    <div className="container mx-auto mobile-safe-padding">
      <div className="glass-card p-8 text-center space-y-6">
        <div className="w-16 h-16 mx-auto bg-red-500/10 rounded-full flex items-center justify-center">
          <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        </div>
        <div>
          <h3 className="text-xl font-semibold mb-2">Failed to Load Personalized Content</h3>
          <p className="text-muted-foreground mb-4">
            We couldn't load your personalized recommendations. Please try again.
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

PersonalizedSection.displayName = 'PersonalizedSection';

export { PersonalizedSection };