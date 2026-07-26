import type { NextConfig } from "next";

const isGitHubPagesBuild = process.env.GITHUB_PAGES === "1";

const nextConfig: NextConfig = {
  ...(isGitHubPagesBuild
    ? {
        output: "export" as const,
        basePath: "/southernmost-bar-grille",
        assetPrefix: "/southernmost-bar-grille",
        trailingSlash: true,
        images: {
          unoptimized: true,
        },
        typescript: {
          tsconfigPath: "tsconfig.github.json",
        },
      }
    : {}),
};

export default nextConfig;
