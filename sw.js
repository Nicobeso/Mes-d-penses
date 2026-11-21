const CACHE_NAME = 'mes-depenses-v1';
const FICHIERS_A_METTRE_EN_CACHE = [
  './',
  './index.html',
  './manifest.json'
];

self.addEventListener('install', function (event) {
  event.waitUntil(
    caches.open(CACHE_NAME).then(function (cache) {
      return cache.addAll(FICHIERS_A_METTRE_EN_CACHE);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', function (event) {
  event.waitUntil(
    caches.keys().then(function (cles) {
      return Promise.all(
        cles
          .filter(function (cle) { return cle !== CACHE_NAME; })
          .map(function (cle) { return caches.delete(cle); })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', function (event) {
  if (event.request.method !== 'GET') return;

  const url = new URL(event.request.url);
  if (url.origin === self.location.origin) {
    event.respondWith(
      caches.match(event.request).then(function (reponseCache) {
        return reponseCache || fetch(event.request).then(function (reponseReseau) {
          const copie = reponseReseau.clone();
          caches.open(CACHE_NAME).then(function (cache) {
            cache.put(event.request, copie);
          });
          return reponseReseau;
        });
      })
    );
  }
});
