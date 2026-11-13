// Wiki Cards : service worker minimal (rend l'app installable). Toujours le réseau d'abord,
// rien n'est mis en cache pour que les mises à jour arrivent tout de suite.
self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", e => e.waitUntil(self.clients.claim()));
self.addEventListener("fetch", () => {});
