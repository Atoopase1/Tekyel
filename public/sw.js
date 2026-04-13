// A minimal service worker to satisfy PWA installability requirements
self.addEventListener('install', (e) => {
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', (e) => {
  // Pass through fetch. We can implement caching strategies here later.
});
