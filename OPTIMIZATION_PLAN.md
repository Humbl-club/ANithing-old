# 🚀 Code Optimization Plan - Reduce by 30,000+ Lines

## Current State: 62,642 lines
## Target State: ~40,000 lines (35% reduction)

## Phase 1: IMMEDIATE CLEANUP (10,000 lines) ✅ STARTED

### Already Deleted:
- ✅ Backup files (App-backup.tsx, etc.) - 500 lines
- ✅ Test scripts (test-*.js) - 2,000 lines  
- ✅ Import scripts (import-*.js) - 1,000 lines
- ✅ Check scripts (check-*.js) - 500 lines

### Still to Delete:
- [ ] Documentation duplicates (.md files) - 1,500 lines
- [ ] Unused dependencies - 500 lines
- [ ] Development-only files - 1,000 lines

## Phase 2: EDGE FUNCTION CONSOLIDATION (5,000 lines)

### Current: 17 functions, 6,465 lines
### Target: 5 functions, ~2,000 lines

**Consolidation Plan:**
```
import-anime/ + import-anime-enhanced/ + import-anime-rich/ + import-anime-minimal/ + import-anime-simple/
→ import-content/ (with strategy parameter)

import-manga/ + import-manga-enhanced/
→ (use same import-content/)

check-email/ + check-email-exists/ + check-email-secure/
→ check-email/ (with options)

daily-import/ + scheduled-import/
→ scheduled-import/ (handles both)
```

## Phase 3: COMPONENT CONSOLIDATION (8,000 lines)

### Generic Components to Create:
1. **ContentCard<T>** - Replace AnimeCard + MangaCard (200 lines saved)
2. **ContentDetail<T>** - Replace AnimeDetail + MangaDetail pages (500 lines saved)
3. **ContentList<T>** - Replace duplicate list components (300 lines saved)
4. **useContentData<T>** - Replace anime/manga specific hooks (400 lines saved)

### Components to Merge:
- 4 search components → 1 UnifiedSearch (800 lines)
- 3 error boundaries → 1 ErrorBoundary (200 lines)
- 4 settings components → 1 TabbedSettings (600 lines)
- Remove all "Refactored" duplicates (1,500 lines)

## Phase 4: TYPE & UTILITY CONSOLIDATION (3,000 lines)

### Type Definitions:
- Merge /types/database.ts + database.types.ts
- Consolidate api.types.ts patterns
- Create generic Content type

### Utilities:
- Merge duplicate validation functions
- Consolidate email validation (3 versions)
- Remove mock/test utilities

## Phase 5: AGGRESSIVE REFACTORING (4,000 lines)

### Pattern Extraction:
```typescript
// Instead of separate files for each:
useAnimeDetail.ts (100 lines)
useMangaDetail.ts (100 lines)
useGameDetail.ts (100 lines)

// Single generic:
useContentDetail<T>.ts (50 lines)
```

### SQL Migrations:
- Squash 21 migrations into 3-5 core migrations
- Remove backup migrations folder entirely

## Implementation Commands:

```bash
# 1. Remove documentation duplicates
cat ARCHITECTURE.md DEVELOPER.md > docs/DEVELOPMENT.md
rm ARCHITECTURE.md DEVELOPER.md OPTIMIZATION_SUMMARY.md CODE_SIMPLIFICATION_SUMMARY.md

# 2. Consolidate edge functions
mkdir supabase/functions/import-content
# ... merge logic from all import functions

# 3. Create generic components
touch src/components/generic/ContentCard.tsx
touch src/components/generic/ContentDetail.tsx

# 4. Remove unused dependencies
npm prune
npm dedupe
```

## Expected Results:

| Area | Current Lines | After Optimization | Reduction |
|------|--------------|-------------------|-----------|
| Frontend (src/) | 48,657 | 35,000 | -13,657 |
| Edge Functions | 6,465 | 2,000 | -4,465 |
| Scripts/Tests | 5,358 | 1,000 | -4,358 |
| Types/Config | 2,162 | 1,000 | -1,162 |
| **TOTAL** | **62,642** | **39,000** | **-23,642** |

## Success Metrics:
- ✅ 38% smaller codebase
- ✅ Faster build times
- ✅ Easier maintenance
- ✅ Better type safety with generics
- ✅ No functionality lost