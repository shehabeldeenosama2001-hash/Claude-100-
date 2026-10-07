// Usage: node render_dir.mjs <srcDir> <outDir> <width> <height>  -> renders every *.html at 2x as JPG-ready PNG
import { chromium } from "playwright";
import { readdirSync, mkdirSync } from "node:fs";
import { pathToFileURL } from "node:url";
import path from "node:path";
const [srcDir, outDir, w, h] = process.argv.slice(2);
mkdirSync(outDir, { recursive: true });
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: +w, height: +h }, deviceScaleFactor: 2 });
for (const f of readdirSync(srcDir).filter((f) => f.endsWith(".html")).sort()) {
  await page.goto(pathToFileURL(path.resolve(srcDir, f)).href, { waitUntil: "networkidle" });
  await page.evaluate(() => document.fonts.ready);
  await page.screenshot({ path: path.join(outDir, f.replace(/\.html$/, ".png")) });
  console.log("rendered", f);
}
await browser.close();
