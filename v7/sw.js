/* Offline cache for the taxi app v7 (app shell, cache-first).
   Bump CACHE before every deploy so clients pick up the new version.

   v6 (/haru-taxi/) and v7 (/haru-taxi/v7/) share one origin, so they share Cache Storage:
   only ever touch caches that start with PREFIX, never the other app's. */
const PREFIX = 'haru-taxi-v7-';
const CACHE = PREFIX + 'v3';
const ASSETS = [
  './', './index.html',
  './css/styles.css',
  './js/data.js', './js/sound.js', './js/art.js', './js/screens.js', './js/app.js',
  './manifest.webmanifest',
  './icons/icon-180.png', './icons/icon-192.png', './icons/icon-512.png', './icons/icon-512-maskable.png'
];

self.addEventListener('install', e => {
  // cache:'reload' bypasses the HTTP cache (GitHub Pages serves max-age=600), so a new
  // version never gets precached with stale files
  e.waitUntil(
    caches.open(CACHE)
      .then(c => c.addAll(ASSETS.map(u => new Request(u, { cache: 'reload' }))))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(ks => Promise.all(ks.filter(k => k.startsWith(PREFIX) && k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  const sameOrigin = url.origin === self.location.origin;
  // cache-busting / probe URLs (?ts=...) go straight to the network and are never stored
  if (sameOrigin && url.search) return;

  e.respondWith(
    caches.open(CACHE).then(cache =>
      cache.match(req).then(hit => hit || fetch(req).then(resp => {
        // only keep good responses (no 404/500, no opaque) so errors can't stick until the next bump
        if (resp && resp.ok && (resp.type === 'basic' || resp.type === 'cors')) {
          cache.put(req, resp.clone()).catch(() => {});
        }
        return resp;
      }).catch(() => req.mode === 'navigate' ? cache.match('./index.html') : Response.error()))
    )
  );
});
