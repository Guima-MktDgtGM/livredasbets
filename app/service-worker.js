const CACHE_NAME = "betfree-pwa-v1";
const ASSETS = [
  "/app/index.html",
  "/app/manifest.json",
  "/Imagens/cerebro-recuperacao.png",
  "https://cdn.tailwindcss.com",
  "https://unpkg.com/lucide@latest"
];

// Install Event
self.addEventListener("install", (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS);
    }).then(() => self.skipWaiting())
  );
});

// Activate Event
self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch Event
self.addEventListener("fetch", (e) => {
  e.respondWith(
    caches.match(e.request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }
      return fetch(e.request).then((networkResponse) => {
        // Cache new successful GET requests
        if (
          networkResponse &&
          networkResponse.status === 200 &&
          e.request.method === "GET" &&
          !e.request.url.includes("chrome-extension")
        ) {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(e.request, responseToCache);
          });
        }
        return networkResponse;
      });
    }).catch(() => {
      // Offline fallback
      if (e.request.mode === "navigate") {
        return caches.match("/app/index.html");
      }
    })
  );
});
