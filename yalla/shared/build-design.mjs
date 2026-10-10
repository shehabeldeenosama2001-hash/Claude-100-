// Generates design.json: the single source of truth both builds read.
// Run with: node yalla/shared/build-design.mjs
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const r2 = (n) => Math.round(n * 100) / 100;
const pt = (x, y) => `${r2(x)} ${r2(y)}`;

// 8-point star outline: 16 vertices, tips at k*45deg, notches between.
// The notch radius makes the outline match two overlapping squares.
const NOTCH = Math.cos(Math.PI / 4) / Math.cos(Math.PI / 8);
const octagramPoints = (cx, cy, r, rotation = -Math.PI / 2) =>
  new Array(16).fill(0).map((_, i) => {
    const a = rotation + (i * Math.PI) / 8;
    const rr = i % 2 === 0 ? r : r * NOTCH;
    return [cx + rr * Math.cos(a), cy + rr * Math.sin(a)];
  });
const closed = (pts) =>
  `M${pts.map(([x, y]) => pt(x, y)).join(" L")} Z`;

// Khatam: two overlapping squares, centered on 0,0 with tip radius 100
const square = (r, offset) =>
  closed(
    new Array(4).fill(0).map((_, i) => {
      const a = offset + (i * Math.PI) / 2;
      return [r * Math.cos(a), r * Math.sin(a)];
    }),
  );
const khatam = `${square(100, Math.PI / 4)} ${square(100, 0)}`;

// Unit octagram (tip radius 1) for iris masks and outlines
const octagramUnit = octagramPoints(0, 0, 1).map(([x, y]) => [
  Math.round(x * 10000) / 10000,
  Math.round(y * 10000) / 10000,
]);

// Rosette: 16 radial strokes from radius 1 to 1.16 (scaled by the renderer)
const rosette = new Array(16)
  .fill(0)
  .map((_, i) => {
    const a = -Math.PI / 2 + (i * Math.PI) / 8;
    const r1 = 1;
    const r0 = i % 2 === 0 ? 1.16 : 1.09;
    return `M${pt(r1 * Math.cos(a), r1 * Math.sin(a))} L${pt(r0 * Math.cos(a), r0 * Math.sin(a))}`;
  })
  .join(" ");

// Girih lattice: stars on a square grid, joined tip to tip, with small
// diamonds at the cell corners. Covers well beyond the frame so it can rotate.
const LATTICE_STEP = 270;
const latticeParts = [];
for (let gx = -4; gx <= 4; gx++) {
  for (let gy = -5; gy <= 5; gy++) {
    const cx = 540 + gx * LATTICE_STEP;
    const cy = 960 + gy * LATTICE_STEP;
    const r = LATTICE_STEP * 0.36;
    latticeParts.push(closed(octagramPoints(cx, cy, r, 0)));
    latticeParts.push(`M${pt(cx + r, cy)} L${pt(cx + LATTICE_STEP - r, cy)}`);
    latticeParts.push(`M${pt(cx, cy + r)} L${pt(cx, cy + LATTICE_STEP - r)}`);
    const dx = cx + LATTICE_STEP / 2;
    const dy = cy + LATTICE_STEP / 2;
    const d = LATTICE_STEP * 0.13;
    latticeParts.push(closed([[dx, dy - d], [dx + d, dy], [dx, dy + d], [dx - d, dy]]));
  }
}

// Small khatam for the crown jewel, centered at 200,118
const jewel = `${square(16, Math.PI / 4)} ${square(16, 0)}`
  .replace(/(-?\d+(\.\d+)?) (-?\d+(\.\d+)?)/g, (_, x, __, y) => pt(Number(x) + 200, Number(y) + 118));

const recitation = JSON.parse(readFileSync(join(here, "recitation-timing.json"), "utf8"));

