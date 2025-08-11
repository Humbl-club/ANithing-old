# AniThing - Ultimate Anime & Manga Tracker

<div align="center">
  <h3>🎌 Discover • Track • Share • Connect</h3>
  <p>Your complete anime and manga companion with social features, advanced search, and personalized recommendations.</p>
  
  [![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://typescriptlang.org/)
  [![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactjs.org/)
  [![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)](https://supabase.com/)
  [![Vite](https://img.shields.io/badge/vite-%23646CFF.svg?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
</div>

## ✨ Features

### 🎯 Core Features
- **🗃️ Massive Database**: 19,000+ anime and manga titles from AniList
- **🔍 Advanced Search**: Multi-filter search with genres, studios, ratings, years
- **👤 User Profiles**: Personalized accounts with custom lists and preferences  
- **⭐ Reviews & Ratings**: Rate titles and write detailed reviews
- **🎭 Character Search**: Find anime/manga by character names
- **🤖 Smart Recommendations**: AI-powered suggestions based on your taste

### 🌟 Social Features
- **👥 Follow System**: Connect with other anime/manga fans
- **📝 Custom Lists**: Create and share curated collections
- **💬 Social Sharing**: Share your favorite titles and lists
- **🎮 Activity Feed**: See what your friends are watching/reading

### 🔄 Data Management
- **📥 Auto-Import**: Daily automated content updates from AniList
- **🔄 Real-time Sync**: Always up-to-date information
- **📊 Rich Metadata**: Detailed information including studios, genres, characters
- **🖼️ Optimized Images**: Fast-loading, responsive images

### 🎨 User Experience
- **📱 Mobile-First**: Responsive design for all devices
- **🌙 Modern UI**: Clean, intuitive interface with shadcn/ui
- **⚡ Fast Performance**: Optimized loading and caching
- **🔒 Secure**: Row-level security with Supabase

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation
```bash
# Clone the repository
git clone <repository-url>
cd star-dust-anime

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your Supabase credentials

# Start development server
npm run dev
```

### Environment Variables
```bash
VITE_SUPABASE_URL=your-supabase-project-url
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
VITE_APP_ENV=development
```

## 📱 Usage

### For Users
1. **Sign Up**: Create an account to start tracking
2. **Explore**: Browse the extensive anime/manga database
3. **Search**: Use advanced filters to find exactly what you want
4. **Track**: Add titles to your custom lists (Watching, Completed, etc.)
5. **Rate & Review**: Share your thoughts with the community
6. **Connect**: Follow other users and discover new content
7. **Discover**: Get personalized recommendations

### For Developers
1. **Database**: Powered by Supabase with PostgreSQL
2. **Frontend**: React + TypeScript + Vite
3. **Styling**: Tailwind CSS + shadcn/ui components
4. **Data**: AniList GraphQL API integration
5. **Auth**: Supabase authentication with RLS
6. **Deployment**: Vercel/Netlify ready

## 🏗️ Architecture

```
src/
├── components/         # Reusable UI components
├── hooks/             # Custom React hooks  
├── integrations/      # External service integrations
├── pages/             # Route components
├── shared/            # Shared utilities and components
│   ├── components/    # Feature components
│   │   ├── AdvancedSearch.tsx
│   │   ├── CharacterSearch.tsx  
│   │   ├── RecommendationEngine.tsx
│   │   ├── ReviewSystem.tsx
│   │   └── SocialFeatures.tsx
│   └── utils/         # Helper functions
├── store/             # State management
└── types/             # TypeScript definitions

supabase/
├── functions/         # Edge functions
│   ├── daily-import/  # Automated data imports
│   ├── import-anime/  # Anime import functions
│   └── import-manga/  # Manga import functions
└── migrations/        # Database schema
```

## 🗄️ Database Schema

### Core Tables
- `titles` - Anime/manga entries with metadata
- `anime_details` - Anime-specific information
- `manga_details` - Manga-specific information  
- `genres` - Genre categories
- `studios` - Animation/manga studios

### Social Tables
- `user_follows` - User follow relationships
- `user_lists` - Custom user lists
- `user_list_items` - Items within lists
- `reviews` - User reviews and ratings
- `user_activity` - Activity feed data

### Rich Data (JSONB)
- `characters_data` - Character information
- `external_links` - Streaming/reading links
- `detailed_tags` - Enhanced categorization
- `studios_data` - Studio details

## 🔄 Data Import System

The application features a sophisticated import system that pulls data from AniList:

### Import Features
- **Automated Daily Updates**: GitHub Actions workflow runs daily at 2 AM UTC
- **Rate Limiting**: Respects AniList API limits (90 requests/minute)
- **Error Handling**: Comprehensive logging and retry mechanisms
- **Incremental Updates**: Only imports new/updated content
- **Quality Filtering**: Excludes adult content and low-rated titles

### Manual Import Commands
```bash
# Import all anime (takes ~2 hours)
node import-all-anime.js

# Import all manga (takes ~10+ hours)  
node import-all-manga.js

# Run daily import manually
node run-daily-import-manual.js

# Check import status
node check-import-status.js
```

## 🎨 UI Components

Built with modern, accessible components:

### Search & Discovery
- **AdvancedSearch**: Multi-filter search interface
- **CharacterSearch**: Search by character names
- **RecommendationEngine**: Personalized content suggestions

### Social Features  
- **SocialFeatures**: Follow system and user discovery
- **ReviewSystem**: Ratings and review management
- **UserLists**: Custom list creation and sharing

### Utilities
- **OptimizedImage**: Responsive image loading
- **LoadingSpinner**: Consistent loading states
- **ErrorBoundary**: Graceful error handling

## 🚀 Deployment

### Vercel (Recommended)
1. Connect your GitHub repository
2. Set environment variables
3. Deploy with one click

### Manual Deployment
```bash
# Build for production
npm run build

# Deploy dist/ folder to your hosting provider
```

See [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) for detailed instructions.

## 📊 Performance

- **Bundle Size**: Optimized with code splitting
- **Loading Speed**: Image optimization and lazy loading
- **Database**: Indexed queries and caching
- **CDN**: Static asset optimization
- **Mobile**: Responsive design with touch optimization

## 🔐 Security

- **Authentication**: Supabase Auth with social providers
- **Authorization**: Row Level Security (RLS) policies
- **API Security**: Service role keys and rate limiting
- **Data Privacy**: GDPR-compliant data handling
- **Content Filtering**: Adult content exclusion

## 🧪 Testing

```bash
# Run tests
npm run test

# Type checking
npm run type-check  

# Linting
npm run lint

# End-to-end tests
npm run test:e2e
```

## 📈 Analytics & Monitoring

### Included Analytics
- User engagement tracking
- Search query analysis
- Import job monitoring
- Performance metrics

### Recommended Integrations
- **Sentry**: Error tracking
- **Vercel Analytics**: Performance monitoring
- **PostHog**: User behavior analysis

## 🛣️ Roadmap

### Phase 1 ✅ (Completed)
- [x] Core anime/manga database
- [x] Advanced search functionality
- [x] User authentication  
- [x] Reviews and ratings
- [x] Character search
- [x] Social features
- [x] Automated imports

### Phase 2 🔄 (In Progress)
- [ ] Mobile app (React Native)
- [ ] Offline functionality
- [ ] Push notifications
- [ ] Advanced analytics

### Phase 3 🗓️ (Planned)
- [ ] AI-powered recommendations
- [ ] Community forums
- [ ] Watch party features
- [ ] Merchandise integration

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](./CONTRIBUTING.md) for details.

### Development Setup
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](./LICENSE) file for details.

## 🙏 Acknowledgments

- **AniList**: For providing the comprehensive anime/manga database
- **Supabase**: For the excellent backend-as-a-service platform
- **shadcn/ui**: For the beautiful component library
- **Community**: For feedback and contributions

## 📞 Support

- 📧 Email: support@anithing.app
- 💬 Discord: [Join our community](https://discord.gg/anithing)
- 🐛 Issues: [GitHub Issues](https://github.com/yourusername/anithing/issues)
- 📖 Docs: [Documentation](https://docs.anithing.app)

## 🎉 Fun Stats

- **19,000+** anime and manga titles
- **50+** genres to explore  
- **500+** animation studios
- **Real-time** data synchronization
- **Mobile-first** responsive design
- **Open source** and community-driven

---

<div align="center">
  <p>Built with ❤️ by the anime and manga community</p>
  <p>Star ⭐ this repository if you found it helpful!</p>
</div>
# Architecture Overview

This document provides a comprehensive overview of the technical architecture for the Anime & Manga Discovery Platform.

## 🏗️ System Architecture

### High-Level Overview

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend       │    │   External      │
│   (React SPA)   │◄──►│   (Supabase)    │◄──►│   APIs          │
└─────────────────┘    └─────────────────┘    └─────────────────┘
│                      │                      │
├─ React 18           ├─ PostgreSQL         ├─ AniList API
├─ TypeScript         ├─ Authentication     ├─ MyAnimeList API
├─ Vite               ├─ Real-time          └─ External Content
├─ Tailwind CSS       ├─ Storage               Providers
├─ React Query        └─ Edge Functions
└─ Zustand
```

## 🎯 Frontend Architecture

### Component Architecture

```
src/components/
├── common/              # Shared utilities and wrappers
│   ├── FeatureWrapper   # Feature flag wrapper
│   ├── LazyComponents   # Code splitting utilities
│   └── InitWrapper     # App initialization
│
├── features/            # Business logic components
│   ├── AnimeCard        # Content display cards
│   ├── ContentGrid     # Virtualized content lists
│   ├── AddToListButton # User interaction components
│   └── Filtering       # Search and filter logic
│
├── layouts/             # Page structure components
│   ├── DetailPageLayout# Common page layouts
│   ├── Navigation      # App navigation
│   └── Grids           # Content organization
│
└── ui/                 # Base UI components (shadcn/ui)
    ├── Button          # Interactive elements
    ├── Card            # Content containers
    └── Form            # Input components
```

### State Management Strategy

```typescript
// Global State (Zustand)
interface AppState {
  user: UserState;        // Authentication
  preferences: UIState;   // User preferences
  search: SearchState;    // Search and filters
}

// Server State (React Query)
const queryKeys = {
  anime: (filters) => ['anime', filters],
  user: (userId) => ['user', userId],
  lists: (userId) => ['lists', userId]
};

// Local State (React useState/useReducer)
// Component-specific UI state
// Form state and validation
// Temporary interaction state
```

### Data Flow Architecture

```
User Action
    ↓
Component Event Handler
    ↓
State Update (Zustand/React Query)
    ↓
API Call (Services Layer)
    ↓
Supabase Client
    ↓
Database/External API
    ↓
Response Processing
    ↓
Cache Update (React Query)
    ↓
Component Re-render
```

## 🗄️ Backend Architecture

### Supabase Structure

```sql
-- Core Content Tables
titles              -- Anime/Manga metadata
anime_details       -- Anime-specific data
manga_details       -- Manga-specific data
genres             -- Genre taxonomy
studios            -- Animation studios
authors            -- Manga authors

-- User Management
profiles           -- User profiles
user_preferences   -- User settings
user_lists         -- User anime/manga lists
user_ratings       -- User scores and reviews

-- Gamification
user_points        -- Points system
user_achievements  -- Achievement tracking
user_loot_boxes   -- Reward system

-- System Tables
sync_status        -- Data synchronization
analytics_events   -- User analytics
```

### Database Relationships

```
titles (1:1) ←→ anime_details
titles (1:1) ←→ manga_details
titles (M:N) ←→ genres (via title_genres)
titles (M:N) ←→ studios (via title_studios)
titles (M:N) ←→ authors (via title_authors)

users (1:1) ←→ profiles
users (1:M) ←→ user_lists
users (1:M) ←→ user_ratings
users (1:1) ←→ user_preferences
```

### Row Level Security (RLS)

```sql
-- Example RLS Policies
CREATE POLICY "Users can view their own lists"
ON user_lists FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own data"
ON profiles FOR ALL
USING (auth.uid() = id);
```

## 🔄 Data Synchronization

### Query Optimization Strategy

```typescript
// High-performance queries with database-level filtering
const useSimpleNewApiData = ({
  contentType,
  limit = 50,
  filters = {}
}) => {
  return useQuery({
    queryKey: ['content', contentType, filters],
    queryFn: () => supabase
      .from('titles')
      .select(`
        *,
        ${contentType}_details!inner(*),
        title_genres(genres(*)),
        title_studios(studios(*))
      `)
      .eq(`${contentType}_details.type`, filters.type)
      .range(0, limit - 1)
      .order('score', { ascending: false }),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};
```

### Caching Strategy

```typescript
// React Query Configuration
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,      // 5 minutes fresh
      gcTime: 10 * 60 * 1000,       // 10 minutes cache
      retry: 2,
      refetchOnWindowFocus: false,
    }
  }
});
```

## 🎨 UI/UX Architecture

### Design System

```css
/* Semantic Design Tokens */
:root {
  /* Color System */
  --primary: 210 40% 98%;
  --primary-foreground: 222.2 84% 4.9%;
  
  /* Spacing Scale */
  --space-xs: 0.25rem;
  --space-sm: 0.5rem;
  --space-md: 1rem;
  
  /* Typography Scale */
  --text-xs: 0.75rem;
  --text-sm: 0.875rem;
  --text-base: 1rem;
}
```

### Responsive Breakpoints

```typescript
const breakpoints = {
  sm: '640px',   // Mobile landscape
  md: '768px',   // Tablet
  lg: '1024px',  // Desktop
  xl: '1280px',  // Large desktop
  '2xl': '1536px' // Extra large
};
```

### Theme Architecture

```typescript
// Theme Configuration
interface ThemeConfig {
  mode: 'light' | 'dark' | 'system';
  accent: string;
  animations: boolean;
  reducedMotion: boolean;
}

// Dynamic Theme Application
const applyTheme = (theme: ThemeConfig) => {
  document.documentElement.dataset.theme = theme.mode;
  document.documentElement.style.setProperty('--accent', theme.accent);
};
```

## ⚡ Performance Architecture

### Code Splitting Strategy

```typescript
// Route-level splitting
const LazyAnimeDetail = lazy(() => import('@/pages/AnimeDetail'));
const LazyMangaDetail = lazy(() => import('@/pages/MangaDetail'));

// Component-level splitting
const LazyContentGrid = lazy(() => 
  import('@/components/features/ContentGrid')
);

// Bundle analysis and optimization
const bundleConfig = {
  chunkSizeWarningLimit: 1000,
  manualChunks: {
    'react-vendor': ['react', 'react-dom'],
    'ui-vendor': ['@radix-ui/*'],
    'query-vendor': ['@tanstack/react-query']
  }
};
```

### Virtual Scrolling

```typescript
// Efficient rendering of large lists
const VirtualizedContentGrid = ({ items, itemHeight = 300 }) => {
  const { scrollElementRef, virtualItems } = useVirtual({
    size: items.length,
    estimateSize: () => itemHeight,
    overscan: 5
  });

  return (
    <div ref={scrollElementRef}>
      {virtualItems.map(virtualItem => (
        <div key={virtualItem.index}>
          <AnimeCard anime={items[virtualItem.index]} />
        </div>
      ))}
    </div>
  );
};
```

### Image Optimization

```typescript
// Responsive image loading
const OptimizedImage = ({ src, alt, sizes }) => (
  <img
    src={src}
    alt={alt}
    sizes={sizes}
    loading="lazy"
    decoding="async"
    onError={(e) => {
      e.currentTarget.src = '/placeholder.svg';
    }}
  />
);
```

## 🔒 Security Architecture

### Authentication Flow

```
User Login Request
    ↓
Supabase Auth
    ↓
JWT Token Generation
    ↓
Row Level Security Policies
    ↓
Authorized Data Access
```

### Data Protection

```sql
-- RLS Policy Examples
CREATE POLICY "Users can only see public content or their own data"
ON user_lists FOR SELECT
USING (
  is_public = true OR 
  auth.uid() = user_id
);

-- Input Validation
CREATE FUNCTION validate_user_input(input text)
RETURNS boolean AS $$
BEGIN
  RETURN length(input) <= 1000 AND input !~ '[<>]';
END;
$$ LANGUAGE plpgsql;
```

## 📊 Analytics Architecture

### Event Tracking

```typescript
// Analytics Event System
interface AnalyticsEvent {
  event: string;
  properties: Record<string, any>;
  timestamp: number;
  userId?: string;
}

const trackEvent = (event: string, properties = {}) => {
  analytics.track(event, {
    ...properties,
    timestamp: Date.now(),
    page: window.location.pathname
  });
};
```

### Performance Monitoring

```typescript
// Performance Metrics Collection
const performanceMonitor = {
  trackPageLoad: () => {
    const navigation = performance.getEntriesByType('navigation')[0];
    trackEvent('page_load', {
      loadTime: navigation.loadEventEnd - navigation.loadEventStart,
      domContentLoaded: navigation.domContentLoadedEventEnd
    });
  },
  
  trackUserInteraction: (action: string) => {
    trackEvent('user_interaction', { action });
  }
};
```

## 🚀 Deployment Architecture

### Build Process

```typescript
// Vite Configuration
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          utils: ['date-fns', 'clsx']
        }
      }
    },
    sourcemap: false,
    minify: 'terser'
  }
});
```

### Environment Configuration

```bash
# Development
VITE_SUPABASE_URL=dev_url
VITE_ANALYTICS_ENABLED=false

