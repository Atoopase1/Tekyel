const CACHE_NAME = 'circle-pwa-cache-v1';
const STATIC_ROOT_CACHES = [
  '/',
  '/manifest.json',
  '/icon-192.png',
  '/icon-512.png',
  '/offline.html',
];

// Install event: cache core static assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      // Add offline shell silently, don't fail installation if some files are missing
      return cache.addAll(STATIC_ROOT_CACHES).catch((err) => console.log('Offline cache error:', err));
    }).then(() => self.skipWaiting())
  );
});

// Activate event: clean up old caches immediately
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => 
      Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      )
    ).then(() => self.clients.claim())
  );
});

// Fetch event with Hybrid Strategy:
// 1. Static Assets (JS/CSS/Fonts/Images) -> Cache First, fallback to Network
// 2. Next.js Data/Navigation -> Network First, fallback to Cache
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Ignore WebSockets, POST requests, and Supabase API calls (let Realtime/Zustand handle them)
  if (
    event.request.method !== 'GET' ||
    url.pathname.startsWith('/socket.io') ||
    url.hostname.includes('supabase.co')
  ) {
    return;
  }

  // Next.js Hot Module Reloading for dev should bypass cache
  if (url.pathname.includes('/_next/webpack-hmr')) return;

  // STRATEGY: Static Assets (Images, Next.js JS/CSS chunks)
  // Stale-While-Revalidate: Return instant cache, update cache in background
  if (url.pathname.startsWith('/_next/static/') || url.pathname.includes('/images/') || url.pathname.match(/\.(png|jpg|jpeg|svg|css|js|woff2)$/)) {
    event.respondWith(
      caches.open(CACHE_NAME).then((cache) => {
        return cache.match(event.request).then((cachedResponse) => {
          const fetchPromise = fetch(event.request).then((networkResponse) => {
            // Update cache in the background with the latest version
            if (networkResponse && networkResponse.status === 200) {
              cache.put(event.request, networkResponse.clone());
            }
            return networkResponse;
          });
          // Return instant cache if available, else wait for network
          return cachedResponse || fetchPromise;
        });
      })
    );
    return;
  }

  // STRATEGY: HTML Pages & Dynamic Navigation
  // Network-First with Cache Fallback: Try network so we always get the newest layout/app version,
  // but if offline, serve the cached version or a standard offline fallback page.
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        const resClone = response.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, resClone);
        });
        return response;
      })
      .catch(() => {
        // Drop to cache if network completely fails (device is offline)
        return caches.match(event.request).then((cachedResponse) => {
          if (cachedResponse) {
            return cachedResponse;
          }
          // If we don't have the explicit page, optionally return an offline shell
          if (event.request.mode === 'navigate') {
            return caches.match('/offline.html');
          }
        });
      })
  );
});
