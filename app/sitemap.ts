import type { MetadataRoute } from "next";

export const dynamic = "force-static";

const routes = [
  "",
  "/menu",
  "/events",
  "/private-events",
  "/visit",
  "/order",
  "/legal/privacy",
  "/legal/terms",
  "/legal/accessibility",
];

export default function sitemap(): MetadataRoute.Sitemap {
  return routes.map((route) => ({
    url: `https://southernmost.life${route}`,
    lastModified: new Date("2026-07-26"),
    changeFrequency: route === "/menu" ? "weekly" : "monthly",
    priority: route === "" ? 1 : route === "/menu" ? 0.9 : 0.7,
  }));
}
