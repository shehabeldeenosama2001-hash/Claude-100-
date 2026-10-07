// Renders source/images/*.html to output/images/*.png at 2x (2160x2700) for crisp feed ads.
// Run: NODE_PATH=$(npm root -g) node source/scripts/render_images.mjs
import { chromium } from "playwright";
import { readdirSync } from "node:fs";
import { fileURLToPath, pathToFileURL } from "node:url";
import path from "node:path";

const here = path.dirname(fileURLToPath(import.meta.url));
const srcDir = path.resolve(here, "../images");
const outDir = path.resolve(here, "../../output/images");

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1080, height: 1350 }, deviceScaleFactor: 2 });
for (const f of readdirSync(srcDir).filter((f) => f.endsWith(".html")).sort()) {
  await page.goto(pathToFileURL(path.join(srcDir, f)).href, { waitUntil: "networkidle" });
  await page.evaluate(() => document.fonts.ready);
  const out = path.join(outDir, f.replace(/\.html$/, ".png"));
  await page.screenshot({ path: out });
  console.log("rendered", out);
}
await browser.close();
