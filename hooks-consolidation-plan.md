# Hook Consolidation Plan

## Current State: 66 hooks with significant duplication

## Consolidation Strategy:

### 1. **Search Hooks** (6 hooks → 1 hook) ✅ DONE
- ~~useSearch~~
- ~~useOptimizedSearch~~
- ~~useUnifiedSearch~~
- ~~useConsolidatedSearch~~
- ~~useMetadataSearch~~
- ~~useSmartTrailerSearch~~
→ **Consolidated into:** `/features/search/hooks/useSearch.ts`

### 2. **Content Data Hooks** (8 hooks → 2 hooks)
**To consolidate:**
- useContentData.tsx
- useSimpleContentData.tsx
- useInfiniteContentData.tsx
- useContentMetadata.tsx
- useAniListData.tsx
- useSimpleNewApiData.tsx
- useFillerData.tsx
- useDataCheck.tsx

**New structure:**
- `/features/content/hooks/useContent.ts` - Main content fetching
- `/features/content/hooks/useContentMetadata.ts` - Metadata only

### 3. **Auth Hooks** (4 hooks → 1 hook)
**To consolidate:**
- useAuth.tsx
- useAuthState.tsx
- useAuthValidation.tsx
- useAuthGuard.tsx

**New structure:**
- `/features/auth/hooks/useAuth.ts` - Unified auth hook

### 4. **PWA/Offline Hooks** (7 hooks → 2 hooks)
**To consolidate:**
- usePWA.ts
- usePWA.tsx
- useOfflineStorage.tsx
- useOfflineSync.ts
- useOfflineContent.ts
- useServiceWorker.tsx
- useBackgroundSync.ts

**New structure:**
- `/shared/hooks/usePWA.ts` - PWA functionality
- `/shared/hooks/useOffline.ts` - Offline data management

### 5. **Notification Hooks** (2 hooks → 1 hook)
**To consolidate:**
- usePushNotifications.ts
- usePushNotifications.tsx

**New structure:**
- `/shared/hooks/useNotifications.ts`

### 6. **Recommendation Hooks** (3 hooks → 1 hook)
**To consolidate:**
- useRecommendations.tsx
- useSmartRecommendations.tsx
- useHybridRecommendations.tsx
- useSmartSimilarContent.tsx

**New structure:**
- `/features/recommendations/hooks/useRecommendations.ts`

### 7. **Detail Page Hooks** (2 hooks → 1 hook)
**To consolidate:**
- useAnimeDetail.tsx
- useMangaDetail.tsx

**New structure:**
- `/features/content/hooks/useContentDetail.ts`

### 8. **User List Hooks** (2 hooks → 1 hook)
**To consolidate:**
- useUserLists.tsx
- useUserTitleLists.tsx

**New structure:**
- `/features/user/hooks/useUserLists.ts`

### 9. **Utility Hooks to Keep** (Move to /shared/hooks/)
**Keep as-is but relocate:**
- useDebounce.ts → `/shared/hooks/`
- use-toast.ts → `/shared/hooks/`
- use-mobile.tsx → `/shared/hooks/`
- useCountdown.tsx → `/shared/hooks/`
- useKeyboardShortcuts.tsx → `/shared/hooks/`

### 10. **Hooks to Remove** (Rarely used/Dead code)
- useRedisCache.tsx (no Redis in stack)
- useGraphQL.tsx (using REST/RPC)
- useNativeSetup.tsx (duplicate of native actions)
- useNativeActions.tsx (Capacitor specific)
- useFillerData.tsx (test data)
- useSimpleGameification.tsx (not implemented)
- useScoreValidation.tsx (can be utility)
- useBulkOperations.tsx (not used)
- useComments.tsx (no comments feature)
- useEmailVerification.tsx (handled by Supabase)
- useAgeVerification.tsx (not needed)
- useFilterPresets.tsx (not used)
- useSearchHistory.ts (not implemented)
- useOptimisticUpdates.tsx (handled by React Query)
- useWebVitals.ts (can be script)
- useEdgeFunctionMetrics.ts (monitoring)
- useErrorTracking.tsx (handled by error boundary)
- useApiWithRetry.ts (React Query handles this)
- useAnalytics.tsx (not implemented)
- useHomeData.tsx (use content hook)
- useStats.tsx (can be part of content)
- useUserInitialization.tsx (in auth hook)
- useTrailerData.tsx (part of content)
- useNamePreference.tsx (user preferences)
- useContentCache.ts (React Query handles)

## Final Structure: 66 hooks → ~15 hooks

### Feature Hooks:
```
/features/
├── auth/hooks/
│   └── useAuth.ts
├── content/hooks/
│   ├── useContent.ts
│   ├── useContentDetail.ts
│   └── useContentMetadata.ts
├── search/hooks/
│   └── useSearch.ts
├── user/hooks/
│   ├── useUserLists.ts
│   └── useUserPreferences.ts
└── recommendations/hooks/
    └── useRecommendations.ts
```

### Shared Hooks:
```
/shared/hooks/
├── useDebounce.ts
├── useToast.ts
├── useMobile.ts
├── useCountdown.ts
├── useKeyboardShortcuts.ts
├── usePWA.ts
├── useOffline.ts
└── useNotifications.ts
```

## Benefits:
- **80% reduction** in hook count (66 → ~15)
- **Clear ownership** - each hook has a specific purpose
- **No duplication** - single source of truth
- **Better performance** - less redundant code
- **Easier testing** - fewer, more focused hooks
- **Improved DX** - clear what hook to use when