const CACHE = "southernmost-v18-20260727b";
const CORE = [
  "./", "./index.html", "./platform.css", "./data.js", "./platform-store.js", "./platform.js", "./three-scenes-pro.js", "./manifest.webmanifest",
  "./menu/", "./order/", "./order/order-responsive.css", "./events/", "./private-events/", "./visit/", "./loyalty/", "./staff/", "./admin/", "./admin/qr-kit.html",
  "./qr/table-12.html", "./qr/patio-07.html", "./qr/bar-03.html", "./qr/lounge-04.html",
  "./legal/terms.html", "./legal/privacy.html", "./legal/allergens.html", "./legal/refunds.html", "./legal/accessibility.html",
  "./assets/hero.webp", "./assets/interior.webp", "./assets/lamb.webp", "./assets/wings.webp", "./assets/burger.webp", "./assets/mahi.webp", "./assets/seafood.webp", "./assets/tacos.webp", "./assets/cocktails.webp", "./assets/key-lime.webp", "./assets/music.webp",
  "./assets/southernmost-wordmark.webp", "./assets/southernmost-badge.webp", "./assets/og-southernmost.jpg", "./assets/menu-board-complete.jpg", "./assets/menu-board-signature.jpg",
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
    const cached = await cache.match(request, { ignoreSearch: true });
    if (cached) return cached;
    if (request.mode === "navigate") return cache.match("./index.html");
    return Response.error();
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