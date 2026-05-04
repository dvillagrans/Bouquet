/* Minimal no-op service worker to avoid 404 in environments trying to fetch /service-worker.js */
self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener("fetch", () => {
  // Intentionally empty: no runtime caching strategy configured.
});