# Production
VITE_SUPABASE_URL=prod_url
VITE_ANALYTICS_ENABLED=true
VITE_CDN_URL=cdn_url
```

## 🔧 Development Tools Architecture

### Code Quality Pipeline

```yaml
# CI/CD Pipeline
Quality Checks:
  - TypeScript compilation
  - ESLint linting
  - Prettier formatting
  - Unit test execution
  - Build verification
  - Bundle size analysis
```

### Development Workflow

```
Feature Development
    ↓
Local Testing (Storybook/Jest)
    ↓
Pre-commit Hooks (Husky)
    ↓
Pull Request
    ↓
Automated Testing (CI)
    ↓
Code Review
    ↓
Merge to Main
    ↓
Automated Deployment
```

## 📈 Scalability Considerations

### Frontend Scaling

- **Code Splitting**: Lazy load routes and components
- **Virtual Scrolling**: Handle large datasets efficiently
- **Caching Strategy**: Minimize API calls with React Query
- **Bundle Optimization**: Minimize JavaScript payload

### Backend Scaling

- **Database Indexing**: Optimize query performance
- **Connection Pooling**: Efficient database connections
- **Edge Functions**: Distribute compute closer to users
- **CDN Integration**: Cache static assets globally

### Monitoring and Observability

```typescript
// Performance Monitoring
const monitor = {
  trackRender: (componentName: string) => {
    const start = performance.now();
    return () => {
      const duration = performance.now() - start;
      if (duration > 16) { // > 1 frame
        console.warn(`Slow render: ${componentName} took ${duration}ms`);
      }
    };
  }
};
```

This architecture provides a solid foundation for a scalable, maintainable, and performant anime/manga discovery platform while ensuring good developer experience and code quality.# Anime & Manga Discovery Platform - Developer Guide

A modern React application for discovering anime and manga content, built with TypeScript, React, and Supabase.

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd anime-manga-platform
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your configuration
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

5. **Open in browser**
   Navigate to `http://localhost:8080`

