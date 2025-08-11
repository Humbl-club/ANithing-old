import { Suspense, memo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2, TrendingUp, Clock, Star } from "lucide-react";
// Layout components
import { Navigation } from "@/layouts/components/Navigation";
import { LegalFooter } from "@/layouts/components/LegalFooter";
import { EmailVerificationBanner } from "@/features/user/components/EmailVerificationBanner";
// Feature components
import { HeroSection } from "@/features/home/components/HeroSection";
import { ContentSection } from "@/features/home/components/ContentSection";
import { StatsSection } from "@/features/home/components/StatsSection";
import { HealthStatus } from "@/features/home/components/HealthStatus";
import { SearchResultsGrid } from "@/features/search/components/SearchResultsGrid";
import { TrendingContentSection } from "@/features/home/components/TrendingContentSection";
// Hooks
import { useHomePageData } from "@/features/home/hooks/useHomePageData";
import { useNamePreference } from "@/hooks/useNamePreference";
import { useSearch } from "@/features/search/hooks/useSearch";
import { useAuth } from "@/hooks/useAuth";

/**
 * Refactored Index page - optimized with memo and callbacks
 * Each section is now a separate component with its own responsibilities
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

// Simple hero skeleton - no need to memoize
const HeroSkeleton = () => {
  return (
    <div className="h-[600px] flex items-center justify-center bg-muted/10">
      <Loader2 className="w-8 h-8 animate-spin" />
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
    <div className="min-h-screen relative">
      <Navigation />
      
      {/* Hero Section */}
      <Suspense fallback={<HeroSkeleton />}>
        <HeroSection />
      </Suspense>
      
      {/* Search Results or Content Sections */}
      {isSearching && hasSearchResults ? (
        <SearchResultsGrid 
          results={searchResults.items}
          totalCount={searchResults.total}
          isLoading={searchResults.isSearching}
          onItemClick={handleContentClick}
          getDisplayName={getDisplayName}
        />
      ) : (
        <>
          {/* Trending Anime Section */}
          {showTrendingAnime && (
            <ContentSection
              title="🔥 Trending Anime"
              subtitle="Most popular anime right now"
              icon={TrendingUp}
              items={sections.trendingAnime}
              viewAllPath="/anime"
              getDisplayName={getDisplayName}
              onItemClick={handleContentClick}
            />
          )}
          
          {/* Recent Anime Section */}
          {showRecentAnime && (
            <ContentSection
              title="🆕 Recently Added"
              subtitle="Latest anime additions"
              icon={Clock}
              items={sections.recentAnime}
              viewAllPath="/anime?sort=recent"
              getDisplayName={getDisplayName}
              onItemClick={handleContentClick}
              className="bg-muted/10"
            />
          )}
          
          {/* Trending Content Components */}
          <div className="container mx-auto px-4">
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
        </>
      )}
      
      {/* Stats Section */}
      <StatsSection />
      
      {/* Footer */}
      <LegalFooter />
      
      {/* Email Verification Banner */}
      <EmailVerificationBanner />
      
      {/* Health Status Indicator */}
      <HealthStatus />
    </div>
  );
});
export default IndexRefactored;