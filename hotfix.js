(() => {
  "use strict";

  const resetTransientLayers = () => {
    document.body?.classList.remove("no-scroll");
    [
      ["#guide-backdrop", "#guide-panel"],
      ["#drawer-backdrop", "#cart-drawer"],
    ].forEach(([backdropSelector, panelSelector]) => {
      const backdrop = document.querySelector(backdropSelector);
      const panel = document.querySelector(panelSelector);
      backdrop?.classList.remove("is-open", "is-visible");
      if (backdrop) backdrop.hidden = true;
      panel?.classList.remove("is-open");
      panel?.setAttribute("aria-hidden", "true");
    });

    const modal = document.querySelector("#flow-modal");
    modal?.classList.remove("is-open");
    modal?.setAttribute("aria-hidden", "true");
    if (modal) modal.hidden = true;

    if (matchMedia("(max-width: 900px)").matches) {
      document.querySelectorAll("[data-reveal]").forEach((node) => node.classList.add("is-visible"));
      const bar = document.querySelector(".mobile-action-bar");
      if (bar) {
        bar.style.removeProperty("transform");
        bar.style.removeProperty("opacity");
        bar.style.removeProperty("visibility");
      }
    }
    document.documentElement.classList.add("southernmost-ui-ready");
  };

  const retireStaleWorker = async () => {
    if (!("serviceWorker" in navigator)) return;
    try {
      const wasControlled = Boolean(navigator.serviceWorker.controller);
      const registrations = await navigator.serviceWorker.getRegistrations();
      await Promise.all(registrations.map((registration) => registration.unregister()));
      if ("caches" in window) {
        const keys = await caches.keys();
        await Promise.all(keys.filter((key) => key.startsWith("southernmost-")).map((key) => caches.delete(key)));
      }
      if (wasControlled && !sessionStorage.getItem("southernmost-worker-retired-20260725h")) {
        sessionStorage.setItem("southernmost-worker-retired-20260725h", "1");
        const url = new URL(location.href);
        url.searchParams.set("v", "20260725h");
        url.searchParams.set("fresh", "1");
        location.replace(url.toString());
      }
    } catch {}
  };

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", resetTransientLayers, { once: true });
  else resetTransientLayers();
  addEventListener("pageshow", resetTransientLayers);
  addEventListener("load", retireStaleWorker, { once: true });
  setTimeout(resetTransientLayers, 80);
})();
