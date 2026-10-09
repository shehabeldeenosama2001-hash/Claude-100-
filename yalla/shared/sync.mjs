// Mirrors the shared design, fonts and audio into both projects.
// Run with: node yalla/shared/sync.mjs (after build-design.mjs)
import { cpSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const shared = dirname(fileURLToPath(import.meta.url));
const yalla = dirname(shared);
const design = readFileSync(join(shared, "design.json"), "utf8");

// HyperFrames: a classic script so the composition can read window.YALLA
const hf = join(yalla, "hyperframes", "assets");
mkdirSync(hf, { recursive: true });
writeFileSync(
  join(hf, "design.js"),
  `// Generated from yalla/shared/design.json by sync.mjs. Do not edit.\nwindow.YALLA = ${design.trim()};\n`,
);
cpSync(join(shared, "fonts"), join(hf, "fonts"), { recursive: true });
cpSync(join(shared, "audio"), join(hf, "audio"), { recursive: true });

// Remotion: static files in public/ (the JSON itself is imported directly)
const rm = join(yalla, "remotion", "public");
mkdirSync(rm, { recursive: true });
cpSync(join(shared, "fonts"), join(rm, "fonts"), { recursive: true });
cpSync(join(shared, "audio"), join(rm, "audio"), { recursive: true });

console.log("synced design, fonts and audio into hyperframes/assets and remotion/public");
