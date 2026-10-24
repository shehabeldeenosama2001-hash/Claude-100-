// Usage: node render.mjs stills <outDir> <frame,frame,...> [propsJson]
//        node render.mjs video  <outFile> [propsJson] [frameStart-frameEnd]
import { bundle } from "@remotion/bundler";
import { renderStill, renderMedia, selectComposition } from "@remotion/renderer";
import path from "node:path";
import fs from "node:fs";

const CLOUD_CHROME = "/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell";

const root = path.resolve(process.cwd());
const [mode, out, a3, a4] = process.argv.slice(2);
// Optional: point at an existing Chromium; otherwise Remotion downloads its own headless shell.
const browserExecutable = process.env.REMOTION_BROWSER || (fs.existsSync(CLOUD_CHROME) ? CLOUD_CHROME : null);
const propsFile = mode === "stills" ? a4 : a3;
const inputProps = propsFile ? JSON.parse(fs.readFileSync(propsFile, "utf8")) : undefined;

const serveUrl = await bundle({ entryPoint: path.join(root, "src/index.tsx"), publicDir: path.join(root, "public") });
const composition = await selectComposition({ serveUrl, id: "CourseReel", inputProps, browserExecutable });
console.log("duration frames:", composition.durationInFrames);

if (mode === "stills") {
  fs.mkdirSync(out, { recursive: true });
  for (const f of a3.split(",").map(Number)) {
    await renderStill({ serveUrl, composition, frame: f, output: path.join(out, `f${String(f).padStart(4, "0")}.jpg`), imageFormat: "jpeg", jpegQuality: 80, inputProps, browserExecutable });
    console.log("still", f);
  }
} else {
  const range = a4 ? a4.split("-").map(Number) : undefined;
  let last = -1;
  await renderMedia({
    serveUrl, composition, codec: "h264", outputLocation: out, inputProps, browserExecutable,
    crf: 18, concurrency: 4, frameRange: range,
    onProgress: ({ progress }) => { const p = Math.floor(progress * 10); if (p !== last) { last = p; console.log(`progress ${p * 10}%`); } },
  });
  console.log("done", out);
}
