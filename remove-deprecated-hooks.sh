#!/bin/bash

# Script to safely remove deprecated hooks after migration
# Run this AFTER verifying all imports have been updated

echo "🧹 Removing deprecated hooks..."

# Deprecated search hooks
DEPRECATED_SEARCH_HOOKS=(
  "src/hooks/useOptimizedSearch.tsx"
  "src/hooks/useOptimizedSearch.ts"
  "src/hooks/useUnifiedSearch.tsx"
  "src/hooks/useConsolidatedSearch.tsx"
  "src/hooks/useMetadataSearch.tsx"
  "src/hooks/useSmartTrailerSearch.tsx"
)

# Deprecated content hooks
DEPRECATED_CONTENT_HOOKS=(
  "src/hooks/useSimpleContentData.tsx"
  "src/hooks/useInfiniteContentData.tsx"
  "src/hooks/useContentMetadata.tsx"
  "src/hooks/useAniListData.tsx"
  "src/hooks/useSimpleNewApiData.tsx"
  "src/hooks/useFillerData.tsx"
  "src/hooks/useDataCheck.tsx"
)

# Deprecated auth hooks
DEPRECATED_AUTH_HOOKS=(
  "src/hooks/useAuthState.tsx"
  "src/hooks/useAuthValidation.tsx"
  "src/hooks/useAuthGuard.tsx"
)

# Deprecated PWA/offline hooks
DEPRECATED_PWA_HOOKS=(
  "src/hooks/useOfflineStorage.tsx"
  "src/hooks/useOfflineSync.ts"
  "src/hooks/useOfflineContent.ts"
  "src/hooks/useServiceWorker.tsx"
  "src/hooks/useBackgroundSync.ts"
)

# Rarely used/dead code hooks
DEPRECATED_UNUSED_HOOKS=(
  "src/hooks/useRedisCache.tsx"
  "src/hooks/useGraphQL.tsx"
  "src/hooks/useNativeSetup.tsx"
  "src/hooks/useNativeActions.tsx"
  "src/hooks/useSimpleGameification.tsx"
  "src/hooks/useScoreValidation.tsx"
  "src/hooks/useBulkOperations.tsx"
  "src/hooks/useComments.tsx"
  "src/hooks/useEmailVerification.tsx"
  "src/hooks/useAgeVerification.tsx"
  "src/hooks/useFilterPresets.tsx"
  "src/hooks/useSearchHistory.ts"
  "src/hooks/useOptimisticUpdates.tsx"
  "src/hooks/useWebVitals.ts"
  "src/hooks/useEdgeFunctionMetrics.ts"
  "src/hooks/useErrorTracking.tsx"
  "src/hooks/useApiWithRetry.ts"
  "src/hooks/useAnalytics.tsx"
  "src/hooks/useHomeData.tsx"
  "src/hooks/useTrailerData.tsx"
  "src/hooks/useContentCache.ts"
  "src/hooks/useUserInitialization.tsx"
)

# Duplicate recommendation hooks
DEPRECATED_RECOMMENDATION_HOOKS=(
  "src/hooks/useSmartRecommendations.tsx"
  "src/hooks/useHybridRecommendations.tsx"
  "src/hooks/useSmartSimilarContent.tsx"
)

# Function to remove hooks
remove_hooks() {
  local hooks=("$@")
  for hook in "${hooks[@]}"; do
    if [ -f "$hook" ]; then
      echo "  ❌ Removing $hook"
      rm "$hook"
    else
      echo "  ⏭️  Already removed: $hook"
    fi
  done
}

echo ""
echo "📦 Removing deprecated search hooks..."
remove_hooks "${DEPRECATED_SEARCH_HOOKS[@]}"

echo ""
echo "📦 Removing deprecated content hooks..."
remove_hooks "${DEPRECATED_CONTENT_HOOKS[@]}"

echo ""
echo "📦 Removing deprecated auth hooks..."
remove_hooks "${DEPRECATED_AUTH_HOOKS[@]}"

echo ""
echo "📦 Removing deprecated PWA/offline hooks..."
remove_hooks "${DEPRECATED_PWA_HOOKS[@]}"

echo ""
echo "📦 Removing deprecated recommendation hooks..."
remove_hooks "${DEPRECATED_RECOMMENDATION_HOOKS[@]}"

echo ""
echo "📦 Removing unused/dead code hooks..."
remove_hooks "${DEPRECATED_UNUSED_HOOKS[@]}"

echo ""
echo "✅ Hook consolidation complete!"
echo ""
echo "📊 Stats:"
echo "  - Removed: $(( ${#DEPRECATED_SEARCH_HOOKS[@]} + ${#DEPRECATED_CONTENT_HOOKS[@]} + ${#DEPRECATED_AUTH_HOOKS[@]} + ${#DEPRECATED_PWA_HOOKS[@]} + ${#DEPRECATED_RECOMMENDATION_HOOKS[@]} + ${#DEPRECATED_UNUSED_HOOKS[@]} )) deprecated hooks"
echo "  - Remaining hooks should be ~15 focused, well-designed hooks"
echo ""
echo "⚠️  IMPORTANT: Run 'npm run build' to verify no broken imports!"