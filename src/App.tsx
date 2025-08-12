import React, { Suspense, memo, useMemo, useCallback } from 'react';
import { QueryClientProvider } from "@tanstack/react-query";
import { persistQueryClient } from '@tanstack/react-query-persist-client';
import { createSyncStoragePersister } from '@tanstack/query-sync-storage-persister';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider, useAuth } from "@/hooks/useAuth";
import { ErrorBoundary } from "@/components/ErrorBoundaryUnified";
import { ConnectionStatus } from "@/shared/components/ConnectionStatus";
import { OfflineIndicator } from "@/shared/components/OfflineIndicator";
import { InstallPrompt } from "@/shared/components/InstallPrompt";
import { GraphQLProvider } from "@/providers/GraphQLProvider";
import { useInitializationStore } from '@/store/initializationStore';
import { useUserInitialization } from '@/hooks/useUserInitialization';
import { 
  createLazyPage, 
  ComponentPreloader, 
  PageLoadingFallback,
  LoadingSpinner
} from '@/utils/lazyLoading';
import { useRoutePreloader } from '@/utils/routePreloader';

// Eagerly loaded critical pages
import Index from "./pages/IndexRefactored";
import Auth from "./pages/Auth";
import ResetPassword from "./pages/ResetPassword";
import NotFound from "./pages/NotFound";

// Enhanced lazy loaded routes with proper chunking
const Dashboard = createLazyPage(() => import('./pages/Dashboard'), 'Dashboard');
const Anime = createLazyPage(() => import('./pages/ContentBrowse').then(m => ({ default: m.AnimeBrowse })), 'Anime Browser');
const Manga = createLazyPage(() => import('./pages/ContentBrowse').then(m => ({ default: m.MangaBrowse })), 'Manga Browser');
const AnimeDetail = createLazyPage(() => import('./pages/ContentDetail').then(m => ({ default: m.AnimeDetail })), 'Anime Details');
const MangaDetail = createLazyPage(() => import('./pages/ContentDetail').then(m => ({ default: m.MangaDetail })), 'Manga Details');
const Trending = createLazyPage(() => import('./pages/Trending'), 'Trending');
const MyLists = createLazyPage(() => import('./pages/MyLists'), 'My Lists');
const UserProfile = createLazyPage(() => import('./pages/UserProfile'), 'User Profile');
const Analytics = createLazyPage(() => import('./pages/Analytics'), 'Analytics');
const Gamification = createLazyPage(() => import('./pages/Gamification'), 'Gamification');
const AdminDashboard = createLazyPage(() => import('./pages/admin/AdminDashboard'), 'Admin Dashboard');
const Settings = createLazyPage(() => import('./pages/Settings'), 'Settings');

// Define routes outside component to prevent recreation
const routes = [
  { path: '/', element: Index, protected: false },
  { path: '/auth', element: Auth, protected: false },
  { path: '/auth/reset-password', element: ResetPassword, protected: false },
  { path: '/dashboard', element: Dashboard, protected: true },
  { path: '/anime', element: Anime, protected: false },
  { path: '/anime/:id', element: AnimeDetail, protected: false },
  { path: '/manga', element: Manga, protected: false },
  { path: '/manga/:id', element: MangaDetail, protected: false },
  { path: '/trending', element: Trending, protected: false },
  { path: '/my-lists', element: MyLists, protected: true },
  { path: '/user/:username', element: UserProfile, protected: false },
  { path: '/analytics', element: Analytics, protected: true },
  { path: '/gamification', element: Gamification, protected: true },
  { path: '/admin', element: AdminDashboard, protected: true },
  { path: '/settings', element: Settings, protected: true },
  { path: '/404', element: NotFound, protected: false },
  { path: '*', element: NotFound, protected: false }
];

// Simple loader component - no need to memoize
const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="text-center">
      <LoadingSpinner size="lg" />
      <p className="text-muted-foreground">Loading...</p>
    </div>
  </div>
);

// Protected Route Component - memoized to prevent re-renders
const ProtectedRoute = memo(({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  const location = useLocation();
  
  if (loading) {
    return <PageLoader />;
  }
  
  if (!user) {
    // Save attempted location for redirect after login
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }
  
  return <>{children}</>;
});

import { queryClient } from '@/lib/queryClient';

// Create persister for React Query - outside component
const persister = createSyncStoragePersister({
  storage: window.localStorage,
  throttleTime: 1000,
});

// Enable query persistence - outside component
persistQueryClient({
  queryClient,
  persister,
  maxAge: 24 * 60 * 60 * 1000, // 24 hours
  hydrateOptions: {},
  dehydrateOptions: {
    shouldDehydrateQuery: (query) => {
      // Don't persist user-specific data
      const queryKey = query.queryKey;
      return !queryKey.some(key => 
        typeof key === 'string' && (key.includes('user') || key.includes('auth'))
      );
    },
  },
});

// Main App Content Component with intelligent preloading - memoized
const AppContent = memo(() => {
  const location = useLocation();
  
  // Use enhanced route preloader with network-aware preloading
  useRoutePreloader(location.pathname);

  // Memoize route elements to prevent recreation
  const routeElements = useMemo(() => 
    routes.map(route => {
      const { path, element: Component, protected: isProtected } = route;
      
      const element = isProtected ? (
        <ProtectedRoute>
          <Component />
        </ProtectedRoute>
      ) : (
        <Component />
      );
      
      return (
        <Route
          key={path}
          path={path}
          element={
            <ErrorBoundary>
              <Suspense fallback={<PageLoader />}>
                {element}
              </Suspense>
            </ErrorBoundary>
          }
        />
      );
    }),
    []
  );

  return (
    <ErrorBoundary>
      <OfflineIndicator />
      <ConnectionStatus />
      <InstallPrompt />
      <Routes>
        {routeElements}
      </Routes>
    </ErrorBoundary>
  );
});

// Simple initialization loader - no need to memoize
const InitializationLoader = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="text-center">
      <LoadingSpinner size="lg" />
      <p className="text-muted-foreground mt-4">Initializing application...</p>
    </div>
  </div>
);

// Initialization wrapper that needs auth context - memoized
const InitializationWrapper = memo(({ children }: { children: React.ReactNode }) => {
  // Initialize user data - this will update the global initialization state
  useUserInitialization();
  return <>{children}</>;
});

// Main App component
const App = () => {
  const { isInitialized } = useInitializationStore();
  
  // Safety check for React
  // Memoize providers structure to prevent recreation
  const appContent = useMemo(() => (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  ), []);

  if (!React || !React.useEffect) {
    // React not properly loaded - handle error silently
    return <div>Loading...</div>;
  }
  
  return (
    <HelmetProvider>
      <QueryClientProvider client={queryClient}>
        <GraphQLProvider>
          <ErrorBoundary>
            <TooltipProvider>
              <Toaster />
              <AuthProvider>
                <InitializationWrapper>
                  {!isInitialized ? (
                    <InitializationLoader />
                  ) : (
                    appContent
                  )}
                </InitializationWrapper>
              </AuthProvider>
            </TooltipProvider>
          </ErrorBoundary>
        </GraphQLProvider>
      </QueryClientProvider>
    </HelmetProvider>
  );
}

export default App;