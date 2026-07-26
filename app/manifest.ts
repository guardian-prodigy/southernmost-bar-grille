import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Southernmost Bar & Grille",
    short_name: "Southernmost",
    description:
      "Coastal food, cocktails, billiards and live music in West Palm Beach.",
    start_url: "/",
    display: "standalone",
    background_color: "#031d1a",
    theme_color: "#031d1a",
    icons: [
      {
        src: "/icon-192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/icon-512.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
  };
}
