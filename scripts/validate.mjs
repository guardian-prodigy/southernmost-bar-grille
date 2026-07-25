import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(scriptDir, "..");
const publicFiles = ["index.html", "terms.html", "privacy.html", "accessibility.html", "styles.css", "app.js", "data.js", "three-scenes-v2.js", "upgrade.js", "upgrade.css", "manifest.webmanifest", "sw.js"];
const errors = [];

for (const file of publicFiles) {
  const full = path.join(root, file);
  if (!fs.existsSync(full)) errors.push(`Missing ${file}`);
}

for (const file of ["index.html", "terms.html", "privacy.html", "accessibility.html", "app.js", "data.js"]) {
  const text = fs.readFileSync(path.join(root, file), "utf8");
  if (/\bdemo\b/i.test(text)) errors.push(`Visible-source word not allowed in ${file}`);
}

for (const file of ["app.js", "data.js", "upgrade.js", "three-scenes-v2.js", "sw.js"]) {
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

const htmlFiles = ["index.html", "terms.html", "privacy.html", "accessibility.html"];
for (const file of htmlFiles) {
  const text = fs.readFileSync(path.join(root, file), "utf8");
  for (const match of text.matchAll(/(?:src|href)="([^"#?]+)"/g)) {
    const ref = match[1];
    if (/^(?:https?:|mailto:|tel:|data:)/.test(ref)) continue;
    const local = path.join(root, ref);
    if (!fs.existsSync(local)) errors.push(`${file}: broken local reference ${ref}`);
  }
}

if (errors.length) {
  console.error(errors.map(error => `✗ ${error}`).join("\n"));
  process.exit(1);
}
console.log(`✓ ${publicFiles.length} core files present`);
console.log(`✓ ${data.menu.length} menu categories and ${itemCount} menu entries loaded`);
console.log("✓ public-facing source contains no prohibited environment label");
console.log("✓ local asset references resolved");
