import type React from "react";
import { AbsoluteFill, Img, staticFile } from "remotion";
import { C, FPS } from "../design";
import { DISPLAY } from "../fonts";
import { inOut } from "../kit";
import cutouts from "./cutouts.json";

export type Cutout = keyof typeof cutouts;
const asset = (name: string) => staticFile(`family/${name}`);

// Shared room plate. The camera moves it with less travel than the people
// in front of it, which is what sells the depth.
export const Room: React.FC<{
  readonly x?: number;
  readonly y?: number;
  readonly scale?: number;
  readonly blur?: number;
}> = ({ x = 0, y = 0, scale = 1, blur = 3 }) => (
  <AbsoluteFill style={{ overflow: "hidden" }}>
    <Img
      src={asset("room.jpg")}
      style={{
        position: "absolute",
        left: -36,
        top: -72,
        width: 1152,
        height: 2064,
        translate: `${x}px ${y}px`,
        scale: String(scale),
        filter: blur ? `blur(${blur}px)` : undefined,
      }}
    />
  </AbsoluteFill>
);

// Warm Maghrib light over everything, with optional light shafts from the window
export const Grade: React.FC<{ readonly shafts?: number }> = ({ shafts = 0 }) => (
  <AbsoluteFill style={{ pointerEvents: "none" }}>
    <AbsoluteFill
      style={{
        background: "linear-gradient(200deg, rgba(255,186,110,0.42) 0%, rgba(255,160,90,0.12) 45%, rgba(3,42,107,0.18) 100%)",
        mixBlendMode: "soft-light",
      }}
    />
    {shafts > 0 ? (
      <AbsoluteFill
        style={{
          background:
            "repeating-linear-gradient(118deg, rgba(255,226,170,0) 0px, rgba(255,226,170,0.16) 60px, rgba(255,226,170,0) 150px, rgba(255,226,170,0) 260px)",
          maskImage: "linear-gradient(200deg, #000 0%, transparent 70%)",
          WebkitMaskImage: "linear-gradient(200deg, #000 0%, transparent 70%)",
          opacity: shafts,
          mixBlendMode: "screen",
        }}
      />
    ) : null}
    <AbsoluteFill
      style={{ background: "radial-gradient(ellipse 80% 65% at 50% 45%, transparent 55%, rgba(30,20,10,0.45) 100%)" }}
    />
  </AbsoluteFill>
);

type Expression = { readonly name: Cutout; readonly from: number };

// One character, switching expressions with a short dissolve. Images of the
// same character share one scale and a bottom-centre anchor.
export const Person: React.FC<{
  readonly frame: number;
  readonly expressions: Expression[];
  readonly x: number;
  readonly bottom: number;
  readonly width: number;
  readonly blur?: number;
  readonly speaking?: Array<[number, number]>;
  readonly style?: React.CSSProperties;
}> = ({ frame, expressions, x, bottom, width, blur = 0, speaking = [], style }) => {
  const base = cutouts[expressions[0].name];
  const k = width / base.w;
  const t = frame / FPS;
  // Breathing, plus a small head bob while this character is talking
  const talking = speaking.some(([a, b]) => frame >= a && frame <= b) ? 1 : 0;
  const bob = talking * 3 * Math.sin(t * 2 * Math.PI * 3.1);
  const breathe = 1 + 0.006 * Math.sin((t * 2 * Math.PI) / 3.4);

  return (
    <div
      style={{
        position: "absolute",
        left: x - width / 2,
        top: bottom - base.h * k,
        width,
        height: base.h * k,
        transformOrigin: "50% 100%",
        scale: String(breathe),
        translate: `0px ${bob}px`,
        filter: blur ? `blur(${blur}px)` : undefined,
        ...style,
      }}
    >
      {expressions.map((e, i) => {
        const meta = cutouts[e.name];
        const next = expressions[i + 1];
        const shown = i === 0 ? 1 : inOut(frame, e.from, e.from + 6);
        const covered = next && frame >= next.from + 6;
        return (
          <Img
            key={e.name}
            src={asset(`${e.name}.png`)}
            style={{
              position: "absolute",
              left: (width - meta.w * k) / 2,
              bottom: 0,
              width: meta.w * k,
              height: meta.h * k,
              opacity: covered ? 0 : shown,
            }}
          />
        );
      })}
    </div>
  );
};

// A standing full-body figure scaled to a real height, feet on `ground`
export const Figure: React.FC<{
  readonly name: Cutout;
  readonly x: number;
  readonly ground: number;
  readonly height: number;
  readonly frame: number;
}> = ({ name, x, ground, height, frame }) => {
  const meta = cutouts[name];
  const [x0, y0, x1, y1] = meta.box;
  const k = height / (y1 - y0);
  const breathe = 1 + 0.005 * Math.sin((frame / FPS) * 2 * Math.PI * 0.3 + x);

  return (
    <>
      <div
        style={{
          position: "absolute",
          left: x - ((x1 - x0) * k) / 2 - 20,
          top: ground - 26,
          width: (x1 - x0) * k + 40,
          height: 52,
          borderRadius: "50%",
          background: "radial-gradient(ellipse, rgba(60,40,20,0.35) 0%, rgba(60,40,20,0) 70%)",
        }}
      />
      <Img
        src={asset(`${name}.png`)}
        style={{
          position: "absolute",
          left: x - ((x0 + x1) / 2) * k,
          top: ground - y1 * k,
          width: meta.w * k,
          height: meta.h * k,
          transformOrigin: `${((x0 + x1) / 2) * k}px ${y1 * k}px`,
          scale: String(breathe),
        }}
      />
    </>
  );
};

export type Line = { readonly text: string; readonly from: number; readonly to: number };

// Dialogue shown as subtitles (no voice yet)
export const Subtitles: React.FC<{ readonly frame: number; readonly lines: Line[]; readonly top?: number }> = ({
  frame,
  lines,
  top = 1560,
}) => (
  <>
    {lines.map((line) => {
      const p = inOut(frame, line.from, line.from + 6) * (1 - inOut(frame, line.to - 5, line.to));
      if (p <= 0) return null;
      return (
        <div
          key={line.text}
          style={{
            position: "absolute",
            top,
            left: 70,
            right: 70,
            display: "flex",
            justifyContent: "center",
            direction: "rtl",
            opacity: p,
            translate: `0px ${(1 - p) * 14}px`,
          }}
        >
          <span
            style={{
              padding: "14px 34px 20px",
              borderRadius: 26,
              background: "rgba(3,42,107,0.78)",
              color: C.cream,
              fontFamily: DISPLAY,
              fontSize: 56,
              fontWeight: 700,
              lineHeight: 1.35,
              textAlign: "center",
              boxShadow: "0 12px 30px rgba(0,0,0,0.25)",
            }}
          >
            {line.text}
          </span>
        </div>
      );
    })}
  </>
);

// Spread a scene's dialogue across its chunks in proportion to word count
export const timeLines = (chunks: string[], from: number, to: number, gap = 4): Line[] => {
  const words = chunks.map((c) => c.split(" ").length);
  const total = words.reduce((a, b) => a + b, 0);
  let cursor = from;
  return chunks.map((text, i) => {
    const length = ((to - from) * words[i]) / total;
    const line = { text, from: Math.round(cursor), to: Math.round(cursor + length - gap) };
    cursor += length;
    return line;
  });
};
