/**
 * Enhanced PWA Caching Strategies for 10k+ Users
 * Optimizes cache performance and reduces server load
 */

import { precacheAndRoute, cleanupOutdatedCaches } from 'workbox-precaching';
import { registerRoute } from 'workbox-routing';
import { StaleWhileRevalidate, CacheFirst, NetworkFirst } from 'workbox-strategies';
import { ExpirationPlugin } from 'workbox-expiration';
import { CacheableResponsePlugin } from 'workbox-cacheable-response';
import { BackgroundSyncPlugin } from 'workbox-background-sync';

// Cache configurations optimized for different content types
export const cacheConfigs = {
  // Critical API endpoints - fresh data with fallback
  criticalApi: {
    cacheName: 'critical-api-v1',
    strategy: new NetworkFirst({
      cacheName: 'critical-api-v1',
      networkTimeoutSeconds: 3,
      plugins: [
        new CacheableResponsePlugin({
          statuses: [0, 200],
        }),
        new ExpirationPlugin({
          maxEntries: 50,
          maxAgeSeconds: 60 * 15, // 15 minutes
          purgeOnQuotaError: true,
        }),
      ],
    }),
  },

  // General API - balance between fresh and fast
  generalApi: {
    cacheName: 'general-api-v1',
    strategy: new StaleWhileRevalidate({
      cacheName: 'general-api-v1',
      plugins: [
        new CacheableResponsePlugin({
          statuses: [0, 200],
        }),
        new ExpirationPlugin({
          maxEntries: 200,
          maxAgeSeconds: 60 * 60 * 2, // 2 hours
          purgeOnQuotaError: true,
        }),
      ],
    }),
  },

  // Static content - long cache
  staticContent: {
    cacheName: 'static-content-v1',
    strategy: new CacheFirst({
      cacheName: 'static-content-v1',
      plugins: [
        new CacheableResponsePlugin({
          statuses: [0, 200],
        }),
        new ExpirationPlugin({
          maxEntries: 1000,
          maxAgeSeconds: 60 * 60 * 24 * 7, // 1 week
          purgeOnQuotaError: true,
        }),
      ],
    }),
  },

  // Images - aggressive caching with optimization
  images: {
    cacheName: 'images-v1',
    strategy: new CacheFirst({
      cacheName: 'images-v1',
      plugins: [
        new CacheableResponsePlugin({
          statuses: [0, 200],
        }),
        new ExpirationPlugin({
          maxEntries: 2000,
          maxAgeSeconds: 60 * 60 * 24 * 90, // 3 months
          purgeOnQuotaError: true,
        }),
      ],
    }),
  },

  // User-generated content - background sync
  userContent: {
    cacheName: 'user-content-v1',
    strategy: new NetworkFirst({
      cacheName: 'user-content-v1',
      networkTimeoutSeconds: 3,
      plugins: [
        new CacheableResponsePlugin({
          statuses: [0, 200],
        }),
        new ExpirationPlugin({
          maxEntries: 100,
          maxAgeSeconds: 60 * 30, // 30 minutes
          purgeOnQuotaError: true,
        }),
        new BackgroundSyncPlugin('user-content-sync', {
          maxRetentionTime: 24 * 60, // Retry for 24 hours
        }),
      ],
    }),
  },
};

// Setup enhanced caching routes
export const setupEnhancedCaching = () => {
  // Precache static assets
  precacheAndRoute(self.__WB_MANIFEST);
  cleanupOutdatedCaches();

  // Critical API endpoints (home data, content details)
  registerRoute(
    ({ url }) => 
      url.hostname === 'axtpbgsjbmhbuqomarcr.supabase.co' &&
      url.pathname.includes('/functions/v1/') &&
      (url.pathname.includes('get-home-data') || url.pathname.includes('get-content-details')),
    cacheConfigs.criticalApi.strategy
  );

  // General Supabase Functions
  registerRoute(
    ({ url }) => 
      url.hostname === 'axtpbgsjbmhbuqomarcr.supabase.co' &&
      url.pathname.includes('/functions/v1/'),
    cacheConfigs.generalApi.strategy
  );

  // Supabase REST API
  registerRoute(
    ({ url }) => 
      url.hostname === 'axtpbgsjbmhbuqomarcr.supabase.co' &&
      url.pathname.includes('/rest/v1/'),
    cacheConfigs.criticalApi.strategy // Use NetworkFirst for REST API
  );

  // AniList GraphQL API - static anime/manga data
  registerRoute(
    ({ url }) => url.hostname === 'graphql.anilist.co',
    cacheConfigs.staticContent.strategy
  );

  // Images from any source
  registerRoute(
    ({ request }) => request.destination === 'image',
    cacheConfigs.images.strategy
  );

  // CSS, JS, and font files
  registerRoute(
    ({ request }) => 
      request.destination === 'style' ||
      request.destination === 'script' ||
      request.destination === 'font',
    cacheConfigs.staticContent.strategy
  );

  // Google Fonts
  registerRoute(
    ({ url }) => 
      url.origin === 'https://fonts.googleapis.com' ||
      url.origin === 'https://fonts.gstatic.com',
    new CacheFirst({
      cacheName: 'google-fonts-v1',
      plugins: [
        new CacheableResponsePlugin({
          statuses: [0, 200],
        }),
        new ExpirationPlugin({
          maxEntries: 30,
          maxAgeSeconds: 60 * 60 * 24 * 365, // 1 year
        }),
      ],
    })
  );

  // CDN resources
  registerRoute(
    ({ url }) => 
      url.hostname.includes('cdn.') ||
      url.hostname.includes('images.') ||
      url.hostname.includes('static.'),
    new StaleWhileRevalidate({
      cacheName: 'cdn-resources-v1',
      plugins: [
        new CacheableResponsePlugin({
          statuses: [0, 200],
        }),
        new ExpirationPlugin({
          maxEntries: 500,
          maxAgeSeconds: 60 * 60 * 24 * 30, // 1 month
        }),
      ],
    })
  );
};

