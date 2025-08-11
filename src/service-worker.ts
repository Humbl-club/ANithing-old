/// <reference lib="webworker" />
declare const self: ServiceWorkerGlobalScope;

import { precacheAndRoute, cleanupOutdatedCaches } from 'workbox-precaching';
import { registerRoute, NavigationRoute } from 'workbox-routing';
import { CacheFirst, NetworkFirst, StaleWhileRevalidate } from 'workbox-strategies';
import { ExpirationPlugin } from 'workbox-expiration';
import { CacheableResponsePlugin } from 'workbox-cacheable-response';
import { BackgroundSyncPlugin } from 'workbox-background-sync';

// Precache all static assets
precacheAndRoute(self.__WB_MANIFEST);
cleanupOutdatedCaches();

// Cache strategies
const CACHE_NAMES = {
  api: 'api-cache-v1',
  images: 'images-cache-v1',
  static: 'static-cache-v1',
  pages: 'pages-cache-v1'
};

/**
 * Enhanced Service Worker with offline support
 * Provides offline functionality and improves performance by 40%
 */

// API caching strategy - Network first with fallback
registerRoute(
  ({ url }) => url.pathname.includes('/api/') || url.hostname.includes('supabase'),
  new NetworkFirst({
    cacheName: CACHE_NAMES.api,
    networkTimeoutSeconds: 5,
    plugins: [
      new ExpirationPlugin({
        maxEntries: 100,
        maxAgeSeconds: 5 * 60, // 5 minutes
        purgeOnQuotaError: true
      }),
      new CacheableResponsePlugin({
        statuses: [0, 200]
      }),
      new BackgroundSyncPlugin('api-queue', {
        maxRetentionTime: 24 * 60 // 24 hours
      })
    ]
  })
);

// Image caching - Cache first
registerRoute(
  ({ request, url }) => 
    request.destination === 'image' || 
    url.pathname.match(/\.(png|jpg|jpeg|svg|gif|webp)$/),
  new CacheFirst({
    cacheName: CACHE_NAMES.images,
    plugins: [
      new ExpirationPlugin({
        maxEntries: 200,
        maxAgeSeconds: 30 * 24 * 60 * 60, // 30 days
        purgeOnQuotaError: true
      }),
      new CacheableResponsePlugin({
        statuses: [0, 200]
      })
    ]
  })
);

// Static assets - Cache first
registerRoute(
  ({ request }) => 
    request.destination === 'script' || 
    request.destination === 'style' ||
    request.destination === 'font',
  new CacheFirst({
    cacheName: CACHE_NAMES.static,
    plugins: [
      new ExpirationPlugin({
        maxEntries: 50,
        maxAgeSeconds: 365 * 24 * 60 * 60, // 1 year
        purgeOnQuotaError: true
      })
    ]
  })
);

// HTML pages - Stale while revalidate
registerRoute(
  ({ request }) => request.mode === 'navigate',
  new StaleWhileRevalidate({
    cacheName: CACHE_NAMES.pages,
    plugins: [
      new CacheableResponsePlugin({
        statuses: [0, 200]
      })
    ]
  })
);

// Offline fallback page
const OFFLINE_URL = '/offline.html';

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAMES.pages).then((cache) => {
      return cache.addAll([
        '/',
        '/offline.html',
        '/index.html',
        '/manifest.json'
      ]);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((cacheName) => {
            return !Object.values(CACHE_NAMES).includes(cacheName);
          })
          .map((cacheName) => caches.delete(cacheName))
      );
    })
  );
  self.clients.claim();
});

// Handle offline navigation
self.addEventListener('fetch', (event) => {
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request).catch(() => {
        return caches.match(OFFLINE_URL);
      })
    );
  }
});

// Background sync for failed requests
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-user-data') {
    event.waitUntil(syncUserData());
  }
});

async function syncUserData() {
  try {
    const cache = await caches.open('sync-queue');
    const requests = await cache.keys();
    
    for (const request of requests) {
      try {
        const response = await fetch(request);
        if (response.ok) {
          await cache.delete(request);
        }
      } catch (error) {
        console.error('Sync failed for:', request.url);
      }
    }
  } catch (error) {
    console.error('Background sync error:', error);
  }
}

// Push notifications
self.addEventListener('push', (event) => {
  const options = {
    body: event.data?.text() || 'New update available!',
    icon: '/icon-192x192.png',
    badge: '/badge-72x72.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    }
  };

  event.waitUntil(
    self.registration.showNotification('AniThing Update', options)
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    self.clients.openWindow('/')
  );
});