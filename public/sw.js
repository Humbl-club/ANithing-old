const CACHE_NAME = 'anithing-v2';
const DYNAMIC_CACHE = 'anithing-dynamic-v2';
const IMAGE_CACHE = 'anithing-images-v2';
const API_CACHE = 'anithing-api-v2';

// Assets to cache on install - optimized for mobile
const STATIC_ASSETS = [
  '/',
  '/offline.html',
  '/manifest.json',
  '/favicon.ico',
  '/icon-192.png',
  '/icon-512.png'
];

// Cache size limits for mobile optimization
const CACHE_LIMITS = {
  images: 100, // 100 images max
  api: 50,     // 50 API responses max
  dynamic: 25  // 25 pages max
};

// Install event - cache static assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    })
  );
  self.skipWaiting();
});

// Activate event - clean old caches and manage cache sizes
self.addEventListener('activate', (event) => {
  event.waitUntil(
    Promise.all([
      // Clean old caches
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter((name) => 
              !name.includes('anithing-v2') && 
              (name.includes('anithing') || name.includes('workbox'))
            )
            .map((name) => caches.delete(name))
        );
      }),
      // Initialize cache limits
      manageCacheSize(IMAGE_CACHE, CACHE_LIMITS.images),
      manageCacheSize(API_CACHE, CACHE_LIMITS.api),
      manageCacheSize(DYNAMIC_CACHE, CACHE_LIMITS.dynamic)
    ])
  );
  self.clients.claim();
});

// Cache management function
async function manageCacheSize(cacheName, maxItems) {
  const cache = await caches.open(cacheName);
  const keys = await cache.keys();
  
  if (keys.length > maxItems) {
    // Remove oldest entries (FIFO)
    const keysToDelete = keys.slice(0, keys.length - maxItems);
    await Promise.all(keysToDelete.map(key => cache.delete(key)));
  }
}

// Network detection
function getNetworkSpeed() {
  const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
  if (!connection) return 'unknown';
  
  return connection.effectiveType || connection.type || 'unknown';
}

// Adaptive caching based on network speed
function shouldCacheResponse(response, networkSpeed) {
  if (!response || response.status !== 200) return false;
  
  const contentLength = response.headers.get('content-length');
  const size = contentLength ? parseInt(contentLength, 10) : 0;
  
  // On slow networks, be more selective about what to cache
  if (networkSpeed === 'slow-2g' || networkSpeed === '2g') {
    return size < 100000; // 100KB limit on slow networks
  }
  
  if (networkSpeed === '3g') {
    return size < 500000; // 500KB limit on 3G
  }
  
  return size < 2000000; // 2MB limit on faster networks
}

// Fetch event - network first, fallback to cache
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Skip non-GET requests
  if (request.method !== 'GET') return;
  
  // Handle Supabase API calls with StaleWhileRevalidate strategy
  if (url.href.includes('supabase.co') && url.pathname.includes('/functions/v1/')) {
    event.respondWith(
      caches.open(DYNAMIC_CACHE).then((cache) => {
        return cache.match(request).then((cachedResponse) => {
          const fetchPromise = fetch(request).then((networkResponse) => {
            if (networkResponse.status === 200) {
              cache.put(request, networkResponse.clone());
            }
            return networkResponse;
          }).catch(() => {
            // Return cached response if network fails
            return cachedResponse;
          });
          
          // Return cached response immediately if available, otherwise wait for network
          return cachedResponse || fetchPromise;
        });
      })
    );
    return;
  }
  
  // Skip other Supabase API calls (non-functions)
  if (url.href.includes('supabase.co')) return;
  
  // HTML requests - network first
  if (request.headers.get('accept')?.includes('text/html')) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const clonedResponse = response.clone();
          caches.open(DYNAMIC_CACHE).then((cache) => {
            cache.put(request, clonedResponse);
          });
          return response;
        })
        .catch(() => {
          return caches.match(request).then((response) => {
            return response || caches.match('/offline.html');
          });
        })
    );
    return;
  }
  
  // Static assets - cache first
  if (url.href.match(/\.(js|css|png|jpg|jpeg|svg|ico|webp)$/)) {
    event.respondWith(
      caches.match(request).then((response) => {
        if (response) return response;
        
        return fetch(request).then((response) => {
          if (response.status === 200) {
            const clonedResponse = response.clone();
            caches.open(DYNAMIC_CACHE).then((cache) => {
              cache.put(request, clonedResponse);
            });
          }
          return response;
        });
      })
    );
    return;
  }
  
  // Default - network first
  event.respondWith(
    fetch(request)
      .then((response) => {
        if (response.status === 200) {
          const clonedResponse = response.clone();
          caches.open(DYNAMIC_CACHE).then((cache) => {
            cache.put(request, clonedResponse);
          });
        }
        return response;
      })
      .catch(() => caches.match(request))
  );
});

// Background sync for offline actions
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-user-lists') {
    event.waitUntil(syncUserLists());
  }
});

async function syncUserLists() {
  // Get pending updates from IndexedDB
  const db = await openDB();
  const tx = db.transaction('pendingUpdates', 'readonly');
  const updates = await tx.objectStore('pendingUpdates').getAll();
  
  for (const update of updates) {
    try {
      await fetch(update.url, {
        method: update.method,
        headers: update.headers,
        body: update.body
      });
      
      // Remove from pending after successful sync
      const deleteTx = db.transaction('pendingUpdates', 'readwrite');
      await deleteTx.objectStore('pendingUpdates').delete(update.id);
    } catch (error) {
      console.error('Sync failed:', error);
    }
  }
}

function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('anithing-offline', 1);
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains('pendingUpdates')) {
        db.createObjectStore('pendingUpdates', { keyPath: 'id' });
      }
    };
  });
}