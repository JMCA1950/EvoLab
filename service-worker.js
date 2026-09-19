'use strict';

// Se guardan solamente los archivos públicos necesarios para abrir EvoLab.
// Los PDF y los datos médicos del usuario no se incorporan a esta caché.
const CACHE_NAME = 'evolab-pwa-v1';

const APP_SHELL = [
  './',
  './index.html',
  './manifest.webmanifest',
  './icons/icon-192.png',
  './icons/icon-512.png'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(APP_SHELL))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    self.clients.claim()
  );
});

self.addEventListener('fetch', event => {
  const request = event.request;

  if (request.method !== 'GET') return;

  const url = new URL(request.url);

  // No intervenir en solicitudes externas ni en otras aplicaciones.
  if (
    url.origin !== self.location.origin ||
    !url.pathname.startsWith(new URL('./', self.registration.scope).pathname)
  ) return;

  event.respondWith(
    fetch(request).catch(async () => {
      const cached = await caches.match(request);

      if (cached) return cached;

      if (request.mode === 'navigate') {
        return caches.match('./index.html');
      }

      throw new Error('Recurso no disponible sin conexión');
    })
  );
});
