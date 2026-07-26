import type { MetadataRoute } from "next";

export const dynamic = "force-static";

export default function manifest(): MetadataRoute.Manifest {
  const basePath =
    process.env.GITHUB_PAGES === "1" ? "/southernmost-bar-grille" : "";

  return {
    name: "Southernmost Bar & Grille",
    short_name: "Southernmost",
    description:
      "Coastal food, cocktails, billiards and live music in West Palm Beach.",
    start_url: `${basePath}/`,
    display: "standalone",
    background_color: "#031d1a",
    theme_color: "#031d1a",
    icons: [
      {
        src: `${basePath}/icon-192.png`,
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: `${basePath}/icon-512.png`,
        sizes: "512x512",
        type: "image/png",
      },
    ],
  };
}