## 📁 Project Structure

```
src/
├── components/          # UI Components
│   ├── common/         # Shared utility components
│   │   ├── FeatureWrapper.tsx
│   │   ├── InitializationWrapper.tsx
│   │   └── LazyComponents.tsx
│   ├── features/       # Feature-specific components  
│   │   ├── AddToListButton.tsx
│   │   ├── AnimeCard.tsx
│   │   ├── ContentGrid.tsx
│   │   └── AdvancedFiltering.tsx
│   ├── layouts/        # Layout and navigation
│   │   ├── DetailPageLayout.tsx
│   │   └── VirtualizedContentGrid.tsx
│   └── ui/            # Base UI components (shadcn/ui)
├── hooks/             # Custom React hooks
├── services/          # API services and data fetching
├── store/            # State management (Zustand)
├── types/            # TypeScript type definitions
├── utils/            # Utility functions
├── pages/            # Route components
└── styles/           # Global styles
```

## 🛠️ Development Tools

### Code Quality

- **ESLint**: Code linting with TypeScript support
- **Prettier**: Code formatting
- **Husky**: Git hooks for pre-commit checks
- **lint-staged**: Run linters on staged files

### Available Scripts

```bash
# Development
npm run dev              # Start development server
npm run build            # Production build
npm run build:dev        # Development build
npm run preview          # Preview production build

# Code Quality
npm run lint             # Run ESLint
npm run lint:fix         # Fix ESLint issues
npm run format           # Format code with Prettier
npm run format:check     # Check code formatting
npm run type-check       # TypeScript type checking

# Documentation
npm run storybook        # Start Storybook
npm run build-storybook  # Build Storybook

# Analysis
npm run analyze          # Bundle size analysis
```

