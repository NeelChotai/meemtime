const CACHE_NAME = "meemtime-v20260201";
const ASSETS = [
  "./",
  "./index.html",
  "./css/styles.css",
  "./css/relaxation.css",
  "./js/app.js",
  "./js/timer-logic.js",
  "./js/timer-display.js",
  "./js/relaxation-data.js",
  "./js/relaxation-logic.js",
  "./js/relaxation-app.js",
  "./manifest.json",
  "./icons/favicon.svg",
  "./icons/favicon-96x96.png",
  "./icons/favicon.ico",
  "./icons/apple-touch-icon.png",
  "./icons/web-app-manifest-192x192.png",
  "./icons/web-app-manifest-512x512.png",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS)),
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => caches.delete(key)),
      );
    }),
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    }),
  );
});
