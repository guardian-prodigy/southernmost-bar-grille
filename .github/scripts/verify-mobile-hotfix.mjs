import { chromium, devices } from "playwright";

const browser = await chromium.launch({ headless: true, channel: "chrome" });
const context = await browser.newContext({ ...devices["Pixel 7"], colorScheme: "dark" });
const page = await context.newPage();
const browserErrors = [];
page.on("pageerror", (error) => browserErrors.push(`pageerror:${error.message}`));

const url = "https://guardian-prodigy.github.io/southernmost-bar-grille/?v=20260725h&fresh=1&verify=6";
await page.goto(url, { waitUntil: "domcontentloaded", timeout: 120000 });
await page.waitForTimeout(3500);

const state = await page.evaluate(() => {
  const read = (selector) => {
    const element = document.querySelector(selector);
    if (!element) return null;
    const computed = getComputedStyle(element);
    const rect = element.getBoundingClientRect();
    return {
      hidden: element.hidden,
      classes: element.className,
      display: computed.display,
      visibility: computed.visibility,
      opacity: computed.opacity,
      filter: computed.filter,
      backdrop: computed.backdropFilter || computed.webkitBackdropFilter || "none",
      pointerEvents: computed.pointerEvents,
      transform: computed.transform,
      rect: { x: rect.x, y: rect.y, width: rect.width, height: rect.height },
    };
  };
  return {
    href: location.href,
    bodyClass: document.body.className,
    ready: document.documentElement.classList.contains("southernmost-ui-ready"),
    hero: read(".hero__copy"),
    heroTitle: read("#hero-title"),
    guideBackdrop: read("#guide-backdrop"),
    drawerBackdrop: read("#drawer-backdrop"),
    modal: read("#flow-modal"),
    mobileBar: read(".mobile-action-bar"),
  };
});

console.log(`INITIAL_STATE=${JSON.stringify(state)}`);
console.log(`BROWSER_ERRORS=${JSON.stringify(browserErrors)}`);
const fail = (message) => { throw new Error(`${message}; STATE=${JSON.stringify(state)}; ERRORS=${JSON.stringify(browserErrors)}`); };

if (!state.ready) fail("UI readiness marker missing");
if (state.bodyClass.includes("no-scroll")) fail("Body locked on initial load");
for (const [name, layer] of Object.entries({ guide: state.guideBackdrop, drawer: state.drawerBackdrop, modal: state.modal })) {
  if (!layer) fail(`${name} layer missing`);
  const closed = layer.hidden || layer.display === "none" || (layer.visibility === "hidden" && layer.pointerEvents === "none");
  if (!closed) fail(`${name} layer active while closed`);
  if (layer.backdrop !== "none") fail(`${name} layer blurs while closed`);
}
if (!state.hero || state.hero.visibility !== "visible" || Number(state.hero.opacity) < 0.99 || state.hero.filter !== "none") fail("Hero copy not fully visible");
if (!state.heroTitle || state.heroTitle.rect.width < 100 || state.heroTitle.rect.height < 50) fail("Hero title has no meaningful rendered area");
if (!state.mobileBar || state.mobileBar.display === "none" || state.mobileBar.visibility !== "visible" || Number(state.mobileBar.opacity) < 0.99) fail("Mobile dock not visible");

await page.locator(".mobile-action-bar [data-open-guide]").click();
await page.waitForTimeout(450);
const guide = await page.evaluate(() => ({
  panel: document.querySelector("#guide-panel")?.classList.contains("is-open"),
  backdrop: document.querySelector("#guide-backdrop")?.classList.contains("is-open"),
  hidden: document.querySelector("#guide-backdrop")?.hidden,
  opacity: getComputedStyle(document.querySelector("#guide-backdrop")).opacity,
}));
console.log(`GUIDE_OPEN=${JSON.stringify(guide)}`);
if (!(guide.panel && guide.backdrop && guide.hidden === false && Number(guide.opacity) > 0.9)) throw new Error(`Guide open failed: ${JSON.stringify(guide)}`);
await page.locator("[data-close-guide]").click();
await page.waitForTimeout(400);
if (!(await page.locator("#guide-backdrop").evaluate((element) => element.hidden))) throw new Error("Guide close failed");

await page.locator(".mobile-action-bar [data-open-cart]").click();
await page.waitForTimeout(450);
const cart = await page.evaluate(() => ({
  drawer: document.querySelector("#cart-drawer")?.classList.contains("is-open"),
  backdrop: document.querySelector("#drawer-backdrop")?.classList.contains("is-open"),
  hidden: document.querySelector("#drawer-backdrop")?.hidden,
  opacity: getComputedStyle(document.querySelector("#drawer-backdrop")).opacity,
}));
console.log(`CART_OPEN=${JSON.stringify(cart)}`);
if (!(cart.drawer && cart.backdrop && cart.hidden === false && Number(cart.opacity) > 0.9)) throw new Error(`Cart open failed: ${JSON.stringify(cart)}`);
await page.locator("[data-close-cart]").first().click();
await page.waitForTimeout(400);
if (!(await page.locator("#drawer-backdrop").evaluate((element) => element.hidden))) throw new Error("Cart close failed");

await page.screenshot({ path: "/tmp/mobile-hotfix-live.png", fullPage: true });
await browser.close();
console.log("MOBILE_HOTFIX_VERIFIED");
