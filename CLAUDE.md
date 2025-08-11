# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Essential Commands

### Development
```bash
# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

### Code Quality
```bash
# Run linting
npm run lint

# Type checking (TypeScript)
# Note: No explicit typecheck command, TypeScript runs during build
npm run build
```

### Testing
```bash
# Run unit tests (Vitest)
npm run test:unit

# Run E2E tests (Playwright)
npm run test:e2e

# Run smoke tests only
npm run e2e:smoke
```

### Database & Backend
```bash
# Check current database mode (local vs production)
./toggle-db.sh status

# Switch to production Supabase (default for development)
./toggle-db.sh prod

# Switch to local Supabase (for schema changes)
./toggle-db.sh local

# Database status and import commands
node check-data.js             # Check database status and data counts
node import-all-anime.js       # Import ALL anime from AniList (takes ~2 hours)
node import-all-manga.js       # Import ALL manga from AniList (takes ~10+ hours)

# Daily Import System (NEW!)
node run-daily-import-manual.js  # Run daily import manually
node check-import-status.js      # Check import history and status
node setup-daily-imports.js      # Setup automated daily imports

# Test application functionality
node test-application-comprehensive.js  # Test all features

# Deploy edge functions to production
npx supabase functions deploy daily-import    # Deploy daily import function
npx supabase functions deploy import-anime-enhanced  # Deploy enhanced anime import
npx supabase functions deploy import-manga-enhanced  # Deploy enhanced manga import

# Start local Supabase
npx supabase start

# Apply database migrations
npx supabase db push --workdir ./supabase
```

## High-Level Architecture

### Stack Overview
- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS + shadcn/ui components
- **State Management**: Zustand (global) + React Query (server state)
- **Backend**: Supabase (PostgreSQL + Edge Functions + Auth)
- **PWA**: Vite PWA plugin with offline support
- **Mobile**: Capacitor for iOS/Android

### Data Flow Architecture
1. **AniList GraphQL** → Edge Functions (import-anime/manga) → **PostgreSQL** (normalized schema)
2. **Frontend** → Edge Function (get-home-data) → RPCs → **Database**
3. Fallback: Frontend → Direct Supabase queries via contentRepository

### Database Schema (Normalized)
- `titles` - Core content table (keyed by anilist_id)
- `anime_details` - Anime-specific data (unique on title_id)
- `manga_details` - Manga-specific data (unique on title_id)
- `genres`, `studios`, `authors` - Reference tables
- Join tables: `title_genres`, `title_studios`, `title_authors`
- User tables: `profiles`, `user_lists`, `user_ratings`, `user_preferences`

### Key Frontend Patterns
- **Route-based code splitting**: Lazy loading with React.lazy()
- **Virtual scrolling**: For large content lists
- **Optimistic updates**: Via React Query mutations
- **PWA caching**: Workbox runtime caching for API responses
- **Component structure**:
  - `/components/ui/` - Base shadcn/ui components
  - `/components/features/` - Business logic components
  - `/components/common/` - Shared utilities and wrappers
  - `/src/shared/components/` - Advanced feature components:
    - `AdvancedSearch.tsx` - Multi-filter search interface
    - `CharacterSearch.tsx` - Search by character names
    - `RecommendationEngine.tsx` - Personalized content suggestions
    - `ReviewSystem.tsx` - Rating and review management
    - `SocialFeatures.tsx` - Follow system and user lists

### Edge Functions Architecture
All edge functions return standardized response envelopes:
```typescript
{
  success: boolean,
  data?: any,
  error?: string,
  meta?: { timestamp, processingTime, etc }
}
```

Key functions:
- `get-home-data` - Fetches home page sections via RPCs
- `import-anime/manga` - Imports from AniList with rate limiting
- `import-data-enhanced` - Orchestrates parallel imports
- `scheduled-import` - Cron-triggered data sync

### Environment Configuration
- Development uses `.env.local` with local/production Supabase URLs
- `src/config/environment.ts` handles environment resolution
- Toggle between local/production DB with `./toggle-db.sh`

### Testing Strategy
- **Unit tests**: Vitest for components and utilities
- **E2E tests**: Playwright for critical user flows
- Tests are separated: `*.test.ts` for unit, `*.spec.ts` for E2E

### Important Development Notes
1. **Database mode**: Use production mode for most development (real data + working edge functions)
2. **Schema changes**: Switch to local mode, make changes, create migration, test, then push
3. **RLS policies**: Temporarily disabled for development ease
4. **Rate limiting**: Import functions include polite delays for AniList API
5. **CORS**: Edge functions handle CORS headers automatically
6. **Caching**: PWA caching is disabled in dev mode

### Common Debugging Points
- Empty home sections: Check if imports ran, verify RPCs use LEFT JOINs
- Edge function errors: Check Supabase logs, verify JWT settings in config.toml
- Build issues: Check TypeScript errors, ensure all imports resolve
- Test failures: Ensure dev server is running on port 8080 for E2E tests