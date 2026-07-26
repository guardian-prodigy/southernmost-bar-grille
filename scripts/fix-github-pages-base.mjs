import { readFile, readdir, writeFile } from "node:fs/promises";
import { extname, join } from "node:path";
import { fileURLToPath } from "node:url";

const outputDirectory = fileURLToPath(new URL("../out/", import.meta.url));
const basePath = "/southernmost-bar-grille";
const textExtensions = new Set([
  ".css",
  ".html",
  ".js",
  ".json",
  ".txt",
  ".webmanifest",
  ".xml",
]);

const publicRoots = [
  "/assets/",
  "/apple-touch-icon.png",
  "/favicon.svg",
  "/icon-192.png",
  "/icon-512.png",
  "/og-southernmost.jpg",
];

async function walk(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await walk(path)));
    } else {
      files.push(path);
    }
  }

  return files;
}

const files = await walk(outputDirectory);
let changed = 0;

for (const file of files) {
  if (!textExtensions.has(extname(file))) continue;

  const original = await readFile(file, "utf8");
  let next = original;

  for (const root of publicRoots) {
    next = next.replaceAll(root, `${basePath}${root}`);
  }

  if (next !== original) {
    await writeFile(file, next);
    changed += 1;
  }
}

const remaining = [];
for (const file of files) {
  if (!textExtensions.has(extname(file))) continue;
  const contents = await readFile(file, "utf8");
  for (const root of publicRoots) {
    if (contents.includes(`"${root}`) || contents.includes(`('${root}`)) {
      remaining.push(`${file}: ${root}`);
    }
  }
}

if (remaining.length) {
  throw new Error(
    `GitHub Pages build contains unprefixed public paths:\n${remaining.join("\n")}`,
  );
}

console.log(`Normalized GitHub Pages base paths in ${changed} files.`);