## 🏗️ Architecture Overview

### Frontend Architecture

- **React 18**: Modern React with concurrent features
- **TypeScript**: Type-safe development
- **Vite**: Fast build tool and dev server
- **Tailwind CSS**: Utility-first styling
- **Framer Motion**: Smooth animations
- **React Query**: Server state management

### Backend Integration

- **Supabase**: Backend-as-a-Service
  - PostgreSQL database
  - Real-time subscriptions
  - Authentication
  - Row Level Security (RLS)

### State Management

- **Zustand**: Lightweight state management
- **React Query**: Server state caching
- **Local Storage**: Persistence for user preferences

### Performance Optimizations

- **Code Splitting**: Lazy loading with React.lazy()
- **Bundle Analysis**: Webpack bundle analyzer
- **Image Optimization**: Responsive images
- **Virtual Scrolling**: Efficient list rendering

## 🎨 Design System

### Theming

- **CSS Variables**: Semantic color tokens
- **Dark/Light Mode**: Automatic theme switching
- **Responsive Design**: Mobile-first approach

### Component Library

- **shadcn/ui**: Base component library
- **Custom Components**: Feature-specific components
- **Storybook**: Component documentation

## 🔧 Development Workflow

### Git Workflow

1. **Feature Branch**: Create from `main`
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Development**: Make changes and commit
   ```bash
   git add .
   git commit -m "feat: add new feature"
   ```

