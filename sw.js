const CACHE = "southernmost-v4";
const CORE = [
  "./", "./index.html", "./styles.css", "./data.js", "./app.js", "./three-scenes.js",
  "./terms.html", "./privacy.html", "./accessibility.html", "./manifest.webmanifest",
  "./assets/hero.webp", "./assets/interior.webp", "./assets/lamb.webp", "./assets/wings.webp",
  "./assets/mahi.webp", "./assets/tacos.webp", "./assets/cocktails.webp", "./assets/key-lime.webp",
  "./assets/menu-board-signature.webp", "./assets/menu-board-complete.webp", "./admin/qr-kit.html"
];
self.addEventListener("install", event => event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(CORE)).then(() => self.skipWaiting())));
self.addEventListener("activate", event => event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(key => key !== CACHE).map(key => caches.delete(key)))).then(() => self.clients.claim())));
self.addEventListener("fetch", event => {
  if (event.request.method !== "GET") return;
  event.respondWith(caches.match(event.request).then(hit => hit || fetch(event.request).then(response => {
    const copy = response.clone();
    if (response.ok && new URL(event.request.url).origin === location.origin) caches.open(CACHE).then(cache => cache.put(event.request, copy));
    return response;
  }).catch(() => caches.match("./index.html"))));
});
