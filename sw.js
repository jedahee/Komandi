'use strict';

/* Service Worker de la landing de Komandi: network-first con caché.
   Sube VERSION en cada release para que los navegadores descarten la caché
   vieja. En línea siempre se sirve lo nuevo (network-first); la caché solo
   da soporte offline. */

const VERSION = 'v9';
const CACHE = 'komandi-landing-' + VERSION;

const CORE = [
  './',
  './index.html',
  './app.js',
  './styles.css',
  './assets/vendor/swiper/swiper-bundle.min.css',
  './assets/vendor/swiper/swiper-bundle.min.js',
  './manifest.webmanifest',
  './robots.txt',
  './sitemap.xml',
  './assets/logo.png',
  './assets/favicon.png',
  './assets/capturas/01-carta.webp',
  './assets/capturas/02-wizard.webp',
  './assets/capturas/03-resumen.webp',
  './assets/capturas/04-cocina.webp',
  './assets/capturas/05-admin.webp',
  './assets/capturas/06-pin.webp'
];

const TIMEOUT_MS = 4000;

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE)
      .then((c) => c.addAll(CORE))
      .then(() => self.skipWaiting())
      .catch(() => {})
  );
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

function desdeCache(req) {
  return caches.match(req).then((hit) => {
    if (hit) return hit;
    return new Response('Not found', { status: 404, statusText: 'Not found' });
  });
}

function conTimeout(promise, ms) {
  return new Promise((resolve, reject) => {
    const t = setTimeout(() => reject(new Error('timeout')), ms);
    promise.then(
      (v) => { clearTimeout(t); resolve(v); },
      (e) => { clearTimeout(t); reject(e); }
    );
  });
}

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;
  let url;
  try { url = new URL(req.url); } catch (err) { return; }
  if (url.origin !== self.location.origin) return;
  if (url.pathname.indexOf('/demo/') === 0) return;

  e.respondWith(
    conTimeout(fetch(req), TIMEOUT_MS)
      .then((res) => {
        const copy = res.clone();
        if (res.ok && (res.type === 'basic' || res.type === 'default')) {
          caches.open(CACHE).then((c) => c.put(req, copy)).catch(() => {});
        }
        return res;
      })
      .catch(() => desdeCache(req))
  );
});
