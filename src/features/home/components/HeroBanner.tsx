import React, { useState, useEffect, useCallback, memo } from 'react';
import { Button } from '@/components/ui/button';
import { Play, ChevronLeft, ChevronRight, Info, Plus, VolumeX, Volume2 } from 'lucide-react';
import { UnifiedSearchBar } from '@/features/search/components/UnifiedSearchBar';
import { LazyImage } from '@/components/ui/lazy-image';
import { useQuery } from '@tanstack/react-query';
import { dataService } from '@/core/services/DataService';

interface FeaturedContent {
  id: string;
  title: string;
  english_title?: string;
  cover_image: string;
  banner_image?: string;
  trailer_url?: string;
  description?: string;
  genres: string[];
  score: number;
  year: number;
  status: string;
  content_type: 'anime' | 'manga';
}

interface HeroBannerProps {
  onSearch?: (query: string) => void;
}

const HeroBanner = memo(({ onSearch }: HeroBannerProps) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true);
  const [showTrailer, setShowTrailer] = useState(false);

  // Fetch featured content for carousel
  const { data: featuredContent = [], isLoading } = useQuery({
    queryKey: ['hero-featured-content'],
    queryFn: async () => {
      // Get top trending anime with high scores and trailers
      const sections = await dataService.getHomeSections();
      const trending = sections.trendingAnime
        .filter(item => item.score >= 8.0 && item.banner_image)
        .slice(0, 5);
      return trending;
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
  });

  const currentContent = featuredContent[currentSlide];

  // Auto-advance carousel
  useEffect(() => {
    if (!isAutoPlaying || featuredContent.length <= 1) return;
    
    const timer = setInterval(() => {
      setCurrentSlide(prev => (prev + 1) % featuredContent.length);
    }, 6000);

    return () => clearInterval(timer);
  }, [isAutoPlaying, featuredContent.length]);

  const nextSlide = useCallback(() => {
    setCurrentSlide(prev => (prev + 1) % featuredContent.length);
  }, [featuredContent.length]);

  const prevSlide = useCallback(() => {
    setCurrentSlide(prev => (prev - 1 + featuredContent.length) % featuredContent.length);
  }, [featuredContent.length]);

  const handlePlayTrailer = useCallback(() => {
    setShowTrailer(true);
    setIsAutoPlaying(false);
  }, []);

  const handleCloseTrailer = useCallback(() => {
    setShowTrailer(false);
    setIsAutoPlaying(true);
  }, []);

  if (isLoading || !featuredContent.length) {
    return <HeroBannerSkeleton />;
  }

  return (
    <section className="relative h-[100vh] overflow-hidden">
      {/* Background Images with Parallax */}
      <div className="absolute inset-0">
        {featuredContent.map((content, index) => (
          <div
            key={content.id}
            className={`absolute inset-0 transition-opacity duration-1000 ${
              index === currentSlide ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <LazyImage
              src={content.banner_image || content.cover_image || content.image_url || ''}
              alt={content.title}
              className="w-full h-full object-cover transform scale-105 transition-transform duration-12000"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/60 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/40" />
          </div>
        ))}
      </div>

      {/* Trailer Video Overlay */}
      {showTrailer && currentContent?.trailer_url && (
        <div className="absolute inset-0 z-50 bg-black/95 flex items-center justify-center">
          <div className="relative w-full max-w-4xl aspect-video">
            <iframe
              src={`${currentContent.trailer_url}?autoplay=1&mute=${isMuted ? '1' : '0'}`}
              className="w-full h-full rounded-xl"
              allowFullScreen
              allow="autoplay; encrypted-media"
            />
            <Button
              onClick={handleCloseTrailer}
              className="absolute top-4 right-4 glass-button"
              size="sm"
            >
              ×
            </Button>
            <Button
              onClick={() => setIsMuted(!isMuted)}
              className="absolute bottom-4 right-4 glass-button"
              size="sm"
            >
              {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </Button>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="relative z-20 h-full flex items-center">
        <div className="container mx-auto mobile-safe-padding">
          <div className="max-w-2xl space-y-8">
            {/* Content Info */}
            <div className="space-y-6">
              {/* Meta Info */}
              <div className="flex items-center gap-4 text-sm opacity-90">
                <span className="px-3 py-1 bg-primary/20 rounded-full text-primary font-medium">
                  #{currentSlide + 1} TRENDING
                </span>
                <span>{currentContent?.year}</span>
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-accent rounded-full animate-pulse" />
                  <span className="text-accent font-medium">{currentContent?.status}</span>
                </div>
                {currentContent?.score && (
                  <div className="flex items-center gap-1">
                    <span className="text-yellow-400">★</span>
                    <span>{currentContent.score.toFixed(1)}</span>
                  </div>
                )}
              </div>

              {/* Title */}
              <div className="space-y-2">
                <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold leading-tight">
                  <span className="text-gradient-primary animate-gradient-shift">
                    {currentContent?.english_title || currentContent?.title}
                  </span>
                </h1>
                {currentContent?.english_title && (
                  <h2 className="text-xl md:text-2xl text-muted-foreground">
                    {currentContent.title}
                  </h2>
                )}
              </div>

              {/* Genres */}
              <div className="flex flex-wrap gap-2">
                {currentContent?.genres?.slice(0, 4).map((genre) => (
                  <span
                    key={genre}
                    className="px-3 py-1 bg-white/10 backdrop-blur-xl rounded-xl text-xs font-medium border border-white/20 hover:bg-white/15 hover:border-white/30 hover:scale-105 transition-all duration-300"
                  >
                    {genre}
                  </span>
                ))}
              </div>

              {/* Description */}
              {currentContent?.description && (
                <p className="text-lg leading-relaxed text-foreground/90 line-clamp-3 max-w-xl">
                  {currentContent.description.replace(/<[^>]*>/g, '').substring(0, 200)}...
                </p>
              )}

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-4">
                {currentContent?.trailer_url && (
                  <Button
                    onClick={handlePlayTrailer}
                    className="px-8 py-3 text-lg bg-white text-black hover:bg-white/90 transition-all duration-300 transform hover:scale-105"
                    size="lg"
                  >
                    <Play className="w-5 h-5 mr-2 fill-current" />
                    Watch Trailer
                  </Button>
                )}
                <Button
                  variant="appleGlass"
                  className="px-8 py-3 text-lg hover:-translate-y-1"
                  size="lg"
                >
                  <Info className="w-5 h-5 mr-2" />
                  More Info
                </Button>
                <Button
                  variant="appleGlass"
                  className="px-6 py-3 hover:bg-primary/10 hover:text-primary hover:-translate-y-1"
                  size="lg"
                >
                  <Plus className="w-5 h-5" />
                </Button>
              </div>
            </div>

            {/* Search Bar */}
            <div className="max-w-2xl">
              <div className="bg-white/8 backdrop-blur-2xl border border-white/20 rounded-xl p-4 hover:border-primary/40 hover:bg-white/10 transition-all duration-500 hover:scale-[1.01] hover:-translate-y-0.5">
                <UnifiedSearchBar
                  placeholder="Search anime, manga, characters..."
                  className="w-full glass-search"
                  onSearch={onSearch}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Controls */}
      {featuredContent.length > 1 && (
        <>
          {/* Arrow Controls */}
          <button
            onClick={prevSlide}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-30 bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl p-3 hover:bg-white/20 hover:border-white/30 transition-all duration-300 hover:scale-110 hover:-translate-y-1"
            aria-label="Previous slide"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <button
            onClick={nextSlide}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-30 bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl p-3 hover:bg-white/20 hover:border-white/30 transition-all duration-300 hover:scale-110 hover:-translate-y-1"
            aria-label="Next slide"
          >
            <ChevronRight className="w-6 h-6" />
          </button>

          {/* Dot Indicators */}
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-30 flex gap-3">
            {featuredContent.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`w-3 h-3 rounded-full transition-all duration-300 ${
                  index === currentSlide 
                    ? 'bg-primary shadow-glow-primary scale-125' 
                    : 'bg-white/30 hover:bg-white/50'
                }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        </>
      )}

      {/* Auto-play Toggle */}
      <div className="absolute bottom-8 right-8 z-30">
        <Button
          onClick={() => setIsAutoPlaying(!isAutoPlaying)}
          variant="outline"
          className="glass-button p-2 hover:bg-white/10"
          size="sm"
        >
          {isAutoPlaying ? (
            <div className="w-2 h-2 bg-accent rounded-full animate-pulse" />
          ) : (
            <div className="w-2 h-2 bg-muted-foreground rounded-full" />
          )}
        </Button>
      </div>

      {/* Gradient Overlay */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background via-background/80 to-transparent z-10" />
    </section>
  );
});

const HeroBannerSkeleton = () => (
  <section className="relative h-[100vh] overflow-hidden bg-muted/20 animate-pulse">
    <div className="absolute inset-0 bg-gradient-to-r from-muted/40 to-transparent" />
    <div className="relative z-20 h-full flex items-center">
      <div className="container mx-auto mobile-safe-padding">
        <div className="max-w-2xl space-y-8">
          <div className="space-y-6">
            <div className="flex gap-4">
              <div className="h-6 w-24 bg-muted/40 rounded-full" />
              <div className="h-6 w-16 bg-muted/40 rounded-full" />
              <div className="h-6 w-20 bg-muted/40 rounded-full" />
            </div>
            <div className="space-y-4">
              <div className="h-16 w-full max-w-lg bg-muted/40 rounded" />
              <div className="h-8 w-3/4 bg-muted/40 rounded" />
            </div>
            <div className="flex gap-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-6 w-16 bg-muted/40 rounded-full" />
              ))}
            </div>
            <div className="space-y-2">
              <div className="h-4 w-full bg-muted/40 rounded" />
              <div className="h-4 w-5/6 bg-muted/40 rounded" />
              <div className="h-4 w-4/6 bg-muted/40 rounded" />
            </div>
            <div className="flex gap-4">
              <div className="h-12 w-32 bg-muted/40 rounded" />
              <div className="h-12 w-28 bg-muted/40 rounded" />
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
);

HeroBanner.displayName = 'HeroBanner';

export { HeroBanner };