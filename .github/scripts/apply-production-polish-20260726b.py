from pathlib import Path
import json
import re
import qrcode
from qrcode.constants import ERROR_CORRECT_H

root = Path.cwd()
release = "20260726b"

# Main document: retire the emergency hotfix layer, use the release cache key,
# and replace temporary text/emoji controls with the shared SVG icon system.
index = root / "index.html"
s = index.read_text()
s = s.replace("20260725h", release)
s = s.replace(f'  <link rel="stylesheet" href="hotfix.css?v={release}" />\n', "")
s = s.replace(f'  <script src="hotfix.js?v={release}"></script>\n', "")
if "<body data-release=" not in s:
    s = s.replace("<body>", f'<body data-release="{release}">', 1)
s = s.replace(
    '<button class="close-button" type="button" data-close-cart aria-label="Close order">×</button>',
    '<button class="close-button" type="button" data-close-cart aria-label="Close order"><svg class="ui-icon" aria-hidden="true"><use href="#icon-close"></use></svg></button>'
)
s = s.replace(
    '<button class="close-button modal__close" type="button" data-close-modal aria-label="Close dialog">×</button>',
    '<button class="close-button modal__close" type="button" data-close-modal aria-label="Close dialog"><svg class="ui-icon" aria-hidden="true"><use href="#icon-close"></use></svg></button>'
)
s = s.replace(
    '<div class="cart-empty" id="cart-empty"><span>🌴</span><h3>Your island order is empty.</h3>',
    '<div class="cart-empty" id="cart-empty"><span class="cart-empty__mark" aria-hidden="true"><svg class="ui-icon"><use href="#icon-bag"></use></svg></span><h3>Your island order is empty.</h3>'
)
index.write_text(s)

# One deterministic layer manager owns scroll locking for the cart, modal and
# Island Guide. Inactive backdrops are always hidden and can never blur mobile.
app = root / "app.js"
s = app.read_text()
declarations = '''  const modal = $("#flow-modal");
  const modalContent = $("#modal-content");
  const cartDrawer = $("#cart-drawer");
  const drawerBackdrop = $("#drawer-backdrop");
  const toastRegion = $("#toast-region");
'''
manager = declarations + '''  const guidePanel = $("#guide-panel");
  const guideBackdrop = $("#guide-backdrop");

  const anyLayerOpen = () => Boolean(
    (!modal.hidden && modal.classList.contains("is-open")) ||
    cartDrawer.classList.contains("is-open") ||
    guidePanel?.classList.contains("is-open")
  );
  const syncScrollLock = () => document.body.classList.toggle("no-scroll", anyLayerOpen());
  window.SouthernmostSyncScrollLock = syncScrollLock;

  function resetTransientLayers() {
    modal.classList.remove("is-open");
    modal.setAttribute("aria-hidden", "true");
    modal.hidden = true;
    drawerBackdrop.classList.remove("is-open", "is-visible");
    drawerBackdrop.hidden = true;
    cartDrawer.classList.remove("is-open");
    cartDrawer.setAttribute("aria-hidden", "true");
    guideBackdrop?.classList.remove("is-open", "is-visible");
    if (guideBackdrop) guideBackdrop.hidden = true;
    guidePanel?.classList.remove("is-open");
    guidePanel?.setAttribute("aria-hidden", "true");
    syncScrollLock();
  }
  resetTransientLayers();
  addEventListener("pageshow", (event) => { if (event.persisted) resetTransientLayers(); });
'''
if 'const guidePanel = $("#guide-panel")' not in s:
    if declarations not in s:
        raise RuntimeError("Application DOM declaration block was not found")
    s = s.replace(declarations, manager, 1)

