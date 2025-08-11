import { useState, useEffect, useMemo, Suspense } from "react";
import { useNavigate } from "react-router-dom";
import { Navigation } from "@/layouts/components/Navigation";
import { HeroSection } from "@/features/home/components/HeroSection";
import { PersonalizedDashboard } from "@/features/home/components/PersonalizedDashboard";
import { TrendingContentSection } from "@/features/home/components/TrendingContentSection";
import { AnimeCard } from "@/shared/components/AnimeCard";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useContentData } from "@/hooks/useContentData";
import { useNamePreference } from "@/hooks/useNamePreference";
import { useStats } from "@/hooks/useStats";
import { useAuth } from "@/hooks/useAuth";
import { type Anime } from "@/data/animeData";
import { TrendingUp, Clock, Star, ChevronRight, Loader2 } from "lucide-react";
import { EmailVerificationBanner } from "@/features/user/components/EmailVerificationBanner";
import { LegalFooter } from "@/layouts/components/LegalFooter";
import { supabase } from "@/integrations/supabase/client";
import { logger } from "@/utils/logger";
import React from 'react';
function useHealthStatus() {
  const [status, setStatus] = React.useState<'ok'|'degraded'|'error'|'unknown'>('unknown');
  React.useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const { data, error } = await supabase.functions.invoke('health', { body: {} });
        if (!mounted) return;
        if (error) throw error;
        const s = (data?.data?.status as string) || 'degraded';
        setStatus(s === 'ok' ? 'ok' : 'degraded');
      } catch {
        if (mounted) setStatus('error');
      }
    })();
    return () => { mounted = false };
  }, []);
  return status;
}
const Index = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { showEnglish, setShowEnglish, getDisplayName } = useNamePreference();
  const { stats, formatCount } = useStats();
  const [searchResults, setSearchResults] = useState<Anime[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [triggerEmailPopup, setTriggerEmailPopup] = useState(false);
  // Get anime data using cached edge function for ultra-fast loading
  // Replace with direct titles fetch via useContentData and ensure content_type filter
  const { data: allAnime, loading: animeLoading, error: animeError } = useContentData({
    contentType: 'anime',
    page: 1,
    limit: 36,
    filters: {
      sort_by: 'score',
      order: 'desc'
    }
  });
  // Store edge sections
  const [homeSections, setHomeSections] = useState<{ trendingAnime?: any[]; recentAnime?: any[] }>({});
  // New: Fetch homepage sections from working edge function get-home-data
  useEffect(() => {
    (async () => {
      try {
        const { data, error } = await supabase.functions.invoke('get-home-data', {
          body: {
            sections: ['trending-anime', 'recent-anime'],
            limit: 24
          }
        });
        if (error) {
          // Handle error silently or use proper error tracking
        } else if (data?.success && data?.data) {
          setHomeSections({
            trendingAnime: data.data.trendingAnime || [],
            recentAnime: data.data.recentAnime || []
          });
        }
      } catch (e) {
        // Handle error silently or use proper error tracking
      }
    })();
  }, []);
  // Prefer edge sections; fallback to direct slices
  const trendingAnime = useMemo(
    () => (homeSections.trendingAnime && homeSections.trendingAnime.length > 0)
      ? homeSections.trendingAnime
      : (allAnime?.slice(0, 12) || []),
    [homeSections.trendingAnime, allAnime]
  );
  const recentlyAdded = useMemo(
    () => (homeSections.recentAnime && homeSections.recentAnime.length > 0)
      ? homeSections.recentAnime
      : (allAnime?.slice(12, 24) || []),
    [homeSections.recentAnime, allAnime]
  );
  const topRated = useMemo(() => allAnime?.slice(24, 36) || [], [allAnime]);
  const loading = animeLoading;
  const error = animeError;
  // Debug: Log homepage data
  logger.debug('🏠 Homepage data check:', {
    allAnime,
    loading,
    error,
    trendingAnime: trendingAnime,
    trendingAnimeLength: trendingAnime.length,
    recentlyAdded: recentlyAdded,
    recentlyAddedLength: recentlyAdded.length,
    topRated: topRated,
    topRatedLength: topRated.length,
    searchResults: searchResults,
    searchResultsLength: searchResults.length,
    isSearching: isSearching
  });
  const handleAnimeClick = (anime: Anime) => {
    navigate(`/anime/${anime.id}`);
  };
  const AnimeSection = ({ 
    title, 
    subtitle, 
    icon: Icon, 
    animeList, 
    className = "" 
  }: { 
    title: string; 
    subtitle: string; 
    icon: any; 
    animeList: Anime[]; 
    className?: string;
  }) => (
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
          <Button 
            variant="outline" 
            className="group"
            onClick={() => navigate('/anime')}
          >
            View All
            <ChevronRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
          </Button>
        </div>
        <Suspense fallback={
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6">
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="h-[400px] bg-muted/20 animate-pulse rounded-lg" />
            ))}
          </div>
        }>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6">
            {animeList.map((anime) => (
              <div key={anime.id} className="group">
                <AnimeCard 
                  anime={anime} 
                  onClick={() => handleAnimeClick(anime)}
                  getDisplayName={getDisplayName}
                />
              </div>
            ))}
          </div>
        </Suspense>
      </div>
    </section>
  );
  const status = useHealthStatus();
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
          <p>Loading anime...</p>
        </div>
      </div>
    );
  }
  return (
    <div className="min-h-screen relative">
      <Navigation />
      {/* Hero Section */}
      <Suspense fallback={
        <div className="h-[600px] flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin" />
        </div>
      }>
        <HeroSection />
      </Suspense>
      {/* Search Results */}
      {isSearching && (
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              <span className="ml-3 text-lg">Searching...</span>
            </div>
          </div>
        </section>
      )}
      {searchResults.length > 0 && !isSearching && (
        <section className="py-16 bg-muted/20">
          <div className="container mx-auto px-4">
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-gradient-primary mb-2">Search Results</h2>
              <div className="flex items-center gap-2">
                <Badge variant="secondary">{searchResults.length} results found</Badge>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
              {searchResults.map((anime, index) => (
                <div 
                  key={anime.id} 
                  className="animate-fade-in"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <AnimeCard 
                    anime={anime} 
                    onClick={() => handleAnimeClick(anime)}
                    getDisplayName={getDisplayName}
                  />
                </div>
              ))}
            </div>
          </div>
        </section>
      )}
      {/* New Trending System */}
      {searchResults.length === 0 && !isSearching && (
        <div className="container mx-auto px-4">
          {/* If edge sections available, render them via cards */}
          {trendingAnime.length > 0 && (
            <section className="py-8">
              <div className="flex items-center gap-2 mb-6">
                <TrendingUp className="h-6 w-6 text-primary" />
                <h2 className="text-2xl font-bold">🔥 Trending Anime</h2>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
                {trendingAnime.slice(0, 12).map((item: any) => (
                  <AnimeCard key={item.id} anime={{
                    id: item.id,
                    title: item.title,
                    title_english: item.title_english,
                    title_japanese: item.title_japanese,
                    image_url: item.image_url,
                    synopsis: item.synopsis || '',
                    score: item.score || item.anilist_score || 0,
                    status: item.anime_details?.status || item.status || 'Unknown',
                    type: item.anime_details?.type || 'TV',
                  } as any} onClick={() => navigate(`/anime/${item.id}`)} getDisplayName={getDisplayName} />
                ))}
              </div>
            </section>
          )}
          {recentlyAdded.length > 0 && (
            <section className="py-8">
              <div className="flex items-center gap-2 mb-6">
                <Clock className="h-5 w-5 text-primary" />
                <h2 className="text-2xl font-bold">🆕 Recently Added</h2>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl-grid-cols-6 gap-4">
                {recentlyAdded.slice(0, 12).map((item: any) => (
                  <AnimeCard key={item.id} anime={{
                    id: item.id,
                    title: item.title,
                    title_english: item.title_english,
                    title_japanese: item.title_japanese,
                    image_url: item.image_url,
                    synopsis: item.synopsis || '',
                    score: item.score || item.anilist_score || 0,
                    status: item.anime_details?.status || item.status || 'Unknown',
                    type: item.anime_details?.type || 'TV',
                  } as any} onClick={() => navigate(`/anime/${item.id}`)} getDisplayName={getDisplayName} />
                ))}
              </div>
            </section>
          )}
          {/* Keep original componentized section as backup */}
          <TrendingContentSection 
            contentType="anime" 
            title="🔥 Trending Anime" 
            limit={24}
          />
          <TrendingContentSection 
            contentType="manga" 
            title="📚 Trending Manga" 
            limit={18}
          />
        </div>
      )}
      {/* Fallback: Original sections if new trending fails */}
      {searchResults.length === 0 && !isSearching && (trendingAnime.length > 0 || recentlyAdded.length > 0) && (
        <div className="container mx-auto px-4 mt-8">
          <AnimeSection
            title="Fallback: Top Rated"
            subtitle="Highest average scores (MAL + AniList combined)"
            icon={Star}
            animeList={topRated}
            className="bg-muted/10"
          />
        </div>
      )}
      {/* Stats Footer */}
      <section className="py-16 md:py-20 bg-gradient-to-br from-primary/10 to-accent/10">
        <div className="container mx-auto mobile-safe-padding text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6 md:mb-8">
            Join the Ultimate <span className="text-accent">Ani</span><span className="text-primary">thing</span> Community
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8 max-w-4xl mx-auto">
            <div className="space-y-2">
              <div className="text-3xl md:text-4xl font-bold text-primary">{formatCount(stats.animeCount)}</div>
              <div className="text-sm md:text-base text-muted-foreground">Anime Series</div>
            </div>
            <div className="space-y-2">
              <div className="text-3xl md:text-4xl font-bold text-accent">{formatCount(stats.mangaCount)}</div>
              <div className="text-sm md:text-base text-muted-foreground">Manga Titles</div>
            </div>
            <div className="space-y-2">
              <div className="text-3xl md:text-4xl font-bold text-secondary">{formatCount(stats.userCount)}</div>
              <div className="text-sm md:text-base text-muted-foreground">Users</div>
            </div>
            <div className="space-y-2">
              <div className="text-3xl md:text-4xl font-bold text-primary">24/7</div>
              <div className="text-sm md:text-base text-muted-foreground">Updates</div>
            </div>
          </div>
          <div className="mt-8 md:mt-12">
            <Button 
              variant="hero" 
              size="lg" 
              className="px-8 md:px-12 py-4 text-base md:text-lg"
              onClick={() => navigate('/auth?tab=signup')}
            >
              Get Started Today
            </Button>
          </div>
        </div>
      </section>
      <LegalFooter />
      {/* Email Verification Banner */}
      <EmailVerificationBanner />
      <div className="fixed bottom-3 right-3 text-xs px-2 py-1 rounded bg-muted/60 backdrop-blur border">
        <span>Health: {status}</span>
      </div>
    </div>
  );
};
export default Index;
