import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/qr/"],
    },
    sitemap: "https://southernmost.life/sitemap.xml",
  };
}
