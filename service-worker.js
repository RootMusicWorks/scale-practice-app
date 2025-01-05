const CACHE_NAME = 'scale-app-cache-v3';  // キャッシュ名が統一されている
const urlsToCache = [
    './index.html',
    './style.css',
    './script.js',
    './click.mp3',
    './icon-192x192.png',
    './icon-512x512.png',
    './manifest.json'  // ここもキャッシュ対象に追加
];

// インストール時にキャッシュ保存
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll(urlsToCache);
        })
    );
});

// 古いキャッシュの削除
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            return caches.delete(cache);
          }
        })
      );
    })
  );
});

// フェッチ時にキャッシュから取得
self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request).then((cachedResponse) => {
            return cachedResponse || fetch(event.request);
        })
    );
});
