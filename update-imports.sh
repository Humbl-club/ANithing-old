#!/bin/bash

# Script to update component imports after restructuring
# This script will update all imports from old paths to new feature-based paths

echo "Starting import path updates..."

# Function to update imports in all TypeScript/React files
update_imports() {
    echo "Updating anime component imports..."
    find src -name "*.tsx" -o -name "*.ts" | xargs sed -i '' \
        -e 's|@/components/AnimeListItem|@/features/anime/components/AnimeListItem|g' \
        -e 's|@/components/AnimeStats|@/features/anime/components/AnimeStats|g' \
        -e 's|@/components/AnimeDebugTest|@/features/anime/components/AnimeDebugTest|g' \
        -e 's|@/components/TrendingAnimeCard|@/features/anime/components/TrendingAnimeCard|g' \
        -e 's|@/components/EnhancedTrailerPlayer|@/features/anime/components/EnhancedTrailerPlayer|g' \
        -e 's|@/components/FillerIndicator|@/features/anime/components/FillerIndicator|g' \
        -e 's|@/components/FillerToggle|@/features/anime/components/FillerToggle|g'

    echo "Updating manga component imports..."
    find src -name "*.tsx" -o -name "*.ts" | xargs sed -i '' \
        -e 's|@/components/features/MangaCard|@/features/manga/components/MangaCard|g'

    echo "Updating search component imports..."
    find src -name "*.tsx" -o -name "*.ts" | xargs sed -i '' \
        -e 's|@/components/SearchAutocomplete|@/features/search/components/SearchAutocomplete|g' \
        -e 's|@/components/SearchWithFilters|@/features/search/components/SearchWithFilters|g' \
        -e 's|@/components/UnifiedSearchBar|@/features/search/components/UnifiedSearchBar|g' \
        -e 's|@/components/UserSearch|@/features/search/components/UserSearch|g' \
        -e 's|@/components/DebouncedSearch|@/features/search/components/DebouncedSearch|g' \
        -e 's|@/components/search/SearchInput|@/features/search/components/SearchInput|g' \
        -e 's|@/components/search/SearchResults|@/features/search/components/SearchResults|g'

    echo "Updating user component imports..."
    find src -name "*.tsx" -o -name "*.ts" | xargs sed -i '' \
        -e 's|@/components/ProfileMenu|@/features/user/components/ProfileMenu|g' \
        -e 's|@/components/ActivityFeed|@/features/user/components/ActivityFeed|g' \
        -e 's|@/components/EmailVerificationBanner|@/features/user/components/EmailVerificationBanner|g' \
        -e 's|@/components/EmailVerificationTest|@/features/user/components/EmailVerificationTest|g' \
        -e 's|@/components/auth/EnhancedEmailInput|@/features/user/components/EnhancedEmailInput|g' \
        -e 's|@/components/auth/EnhancedPasswordInput|@/features/user/components/EnhancedPasswordInput|g' \
        -e 's|@/components/auth/PasswordStrengthIndicator|@/features/user/components/PasswordStrengthIndicator|g'

    echo "Updating home component imports..."
    find src -name "*.tsx" -o -name "*.ts" | xargs sed -i '' \
        -e 's|@/components/HeroSection|@/features/home/components/HeroSection|g' \
        -e 's|@/components/PersonalizedDashboard|@/features/home/components/PersonalizedDashboard|g' \
        -e 's|@/components/BecauseYouWatched|@/features/home/components/BecauseYouWatched|g' \
        -e 's|@/components/RecommendedForYou|@/features/home/components/RecommendedForYou|g' \
        -e 's|@/components/TrendingContentSection|@/features/home/components/TrendingContentSection|g' \
        -e 's|@/components/CuratedLists|@/features/home/components/CuratedLists|g' \
        -e 's|@/components/WelcomeAnimation|@/features/home/components/WelcomeAnimation|g' \
        -e 's|@/components/HybridRecommendations|@/features/home/components/HybridRecommendations|g'

    echo "Updating layout component imports..."
    find src -name "*.tsx" -o -name "*.ts" | xargs sed -i '' \
        -e 's|@/components/Navigation|@/layouts/components/Navigation|g' \
        -e 's|@/components/MobileNavigation|@/layouts/components/MobileNavigation|g' \
        -e 's|@/components/LegalFooter|@/layouts/components/LegalFooter|g' \
        -e 's|@/components/layouts/DetailPageLayout|@/layouts/components/DetailPageLayout|g' \
        -e 's|@/components/layouts/VirtualizedContentGrid|@/layouts/components/VirtualizedContentGrid|g'

    echo "Updating shared component imports (batch 1)..."
    find src -name "*.tsx" -o -name "*.ts" | xargs sed -i '' \
        -e 's|@/components/ErrorBoundary|@/shared/components/ErrorBoundary|g' \
        -e 's|@/components/OptimizedImage|@/shared/components/OptimizedImage|g' \
        -e 's|@/components/RatingComponent|@/shared/components/RatingComponent|g' \
        -e 's|@/components/ShareButton|@/shared/components/ShareButton|g' \
        -e 's|@/components/MobileEnhancedShareButton|@/shared/components/MobileEnhancedShareButton|g' \
        -e 's|@/components/ContentRatingBadge|@/shared/components/ContentRatingBadge|g' \
        -e 's|@/components/StatusIndicator|@/shared/components/StatusIndicator|g' \
        -e 's|@/components/SimilarTitles|@/shared/components/SimilarTitles|g' \
        -e 's|@/components/RichSynopsis|@/shared/components/RichSynopsis|g' \
        -e 's|@/components/InfiniteScrollContainer|@/shared/components/InfiniteScrollContainer|g'

    echo "Updating shared component imports (batch 2)..."
    find src -name "*.tsx" -o -name "*.ts" | xargs sed -i '' \
        -e 's|@/components/AdminRoute|@/shared/components/AdminRoute|g' \
        -e 's|@/components/ProtectedRoute|@/shared/components/ProtectedRoute|g' \
        -e 's|@/components/ConnectionStatus|@/shared/components/ConnectionStatus|g' \
        -e 's|@/components/OfflineFallback|@/shared/components/OfflineFallback|g' \
        -e 's|@/components/OfflineIndicator|@/shared/components/OfflineIndicator|g' \
        -e 's|@/components/PWAFeatures|@/shared/components/PWAFeatures|g' \
        -e 's|@/components/PWAInstallPrompt|@/shared/components/PWAInstallPrompt|g' \
        -e 's|@/components/PWAStatus|@/shared/components/PWAStatus|g' \
        -e 's|@/components/PullToRefresh|@/shared/components/PullToRefresh|g' \
        -e 's|@/components/SyncStatus|@/shared/components/SyncStatus|g'

    echo "Updating features component imports..."
    find src -name "*.tsx" -o -name "*.ts" | xargs sed -i '' \
        -e 's|@/components/features/AddToListButton|@/shared/components/AddToListButton|g' \
        -e 's|@/components/features/AdvancedFiltering|@/shared/components/AdvancedFiltering|g' \
        -e 's|@/components/features/AgeVerificationModal|@/shared/components/AgeVerificationModal|g' \
        -e 's|@/components/features/AnalyticsCharts|@/shared/components/AnalyticsCharts|g' \
        -e 's|@/components/features/AnimeCard|@/shared/components/AnimeCard|g' \
        -e 's|@/components/features/ContentGrid|@/shared/components/ContentGrid|g' \
        -e 's|@/components/features/ListManager|@/shared/components/ListManager|g' \
        -e 's|@/components/features/ListStatistics|@/shared/components/ListStatistics|g' \
        -e 's|@/components/features/ProgressTracker|@/shared/components/ProgressTracker|g' \
        -e 's|@/components/features/StreamingPlatformFilter|@/shared/components/StreamingPlatformFilter|g'

    echo "Updating common component imports..."
    find src -name "*.tsx" -o -name "*.ts" | xargs sed -i '' \
        -e 's|@/components/common/DeepLinkHandler|@/shared/components/DeepLinkHandler|g' \
        -e 's|@/components/common/FeatureWrapper|@/shared/components/FeatureWrapper|g' \
        -e 's|@/components/common/InitializationWrapper|@/shared/components/InitializationWrapper|g' \
        -e 's|@/components/common/LazyComponents|@/shared/components/LazyComponents|g'

    echo "Updating PWA component imports..."
    find src -name "*.tsx" -o -name "*.ts" | xargs sed -i '' \
        -e 's|@/components/pwa/InstallPrompt|@/shared/components/InstallPrompt|g'

    echo "Updating remaining shared component imports..."
    find src -name "*.tsx" -o -name "*.ts" | xargs sed -i '' \
        -e 's|@/components/VirtualizedList|@/shared/components/VirtualizedList|g' \
        -e 's|@/components/PrefetchOnHover|@/shared/components/PrefetchOnHover|g' \
        -e 's|@/components/SwipeableListItem|@/shared/components/SwipeableListItem|g' \
        -e 's|@/components/DragDropListItem|@/shared/components/DragDropListItem|g' \
        -e 's|@/components/MobileOptimizedCard|@/shared/components/MobileOptimizedCard|g' \
        -e 's|@/components/SEOMetaTags|@/shared/components/SEOMetaTags|g' \
        -e 's|@/components/ScoreValidationComponent|@/shared/components/ScoreValidationComponent|g' \
        -e 's|@/components/NameToggle|@/shared/components/NameToggle|g'
}

# Run the updates
update_imports

echo "Import path updates completed!"
echo "Please run 'npm run build' to verify all imports are working correctly."