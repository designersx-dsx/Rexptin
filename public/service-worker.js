const CACHE_NAME = "my-app-cache-v2"; // 🔁 update version on each deploy
const urlsToCache = ["/", "/favicon.ico", "/logo192.png", "/logo512.png"];

// ✅ Install event: Cache essential files
self.addEventListener("install", (event) => {
  self.skipWaiting(); // activate immediately
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(urlsToCache))
  );
});

// ✅ Activate event: Delete old caches
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) =>
      Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      )
    )
  );
  self.clients.claim(); // take control of open pages
});

// ✅ Fetch event: Network-first strategy for dynamic stability
self.addEventListener("fetch", (event) => {
  // Avoid caching non-GET requests or chrome-extension URLs
  if (event.request.method !== "GET" || event.request.url.startsWith("chrome-extension")) {
    return;
  }

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Clone & cache new response
        const resClone = response.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, resClone);
        });
        return response;
      })
      .catch(() => caches.match(event.request)) // fallback to cache
  );
});
