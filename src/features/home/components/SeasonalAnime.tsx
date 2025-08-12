import React, { memo, useState, useCallback, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { AnimeCard } from '@/shared/components/AnimeCard';
import { LazyImage } from '@/components/ui/lazy-image';
import { 
  Calendar,
  Sun,
  Leaf,
  Snowflake,
  Flower2,
  ChevronRight,
  Clock,
  Star,
  Play,
  Filter
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { dataService } from '@/core/services/DataService';
import { useNamePreference } from '@/hooks/useNamePreference';
import { useNavigate } from 'react-router-dom';
import type { DomainTitle } from '@/repositories/contentRepository';

interface SeasonalAnimeProps {
  onItemClick?: (content: DomainTitle) => void;
}

type Season = 'winter' | 'spring' | 'summer' | 'fall';

interface SeasonalData {
  winter: DomainTitle[];
  spring: DomainTitle[];
  summer: DomainTitle[];
  fall: DomainTitle[];
}

const SeasonalAnime = memo(({ onItemClick }: SeasonalAnimeProps) => {
  const navigate = useNavigate();
  const { getDisplayName } = useNamePreference();
  
  // Get current season based on month
  const getCurrentSeason = (): Season => {
    const month = new Date().getMonth() + 1;
    if (month >= 12 || month <= 2) return 'winter';
    if (month >= 3 && month <= 5) return 'spring';
    if (month >= 6 && month <= 8) return 'summer';
    return 'fall';
  };

  const [activeSeason, setActiveSeason] = useState<Season>(getCurrentSeason());
  const [showUpcoming, setShowUpcoming] = useState(false);

  // Fetch seasonal anime
  const { data: seasonalData, isLoading } = useQuery({
    queryKey: ['seasonal-anime'],
    queryFn: async (): Promise<SeasonalData> => {
      const sections = await dataService.getHomeSections();
      const baseAnime = sections.trendingAnime;
      
      // Simulate seasonal data by filtering and shuffling
      // In a real app, this would filter by actual season/year data
      const shuffleArray = (array: DomainTitle[]) => [...array].sort(() => Math.random() - 0.5);
      
      return {
        winter: shuffleArray(baseAnime).slice(0, 18),
        spring: shuffleArray(baseAnime).slice(6, 24),
        summer: shuffleArray(baseAnime).slice(12, 30),
        fall: shuffleArray(baseAnime).slice(18, 36)
      };
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
  });

  const currentYear = new Date().getFullYear();
  const nextYear = currentYear + 1;

  const seasonConfig = {
    winter: {
      label: 'Winter',
      year: activeSeason === 'winter' && getCurrentSeason() === 'winter' ? currentYear : nextYear,
      icon: Snowflake,
      color: 'text-blue-400',
      bgColor: 'bg-blue-400/10',
      gradient: 'from-blue-600/20 to-cyan-400/20',
      emoji: '❄️'
    },
    spring: {
      label: 'Spring',
      year: activeSeason === 'spring' && getCurrentSeason() === 'spring' ? currentYear : 
            ['winter'].includes(getCurrentSeason()) ? currentYear : nextYear,
      icon: Flower2,
      color: 'text-pink-400',
      bgColor: 'bg-pink-400/10',
      gradient: 'from-pink-500/20 to-green-400/20',
      emoji: '🌸'
    },
    summer: {
      label: 'Summer',
      year: activeSeason === 'summer' && getCurrentSeason() === 'summer' ? currentYear :
            ['winter', 'spring'].includes(getCurrentSeason()) ? currentYear : nextYear,
      icon: Sun,
      color: 'text-yellow-400',
      bgColor: 'bg-yellow-400/10',
      gradient: 'from-yellow-400/20 to-orange-400/20',
      emoji: '☀️'
    },
    fall: {
      label: 'Fall',
      year: activeSeason === 'fall' && getCurrentSeason() === 'fall' ? currentYear :
            ['winter', 'spring', 'summer'].includes(getCurrentSeason()) ? currentYear : nextYear,
      icon: Leaf,
      color: 'text-orange-400',
      bgColor: 'bg-orange-400/10',
      gradient: 'from-orange-500/20 to-red-400/20',
      emoji: '🍂'
    }
  };

  const currentData = useMemo(() => {
    return seasonalData?.[activeSeason] || [];
  }, [seasonalData, activeSeason]);

  const handleItemClick = useCallback((content: DomainTitle) => {
    if (onItemClick) {
      onItemClick(content);
    } else {
      const type = content.content_type || 'anime';
      navigate(`/${type}/${content.id}`);
    }
  }, [onItemClick, navigate]);

  const handleSeasonClick = useCallback((season: Season) => {
    setActiveSeason(season);
  }, []);

  if (isLoading) {
    return <SeasonalAnimeSkeleton />;
  }

  const currentSeasonConfig = seasonConfig[activeSeason];
  const Icon = currentSeasonConfig.icon;

  return (
    <section className="py-16 relative">
      {/* Background Gradient */}
      <div className={`absolute inset-0 bg-gradient-to-br ${currentSeasonConfig.gradient} opacity-30`} />
      
      <div className="relative container mx-auto mobile-safe-padding space-y-8">
        {/* Section Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className={`p-3 ${currentSeasonConfig.bgColor} rounded-xl`}>
              <Icon className={`w-6 h-6 ${currentSeasonConfig.color}`} />
            </div>
            <div>
              <h2 className="text-3xl font-bold flex items-center gap-2">
                <span className="text-gradient-primary">Seasonal Anime</span>
                <span className="text-2xl">{currentSeasonConfig.emoji}</span>
              </h2>
              <p className="text-muted-foreground">
                {currentSeasonConfig.label} {currentSeasonConfig.year} • {currentData.length} titles
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <div className="flex bg-muted/20 rounded-lg p-1">
              <button
                onClick={() => setShowUpcoming(false)}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                  !showUpcoming 
                    ? 'bg-primary text-primary-foreground' 
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Airing
              </button>
              <button
                onClick={() => setShowUpcoming(true)}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                  showUpcoming 
                    ? 'bg-primary text-primary-foreground' 
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Upcoming
              </button>
            </div>
            
            <Button variant="outline" className="glass-button">
              <Filter className="w-4 h-4 mr-2" />
              Genre
            </Button>
            
            <Button 
              variant="outline" 
              className="glass-button"
              onClick={() => navigate('/seasonal')}
            >
              View Calendar
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        </div>

        {/* Season Selector */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {(Object.keys(seasonConfig) as Season[]).map((season) => {
            const config = seasonConfig[season];
            const SeasonIcon = config.icon;
            const isActive = activeSeason === season;
            const isCurrent = season === getCurrentSeason();
            
            return (
              <button
                key={season}
                onClick={() => handleSeasonClick(season)}
                className={`glass-card p-4 text-left transition-all duration-300 hover:scale-105 ${
                  isActive ? 'border-2 border-primary/50 bg-primary/5' : 'hover:bg-white/5'
                }`}
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className={`p-2 rounded-lg ${config.bgColor}`}>
                    <SeasonIcon className={`w-5 h-5 ${config.color}`} />
                  </div>
                  <div>
                    <div className="font-semibold flex items-center gap-2">
                      {config.label} {config.year}
                      {isCurrent && <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {isCurrent ? 'Current Season' : 'Coming Soon'}
                    </div>
                  </div>
                </div>
                {isActive && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Airing: {Math.floor(currentData.length * 0.7)}</span>
                      <span>Upcoming: {Math.floor(currentData.length * 0.3)}</span>
                    </div>
                    <div className="w-full bg-muted/20 rounded-full h-1">
                      <div 
                        className={`h-full bg-gradient-to-r ${config.color.replace('text-', 'from-')} to-primary rounded-full`}
                        style={{ width: `${(currentData.length / 24) * 100}%` }}
                      />
                    </div>
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* Featured Spotlight */}
        {currentData.length > 0 && (
          <div className="glass-card p-6 bg-gradient-to-r from-primary/5 to-secondary/5">
            <div className="flex items-center gap-3 mb-4">
              <Star className="w-5 h-5 text-yellow-400" />
              <h3 className="text-lg font-semibold">Season Highlight</h3>
            </div>
            
            <div className="grid md:grid-cols-3 gap-6">
              <div className="md:col-span-1">
                <div className="aspect-[3/4] rounded-xl overflow-hidden">
                  <LazyImage
                    src={currentData[0].image_url || currentData[0].cover_image || ''}
                    alt={getDisplayName(currentData[0])}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                  />
                </div>
              </div>
              
              <div className="md:col-span-2 space-y-4">
                <div>
                  <h4 className="text-xl font-bold mb-2">
                    {getDisplayName(currentData[0])}
                  </h4>
                  <p className="text-muted-foreground line-clamp-3">
                    {currentData[0].description?.replace(/<[^>]*>/g, '').substring(0, 200)}...
                  </p>
                </div>
                
                <div className="flex flex-wrap gap-2">
                  {currentData[0].genres?.slice(0, 3).map((genre) => (
                    <span
                      key={genre}
                      className="px-3 py-1 bg-primary/10 text-primary rounded-full text-xs font-medium"
                    >
                      {genre}
                    </span>
                  ))}
                </div>
                
                <div className="flex items-center gap-6 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    {currentSeasonConfig.label} {currentSeasonConfig.year}
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {showUpcoming ? 'Coming Soon' : 'Airing Now'}
                  </div>
                  {currentData[0].score && (
                    <div className="flex items-center gap-1 text-yellow-400">
                      <Star className="w-4 h-4" />
                      {currentData[0].score.toFixed(1)}
                    </div>
                  )}
                </div>
                
                <div className="flex gap-3">
                  <Button
                    onClick={() => handleItemClick(currentData[0])}
                    className="px-6"
                  >
                    <Play className="w-4 h-4 mr-2" />
                    {showUpcoming ? 'Add to List' : 'Watch Now'}
                  </Button>
                  <Button variant="outline" className="glass-button">
                    More Info
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Anime Grid */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-semibold">
              All {currentSeasonConfig.label} {currentSeasonConfig.year} Anime
            </h3>
            <div className="text-sm text-muted-foreground">
              Showing {showUpcoming ? 'upcoming' : 'currently airing'} titles
            </div>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6">
            {currentData.map((item, index) => (
              <div key={item.id} className="group relative">
                <AnimeCard
                  content={item}
                  onClick={() => handleItemClick(item)}
                  getDisplayName={getDisplayName}
                  className="transition-all duration-300 group-hover:scale-105 group-hover:-translate-y-2"
                />
                
                {/* Status Badge */}
                <div className="absolute top-2 left-2 z-10">
                  <div className={`px-2 py-1 rounded-full text-xs font-bold ${
                    showUpcoming 
                      ? 'bg-orange-500/80 text-white' 
                      : 'bg-green-500/80 text-white'
                  }`}>
                    {showUpcoming ? 'Soon' : 'Airing'}
                  </div>
                </div>
                
                {/* Score Badge */}
                {item.score && (
                  <div className="absolute top-2 right-2 z-10">
                    <div className="px-2 py-1 bg-black/80 rounded-full text-xs font-bold text-yellow-400">
                      ★ {item.score.toFixed(1)}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Load More */}
        <div className="text-center">
          <Button 
            variant="outline" 
            className="px-8 py-3 glass-button hover:bg-primary/10 hover:border-primary/30"
            onClick={() => navigate('/seasonal')}
          >
            View Full {currentSeasonConfig.label} Calendar
            <ChevronRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </div>
    </section>
  );
});

const SeasonalAnimeSkeleton = () => (
  <section className="py-16">
    <div className="container mx-auto mobile-safe-padding space-y-8">
      {/* Header Skeleton */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-muted/20 rounded-xl animate-pulse" />
          <div className="space-y-2">
            <div className="h-8 w-56 bg-muted/20 rounded animate-pulse" />
            <div className="h-4 w-32 bg-muted/20 rounded animate-pulse" />
          </div>
        </div>
      </div>

      {/* Season Selector Skeleton */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="glass-card p-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-muted/20 rounded-lg animate-pulse" />
              <div className="space-y-2">
                <div className="h-4 w-24 bg-muted/20 rounded animate-pulse" />
                <div className="h-3 w-20 bg-muted/20 rounded animate-pulse" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Featured Spotlight Skeleton */}
      <div className="glass-card p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-5 h-5 bg-muted/20 rounded animate-pulse" />
          <div className="h-6 w-32 bg-muted/20 rounded animate-pulse" />
        </div>
        
        <div className="grid md:grid-cols-3 gap-6">
          <div className="aspect-[3/4] bg-muted/20 rounded-xl animate-pulse" />
          <div className="md:col-span-2 space-y-4">
            <div className="space-y-2">
              <div className="h-6 w-64 bg-muted/20 rounded animate-pulse" />
              <div className="h-4 w-full bg-muted/20 rounded animate-pulse" />
              <div className="h-4 w-5/6 bg-muted/20 rounded animate-pulse" />
            </div>
            <div className="flex gap-2">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-6 w-16 bg-muted/20 rounded-full animate-pulse" />
              ))}
            </div>
          </div>
        </div>
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

SeasonalAnime.displayName = 'SeasonalAnime';

export { SeasonalAnime };