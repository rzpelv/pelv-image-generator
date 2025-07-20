const CACHE_NAME = 'pelv-image-ai-v2';
const APP_SHELL_URLS = [
    '/',
    '/index.html',
    '/icon.svg',
    '/manifest.json',
];
const CDN_URLS = [
    'https://cdn.tailwindcss.com'
];

// Install: Cache the app shell and CDNs
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      console.log('Opened cache');
      const shellPromise = cache.addAll(APP_SHELL_URLS);
      const cdnPromise = cache.addAll(CDN_URLS);
      return Promise.all([shellPromise, cdnPromise]);
    })
  );
});

// Activate: Clean up old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('Service Worker: clearing old cache', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Fetch: Stale-While-Revalidate strategy
self.addEventListener('fetch', event => {
    // Ignore non-GET requests
    if (event.request.method !== 'GET') return;
    
    // For API calls to our own backend, always go to network.
    if (event.request.url.includes('/api/generate')) {
        return; // Let browser handle it
    }

    event.respondWith(
        caches.open(CACHE_NAME).then(cache => {
            return cache.match(event.request).then(cachedResponse => {
                // Stale-while-revalidate strategy
                const fetchPromise = fetch(event.request).then(networkResponse => {
                    // Check for valid response to cache
                    if (networkResponse && (networkResponse.status === 200 || networkResponse.status === 0)) {
                        const responseToCache = networkResponse.clone();
                        cache.put(event.request, responseToCache);
                    }
                    return networkResponse;
                }).catch(error => {
                    // Fetch failed, probably offline
                    console.warn('Fetch failed. Serving from cache if available.', error);
                });

                // Return cached response immediately, and update cache in background.
                return cachedResponse || fetchPromise;
            });
        })
    );
});