old_layers = '''  function openModal(markup, afterOpen) {
    modalContent.innerHTML = markup;
    modal.hidden = false;
    modal.setAttribute("aria-hidden", "false");
    document.body.classList.add("no-scroll");
    requestAnimationFrame(() => modal.classList.add("is-open"));
    afterOpen?.();
  }
  function closeModal() {
    modal.classList.remove("is-open");
    modal.setAttribute("aria-hidden", "true");
    setTimeout(() => { modal.hidden = true; document.body.classList.remove("no-scroll"); }, 240);
  }
  function openCart() {
    renderCart();
    drawerBackdrop.hidden = false;
    cartDrawer.setAttribute("aria-hidden", "false");
    document.body.classList.add("no-scroll");
    requestAnimationFrame(() => { drawerBackdrop.classList.add("is-open"); cartDrawer.classList.add("is-open"); });
  }
  function closeCart() {
    drawerBackdrop.classList.remove("is-open");
    cartDrawer.classList.remove("is-open");
    cartDrawer.setAttribute("aria-hidden", "true");
    setTimeout(() => { drawerBackdrop.hidden = true; document.body.classList.remove("no-scroll"); }, 240);
  }
'''
new_layers = '''  function openModal(markup, afterOpen) {
    closeCart(true);
    dispatchEvent(new CustomEvent("southernmost:close-guide", { detail: { immediate: true } }));
    modalContent.innerHTML = markup;
    modal.hidden = false;
    modal.setAttribute("aria-hidden", "false");
    requestAnimationFrame(() => { modal.classList.add("is-open"); syncScrollLock(); });
    afterOpen?.();
  }
  function closeModal(immediate = false) {
    modal.classList.remove("is-open");
    modal.setAttribute("aria-hidden", "true");
    const finish = () => { modal.hidden = true; syncScrollLock(); };
    if (immediate) finish(); else setTimeout(finish, 240);
  }
  function openCart() {
    closeModal(true);
    dispatchEvent(new CustomEvent("southernmost:close-guide", { detail: { immediate: true } }));
    renderCart();
    drawerBackdrop.hidden = false;
    cartDrawer.setAttribute("aria-hidden", "false");
    requestAnimationFrame(() => {
      drawerBackdrop.classList.add("is-open");
      cartDrawer.classList.add("is-open");
      syncScrollLock();
    });
  }
  function closeCart(immediate = false) {
    drawerBackdrop.classList.remove("is-open", "is-visible");
    cartDrawer.classList.remove("is-open");
    cartDrawer.setAttribute("aria-hidden", "true");
    const finish = () => { drawerBackdrop.hidden = true; syncScrollLock(); };
    if (immediate) finish(); else setTimeout(finish, 240);
  }
'''
if old_layers in s:
    s = s.replace(old_layers, new_layers, 1)
elif "function closeCart(immediate = false)" not in s:
    raise RuntimeError("Application overlay function block was not found")

listener = '  drawerBackdrop.addEventListener("click", closeCart);\n'
if 'southernmost:close-cart' not in s:
    if listener not in s:
        raise RuntimeError("Cart backdrop listener was not found")
    s = s.replace(
        listener,
        listener + '  addEventListener("southernmost:close-cart", (event) => closeCart(Boolean(event.detail?.immediate)));\n  addEventListener("southernmost:close-modal", (event) => closeModal(Boolean(event.detail?.immediate)));\n',
        1
    )

old_worker = '''  if ("serviceWorker" in navigator) {
      addEventListener("load", async () => {
        try {
          const registrations = await navigator.serviceWorker.getRegistrations();
          await Promise.all(registrations.map((registration) => registration.unregister()));
          if ("caches" in window) {
            const keys = await caches.keys();
            await Promise.all(keys.filter((key) => key.startsWith("southernmost-")).map((key) => caches.delete(key)));
          }
        } catch {}
      }, { once: true });
    }
  })();
'''
new_worker = '''  if ("serviceWorker" in navigator && location.protocol !== "file:") {
    addEventListener("load", async () => {
      try {
        const registration = await navigator.serviceWorker.register("./sw.js", { updateViaCache: "none" });
        await registration.update();
      } catch {}
    }, { once: true });
  }
})();
'''
if old_worker in s:
    s = s.replace(old_worker, new_worker, 1)
elif 'navigator.serviceWorker.register("./sw.js"' not in s:
    raise RuntimeError("Service-worker transition block was not found")
app.write_text(s)

