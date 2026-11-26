// Service worker minimal : le jeu reste disponible hors connexion.
// Stratégie « réseau d'abord » : on prend toujours la dernière version en ligne,
// et on se rabat sur la copie en cache si le réseau ne répond pas.
const CACHE = 'wipe-and-loot-v1';

self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (event) => event.waitUntil(self.clients.claim()));

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== self.location.origin) return;
  event.respondWith(
    fetch(req)
      .then((res) => {
        const copy = res.clone();
        caches.open(CACHE).then((cache) => cache.put(req, copy));
        return res;
      })
      .catch(() => caches.match(req).then((cached) => cached || Response.error())),
  );
});
