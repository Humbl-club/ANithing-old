# ⚠️ DEPRECATED SEARCH HOOKS

The following search hooks have been **DEPRECATED** and consolidated into a single, unified search hook:

## Deprecated Hooks:
- `useSearch.tsx` 
- `useOptimizedSearch.tsx`
- `useUnifiedSearch.tsx`
- `useConsolidatedSearch.tsx`
- `useMetadataSearch.tsx`
- `useSmartTrailerSearch.tsx`

## New Unified Hook:
Use `@/features/search/hooks/useSearch` instead:

```typescript
import { useSearch, useAnimeSearch, useMangaSearch } from '@/features/search/hooks/useSearch';

// Basic usage
const { results, searchQuery, setSearchQuery } = useSearch();

// Anime-specific search
const { results } = useAnimeSearch({ 
  limit: 10,
  sortBy: 'popularity' 
});

// Manga-specific search
const { results } = useMangaSearch({
  debounceMs: 500
});
```

## Migration Guide:

### Old useSearch:
```typescript
// Before
import { useSearch } from '@/hooks/useSearch';
const { searchResults, searchTerm, handleSearch } = useSearch();

// After
import { useSearch } from '@/features/search/hooks/useSearch';
const { results, searchQuery, setSearchQuery } = useSearch();
```

### Old useOptimizedSearch:
```typescript
// Before
import { useOptimizedSearch } from '@/hooks/useOptimizedSearch';
const { results, loading } = useOptimizedSearch(query);

// After
import { useSearch } from '@/features/search/hooks/useSearch';
const { results } = useSearch();
// Access loading via results.isSearching
```

### Old useUnifiedSearch:
```typescript
// Before
import { useUnifiedSearch } from '@/hooks/useUnifiedSearch';
const data = useUnifiedSearch({ type: 'anime', query });

// After
import { useAnimeSearch } from '@/features/search/hooks/useSearch';
const { results } = useAnimeSearch();
```

## Benefits of the New Hook:
- ✅ Single source of truth for search logic
- ✅ Proper debouncing and request cancellation
- ✅ Built-in caching with React Query
- ✅ TypeScript support with generics
- ✅ Consistent API across all search types
- ✅ Better performance with abort controllers
- ✅ Pagination support built-in

## Scheduled for Removal:
These deprecated hooks will be removed in the next major version. Please migrate to the new unified search hook.