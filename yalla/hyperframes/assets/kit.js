// Shared motion kit for the Yalla scenes. Every value comes from window.YALLA
// (the mirror of ../shared/design.json). Times passed to helpers are
// scene-local seconds; `sceneStart` maps them back to film time.
window.YallaKit = function (compositionId, sceneStart) {
  const Y = window.YALLA;
  const B = Y.beats;
  const NS = "http://www.w3.org/2000/svg";
  const s = (frame) => frame / Y.canvas.fps;
  // Film frame -> this scene's local seconds
  const at = (frame) => s(frame) - sceneStart;
  const CX = 540;
  const CY = Y.layout.stageCenterY;
  const STILL = s(B.stillFrom);
  const SOFT = "power3.out"; // stands in for spring({ damping: 200 }): no overshoot
  const INOUT = "power2.inOut"; // ease-in-out cubic
  const clamp01 = (x) => Math.min(1, Math.max(0, x));
  const tl = gsap.timeline({ paused: true });
  const $ = (sel) => document.querySelector(sel);

  const svgEl = (tag, attrs, parent) => {
    const el = document.createElementNS(NS, tag);
    for (const key in attrs) el.setAttribute(key, attrs[key]);
    if (parent) parent.appendChild(el);
    return el;
  };
  const octaPoints = (cx, cy, r) =>
    Y.paths.octagramUnit.map(([x, y]) => `${(cx + x * r).toFixed(2)},${(cy + y * r).toFixed(2)}`).join(" ");
  const octaClip = (cx, cy, r) =>
    `polygon(${Y.paths.octagramUnit.map(([x, y]) => `${(cx + x * r).toFixed(1)}px ${(cy + y * r).toFixed(1)}px`).join(", ")})`;
  const drawable = (el) => {
    el.setAttribute("pathLength", "1");
    el.style.strokeDasharray = "1";
    return el;
  };
  const drawOn = (el, when, duration, ease = INOUT) =>
    tl.fromTo(drawable(el), { strokeDashoffset: 1 }, { strokeDashoffset: 0, duration, ease }, when);
  const words = (container, text) =>
    text.split(" ").map((word) => {
      const span = document.createElement("span");
      span.className = "word";
      span.textContent = word;
      container.appendChild(span);
      return span;
    });
  const wordsIn = (spans, when) =>
    tl.fromTo(spans, { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: s(14), ease: SOFT, stagger: s(B.wordStagger) }, when);

  // The lattice angle is a function of film time, so every scene's copy lines
  // up exactly across a wipe. It stops for the final still.
  const latticeAngle = (t) => B.latticeDegPerSec * Math.min(t, STILL);
  const backdrop = (stage, localEnd) => {
    const bd = document.createElement("div");
    bd.className = "backdrop";
    stage.prepend(bd);
    const bg = document.createElement("div");
    bg.className = "bg";
    bd.appendChild(bg);
    const svg = svgEl("svg", { class: "lattice", viewBox: "0 0 1080 1920" }, bd);
    const turn = svgEl("g", {}, svg);
    const extra = svgEl("g", {}, turn);
    svgEl("path", { d: Y.paths.lattice, opacity: B.latticeOpacity }, extra);
    const until = Math.max(0, Math.min(sceneStart + localEnd, STILL) - sceneStart);
    tl.fromTo(
      turn,
      { rotation: latticeAngle(sceneStart), svgOrigin: "540 960" },
      { rotation: latticeAngle(sceneStart + until), svgOrigin: "540 960", duration: until, ease: "none" },
      0,
    );
    return { bd, extra };
  };

  // Cream line sweeping right-to-left, revealing this scene behind it
  const sweep = (stage, line, when) => {
    const d = s(Y.transitions.sweep.duration);
    tl.fromTo(stage, { clipPath: "inset(0px 0px 0px 1080px)" }, { clipPath: "inset(0px 0px 0px 0px)", duration: d, ease: INOUT }, when);
    tl.fromTo(line, { x: 1080, opacity: 1 }, { x: -4, duration: d, ease: INOUT }, when);
    tl.to(line, { opacity: 0, duration: s(1) }, when + d);
  };

  // Octagram iris: the target opens inside a growing 8-point star
  const iris = (target, overlay, when) => {
    const d = s(Y.transitions.iris.duration);
    tl.fromTo(target, { clipPath: octaClip(CX, CY, 0) }, { clipPath: octaClip(CX, CY, 1500), duration: d, ease: INOUT }, when);
    const edge = svgEl("polygon", { points: octaPoints(CX, CY, 1), class: "line", "stroke-width": 2 }, overlay);
    tl.fromTo(
      edge,
      { scale: 0, opacity: 0.7, svgOrigin: `${CX} ${CY}` },
      { scale: 1500, opacity: 0, svgOrigin: `${CX} ${CY}`, duration: d, ease: INOUT },
      when,
    );
  };

  // Faces that start hidden would not load on their own
  const ready = Promise.all([
    document.fonts.load('104px "Amiri Quran"', "قُلۡ هُوَ"),
    document.fonts.load('800 104px "Cairo"', "يلا"),
  ]).then(() => document.fonts.ready);

  const register = () => {
    window.__timelines[compositionId] = tl;
  };

  return {
    Y, B, L: Y.layout, REC: Y.recitation, tl, s, at, CX, CY, SOFT, INOUT, clamp01, $,
    svgEl, octaPoints, drawable, drawOn, words, wordsIn, backdrop, sweep, iris, ready, register,
  };
};
