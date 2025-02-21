const CACHE_NAME = 'blackjack-cache-v1';
const urlsToCache = [
  'index.html',
  'style.css',
  'app.js',
  'manifest.json',
  'assets/icon-192x192.png',
  'assets/icon-512x512.png',
  'assets/card-back.jpg',
  'assets/dealer.jpg',
  "assets/chip.svg",
  'assets/ellipse.svg'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        return cache.addAll(urlsToCache);
      })
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        if (response) {
          return response;
        }
        return fetch(event.request);
      })
  );
});

self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});