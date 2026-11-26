const CACHE_NAME = 'jeico-cache-1795673423111';
const urlsToCache = [
  './',
  './index.html',
  './estilo1.css',
  './new-login-style.css',
  './assets/icon-512x512.png',
  './manifest.json'
];

self.addEventListener('install', event => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        return cache.addAll(urlsToCache);
      })
  );
});

// ESTRATEGIA: "Network First" con Actualización de Caché y Bypass de HTTP Cache
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;
  try {
    const reqUrl = new URL(event.request.url);
    if (reqUrl.origin !== self.location.origin) return;
    if (reqUrl.pathname.endsWith('/version.json') || reqUrl.pathname.endsWith('version.json') || reqUrl.pathname.endsWith('.php')) {
      return;
    }
  } catch (e) {
    return;
  }

  event.respondWith(
    fetch(event.request, { cache: 'no-store' })
      .then(response => {
        if (response && response.ok && response.type === 'basic') {
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, responseClone);
          });
        }
        return response;
      })
      .catch(() => {
        // Si no hay red (offline), servimos desde el caché
        return caches.match(event.request);
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
    }).then(() => self.clients.claim())
  );
});