# Coordinate the on-device Guide with the same layer manager.
upgrade = root / "upgrade.js"
s = upgrade.read_text()
old_guide = '''    const openGuide = () => {
      backdrop.hidden = false;
      requestAnimationFrame(() => {
        backdrop.classList.add("is-open");
        panel.classList.add("is-open");
        panel.setAttribute("aria-hidden", "false");
      });
      document.body.classList.add("no-scroll");
      setTimeout(() => guideInput?.focus(), 320);
    };
    const closeGuide = () => {
      backdrop.classList.remove("is-open");
      panel.classList.remove("is-open");
      panel.setAttribute("aria-hidden", "true");
      setTimeout(() => { backdrop.hidden = true; document.body.classList.remove("no-scroll"); }, 300);
    };
'''
new_guide = '''    const openGuide = () => {
      dispatchEvent(new CustomEvent("southernmost:close-cart", { detail: { immediate: true } }));
      dispatchEvent(new CustomEvent("southernmost:close-modal", { detail: { immediate: true } }));
      backdrop.hidden = false;
      requestAnimationFrame(() => {
        backdrop.classList.add("is-open");
        panel.classList.add("is-open");
        panel.setAttribute("aria-hidden", "false");
        window.SouthernmostSyncScrollLock?.();
      });
      setTimeout(() => guideInput?.focus(), 320);
    };
    const closeGuide = (immediate = false) => {
      backdrop.classList.remove("is-open", "is-visible");
      panel.classList.remove("is-open");
      panel.setAttribute("aria-hidden", "true");
      const finish = () => { backdrop.hidden = true; window.SouthernmostSyncScrollLock?.(); };
      if (immediate) finish(); else setTimeout(finish, 300);
    };
'''
if old_guide in s:
    s = s.replace(old_guide, new_guide, 1)
elif "window.SouthernmostSyncScrollLock" not in s:
    raise RuntimeError("Island Guide layer block was not found")
old_guide_listener = '''    backdrop.addEventListener("click", closeGuide);
    document.addEventListener("keydown", (event) => { if (event.key === "Escape" && panel.classList.contains("is-open")) closeGuide(); });
'''
new_guide_listener = '''    backdrop.addEventListener("click", () => closeGuide());
    addEventListener("southernmost:close-guide", (event) => closeGuide(Boolean(event.detail?.immediate)));
    document.addEventListener("keydown", (event) => { if (event.key === "Escape" && panel.classList.contains("is-open")) closeGuide(); });
'''
if 'southernmost:close-guide' not in s:
    if old_guide_listener not in s:
        raise RuntimeError("Island Guide event block was not found")
    s = s.replace(old_guide_listener, new_guide_listener, 1)
upgrade.write_text(s)

# Fold all mobile emergency rules into the real responsive stylesheet.
css = root / "upgrade.css"
s = css.read_text()
guards = '''

/* Production interaction guardrails — 20260726b */
[hidden] { display: none !important; }
html, body { max-width: 100%; overflow-x: clip; }
.drawer-backdrop,
.guide-backdrop,
.modal {
  visibility: hidden !important;
  pointer-events: none !important;
  opacity: 0 !important;
  -webkit-backdrop-filter: none !important;
  backdrop-filter: none !important;
}
.drawer-backdrop.is-open,
.drawer-backdrop.is-visible {
  visibility: visible !important;
  pointer-events: auto !important;
  opacity: 1 !important;
  -webkit-backdrop-filter: blur(6px) !important;
  backdrop-filter: blur(6px) !important;
}
.guide-backdrop.is-open {
  visibility: visible !important;
  pointer-events: auto !important;
  opacity: 1 !important;
  -webkit-backdrop-filter: blur(4px) !important;
  backdrop-filter: blur(4px) !important;
}
.modal.is-open {
  visibility: visible !important;
  pointer-events: auto !important;
  opacity: 1 !important;
}
.guide-panel:not(.is-open),
.cart-drawer:not(.is-open) { pointer-events: none !important; }
body:not(.no-scroll),
body:not(.no-scroll) #main { -webkit-filter: none !important; filter: none !important; }
.close-button .ui-icon { width: 1.15rem; height: 1.15rem; stroke-width: 2.2; }
.cart-empty__mark { display:grid; place-items:center; width:4.5rem; height:4.5rem; margin:0 auto 1rem; border-radius:50%; background:rgba(255,107,74,.12); color:var(--coral); }
.cart-empty__mark .ui-icon { width:2rem; height:2rem; }
.billiards-visual, #billiards-canvas { -webkit-user-select:none; user-select:none; touch-action:none; cursor:grab; }
.billiards-visual:active, #billiards-canvas:active { cursor:grabbing; }
@media (max-width: 900px) {
  [data-reveal], [data-reveal].is-visible {
    opacity:1 !important; visibility:visible !important; transform:none !important;
    -webkit-filter:none !important; filter:none !important; animation:none !important; transition:none !important;
  }
  .mobile-action-bar { opacity:1 !important; visibility:visible !important; transform:none !important; animation:none !important; transition:none !important; position:fixed !important; }
  .guide-launcher, .floating-cart { display:none !important; }
  .hero__copy, .hero__portal, .hero-sign-card, .mobile-book-reader, .mobile-book-shell {
    opacity:1 !important; visibility:visible !important; -webkit-filter:none !important; filter:none !important;
  }
}
'''
s = re.sub(r'\n/\* Production interaction guardrails — 20260726b \*/.*\Z', '', s, flags=re.S)
css.write_text(s.rstrip() + guards)

