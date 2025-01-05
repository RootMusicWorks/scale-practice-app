self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open('scale-app-cache').then((cache) => {
      return cache.addAll([
        '/index.html',
        '/style.css',
        '/script.js',
        '/click.mp3',
        '/icon-192x192.png',
        '/icon-512x512.png',
      ]);
    })
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      return cachedResponse || fetch(event.request);
    })
  );
});
