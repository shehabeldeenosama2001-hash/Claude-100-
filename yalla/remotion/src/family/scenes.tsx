import type React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { C, CX, Y } from "../design";
import { DISPLAY } from "../fonts";
import { drawn, inOut, lineStyle, octaPoints, out } from "../kit";
import { Figure, Grade, Person, Room, Subtitles, timeLines } from "./parts";

// Frames of a soft dissolve into each scene (the whip pan replaces it for the son)
export const DISSOLVE = 8;
export const WHIP = 10;

const fadeIn = (frame: number) => inOut(frame, 0, DISSOLVE);

// Horizontal-only blur for the whip pan
const WhipBlur: React.FC<{ readonly id: string; readonly amount: number }> = ({ id, amount }) => (
  <svg width={0} height={0} style={{ position: "absolute" }}>
    <filter id={id} x="-20%" y="0%" width="140%" height="100%">
      <feGaussianBlur stdDeviation={`${amount.toFixed(1)} 0`} />
    </filter>
  </svg>
);

// ── Scene 0 · Hook: the mother, silent, slow dolly in ────────────────────────
export const HookScene: React.FC = () => {
  const frame = useCurrentFrame();
  const push = inOut(frame, 0, 166);
  const caption = Y.copy.familyHook;

  return (
    <AbsoluteFill>
      <Room x={0} y={-40} scale={1.06 + 0.04 * push} blur={3} />
      <Person
        frame={frame}
        expressions={[{ name: "mother-neutral", from: 0 }]}
        x={CX}
        bottom={1935}
        width={1150}
        style={{ scale: String(1 + 0.24 * push), transformOrigin: "50% 1500px" }}
      />
      <Grade shafts={0.9} />
      <div
        style={{
          position: "absolute",
          top: 230,
          left: 70,
          right: 70,
          direction: "rtl",
          textAlign: "center",
          fontFamily: DISPLAY,
          fontSize: 66,
          fontWeight: 800,
          lineHeight: 1.45,
          color: C.cream,
          textShadow: "0 4px 24px rgba(3,42,107,0.75)",
        }}
      >
        {caption.map((line, row) => (
          <div
            key={line}
            style={{
              display: "table",
              margin: "0 auto 18px",
              padding: "10px 30px 18px",
              borderRadius: 24,
              background: "rgba(3,42,107,0.72)",
              opacity: inOut(frame, row === 0 ? 8 : 64, row === 0 ? 16 : 72),
            }}
          >
            {line.split(" ").map((word, i) => {
              const at = (row === 0 ? 14 : 70) + i * 5;
              const p = inOut(frame, at, at + 10);
              return (
                <span key={`${word}-${i}`} style={{ display: "inline-block", margin: "0 9px", opacity: p, translate: `0px ${(1 - p) * 12}px` }}>
                  {word}
                </span>
              );
            })}
          </div>
        ))}
      </div>
    </AbsoluteFill>
  );
};

// ── Scene 1 · The mother speaks, slow orbit left ─────────────────────────────
const motherLines = timeLines(Y.copy.familyMother, 8, 248);

export const MotherScene: React.FC = () => {
  const frame = useCurrentFrame();
  const orbit = inOut(frame, 0, 255);
  const heart = motherLines[2].from;
  const smile = motherLines[3].from;

  return (
    <AbsoluteFill style={{ opacity: fadeIn(frame) }}>
      <Room x={-90 + 180 * orbit} y={-20} scale={1.1} blur={4} />
      <div style={{ position: "absolute", inset: 0, perspective: 1400 }}>
        <Person
          frame={frame}
          expressions={[
            { name: "mother-neutral", from: 0 },
            { name: "mother-heart", from: heart },
            { name: "mother-smile", from: smile },
          ]}
          x={CX + 20 - 40 * orbit}
          bottom={1940}
          width={1350}
          speaking={motherLines.map((l) => [l.from, l.to])}
          style={{ rotate: `y ${-4 + 10 * orbit}deg` }}
        />
      </div>
      <Grade shafts={0.35} />
      <Subtitles frame={frame} lines={motherLines} />
    </AbsoluteFill>
  );
};

