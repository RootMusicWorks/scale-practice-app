const CACHE_NAME = 'scale-app-cache-v3';  // キャッシュ名変更で強制更新
const urlsToCache = [
    './index.html',
    './style.css',
    './script.js',
    './click.mp3',
    './icon-192x192.png',
    './icon-512x512.png'
];

// インストール時にキャッシュを保存
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
                cacheNames.map((cacheName) => {
                    if (cacheName !== CACHE_NAME) {
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});

// フェッチ時にキャッシュから取得（オフライン対応）
self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request).then((cachedResponse) => {
            return cachedResponse || fetch(event.request);
        })
    );
});