3. **Pre-commit Hooks**: Automatically run:
   - ESLint with auto-fix
   - Prettier formatting
   - TypeScript type checking

4. **Pre-push Hooks**: Automatically run:
   - Full linting
   - Type checking
   - Production build test

### Code Style Guidelines

- **TypeScript**: Strict mode enabled
- **ESLint**: Enforced code standards
- **Prettier**: Consistent formatting
- **Naming**: PascalCase for components, camelCase for functions

### Component Development

1. **Create Component**: Use TypeScript interfaces
2. **Add Stories**: Document in Storybook
3. **Write Tests**: Unit tests with Jest
4. **Update Types**: Export types from component

## 🧪 Testing Strategy

### Unit Testing
- **Vitest**: Modern test runner
- **Testing Library**: Component testing
- **MSW**: API mocking

### E2E Testing
- **Playwright**: End-to-end testing
- **Visual Regression**: Screenshot testing

## 📦 Dependencies

### Core Dependencies
- `react`: ^18.3.1
- `typescript`: ^5.2.2
- `vite`: ^5.1.0
- `@supabase/supabase-js`: ^2.50.3
- `@tanstack/react-query`: ^5.83.0

### Development Dependencies
- `eslint`: ^8.57.0
- `prettier`: ^3.2.5
- `husky`: ^9.0.11
- `@storybook/react-vite`: ^7.6.17

