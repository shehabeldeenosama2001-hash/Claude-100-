// Renders source/product-shots/*.html to output/store-images/*.jpg at 2000x2000.
// Run from source/scripts with node_modules linked to the global playwright install.
import { chromium } from "playwright";
import { readdirSync } from "node:fs";
import { fileURLToPath, pathToFileURL } from "node:url";
import path from "node:path";
const here = path.dirname(fileURLToPath(import.meta.url));
const srcDir = path.resolve(here, "../product-shots");
const outDir = path.resolve(here, "../../output/store-images");
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1000, height: 1000 }, deviceScaleFactor: 2 });
for (const f of readdirSync(srcDir).filter((f) => f.endsWith(".html")).sort()) {
  await page.goto(pathToFileURL(path.join(srcDir, f)).href, { waitUntil: "networkidle" });
  const out = path.join(outDir, f.replace(/\.html$/, ".png"));
  await page.screenshot({ path: out });
  console.log("rendered", out);
}
await browser.close();
