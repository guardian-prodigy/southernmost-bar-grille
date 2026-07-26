import assert from "node:assert/strict";
import test from "node:test";

const developmentPreviewMeta =
  /<meta(?=[^>]*\bname=["']codex-preview["'])(?=[^>]*\bcontent=["']development["'])[^>]*>/i;

let worker;

async function fetchRoute(pathname = "/") {
  if (!worker) {
    const workerUrl = new URL("../dist/server/index.js", import.meta.url);
    workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
    ({ default: worker } = await import(workerUrl.href));
  }

  return worker.fetch(
    new Request(`http://localhost${pathname}`, {
      headers: { accept: "text/html" },
    }),
    {
      ASSETS: {
        fetch: async () => new Response("Not found", { status: 404 }),
      },
    },
    {
      waitUntil() {},
      passThroughOnException() {},
    },
  );
}

test("renders development metadata and primary contact details", async () => {
  const response = await fetchRoute("/");

  assert.equal(response.status, 200);
  assert.match(
    response.headers.get("content-type") ?? "",
    /^text\/html\b/i,
  );
  const html = await response.text();
  assert.match(html, developmentPreviewMeta);
  assert.match(html, /Coastal plates/);
  assert.match(html, /The neighborhood bar took a trip/);
  assert.match(html, /\+1 \(727\) 910-6118/);
  assert.match(html, /AJL WebCraft/);
});

test("renders the complete public menu route", async () => {
  const response = await fetchRoute("/menu");
  assert.equal(response.status, 200);
  const html = await response.text();
  assert.match(html, /A taste of/);
  assert.match(html, /Menu folio/);
  assert.match(html, /Conch Fritters/);
  assert.match(html, /Jerk Lamb Chops/);
  assert.match(html, /Tropical Cocktails/);
});

test("renders guest conversion and protected QR routes", async () => {
  for (const [route, expected] of [
    ["/order", "Your favorites"],
    ["/events", "Dinner is only"],
    ["/private-events", "Your celebration"],
    ["/visit", "Meet at the corner"],
    ["/qr/table-12", "Dining room"],
    ["/legal/accessibility", "Accessibility"],
  ]) {
    const response = await fetchRoute(route);
    assert.equal(response.status, 200, route);
    assert.match(await response.text(), new RegExp(expected), route);
  }
});