// ── Scene 2 · The father speaks, tilt up ─────────────────────────────────────
const fatherLines = timeLines(Y.copy.familyFather, 10, 228);

export const FatherScene: React.FC<{ readonly length: number }> = ({ length }) => {
  const frame = useCurrentFrame();
  const tilt = inOut(frame, 0, 200);
  // Whip out to the left over the last frames
  const whip = inOut(frame, length - WHIP, length);

  return (
    <AbsoluteFill style={{ opacity: fadeIn(frame) }}>
      <WhipBlur id="whip-out" amount={60 * Math.sin(Math.PI * whip)} />
      <AbsoluteFill style={{ translate: `${-1150 * whip}px 0px`, filter: whip > 0 ? "url(#whip-out)" : undefined }}>
        <Room x={30} y={-110 * (1 - tilt)} scale={1.22} blur={4} />
        <AbsoluteFill style={{ perspective: 1600 }}>
          <AbsoluteFill style={{ rotate: `x ${10 * (1 - tilt)}deg`, transformOrigin: "50% 100%" }}>
            {/* The mother stands beside him, out of focus */}
            <Person
              frame={frame}
              expressions={[{ name: "mother-neutral", from: 0 }]}
              x={140}
              bottom={2020 - 120 * (1 - tilt)}
              width={1000}
              style={{ filter: "blur(7px) brightness(0.92)" }}
            />
            <Person
              frame={frame}
              expressions={[
                { name: "father-neutral", from: 0 },
                { name: "father-smile", from: fatherLines[fatherLines.length - 1].from },
              ]}
              x={650}
              bottom={2070 - 150 * (1 - tilt)}
              width={1300}
              speaking={fatherLines.map((l) => [l.from, l.to])}
            />
          </AbsoluteFill>
        </AbsoluteFill>
        <Grade shafts={0.3} />
        <Subtitles frame={frame} lines={fatherLines} />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// ── Scene 3 · The son speaks, whip pan in ────────────────────────────────────
const sonLines = timeLines(Y.copy.familySon, 14, 160);

export const SonScene: React.FC = () => {
  const frame = useCurrentFrame();
  const land = out(frame, 0, WHIP);
  const blur = 60 * (1 - land);

  return (
    <AbsoluteFill>
      <WhipBlur id="whip-in" amount={blur} />
      <AbsoluteFill style={{ translate: `${1150 * (1 - land)}px 0px`, filter: blur > 0.5 ? "url(#whip-in)" : undefined }}>
        <Room x={-80} y={60} scale={1.14} blur={4} />
        <Person
          frame={frame}
          expressions={[
            { name: "son-smile", from: 0 },
            { name: "son-bigsmile", from: sonLines[0].from + 26 },
            { name: "son-laugh", from: sonLines[2].from },
          ]}
          x={CX}
          bottom={1940}
          width={1250}
          speaking={sonLines.map((l) => [l.from, l.to])}
        />
        <Grade shafts={0.25} />
        <Subtitles frame={frame} lines={sonLines} top={300} />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// ── Scene 4 · The daughter speaks, slow dolly out ────────────────────────────
const daughterLines = timeLines(Y.copy.familyDaughter, 8, 174);

export const DaughterScene: React.FC = () => {
  const frame = useCurrentFrame();
  const pull = inOut(frame, 0, 180);

  return (
    <AbsoluteFill style={{ opacity: fadeIn(frame) }}>
      <Room x={-80} y={60} scale={1.14 + 0.06 * (1 - pull)} blur={4} />
      {/* Her brother sits beside her, out of focus */}
      <Person
        frame={frame}
        expressions={[{ name: "son-smile", from: 0 }]}
        x={930}
        bottom={2000}
        width={900}
        style={{ filter: "blur(7px) brightness(0.92)", scale: String(1 + 0.12 * (1 - pull)), transformOrigin: "50% 1500px" }}
      />
      <Person
        frame={frame}
        expressions={[
          { name: "daughter-smile", from: 0 },
          { name: "daughter-finger", from: daughterLines[1].from },
          { name: "daughter-book", from: daughterLines[2].from },
        ]}
        x={500}
        bottom={1940}
        width={1200}
        speaking={daughterLines.map((l) => [l.from, l.to])}
        style={{ scale: String(1 + 0.2 * (1 - pull)), transformOrigin: "50% 1500px" }}
      />
      <Grade shafts={0.25} />
      <Subtitles frame={frame} lines={daughterLines} top={300} />
    </AbsoluteFill>
  );
};

// ── Scene 5 · Closing: the whole family, a gentle rising pull-back ───────────
const closingLines = timeLines(Y.copy.familyClosing, 14, 236);
export const END_CARD = 244;

export const ClosingScene: React.FC = () => {
  const frame = useCurrentFrame();
  const rise = inOut(frame, 0, 220);
  const card = inOut(frame, END_CARD, END_CARD + 24);
  const star = inOut(frame, END_CARD + 6, END_CARD + 36);
  const word = inOut(frame, END_CARD + 22, END_CARD + 46);
  const a = inOut(frame, END_CARD + 34, END_CARD + 52);
  const b = inOut(frame, END_CARD + 64, END_CARD + 88);
  const logoY = 330;

  return (
    <AbsoluteFill style={{ opacity: fadeIn(frame) }}>
      <AbsoluteFill>
        <AbsoluteFill
          style={{
            scale: String(interpolate(rise, [0, 1], [1.34, 1])),
            translate: `0px ${interpolate(rise, [0, 1], [-140, 0])}px`,
            transformOrigin: "50% 1450px",
          }}
        >
          <Room x={0} y={-30} scale={1.16} blur={2} />
          <Figure name="mother-front" x={760} ground={1830} height={900} frame={frame} />
          <Figure name="father-front" x={330} ground={1840} height={980} frame={frame} />
          <Figure name="daughter-front" x={470} ground={1880} height={650} frame={frame} />
          <Figure name="son-front" x={640} ground={1890} height={600} frame={frame} />
        </AbsoluteFill>
      </AbsoluteFill>
      <Grade shafts={0.3} />
      <Subtitles frame={frame} lines={closingLines} top={300} />
      {/* End card in the open space above the family */}
      <AbsoluteFill
        style={{
          background: `linear-gradient(180deg, ${C.background} 0%, rgba(5,60,150,0.88) 38%, rgba(5,60,150,0) 62%)`,
          opacity: card,
        }}
      />
      <svg viewBox="0 0 1080 1920" style={{ position: "absolute", inset: 0, width: 1080, height: 1920 }}>
        <polygon
          points={octaPoints(CX, logoY, 120)}
          {...(lineStyle as React.SVGProps<SVGPolygonElement>)}
          strokeWidth={2.5}
          opacity={0.85 * card}
          {...drawn(star)}
        />
      </svg>
      <div
        style={{
          position: "absolute",
          top: logoY - 90,
          left: 0,
          right: 0,
          height: 180,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <span
          style={{
            display: "inline-block",
            fontFamily: DISPLAY,
            fontSize: 112,
            fontWeight: 800,
            lineHeight: 1,
            color: C.cream,
            translate: "0px -6px",
            clipPath: `inset(0% 0% 0% ${(100 * (1 - word)).toFixed(2)}%)`,
          }}
        >
          {Y.copy.logo}
        </span>
      </div>
      <div style={{ position: "absolute", top: 500, left: 70, right: 70, textAlign: "center", direction: "rtl", fontFamily: DISPLAY, color: C.slogan }}>
        <div style={{ fontSize: 84, fontWeight: 800, lineHeight: 1.35, opacity: a }}>{Y.copy.sloganA}</div>
        <div
          style={{
            fontSize: 118,
            fontWeight: 900,
            lineHeight: 1.3,
            clipPath: `inset(0% 0% 0% ${(100 * (1 - b)).toFixed(2)}%)`,
          }}
        >
          {Y.copy.sloganB}
        </div>
      </div>
    </AbsoluteFill>
  );
};