const design = {
  canvas: { width: 1080, height: 1920, fps: 30, durationInFrames: 1140 },
  colors: {
    background: "#053C96",
    cream: "#F6F0E1",
    slogan: "#FFFFFF",
    navy: "#032A6B",
  },
  ornament: { strokeWidth: 2, strokeWidthThin: 1.5, opacityLow: 0.4, opacityHigh: 0.7, maxRotationDegPerSec: 6 },
  fonts: {
    display: { family: "Cairo", file: "fonts/Cairo.ttf", weight: "200 1000" },
    quran: { family: "Amiri Quran", file: "fonts/AmiriQuran.ttf", weight: "400" },
  },
  scenes: [
    { id: "hook", from: 0, duration: 75 },
    { id: "age", from: 75, duration: 105 },
    { id: "ayah", from: 180, duration: 150 },
    { id: "mother", from: 330, duration: 150 },
    { id: "growing", from: 480, duration: 270 },
    { id: "credit", from: 750, duration: 150 },
    { id: "payoff", from: 900, duration: 120 },
    { id: "slogan", from: 1020, duration: 120 },
  ],
  transitions: {
    sweep: { at: [180, 330, 750, 1020], duration: 18 },
    iris: { at: [480, 547, 615, 682, 900], duration: 24 },
  },
  copy: {
    hook: "استنّي… اسمعي ده",
    age: "عنده ٥ سنين",
    mother: "أول مرة سمعته بيقرا لوحده…",
    chapters: ["أول آية", "أول سورة", "أول جزء", "…"],
    credit: ["وكل حرف حفظه…", "في ميزانك انتي كمان"],
    sloganA: "قبل ما يكبر...",
    sloganB: "خليه يبدأ",
    logo: "يلا",
    // Family film: dialogue split into the chunks shown as subtitles
    familyHook: ["بنذاكرله كل مادة في الدنيا...", "إلا المادة اللي هيتسأل عنها قدام ربنا."],
    familyMother: ["عندنا مفيش مجموعات كبيرة", "ابنك ممكن يضيع فيها.", "كل طفل عنده شيخه لوحده...", "واحد لواحد،", "من غير ما حد ياخد وقت حد."],
    familyFather: ["وكل شيوخنا متخصصين،", "بيعلّموا ابنك التجويد والحفظ", "والقراءة الصحيحة والتربية الدينية...", "مش بس حفظ من غير فهم."],
    familySon: ["أول حصة ليا كانت تجربة!", "جربتها الأول، وبعدين قررنا...", "من غير أي التزام!"],
    familyDaughter: ["وكل طفل بيبدأ من مستواه هو،", "وبيتقدّم خطوة خطوة...", "لحد ما يوصل لآخر مستوى."],
    familyClosing: ["إحنا في يلا مش بس بنحفظ...", "إحنا بنربّي جيل عارف دينه،", "وعارف يقرا كتاب ربنا صح."],
  },
  layout: {
    stageCenterY: 940,
    octagramRadius: 430,
    // y = y0 + amp(t) * sin(pi*u)^1.5 * (0.6 sin(2pi f1 u + w1 t) + 0.4 sin(2pi f2 u - w2 t))
    // amp(t) = base + gain * activity(t); activity ramps over `ramp` seconds at each ayah edge
    waveform: { y: 1040, width: 720, points: 160, base: 5, gain: 62, f1: 3.2, f2: 7.3, w1: 5.1, w2: 8.7, ramp: 0.2 },
    hookTextY: 840,
    ayahY: 900,
    silhouette: { x: 240, y: 360, width: 600, height: 800 },
    motherTextY: 1300,
    ring: { cy: 470, r: 150 },
    chapterY: 900,
    child: { x: 390, y: 1180, width: 300, height: 500 },
    crown: { x: 340, y: 236, width: 400, height: 220 },
    payoffSilhouetteY: 420,
    sloganAY: 760,
    sloganBY: 930,
    logo: { cy: 1430, r: 120 },
  },
  beats: {
    octagramDraw: [0, 60],
    typeOn: [6, 48],
    hookTextOut: [75, 90],
    badgeIn: 84,
    rosetteDraw: [80, 112],
    ayahFade: 18,
    silhouetteDraw: [348, 393],
    motherWordsAt: 398,
    wordStagger: 4,
    ringFill: 30,
    childStep: 0.08,
    creditWordsAt: 770,
    latticeTurnDeg: 3,
    latticeBrighten: 0.1,
    crownIn: [912, 942],
    crownDrop: 40,
    sloganAIn: [1026, 1044],
    sloganBReveal: [1064, 1088],
    logoStarDraw: [1080, 1104],
    logoWordDraw: [1092, 1118],
    stillFrom: 1125,
    latticeDegPerSec: 0.5,
    latticeOpacity: 0.4,
  },
  // Scene 7 star particles (at most 12), fixed so both builds match
  particles: new Array(12).fill(0).map((_, i) => {
    const golden = (i * 0.618034) % 1;
    return {
      x: r2(150 + golden * 780),
      y: r2(260 + ((i * 0.381966 + 0.2) % 1) * 1300),
      size: r2(8 + ((i * 7) % 5) * 2.5),
      phase: r2(i * 0.9),
    };
  }),
  paths: {
    khatam,
    octagramUnit,
    rosette,
    lattice: latticeParts.join(" "),
    mother: [
      "M300 96 C232 96 186 148 184 220 C182 282 208 324 240 346 C196 362 160 396 144 452 C130 502 126 590 122 760",
      "M300 96 C368 96 414 148 416 220 C418 282 392 324 360 346 C404 362 440 396 456 452 C470 502 474 590 478 760",
      "M300 140 C262 140 238 176 238 222 C238 270 266 304 300 304 C334 304 362 270 362 222 C362 176 338 140 300 140 Z",
      "M246 332 C268 354 332 354 354 332",
      "M172 404 C164 470 176 552 214 598 C236 624 270 592 300 540",
      "M316 534 C338 522 370 496 394 470 C406 456 394 436 378 444 C364 452 350 464 340 474 C340 464 334 454 324 454 C312 454 308 466 312 478 C314 492 304 512 296 524",
      "M122 760 C220 778 380 778 478 760",
    ],
    child: [
      "M104 92 C104 66 125 46 150 46 C175 46 196 66 196 92 C196 118 175 138 150 138 C125 138 104 118 104 92 Z",
      "M110 74 C122 44 178 44 190 74",
      "M150 146 C112 148 92 172 86 210 L72 462 L228 462 L214 210 C208 172 188 148 150 146 Z",
      "M108 252 L150 264 L192 252 L192 304 L150 316 L108 304 Z",
      "M150 264 L150 316",
    ],
    crown: [
      "M60 190 L40 70 L120 132 L200 40 L280 132 L360 70 L340 190 Z",
      "M72 162 L328 162",
      "M33 70 C33 66 36 63 40 63 C44 63 47 66 47 70 C47 74 44 77 40 77 C36 77 33 74 33 70 Z",
      "M193 40 C193 36 196 33 200 33 C204 33 207 36 207 40 C207 44 204 47 200 47 C196 47 193 44 193 40 Z",
      "M353 70 C353 66 356 63 360 63 C364 63 367 66 367 70 C367 74 364 77 360 77 C356 77 353 74 353 70 Z",
      jewel,
    ],
  },
  recitation,
  audio: {
    roomTone: "audio/room-tone.wav",
    pad: "audio/pad.wav",
    recitation: "audio/recitation.wav",
    familyBed: "audio/family-bed.wav",
  },
};

writeFileSync(join(here, "design.json"), JSON.stringify(design, null, 2) + "\n");
console.log("wrote design.json");