## 🚀 Deployment

### Environment Variables

Required for production:
```bash
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Build Process

```bash
npm run build           # Create production build
npm run preview         # Test production build locally
```

### Platform Deployment

- **Lovable**: One-click deployment
- **Vercel**: Connect GitHub repository
- **Netlify**: Drag & drop deployment

## 🤝 Contributing

### Getting Started

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and linting
5. Submit a pull request

### Pull Request Guidelines

- **Clear Description**: Explain what and why
- **Small Commits**: Focused, atomic changes
- **Tests**: Add tests for new features
- **Documentation**: Update docs if needed

### Code Review Process

1. **Automated Checks**: CI/CD pipeline
2. **Manual Review**: Team member review
3. **Testing**: Feature testing
4. **Merge**: Squash and merge

## 📚 Documentation

### Storybook

- **Component Docs**: Visual component library
- **Interactive Examples**: Live component testing
- **Design System**: Style guide and tokens

### API Documentation

- **Supabase Schema**: Database structure
- **Service Layer**: API abstractions
- **Type Definitions**: TypeScript interfaces

## 🐛 Debugging

### Development Tools

- **React DevTools**: Component debugging
- **React Query DevTools**: State inspection
- **Supabase Dashboard**: Database queries

### Common Issues

1. **Build Errors**: Check TypeScript types
2. **Style Issues**: Verify Tailwind classes
3. **API Errors**: Check Supabase configuration

## 📈 Performance Monitoring

### Metrics

- **Bundle Size**: Track with analyzer
- **Load Times**: Lighthouse audits
- **Runtime Performance**: React Profiler

### Optimization Techniques

- **Code Splitting**: Lazy load components
- **Memoization**: React.memo and useMemo
- **Virtual Scrolling**: Large list performance

## 🔐 Security

### Best Practices

- **Environment Variables**: Never commit secrets
- **RLS Policies**: Database security
- **Input Validation**: Client and server side
- **Authentication**: Secure user management

## 🆘 Support

### Getting Help

- **Documentation**: Check this README first
- **Issues**: Create GitHub issue
- **Discussions**: Team discussions
- **Code Review**: Ask for help in PRs

### Resources

- [React Documentation](https://react.dev/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Supabase Documentation](https://supabase.com/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Storybook Documentation](https://storybook.js.org/docs)

---

**Happy coding! 🎉**# Contributing to Anime & Manga Discovery Platform

Thank you for your interest in contributing! This guide will help you get started with contributing to our project.

## 🤝 How to Contribute

### Reporting Issues

1. **Check existing issues** first to avoid duplicates
2. **Use issue templates** when available
3. **Provide clear descriptions** with steps to reproduce
4. **Include relevant details** (browser, OS, screenshots)

### Suggesting Features

1. **Check roadmap** and existing feature requests
2. **Open a discussion** for major features
3. **Provide use cases** and rationale
4. **Consider implementation complexity**

## 🚀 Development Process

### Setting Up

1. **Fork the repository**
2. **Clone your fork**
   ```bash
   git clone https://github.com/your-username/anime-manga-platform.git
   ```
3. **Install dependencies**
   ```bash
   npm install
   ```
4. **Create environment file**
   ```bash
   cp .env.example .env.local
   ```

### Making Changes

1. **Create a feature branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Follow naming conventions**
   - `feature/` for new features
   - `fix/` for bug fixes
   - `docs/` for documentation
   - `refactor/` for code improvements

3. **Make your changes**
   - Follow existing code style
   - Add tests for new functionality
   - Update documentation as needed

4. **Test your changes**
   ```bash
   npm run lint        # Check code style
   npm run type-check  # Verify TypeScript
   npm run build       # Test production build
   ```

### Commit Guidelines

Use [Conventional Commits](https://www.conventionalcommits.org/):

```bash
feat: add anime recommendation engine
fix: resolve search filter bug
docs: update API documentation
style: format code with prettier
refactor: improve performance of content grid
test: add unit tests for search component
```

### Code Style

- **TypeScript**: Use strict typing
- **ESLint**: Follow configured rules
- **Prettier**: Automatic formatting on commit
- **Components**: PascalCase naming
- **Functions**: camelCase naming
- **Files**: kebab-case for utilities, PascalCase for components

### Testing Requirements

- **Unit Tests**: Add tests for new functions/hooks
- **Component Tests**: Test user interactions
- **Storybook**: Document new components
- **Type Safety**: Ensure TypeScript compliance

## 📝 Pull Request Process

### Before Submitting

1. **Sync with main branch**
   ```bash
   git checkout main
   git pull upstream main
   git checkout feature/your-feature
   git rebase main
   ```

2. **Run all checks**
   ```bash
   npm run lint
   npm run type-check
   npm run build
   ```

3. **Update documentation** if needed

### Submitting PR

1. **Create pull request** to `main` branch
2. **Use PR template** and fill out all sections
3. **Link related issues** using keywords
4. **Request reviews** from maintainers

### PR Guidelines

- **Small, focused changes** are preferred
- **Clear descriptions** of what and why
- **Include screenshots** for UI changes
- **Update tests** and documentation
- **Respond to feedback** promptly

## 🎨 Design Guidelines

### UI/UX Principles

- **Mobile-first** responsive design
- **Accessibility** compliance (WCAG 2.1)
- **Performance** - optimize for speed
- **Consistency** with design system

### Component Development

1. **Start with Storybook** stories
2. **Use semantic HTML** elements
3. **Implement keyboard navigation**
4. **Add proper ARIA labels**
5. **Test across devices/browsers**

### Style Guidelines

- **Use design tokens** from CSS variables
- **Follow Tailwind utility classes**
- **Avoid custom CSS** when possible
- **Responsive breakpoints** for all components

## 🔧 Technical Standards

### Code Quality

- **TypeScript strict mode** enabled
- **ESLint configuration** enforced
- **Prettier formatting** automated
- **Pre-commit hooks** prevent bad commits

### Performance

- **Bundle size** monitoring
- **Lazy loading** for routes and components
- **Image optimization** for all assets
- **Virtual scrolling** for large lists

### Security

- **Input validation** on all forms
- **XSS prevention** in dynamic content
- **Secure API calls** with proper headers
- **Environment variable** protection

## 📚 Documentation Standards

### Code Documentation

- **JSDoc comments** for complex functions
- **README updates** for new features
- **Storybook stories** for all components
- **Type definitions** with descriptions

### Commit Documentation

- **Clear commit messages** following conventions
- **PR descriptions** explaining changes
- **Issue linking** for traceability
- **Breaking change** notifications

## 🧪 Testing Guidelines

### Test Coverage

- **Unit tests** for utilities and hooks
- **Integration tests** for components
- **E2E tests** for critical user flows
- **Visual regression** testing with Storybook

### Testing Best Practices

- **Test behavior, not implementation**
- **Use Testing Library** queries appropriately
- **Mock external dependencies**
- **Write descriptive test names**

## 🚦 Review Process

### Automated Checks

- **CI/CD pipeline** runs on all PRs
- **TypeScript compilation**
- **Linting and formatting**
- **Test execution**
- **Build verification**

### Manual Review

- **Code quality** assessment
- **Design review** for UI changes
- **Performance impact** evaluation
- **Security considerations**

### Approval Process

1. **Automated checks** must pass
2. **At least one reviewer** approval required
3. **No unresolved conversations**
4. **Up-to-date with main** branch

## 🏆 Recognition

### Contributors

- **All contributors** listed in README
- **Significant contributions** highlighted
- **First-time contributors** welcomed
- **Regular contributors** may become maintainers

### Types of Contributions

- **Code contributions** (features, fixes)
- **Documentation** improvements
- **Issue reporting** and triage
- **Community support** and discussions
- **Design** and UX improvements

## 📞 Getting Help

### Communication Channels

- **GitHub Issues** for bugs and features
- **GitHub Discussions** for questions
- **Code reviews** for technical guidance
- **Documentation** for implementation details

### Mentorship

- **New contributors** paired with experienced developers
- **Code review feedback** as learning opportunity
- **Pairing sessions** for complex features
- **Architecture discussions** for major changes

## 📋 Checklist Template

### Before Opening PR

- [ ] Code follows style guidelines
- [ ] Tests added/updated for changes
- [ ] Documentation updated
- [ ] No console errors or warnings
- [ ] Accessibility checked
- [ ] Performance impact considered
- [ ] Cross-browser testing done

### PR Description

- [ ] Clear title describing the change
- [ ] Description explains what and why
- [ ] Related issues linked
- [ ] Screenshots for UI changes
- [ ] Breaking changes noted
- [ ] Migration guide provided if needed

---

Thank you for contributing to our project! Your efforts help make this platform better for everyone. 🎉