const CACHE = "southernmost-v16-20260726b";
const CORE = [
  "./", "./index.html", "./styles.css", "./upgrade.css", "./data.js", "./app.js", "./upgrade.js", "./three-scenes-v2.js",
  "./404.html", "./terms.html", "./privacy.html", "./accessibility.html", "./manifest.webmanifest",
  "./legal/terms.html", "./legal/privacy.html", "./legal/allergens.html", "./legal/refunds.html", "./legal/accessibility.html",
  "./admin/qr-kit.html", "./qr/table-12.html", "./qr/patio-07.html", "./qr/bar-03.html", "./qr/lounge-04.html",
  "./assets/hero.webp", "./assets/interior.webp", "./assets/lamb.webp", "./assets/wings.webp", "./assets/burger.webp",
  "./assets/mahi.webp", "./assets/seafood.webp", "./assets/tacos.webp", "./assets/cocktails.webp", "./assets/key-lime.webp", "./assets/music.webp",
  "./assets/southernmost-logo-plate.webp", "./assets/southernmost-mark-plate.webp", "./assets/southernmost-wordmark.webp", "./assets/southernmost-badge.webp",
  "./assets/menu-board-complete.jpg", "./assets/menu-board-signature.jpg", "./assets/og-southernmost.jpg",
  "./assets/qr-table-12.png", "./assets/qr-patio-07.png", "./assets/qr-bar-03.png", "./assets/qr-lounge-04.png"
];
self.addEventListener("install", event => event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(CORE)).then(() => self.skipWaiting())));
self.addEventListener("activate", event => event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(key => key.startsWith("southernmost-") && key !== CACHE).map(key => caches.delete(key)))).then(() => self.clients.claim())));
async function networkFirst(request) {
  const cache = await caches.open(CACHE);
  try {
    const response = await fetch(request, { cache: "no-store" });
    if (response.ok) cache.put(request, response.clone());
    return response;
  } catch {
    return (await cache.match(request, { ignoreSearch: true })) || (request.mode === "navigate" ? cache.match("./index.html") : Response.error());
  }
}
async function cacheFirst(request) {
  const cache = await caches.open(CACHE);
  const cached = await cache.match(request, { ignoreSearch: true });
  if (cached) return cached;
  const response = await fetch(request);
  if (response.ok) cache.put(request, response.clone());
  return response;
}
self.addEventListener("fetch", event => {
  const request = event.request;
  if (request.method !== "GET") return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;
  const extension = url.pathname.split(".").pop()?.toLowerCase();
  const dynamic = request.mode === "navigate" || ["html", "css", "js", "json", "webmanifest"].includes(extension);
  event.respondWith(dynamic ? networkFirst(request) : cacheFirst(request));
});
