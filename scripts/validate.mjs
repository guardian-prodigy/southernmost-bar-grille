import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(scriptDir, "..");
const coreFiles = [
  "index.html", "terms.html", "privacy.html", "accessibility.html", "styles.css",
  "app.js", "data.js", "three-scenes.js", "manifest.webmanifest", "sw.js",
  "admin/qr-kit.html", "qr/table-12.html", "qr/patio-07.html", "qr/bar-03.html",
  "qr/billiards-02.html", "assets/qr/table-12.svg", "assets/qr/patio-07.svg",
  "assets/qr/bar-03.svg", "assets/qr/billiards-02.svg"
];
const errors = [];

for (const file of coreFiles) {
  const full = path.join(root, file);
  if (!fs.existsSync(full) || fs.statSync(full).size === 0) errors.push(`Missing or empty ${file}`);
}

const walk = directory => fs.readdirSync(directory, { withFileTypes: true }).flatMap(entry => {
  const full = path.join(directory, entry.name);
  return entry.isDirectory() ? walk(full) : [full];
});
const sourceFiles = walk(root).filter(file => /\.(?:html|js|css|json|xml|txt)$/i.test(file));
for (const full of sourceFiles) {
  const relative = path.relative(root, full);
  const text = fs.readFileSync(full, "utf8");
  if (/\b(?:demo|demonstration)\b/i.test(text)) errors.push(`Visible-source word not allowed in ${relative}`);
}

for (const file of ["app.js", "data.js", "three-scenes.js", "sw.js"]) {
  const result = spawnSync(process.execPath, ["--check", path.join(root, file)], { encoding: "utf8" });
  if (result.status !== 0) errors.push(`${file}: ${(result.stderr || result.stdout).trim()}`);
}

const dataSource = fs.readFileSync(path.join(root, "data.js"), "utf8");
const sandbox = { window: {} };
vm.createContext(sandbox);
try { vm.runInContext(dataSource, sandbox); }
catch (error) { errors.push(`data.js runtime: ${error.message}`); }
const data = sandbox.window.SOUTHERNMOST;
if (!data?.menu?.length) errors.push("Menu data failed to load");
const itemCount = data?.menu?.reduce((count, category) => count + category.items.length, 0) || 0;
if (itemCount < 50) errors.push(`Expected at least 50 menu entries, found ${itemCount}`);
if (data?.menu?.length < 11) errors.push(`Expected at least 11 menu categories, found ${data?.menu?.length || 0}`);

const htmlFiles = walk(root).filter(file => file.endsWith(".html"));
for (const full of htmlFiles) {
  const relative = path.relative(root, full);
  const text = fs.readFileSync(full, "utf8");
  for (const match of text.matchAll(/(?:src|href)=["']([^"'#?]+)["']/g)) {
    const ref = match[1];
    if (/^(?:https?:|mailto:|tel:|data:|javascript:)/.test(ref)) continue;
    const local = path.resolve(path.dirname(full), ref);
    if (!fs.existsSync(local)) errors.push(`${relative}: broken local reference ${ref}`);
  }
}

const indexSource = fs.readFileSync(path.join(root, "index.html"), "utf8");
const appSource = fs.readFileSync(path.join(root, "app.js"), "utf8");
if (!indexSource.includes("Southernmost Island Guide") || !appSource.includes("guideResponse")) errors.push("On-device Island Guide missing");
if (!indexSource.includes("book-sheets") || !appSource.includes("updateBook")) errors.push("Interactive menu book missing");
if (!indexSource.includes("table-ordering") || !appSource.includes("openTabFlow")) errors.push("Table ordering flow missing");
if (!fs.readFileSync(path.join(root, "sitemap.xml"), "utf8").includes("/southernmost-bar-grille/")) errors.push("Sitemap uses the wrong deployment path");

if (errors.length) {
  console.error(errors.map(error => `✗ ${error}`).join("\n"));
  process.exit(1);
}
console.log(`✓ ${coreFiles.length} core files present`);
console.log(`✓ ${data.menu.length} menu categories and ${itemCount} menu entries loaded`);
console.log("✓ public-facing source contains no prohibited environment label");
console.log("✓ on-device Island Guide, menu book and table ordering present");
console.log(`✓ ${htmlFiles.length} HTML files have valid local references`);
console.log("✓ sitemap and GitHub Pages path are correct");
