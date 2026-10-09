import type React from "react";
import { AbsoluteFill, Easing, interpolate, spring, useCurrentFrame } from "remotion";
import { B, C, CX, CY, FPS, Y } from "./design";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

// Ease-in-out cubic, 0..1 between two frames
export const inOut = (frame: number, from: number, to: number) =>
  interpolate(frame, [from, to], [0, 1], { ...clamp, easing: Easing.inOut(Easing.cubic) });

// Ease-out cubic, 0..1 between two frames
export const out = (frame: number, from: number, to: number) =>
  interpolate(frame, [from, to], [0, 1], { ...clamp, easing: Easing.out(Easing.cubic) });

export const linear = (frame: number, from: number, to: number) =>
  interpolate(frame, [from, to], [0, 1], clamp);

// Soft spring, no overshoot
export const soft = (frame: number, from: number, durationInFrames: number) =>
  spring({ frame: frame - from, fps: FPS, config: { damping: 200 }, durationInFrames });

export const clamp01 = (x: number) => Math.min(1, Math.max(0, x));

export const lineStyle: React.SVGProps<SVGPathElement> = {
  fill: "none",
  stroke: C.cream,
  strokeLinecap: "round",
  strokeLinejoin: "round",
  vectorEffect: "non-scaling-stroke",
};

// Props that draw a stroke on: 0 = hidden, 1 = fully drawn
export const drawn = (progress: number) => ({
  pathLength: 1,
  strokeDasharray: 1,
  strokeDashoffset: 1 - progress,
});

export const octaPoints = (cx: number, cy: number, r: number) =>
  Y.paths.octagramUnit.map(([x, y]) => `${(cx + x * r).toFixed(2)},${(cy + y * r).toFixed(2)}`).join(" ");

export const octaClip = (cx: number, cy: number, r: number) =>
  `polygon(${Y.paths.octagramUnit.map(([x, y]) => `${(cx + x * r).toFixed(1)}px ${(cy + y * r).toFixed(1)}px`).join(", ")})`;

export const IRIS = Y.transitions.iris.duration;
export const SWEEP = Y.transitions.sweep.duration;

// The lattice angle is a function of film time, so every scene's copy lines
// up exactly across a wipe. It stops for the final still.
const latticeAngle = (filmFrame: number) => (B.latticeDegPerSec * Math.min(filmFrame, B.stillFrom)) / FPS;

const fullFrame: React.CSSProperties = { position: "absolute", left: 0, top: 0, width: 1080, height: 1920, overflow: "visible" };

export const Art: React.FC<{ readonly children: React.ReactNode }> = ({ children }) => (
  <svg viewBox="0 0 1080 1920" style={fullFrame}>
    {children}
  </svg>
);

// A scene's backdrop plus its entrance transition. `start` is the film frame
// this scene begins at; children see the scene's local frame.
export const Shell: React.FC<{
  readonly start: number;
  readonly enter: "none" | "sweep" | "iris";
  readonly extraTurn?: number;
  readonly brighten?: number;
  readonly children: React.ReactNode;
}> = ({ start, enter, extraTurn = 0, brighten = 0, children }) => {
  const frame = useCurrentFrame();
  const sweep = inOut(frame, 0, SWEEP);
  const iris = inOut(frame, 0, IRIS);
  const clipPath =
    enter === "sweep" ? `inset(0px 0px 0px ${(1080 * (1 - sweep)).toFixed(1)}px)` : enter === "iris" ? octaClip(CX, CY, 1500 * iris) : undefined;

  return (
    <AbsoluteFill>
      <AbsoluteFill style={{ clipPath }}>
        <AbsoluteFill style={{ filter: brighten ? `brightness(${1 + brighten})` : undefined }}>
          <AbsoluteFill
            style={{ background: `radial-gradient(ellipse 85% 62% at 50% 47%, ${C.background} 48%, ${C.navy} 100%)` }}
          />
          <svg
            viewBox="0 0 1080 1920"
            style={{
              ...fullFrame,
              maskImage: "radial-gradient(ellipse 62% 42% at 50% 48%, rgba(0,0,0,0.2) 0%, #000 100%)",
              WebkitMaskImage: "radial-gradient(ellipse 62% 42% at 50% 48%, rgba(0,0,0,0.2) 0%, #000 100%)",
            }}
          >
            <g transform={`rotate(${latticeAngle(start + frame) + extraTurn} 540 960)`}>
              <path d={Y.paths.lattice} fill="none" stroke={C.cream} strokeWidth={1.5} opacity={B.latticeOpacity} />
            </g>
          </svg>
        </AbsoluteFill>
        {children}
      </AbsoluteFill>
      {enter === "sweep" && sweep < 1 ? (
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: 2,
            height: 1920,
            background: C.cream,
            translate: `${1080 - sweep * 1084}px 0px`,
          }}
        />
      ) : null}
      {enter === "iris" ? <IrisEdge progress={iris} /> : null}
    </AbsoluteFill>
  );
};

// The cream octagram outline riding the edge of an iris wipe
export const IrisEdge: React.FC<{ readonly progress: number }> = ({ progress }) =>
  progress > 0 && progress < 1 ? (
    <Art>
      <polygon
        points={octaPoints(CX, CY, 1500 * progress)}
        {...(lineStyle as React.SVGProps<SVGPolygonElement>)}
        strokeWidth={2}
        opacity={0.7 * (1 - progress)}
      />
    </Art>
  ) : null;

export const textBlock = (top: number): React.CSSProperties => ({
  position: "absolute",
  top,
  left: 80,
  right: 80,
  textAlign: "center",
  direction: "rtl",
  color: C.cream,
});

// Colloquial lines only: word-by-word fade, 4-frame stagger
export const Words: React.FC<{
  readonly text: string;
  readonly at: number;
  readonly frame: number;
  readonly indexOffset?: number;
}> = ({ text, at, frame, indexOffset = 0 }) => (
  <>
    {text.split(" ").map((word, i) => {
      const p = soft(frame, at + (i + indexOffset) * B.wordStagger, 14);
      return (
        <span
          key={`${word}-${i}`}
          style={{ display: "inline-block", margin: "0 10px", opacity: p, translate: `0px ${(1 - p) * 12}px` }}
        >
          {word}
        </span>
      );
    })}
  </>
);
