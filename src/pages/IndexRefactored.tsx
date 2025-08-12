import { Suspense, memo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
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
          
          {/* Stats Section (Legacy) */}
          <StatsSection />
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
export default IndexRefactored;