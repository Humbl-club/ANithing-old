import { Suspense, memo, useCallback, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
// Layout components
import { Navigation } from "@/layouts/components/Navigation";
import { LegalFooter } from "@/layouts/components/LegalFooter";
import { EmailVerificationBanner } from "@/features/user/components/EmailVerificationBanner";
// New feature components
import { HeroBanner } from "@/features/home/components/HeroBanner";
import { PersonalizedSection } from "@/features/home/components/PersonalizedSection";
import { TrendingTabs } from "@/features/home/components/TrendingTabs";
import { SeasonalAnime } from "@/features/home/components/SeasonalAnime";
import { NewsAndUpdates } from "@/features/home/components/NewsAndUpdates";
import { InfiniteScroll } from "@/features/home/components/InfiniteScroll";
// Legacy components (kept for fallback)
import { StatsSection } from "@/features/home/components/StatsSection";
import { HealthStatus } from "@/features/home/components/HealthStatus";
import { SearchResultsGrid } from "@/features/search/components/SearchResultsGrid";
// Hooks
import { useHomePageData } from "@/features/home/hooks/useHomePageData";
import { useNamePreference } from "@/hooks/useNamePreference";
import { useSearch } from "@/features/search/hooks/useSearch";
import { useAuth } from "@/hooks/useAuth";

/**
 * Completely Redesigned Index page with new aesthetics and modern UI
 * Features: HeroBanner carousel, PersonalizedSection, TrendingTabs, SeasonalAnime, NewsUpdates
 * Enhanced with smooth animations, parallax effects, and infinite scroll
*/

// Simple loading screen - no need to memoize
const LoadingScreen = () => {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
        <p>Loading anime...</p>
      </div>
    </div>
  );
};

// Simple error screen - no need to memoize
const ErrorScreen = ({ error }: { error: Error }) => {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-4">Something went wrong</h2>
        <p className="text-muted-foreground">{error.message}</p>
      </div>
    </div>
  );
};

// Hero banner skeleton
const HeroBannerSkeleton = () => {
  return (
    <div className="h-[100vh] flex items-center justify-center bg-gradient-to-br from-muted/20 to-background animate-pulse">
      <div className="text-center space-y-4">
        <Loader2 className="w-12 h-12 animate-spin mx-auto text-primary" />
        <p className="text-muted-foreground">Loading amazing content...</p>
      </div>
    </div>
  );
};

const IndexRefactored = memo(() => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { getDisplayName } = useNamePreference();
  
  // Fetch home page data
  const { sections, isLoading, error } = useHomePageData();
  
  // Search functionality
  const searchOptions = { 
    contentType: 'anime' as const,
    limit: 24 
  };
  
  const { 
    results: searchResults, 
    searchQuery,
    setSearchQuery 
  } = useSearch(searchOptions);
  
  // Handle navigation - memoized callback
  const handleContentClick = useCallback((content: any) => {
    const type = content.content_type || 'anime';
    navigate(`/${type}/${content.id}`);
  }, [navigate]);
  
  // Simple boolean checks - no memoization needed
  const isSearching = searchQuery.length > 0;
  const hasSearchResults = searchResults.items.length > 0;
  const showTrendingAnime = sections.trendingAnime.length > 0;
  const showRecentAnime = sections.recentAnime.length > 0;
  
  // Loading state
  if (isLoading) {
    return <LoadingScreen />;
  }
  
  // Error state
  if (error) {
    return <ErrorScreen error={error} />;
  }

  // Check if we have any content at all
  const hasAnyContent = sections.trendingAnime.length > 0 || 
                       sections.recentAnime.length > 0 || 
                       sections.trendingManga.length > 0 || 
                       sections.recentManga.length > 0;
  
  return (
    <div className="min-h-screen relative overflow-x-hidden">
      <Navigation />
      
      {/* Search Results Override */}
      {isSearching && hasSearchResults ? (
        <div className="pt-20">
          <SearchResultsGrid 
            results={searchResults.items}
            totalCount={searchResults.total}
            isLoading={searchResults.isSearching}
            onItemClick={handleContentClick}
            getDisplayName={getDisplayName}
          />
        </div>
      ) : (
        <>
          {/* Hero Banner with Featured Carousel */}
          <Suspense fallback={<HeroBannerSkeleton />}>
            <HeroBanner onSearch={setSearchQuery} />
          </Suspense>
          
          {/* Personalized Section (for logged-in users) */}
          <PersonalizedSection onItemClick={handleContentClick} />
          
          {/* Trending Content with Tabs */}
          <TrendingTabs onItemClick={handleContentClick} />
          
          {/* Seasonal Anime */}
          <SeasonalAnime onItemClick={handleContentClick} />
          
          {/* News and Updates */}
          <NewsAndUpdates className="bg-gradient-to-b from-background/80 to-background" />
          
          {/* Empty State Message */}
          {!hasAnyContent && (
            <section className="py-16">
              <div className="container mx-auto mobile-safe-padding text-center">
                <div className="glass-card p-12 space-y-6">
                  <div className="w-20 h-20 mx-auto bg-muted/20 rounded-full flex items-center justify-center">
                    <svg className="w-10 h-10 text-muted-foreground/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-2xl font-semibold mb-2">No Content Available Yet</h3>
                    <p className="text-muted-foreground max-w-md mx-auto">
                      We're working on populating the database with amazing anime and manga content. 
                      Check back soon for trending titles, recommendations, and more!
                    </p>
                  </div>
                  <div className="flex gap-4 justify-center">
                    <Button 
                      onClick={() => window.location.reload()} 
                      className="px-6"
                    >
                      Refresh Page
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={() => navigate('/search')}
                      className="px-6"
                    >
                      Search Content
                    </Button>
                  </div>
                </div>
              </div>
            </section>
          )}
          
          {/* Stats Section (Legacy) - only show if we have content */}
          {hasAnyContent && <StatsSection />}
        </>
      )}
      
      {/* Footer */}
      <LegalFooter />
      
      {/* Floating Elements */}
      <EmailVerificationBanner />
      <HealthStatus />
      
      {/* Scroll to Top Button */}
      <ScrollToTopButton />
    </div>
  );
});

// Scroll to Top Button Component
const ScrollToTopButton = memo(() => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      if (window.pageYOffset > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener('scroll', toggleVisibility);
    return () => window.removeEventListener('scroll', toggleVisibility);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  if (!isVisible) return null;

  return (
    <Button
      onClick={scrollToTop}
      className="fixed bottom-6 right-6 z-50 p-3 glass-button hover:bg-primary/20 transition-all duration-300 animate-fade-in"
      size="sm"
    >
      <ChevronUp className="w-5 h-5" />
    </Button>
  );
});
export default IndexRefactored;