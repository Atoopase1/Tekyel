const CACHE_NAME = 'tekyel-pwa-cache-v3';
const MEDIA_CACHE_NAME = 'tekyel-media-cache-v1';
const STATIC_ROOT_CACHES = [
  '/',
  '/login',
  '/manifest.json',
  '/icon-192.png',
  '/icon-512.png',
  '/logo.jpg',
];

// Install event: cache core static assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      // Use individual additions so one failure (like a redirect on /) doesn't block the rest
      return Promise.allSettled(
        STATIC_ROOT_CACHES.map(url => 
          cache.add(url).catch(err => console.warn(`Failed to cache ${url}:`, err))
        )
      );
    }).then(() => self.skipWaiting())
  );
});

// Activate event: clean up old caches immediately
self.addEventListener('activate', (event) => {
  const currentCaches = [CACHE_NAME, MEDIA_CACHE_NAME];
  event.waitUntil(
    caches.keys().then((cacheNames) => 
      Promise.all(
        cacheNames
          .filter((name) => !currentCaches.includes(name))
          .map((name) => caches.delete(name))
      )
    ).then(() => self.clients.claim())
  );
});

// Fetch event with Hybrid Strategy:
// 1. Supabase Storage Media (images/avatars/attachments) -> Cache First, update in background
// 2. Static Assets (JS/CSS/Fonts/Images) -> Stale-While-Revalidate
// 3. Next.js Data/Navigation -> Network First, fallback to Cache
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Ignore non-HTTP protocols (chrome-extension, etc)
  if (!url.protocol.startsWith('http')) return;

  // Ignore WebSockets, POST requests, and Supabase REST/Realtime API calls
  if (
    event.request.method !== 'GET' ||
    url.pathname.startsWith('/socket.io') ||
    (url.hostname.includes('supabase.co') && url.pathname.startsWith('/rest/')) ||
    (url.hostname.includes('supabase.co') && url.pathname.startsWith('/realtime/')) ||
    (url.hostname.includes('supabase.co') && url.pathname.startsWith('/auth/'))
  ) {
    return;
  }

  // Next.js Hot Module Reloading for dev should bypass cache
  if (url.pathname.includes('/_next/webpack-hmr') || url.pathname.includes('/__nextjs_')) return;

  // ── STRATEGY 1: Supabase Storage Media (profile pics, shared images, audio, video) ──
  // Cache-First with background revalidation. These URLs rarely change.
  if (url.hostname.includes('supabase.co') && url.pathname.includes('/storage/')) {
    event.respondWith(
      caches.open(MEDIA_CACHE_NAME).then((cache) => {
        return cache.match(event.request).then((cachedResponse) => {
          // Always kick off a background fetch to keep the cache fresh
          const fetchPromise = fetch(event.request).then((networkResponse) => {
            if (networkResponse && networkResponse.status === 200) {
              cache.put(event.request, networkResponse.clone());
            }
            return networkResponse;
          }).catch(() => {
            // Network failed — that's fine, we have the cached copy
            return cachedResponse;
          });

          // Return the cached version instantly if we have it
          return cachedResponse || fetchPromise;
        });
      })
    );
    return;
  }

  // ── STRATEGY 2: Static Assets (Next.js chunks, images, fonts, CSS) ──
  // Stale-While-Revalidate: Return instant cache, update cache in background
  if (url.pathname.startsWith('/_next/static/') || url.pathname.includes('/images/') || url.pathname.match(/\.(png|jpg|jpeg|svg|css|js|woff2|woff|ttf|webp|avif|gif|ico)$/)) {
    event.respondWith(
      caches.open(CACHE_NAME).then((cache) => {
        return cache.match(event.request).then((cachedResponse) => {
          const fetchPromise = fetch(event.request).then((networkResponse) => {
            if (networkResponse && networkResponse.status === 200) {
              cache.put(event.request, networkResponse.clone());
            }
            return networkResponse;
          }).catch(() => cachedResponse);
          return cachedResponse || fetchPromise;
        });
      })
    );
    return;
  }

  // ── STRATEGY 3: Google Fonts ──
  // Cache-First: Fonts never change once loaded
  if (url.hostname.includes('fonts.googleapis.com') || url.hostname.includes('fonts.gstatic.com')) {
    event.respondWith(
      caches.open(CACHE_NAME).then((cache) => {
        return cache.match(event.request).then((cachedResponse) => {
          if (cachedResponse) return cachedResponse;
          return fetch(event.request).then((networkResponse) => {
            if (networkResponse && networkResponse.status === 200) {
              cache.put(event.request, networkResponse.clone());
            }
            return networkResponse;
          });
        });
      })
    );
    return;
  }

  // ── STRATEGY 4: HTML Pages & Dynamic Navigation ──
  // Network-First with Cache Fallback.
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Only cache successful HTTP responses
        if (response && response.status === 200 && response.type === 'basic') {
          const resClone = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, resClone).catch(() => {});
          });
        }
        return response;
      })
      .catch((err) => {
        console.warn('[Service Worker] Fetch failed:', err);
        return caches.match(event.request).then((cachedResponse) => {
          if (cachedResponse) {
            return cachedResponse;
          }
          // For navigation requests (page loads), serve the cached root page
          // so the React app can boot and show the offline banner in-app
          if (event.request.mode === 'navigate') {
            return caches.match('/').then((rootResponse) => {
              if (rootResponse) return rootResponse;
              
              // If absolutely nothing is in cache, return a functional fallback instead of crashing the PWA
              return new Response(
                `<!DOCTYPE html>
                <html lang="en">
                <head>
                  <meta charset="UTF-8">
                  <meta name="viewport" content="width=device-width, initial-scale=1.0">
                  <title>Offline - Tekyel</title>
                  <style>
                    body { font-family: system-ui, sans-serif; background: #0F172A; color: white; display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; margin: 0; text-align: center; padding: 20px; }
                    button { margin-top: 20px; padding: 12px 24px; background: #3B82F6; color: white; border: none; border-radius: 8px; font-weight: bold; cursor: pointer; }
                  </style>
                </head>
                <body>
                  <h2>You are offline</h2>
                  <p>Tekyel could not connect to the server and no offline cache was found.</p>
                  <button onclick="window.location.reload()">Retry Connection</button>
                </body>
                </html>`,
                { headers: { 'Content-Type': 'text/html' } }
              );
            });
          }
          
          return new Response('', { status: 404, statusText: 'Offline' });
        });
      })
  );
});
