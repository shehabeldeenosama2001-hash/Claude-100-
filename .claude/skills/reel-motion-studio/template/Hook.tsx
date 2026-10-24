import React from "react";
import { AbsoluteFill, Freeze, interpolate, OffthreadVideo, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { C, FONT, strokeText, toArabicDigits, withEmoji } from "./theme";

export interface HookSpec {
  line1: string;
  line2: string;
  freezeAt: number;
  count?: number;
  seconds?: number;
}

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

// Cold-open: frozen expressive frame of the speaker, slow push-in, RGB split shake,
// slammed kinetic text, then a white flash into the real video.
export const Hook: React.FC<{ variant: "A" | "B" | "C"; spec: HookSpec; videoSrc: string; durationFrames: number }> = ({
  variant,
  spec,
  videoSrc,
  durationFrames,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const slam1 = spring({ frame: frame - 2, fps, config: { damping: 9, stiffness: 260 } });
  const slam2 = spring({ frame: frame - 14, fps, config: { damping: 10, stiffness: 220 } });
  const shake = frame < 10 ? Math.sin(frame * 7) * (10 - frame) * 2.2 : 0;
  const push = interpolate(frame, [0, durationFrames], [1.18, 1.38]);
  const flash = interpolate(frame, [durationFrames - 5, durationFrames - 1], [0, 1], clamp);
  const src = staticFile(videoSrc);

  const layer = (dx: number, color: string, blend: boolean) => (
    <AbsoluteFill style={{ transform: `translate(${dx + shake}px, ${shake * 0.4}px) scale(${push})`, mixBlendMode: blend ? "screen" : undefined, opacity: blend ? 0.55 : 1 }}>
      <Freeze frame={Math.round(spec.freezeAt * fps)}>
        <OffthreadVideo src={src} muted style={{ width: "100%", height: "100%", objectFit: "cover", filter: "saturate(.75) contrast(1.15)" }} />
      </Freeze>
      {blend && <AbsoluteFill style={{ background: color, mixBlendMode: "multiply" }} />}
    </AbsoluteFill>
  );

  return (
    <AbsoluteFill style={{ background: "#000", overflow: "hidden" }}>
      {layer(0, "", false)}
      {frame < 12 && layer(-14, "#ff0040", true)}
      {frame < 12 && layer(14, "#00e5ff", true)}
      <AbsoluteFill style={{ background: "radial-gradient(70% 55% at 50% 40%, transparent 30%, rgba(0,0,0,.75) 100%)" }} />
      {/* scanlines */}
      <AbsoluteFill style={{ backgroundImage: "repeating-linear-gradient(0deg, rgba(0,0,0,.18) 0 2px, transparent 2px 6px)", opacity: 0.6 }} />

      <AbsoluteFill style={{ alignItems: "center", justifyContent: "flex-start", paddingTop: 220, direction: "rtl" }}>
        {variant === "B" && <Counter to={spec.count ?? 500} />}
        {variant === "C" && <Stopwatch seconds={spec.seconds ?? 40} />}
        <div
          style={{
            fontFamily: FONT,
            fontWeight: 900,
            fontSize: variant === "A" ? 150 : 104,
            lineHeight: 1.1,
            color: variant === "A" ? C.lime : C.white,
            textShadow: strokeText(8),
            transform: `scale(${interpolate(slam1, [0, 1], [2.6, 1])}) rotate(${(1 - slam1) * -6}deg)`,
            opacity: Math.min(1, slam1 * 3),
            textAlign: "center",
            padding: "0 40px",
          }}
        >
          {withEmoji(spec.line1)}
        </div>
        <div
          style={{
            marginTop: 26,
            fontFamily: FONT,
            fontWeight: 900,
            fontSize: 76,
            color: C.navy,
            background: C.white,
            padding: "6px 34px",
            borderRadius: 20,
            transform: `translateY(${(1 - slam2) * 120}px) rotate(-2deg)`,
            opacity: slam2,
            boxShadow: "0 12px 0 #000",
            textAlign: "center",
          }}
        >
          {withEmoji(spec.line2)}
        </div>
      </AbsoluteFill>

      {/* hazard tape for A */}
      {variant === "A" && (
        <div
          style={{
            position: "absolute",
            bottom: 300,
            left: -100,
            right: -100,
            height: 96,
            transform: "rotate(-6deg)",
            background: `repeating-linear-gradient(45deg, ${C.lime} 0 48px, #000 48px 96px)`,
            boxShadow: "0 10px 30px rgba(0,0,0,.5)",
            backgroundPosition: `${frame * 6}px 0`,
          }}
        />
      )}
      <AbsoluteFill style={{ background: "#fff", opacity: flash }} />
    </AbsoluteFill>
  );
};

const Counter: React.FC<{ to: number }> = ({ to }) => {
  const frame = useCurrentFrame();
  const v = Math.round(interpolate(frame, [0, 34], [0, to], { ...clamp, easing: (t) => 1 - Math.pow(1 - t, 3) }));
  return (
    <div style={{ fontFamily: FONT, fontWeight: 900, fontSize: 230, color: C.lime, textShadow: strokeText(10), lineHeight: 1, marginBottom: 10 }}>
      +{toArabicDigits(v)}
    </div>
  );
};

const Stopwatch: React.FC<{ seconds: number }> = ({ seconds }) => {
  const frame = useCurrentFrame();
  const p = interpolate(frame, [0, 60], [1, 0.82], clamp);
  const R = 120;
  const L = 2 * Math.PI * R;
  return (
    <svg width="300" height="300" viewBox="-150 -150 300 300" style={{ marginBottom: 20 }}>
      <circle r={R} fill="rgba(0,0,0,.55)" stroke="rgba(255,255,255,.2)" strokeWidth="18" />
      <circle r={R} fill="none" stroke={C.lime} strokeWidth="18" strokeLinecap="round" strokeDasharray={L} strokeDashoffset={L * (1 - p)} transform="rotate(-90)" />
      <text textAnchor="middle" dy="30" style={{ fontFamily: FONT, fontWeight: 900, fontSize: 96, fill: C.white }}>
        {toArabicDigits(Math.ceil(seconds * p))}
      </text>
    </svg>
  );
};