# Network-first application shell prevents a mixed-version mobile cache.
(root / "sw.js").write_text('''const CACHE = "southernmost-v16-20260726b";
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
''')

# Production QR routes carry location context into the existing tab system.
qr_dir = root / "qr"
qr_dir.mkdir(exist_ok=True)
routes = {
    "table-12.html": ("Southernmost Dining Table 12", "../index.html?table=12&zone=dining&token=SM-DINING-12#order"),
    "patio-07.html": ("Southernmost Patio Table 07", "../index.html?table=07&zone=patio&token=SM-PATIO-07#order"),
    "bar-03.html": ("Southernmost Bar Seat 03", "../index.html?table=03&zone=bar&token=SM-BAR-03#order"),
    "lounge-04.html": ("Southernmost Billiards Station 04", "../index.html?table=04&zone=lounge&station=04&token=SM-LOUNGE-04#order")
}
for filename, (title, url) in routes.items():
    (qr_dir / filename).write_text(f'<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex"><meta http-equiv="refresh" content="0;url={url}"><title>{title}</title></head><body><p>Opening your Southernmost ordering session…</p><script>location.replace({json.dumps(url)})</script></body></html>')

base = "https://guardian-prodigy.github.io/southernmost-bar-grille"
qr_targets = {
    "qr-table-12.png": f"{base}/qr/table-12.html",
    "qr-patio-07.png": f"{base}/qr/patio-07.html",
    "qr-bar-03.png": f"{base}/qr/bar-03.html",
    "qr-lounge-04.png": f"{base}/qr/lounge-04.html"
}
for filename, url in qr_targets.items():
    qr = qrcode.QRCode(error_correction=ERROR_CORRECT_H, box_size=12, border=4)
    qr.add_data(url)
    qr.make(fit=True)
    qr.make_image(fill_color="#062f2b", back_color="#fffaf0").save(root / "assets" / filename, optimize=True)