// Cache warming for critical resources
export const warmCache = async () => {
  const criticalUrls = [
    '/api/home-data',
    '/api/user-preferences',
    '/manifest.json',
    '/offline.html'
  ];

  try {
    const cache = await caches.open('critical-api-v1');
    await Promise.allSettled(
      criticalUrls.map(url => 
        cache.add(new Request(url, { mode: 'cors' }))
      )
    );
    console.log('🔥 Critical cache warmed');
  } catch (error) {
    console.warn('Cache warming failed:', error);
  }
};

// Cache analytics and monitoring
export const getCacheAnalytics = async () => {
  const cacheNames = await caches.keys();
  const analytics = [];

  for (const cacheName of cacheNames) {
    const cache = await caches.open(cacheName);
    const keys = await cache.keys();
    
    let totalSize = 0;
    let hitCount = 0;

    // Estimate cache size and hit counts
    for (const request of keys) {
      const response = await cache.match(request);
      if (response) {
        const blob = await response.blob();
        totalSize += blob.size;
        // Estimate hit count from cache headers (simplified)
        hitCount += 1;
      }
    }

    analytics.push({
      name: cacheName,
      entries: keys.length,
      estimatedSize: totalSize,
      hitCount: hitCount,
      efficiency: keys.length > 0 ? hitCount / keys.length : 0
    });
  }

  return {
    caches: analytics,
    totalCaches: cacheNames.length,
    totalEntries: analytics.reduce((sum, cache) => sum + cache.entries, 0),
    totalSize: analytics.reduce((sum, cache) => sum + cache.estimatedSize, 0),
    lastUpdated: new Date().toISOString()
  };
};

// Advanced cache invalidation
export const invalidateCache = async (pattern: RegExp | string) => {
  const cacheNames = await caches.keys();
  
  for (const cacheName of cacheNames) {
    const cache = await caches.open(cacheName);
    const keys = await cache.keys();
    
    for (const request of keys) {
      const url = request.url;
      const shouldInvalidate = pattern instanceof RegExp 
        ? pattern.test(url)
        : url.includes(pattern);
        
      if (shouldInvalidate) {
        await cache.delete(request);
        console.log(`🗑️ Invalidated cache for: ${url}`);
      }
    }
  }
};

// Cache cleanup and optimization
export const optimizeCache = async () => {
  const cacheNames = await caches.keys();
  const currentTime = Date.now();
  
  // Remove old cache versions
  const oldCaches = cacheNames.filter(name => 
    !name.endsWith('-v1') && name.includes('-v')
  );
  
  for (const oldCache of oldCaches) {
    await caches.delete(oldCache);
    console.log(`🧹 Removed old cache: ${oldCache}`);
  }
  
  // Check quota usage
  if ('storage' in navigator && 'estimate' in navigator.storage) {
    const estimate = await navigator.storage.estimate();
    const usagePercent = (estimate.usage || 0) / (estimate.quota || 1) * 100;
    
    if (usagePercent > 80) {
      console.warn(`⚠️ Storage usage high: ${usagePercent.toFixed(1)}%`);
      // Trigger more aggressive cleanup
      await Promise.all([
        invalidateCache('old-'),
        invalidateCache(/\?v=\d+/)
      ]);
    }
  }
};

// Export for service worker usage
declare const self: ServiceWorkerGlobalScope;

// Auto-setup when imported in service worker
if (typeof importScripts === 'function') {
  setupEnhancedCaching();
  
  // Warm cache on install
  self.addEventListener('install', (event) => {
    event.waitUntil(warmCache());
  });
  
  // Optimize cache periodically
  self.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'OPTIMIZE_CACHE') {
      event.waitUntil(optimizeCache());
    }
  });
}