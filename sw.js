/* Retires the service worker that v10 installed (sw.js, removed in v12). A registered worker outlives its
   script: browsers that visited v10 kept it, and with it a cache of the old site. When such a browser next
   checks for an update it gets this file instead, which deletes every cache, unregisters itself and reloads
   any open tab onto the live game. Nothing registers this worker any more; it only replaces the old one. */
self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (event) => {
  event.waitUntil((async () => {
    for (const key of await caches.keys()) await caches.delete(key);
    await self.registration.unregister();
    for (const client of await self.clients.matchAll({ type: "window" })) client.navigate(client.url);
  })());
});