cards = [
    ("qr-table-12.png", "Dining room", "Table 12", "Activates dining-zone ordering for table 12.", "../qr/table-12.html"),
    ("qr-patio-07.png", "Patio", "Table 07", "Activates outdoor patio service for table 7.", "../qr/patio-07.html"),
    ("qr-bar-03.png", "Main bar", "Seat 03", "Starts a bar-zone tab associated with seat 3.", "../qr/bar-03.html"),
    ("qr-lounge-04.png", "Billiards lounge", "Station 04", "Connects billiards station 4 to lounge service and the running tab.", "../qr/lounge-04.html")
]
articles = "".join(f'<article class="card"><div class="qr-wrap"><img src="../assets/{image}" alt="QR code for Southernmost {title}"></div><div><small>{zone}</small><h2>{title}</h2><p>{copy}</p><div class="actions"><a class="button primary" href="{route}">Open session</a><a class="button secondary" href="../assets/{image}" download>Download QR</a></div></div></article>' for image, zone, title, copy, route in cards)
(root / "admin" / "qr-kit.html").write_text(f'''<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="theme-color" content="#041f1c"><meta name="robots" content="noindex"><title>Southernmost Table QR Access</title><link rel="icon" href="../assets/favicon.svg"><style>:root{{--ink:#041f1c;--paper:#fffdf7;--coral:#ff6b4a;--gold:#f6bc4b;--muted:#64736f}}*{{box-sizing:border-box}}body{{margin:0;background:radial-gradient(circle at 15% 5%,#16554b 0,transparent 34%),linear-gradient(145deg,#031d1a,#062f2b);color:#fff;font-family:Inter,system-ui,sans-serif;min-height:100vh}}.shell{{width:min(1180px,calc(100% - 30px));margin:auto;padding:34px 0 80px}}.back{{color:#ffffffb0;text-decoration:none;font-weight:750}}.hero{{padding:64px 0 38px}}.eyebrow{{color:var(--gold);font-weight:900;letter-spacing:.15em;text-transform:uppercase;font-size:.75rem}}.hero h1{{font-family:Georgia,serif;font-size:clamp(3.1rem,8vw,6.8rem);line-height:.88;letter-spacing:-.055em;margin:.65rem 0}}.hero p{{max-width:760px;color:#ffffffb8;line-height:1.75;font-size:1.05rem}}.grid{{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:20px}}.card{{display:grid;grid-template-columns:minmax(180px,240px) 1fr;gap:24px;align-items:center;background:var(--paper);color:var(--ink);border-radius:28px;padding:22px;box-shadow:0 32px 80px #0005}}.qr-wrap{{background:#fff;border-radius:22px;padding:14px;box-shadow:0 16px 35px #062f2b22}}.qr-wrap img{{display:block;width:100%;aspect-ratio:1;object-fit:contain}}.card small{{display:inline-flex;color:#0d796d;background:#e2f5f1;border-radius:999px;padding:.45rem .7rem;font-weight:900;text-transform:uppercase;letter-spacing:.1em;font-size:.68rem}}.card h2{{font-family:Georgia,serif;font-size:2rem;line-height:1;margin:14px 0 9px}}.card p{{color:var(--muted);line-height:1.6;margin:0}}.actions{{display:flex;flex-wrap:wrap;gap:10px;margin-top:18px}}.button{{display:inline-flex;align-items:center;justify-content:center;padding:12px 16px;border-radius:999px;text-decoration:none;font-weight:900}}.primary{{background:var(--coral);color:#fff}}.secondary{{background:var(--ink);color:#fff}}.note{{margin-top:26px;padding:20px 22px;border:1px solid #ffffff29;border-radius:20px;background:#ffffff0b;color:#ffffffc2;line-height:1.65}}@media(max-width:900px){{.grid{{grid-template-columns:1fr}}.card{{grid-template-columns:180px 1fr}}}}@media(max-width:620px){{.shell{{width:min(100% - 22px,1180px)}}.hero{{padding-top:42px}}.card{{grid-template-columns:1fr}}.qr-wrap{{width:min(100%,310px);margin:auto}}.actions .button{{flex:1}}}}</style></head><body><main class="shell"><a class="back" href="../index.html">← Back to Southernmost</a><section class="hero"><p class="eyebrow">In-venue ordering access</p><h1>Open the right<br>service location.</h1><p>Each QR route carries the service zone and seat identifier into the menu. Guests can verify a mobile number, order in rounds, request their assigned server, tip and close the tab from one browser session.</p></section><section class="grid">{articles}</section><p class="note"><strong>Operating model:</strong> public visitors can browse the full menu. In-venue ordering controls activate only after entry through a location QR.</p></main></body></html>''')

for obsolete in ("hotfix.css", "hotfix.js"):
    (root / obsolete).unlink(missing_ok=True)

print(f"Applied Southernmost production polish {release}")
