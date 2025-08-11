import React from 'react';
import { ComponentPreloader } from './lazyLoading';

// Route preloading configuration
interface RoutePreloadConfig {
  [key: string]: {
    preloadTargets: Array<{
      importFn: () => Promise<any>;
      key: string;
      delay?: number;
      priority?: 'high' | 'medium' | 'low';
    }>;
  };
}

/**
 * Intelligent route-based preloading system
 * Preloads likely next navigation targets based on user behavior patterns
*/
export class RoutePreloader {
  private static config: RoutePreloadConfig = {
    '/': {
      preloadTargets: [
        {
          importFn: () => import('../pages/Anime'),
          key: 'anime-page',
          delay: 1000,
          priority: 'high'
        },
        {
          importFn: () => import('../pages/Dashboard'),
          key: 'dashboard-page',
          delay: 2000,
          priority: 'high'
        },
        {
          importFn: () => import('../pages/Trending'),
          key: 'trending-page',
          delay: 3000,
          priority: 'medium'
        }
      ]
    },
    '/dashboard': {
      preloadTargets: [
        {
          importFn: () => import('../pages/MyLists'),
          key: 'lists-page',
          delay: 1500,
          priority: 'high'
        },
        {
          importFn: () => import('../pages/Analytics'),
          key: 'analytics-page',
          delay: 2500,
          priority: 'medium'
        },
        {
          importFn: () => import('../pages/Settings'),
          key: 'settings-page',
          delay: 4000,
          priority: 'low'
        }
      ]
    },
    '/anime': {
      preloadTargets: [
        {
          importFn: () => import('../pages/Manga'),
          key: 'manga-page',
          delay: 1000,
          priority: 'high'
        },
        {
          importFn: () => import('../pages/Trending'),
          key: 'trending-page',
          delay: 2000,
          priority: 'medium'
        },
        {
          importFn: () => import('../pages/MyLists'),
          key: 'lists-page',
          delay: 3000,
          priority: 'medium'
        }
      ]
    },
    '/manga': {
      preloadTargets: [
        {
          importFn: () => import('../pages/Anime'),
          key: 'anime-page',
          delay: 1000,
          priority: 'high'
        },
        {
          importFn: () => import('../pages/Trending'),
          key: 'trending-page',
          delay: 2000,
          priority: 'medium'
        }
      ]
    },
    '/trending': {
      preloadTargets: [
        {
          importFn: () => import('../pages/Anime'),
          key: 'anime-page',
          delay: 1000,
          priority: 'high'
        },
        {
          importFn: () => import('../pages/Manga'),
          key: 'manga-page',
          delay: 1500,
          priority: 'high'
        }
      ]
    }
  };

  /**
/**
 * Preload routes based on current path
*/
  static preloadForRoute(currentPath: string): void {
    const routeConfig = this.getRouteConfig(currentPath);
    
    if (!routeConfig) return;

    // Sort by priority and delay
    const sortedTargets = routeConfig.preloadTargets
      .sort((a, b) => {
        const priorityOrder = { high: 0, medium: 1, low: 2 };
        return priorityOrder[a.priority || 'medium'] - priorityOrder[b.priority || 'medium'];
      });

    // Execute preloads based on priority and network conditions
    this.executePreloads(sortedTargets);
  }

  private static getRouteConfig(path: string) {
    // Exact match first
    if (this.config[path]) {
      return this.config[path];
    }

    // Pattern matching for dynamic routes
    for (const [pattern, config] of Object.entries(this.config)) {
      if (this.matchesPattern(path, pattern)) {
        return config;
      }
    }

    return null;
  }

  private static matchesPattern(path: string, pattern: string): boolean {
    // Handle dynamic routes like /anime/:id
    if (pattern.includes(':')) {
      const patternParts = pattern.split('/');
      const pathParts = path.split('/');

      if (patternParts.length !== pathParts.length) return false;

      return patternParts.every((part, i) => 
        part.startsWith(':') || part === pathParts[i]
      );
    }

    // Handle prefix matching for nested routes
    return path.startsWith(pattern.replace('*', ''));
  }

  private static executePreloads(targets: RoutePreloadConfig[string]['preloadTargets']): void {
    // Check network conditions
    const isSlowConnection = this.isSlowConnection();
    const isMobile = this.isMobileDevice();

    targets.forEach(({ importFn, key, delay = 1000, priority }) => {
      // Skip low priority preloads on slow connections or mobile
      if ((isSlowConnection || isMobile) && priority === 'low') {
        return;
      }

      // Increase delay on slow connections
      const adjustedDelay = isSlowConnection ? delay * 2 : delay;

      // Use idle time preloading
      ComponentPreloader.preloadOnIdle(importFn, key, adjustedDelay);
    });
  }

  private static isSlowConnection(): boolean {
    if ('connection' in navigator) {
      const connection = (navigator as any).connection;
      return connection.effectiveType === '2g' || connection.effectiveType === 'slow-2g';
    }
    return false;
  }

  private static isMobileDevice(): boolean {
    return window.innerWidth < 768 || /Mobile|Android|iPhone|iPad/.test(navigator.userAgent);
  }

  /**
/**
 * Preload specific features based on user interaction patterns
*/
  static preloadFeatures(features: string[]): void {
    const featureMap: Record<string, () => Promise<any>> = {
      'social-features': () => import('../features/social/components/SocialFeaturesRefactored'),
      'advanced-filtering': () => import('../features/filtering/components/AdvancedFilteringRefactored'),
      'list-manager': () => import('../features/lists/components/ListManagerRefactored'),
      'home-components': () => import('../features/home/components'),
      'auth-components': () => import('../features/auth/components/AuthForm')
    };

    features.forEach(feature => {
      const importFn = featureMap[feature];
      if (importFn) {
        ComponentPreloader.preloadOnIdle(importFn, `feature-${feature}`, 2000);
      }
    });
  }
}

/**
 * Hook for automatic route-based preloading
*/
export function useRoutePreloader(currentPath: string) {
  React.useEffect(() => {
    RoutePreloader.preloadForRoute(currentPath);
  }, [currentPath]);
}