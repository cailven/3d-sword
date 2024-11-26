const CACHE_NAME = 'lightsaber-v1';
const urlsToCache = [
    '/',
    '/index.html',
    '/js/lightsaber.js',
    '/js/physics.js',
    '/models/lightsaber.gltf'
];

self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => cache.addAll(urlsToCache))
    );
});

self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request)
            .then(response => response || fetch(event.request))
    );
}); 