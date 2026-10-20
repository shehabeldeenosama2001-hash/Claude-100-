import React from "react";
import {
  AbsoluteFill,
  Audio,
  CalculateMetadataFunction,
  interpolate,
  OffthreadVideo,
  Sequence,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { C, FONT, strokeText, withEmoji } from "./theme";
import { Captions, spreadWords, TimedWord } from "./Captions";
import { Feature, FeaturePanel, FEATURE_PANEL_HEIGHT } from "./FeatureGraphics";
import { Hook, HookSpec } from "./Hook";

export interface Segment {
  start: number;
  end: number;
  role: "intro" | "feature" | "cta";
  feature?: number;
  text: string;
  words?: { word: string; start: number; end: number }[]; // real word timestamps (source seconds), optional
}

export interface CourseReelProps {
  videoSrc: string;
  trimStart: number;
  trimEnd: number;
  hookVariant: "A" | "B" | "C" | "none";
  hookDuration: number;
  segments: Segment[];
  features: Feature[];
  hooks: Record<"A" | "B" | "C", HookSpec>;
  intro: { kicker: string; headline: string };
  cta: { button: string; sub: string; ticker: string };
  showDemoBadge?: boolean;
  [key: string]: unknown;
}

const FPS = 30;
const SPLIT_SHIFT = 590;
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

export const calculateCourseReelMetadata: CalculateMetadataFunction<CourseReelProps> = ({ props }) => {
  const hook = props.hookVariant === "none" ? 0 : props.hookDuration;
  return { durationInFrames: Math.round((hook + props.trimEnd - props.trimStart) * FPS), fps: FPS, width: 1080, height: 1920 };
};

export const CourseReel: React.FC<CourseReelProps> = (p) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const hookSec = p.hookVariant === "none" ? 0 : p.hookDuration;
  const hookF = Math.round(hookSec * fps);
  // source-video seconds -> composition seconds / frames
  const cs = (s: number) => hookSec + (s - p.trimStart);
  const cf = (s: number) => Math.round(cs(s) * fps);
  const t = frame / fps;

  const intro = p.segments.find((s) => s.role === "intro");
  const cta = p.segments.find((s) => s.role === "cta");
  const feats = p.segments.filter((s) => s.role === "feature");

  // One window per feature: from its first segment until the next feature (or CTA) begins.
  const featureIdx = Array.from(new Set(feats.map((s) => s.feature!)));
  const windows = featureIdx.map((fi, k) => {
    const first = feats.find((s) => s.feature === fi)!;
    const nextFi = featureIdx[k + 1];
    const next = nextFi !== undefined ? feats.find((s) => s.feature === nextFi)! : cta;
    return { fi, from: cf(first.start - 0.25), to: next ? cf(next.start - 0.25) : cf(p.trimEnd) };
  });
  const splitIn = windows.length ? windows[0].from : Infinity;
  const splitOut = windows.length ? windows[windows.length - 1].to : Infinity;

  const enter = spring({ frame: frame - splitIn, fps, config: { damping: 16, stiffness: 120 } });
  const exit = spring({ frame: frame - splitOut, fps, config: { damping: 16, stiffness: 120 } });
  const split = frame < splitIn ? 0 : enter - exit;

  // Punch-in zooms on the full-screen parts (jump-cut energy)
  const introMid = intro ? cf((intro.start + intro.end) / 2) : 0;
  const punch = frame < splitIn ? (frame >= introMid ? 1.12 : 1.0) : frame >= splitOut ? 1.08 : 1.0;
  const punchKick = frame === introMid || frame === splitOut ? 1.02 : 1;

  // Captions: real word timestamps when present, otherwise spread across the segment.
  const words: TimedWord[] = p.segments.flatMap((s) =>
    s.words?.length
      ? s.words.map((w) => ({ word: w.word.trim(), start: cs(w.start), end: cs(w.end) }))
      : spreadWords(s.text, cs(s.start), cs(s.end))
  );

  return (
    <AbsoluteFill style={{ background: C.navy }}>
      {/* ---------------- speaker footage ---------------- */}
      <Sequence from={hookF}>
        <AbsoluteFill style={{ transform: `translateY(${split * SPLIT_SHIFT}px) scale(${punch * punchKick})`, transformOrigin: "50% 30%" }}>
          <OffthreadVideo
            src={staticFile(p.videoSrc)}
            startFrom={Math.round(p.trimStart * fps)}
            endAt={Math.round(p.trimEnd * fps)}
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        </AbsoluteFill>
      </Sequence>

      {/* ---------------- feature panels (split layout) ---------------- */}
      {split > 0.001 && (
        <AbsoluteFill style={{ height: FEATURE_PANEL_HEIGHT, clipPath: `inset(0 0 ${(1 - split) * 100}% 0)` }}>
          {windows.map((w, k) => (
            <Sequence key={k} from={w.from} durationInFrames={w.to - w.from + 12}>
              <FeaturePanel feature={p.features[w.fi]} index={w.fi} total={p.features.length} />
            </Sequence>
          ))}
          {windows.slice(1).map((w, k) => (
            <Sequence key={`wipe${k}`} from={w.from - 6} durationInFrames={14}>
              <Wipe />
            </Sequence>
          ))}
          <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: 10, background: C.lime, boxShadow: `0 0 30px ${C.lime}` }} />
        </AbsoluteFill>
      )}

      {/* ---------------- intro headline ---------------- */}
      {intro && (
        <Sequence from={cf(intro.start)} durationInFrames={Math.max(1, splitIn - cf(intro.start))}>
          <IntroTitle kicker={p.intro.kicker} headline={p.intro.headline} />
        </Sequence>
      )}

      {/* ---------------- CTA ---------------- */}
      {cta && (
        <Sequence from={cf(cta.start) - 4}>
          <CTA {...p.cta} />
        </Sequence>
      )}

      {/* ---------------- captions ---------------- */}
      <Sequence from={hookF}>
        <Captions words={words.filter((w) => !cta || w.start < cs(cta.start) - 0.05).map((w) => ({ ...w, start: w.start - hookSec, end: w.end - hookSec }))} bottom={interpolate(split, [0, 1], [430, 150])} />
      </Sequence>

      {/* ---------------- progress bar ---------------- */}
      <div style={{ position: "absolute", top: 0, left: 0, height: 10, width: `${(frame / durationInFrames) * 100}%`, background: C.lime, boxShadow: `0 0 20px ${C.lime}` }} />

      {/* ---------------- hook cold-open ---------------- */}
      {p.hookVariant !== "none" && (
        <Sequence durationInFrames={hookF}>
          <Hook variant={p.hookVariant} spec={p.hooks[p.hookVariant]} videoSrc={p.videoSrc} durationFrames={hookF} />
        </Sequence>
      )}
      {p.hookVariant !== "none" && (
        <Sequence from={hookF} durationInFrames={8}>
          <AbsoluteFill style={{ background: "#fff", opacity: interpolate(frame - hookF, [0, 7], [1, 0], clamp) }} />
        </Sequence>
      )}

      {p.showDemoBadge && (
        <div style={{ position: "absolute", top: 26, left: 26, fontFamily: FONT, fontWeight: 700, fontSize: 26, color: "#000", background: "rgba(255,255,255,.75)", padding: "4px 14px", borderRadius: 10 }}>
          DEMO — نص تجريبي
        </div>
      )}

      {/* ---------------- audio: music bed + SFX ---------------- */}
      <Audio
        src={staticFile("course-reel/sfx/music_bed.wav")}
        volume={(f) => {
          const sec = f / fps;
          const talking = p.segments.some((s) => sec >= cs(s.start) - 0.1 && sec <= cs(s.end) + 0.1);
          return (f < hookF ? 0.32 : 0.11) * (talking ? 1 : 1.7);
        }}
      />
      {p.hookVariant !== "none" && (
        <>
          <Sfx at={0} name="impact" volume={0.9} />
          <Sfx at={12} name="whoosh" volume={0.5} />
          <Sfx at={hookF - 30} name="riser" volume={0.35} />
          <Sfx at={hookF - 4} name="whoosh" volume={0.8} />
        </>
      )}
      {intro && <Sfx at={cf(intro.start) + 4} name="pop" volume={0.6} />}
      {windows.map((w, k) => (
        <React.Fragment key={k}>
          <Sfx at={w.from - 4} name="whoosh" volume={0.55} />
          <SfxForFeature kind={p.features[w.fi].kind} from={w.from} />
        </React.Fragment>
      ))}
      {cta && (
        <>
          <Sfx at={cf(cta.start) - 4} name="impact" volume={0.6} />
          <Sfx at={cf(cta.start) + 10} name="chime" volume={0.45} />
        </>
      )}
    </AbsoluteFill>
  );
};

const Sfx: React.FC<{ at: number; name: string; volume: number }> = ({ at, name, volume }) => (
  <Sequence from={Math.max(0, at)}>
    <Audio src={staticFile(`course-reel/sfx/${name}.wav`)} volume={volume} />
  </Sequence>
);

const SfxForFeature: React.FC<{ kind: Feature["kind"]; from: number }> = ({ kind, from }) => {
  if (kind === "practical") return <>{[0, 1, 2].map((i) => <Sfx key={i} at={from + 28 + i * 16} name="ding" volume={0.22} />)}</>;
  if (kind === "certificate") return <Sfx at={from + 26} name="impact" volume={0.55} />;
  if (kind === "mentor") return <>{[6, 40, 70].map((d) => <Sfx key={d} at={from + d} name="pop" volume={0.5} />)}</>;
  if (kind === "projects") return <Sfx at={from + 66} name="chime" volume={0.4} />;
  return <Sfx at={from + 38} name="ding" volume={0.3} />;
};

const Wipe: React.FC = () => {
  const f = useCurrentFrame();
  const x = interpolate(f, [0, 13], [-120, 120]);
  return (
    <AbsoluteFill style={{ overflow: "hidden" }}>
      <div style={{ position: "absolute", top: -200, bottom: -200, width: "70%", left: `${x}%`, background: C.lime, transform: "skewX(-18deg)" }} />
    </AbsoluteFill>
  );
};

const IntroTitle: React.FC<{ kicker: string; headline: string }> = ({ kicker, headline }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const k = spring({ frame: frame - 2, fps, config: { damping: 8, stiffness: 240 } });
  const h = spring({ frame: frame - 12, fps, config: { damping: 12, stiffness: 160 } });
  const float = Math.sin(frame / 12) * 6;
  return (
    <AbsoluteFill style={{ alignItems: "center", paddingTop: 120, direction: "rtl" }}>
      <div
        style={{
          fontFamily: FONT,
          fontWeight: 900,
          fontSize: 170,
          lineHeight: 1,
          color: C.lime,
          textShadow: strokeText(9),
          transform: `scale(${interpolate(k, [0, 1], [3, 1])}) rotate(${(1 - k) * 10 - 3}deg) translateY(${float}px)`,
          opacity: Math.min(1, k * 2),
        }}
      >
        {kicker}
      </div>
      <div
        style={{
          marginTop: 18,
          fontFamily: FONT,
          fontWeight: 900,
          fontSize: 64,
          color: C.navy,
          background: C.white,
          borderRadius: 22,
          padding: "4px 30px",
          boxShadow: "0 10px 0 #000",
          transform: `translateY(${(1 - h) * 80}px) rotate(1.5deg)`,
          opacity: h,
        }}
      >
        {withEmoji(headline)}
      </div>
    </AbsoluteFill>
  );
};

const CTA: React.FC<{ button: string; sub: string; ticker: string }> = ({ button, sub, ticker }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const inn = spring({ frame, fps, config: { damping: 10, stiffness: 180 } });
  const pulse = 1 + Math.sin(frame / 4) * 0.035;
  const shine = ((frame * 3) % 160) - 30;
  const bounce = Math.abs(Math.sin(frame / 5)) * -26;
  return (
    <AbsoluteFill style={{ direction: "rtl" }}>
      {/* diagonal ticker tape */}
      <div style={{ position: "absolute", top: 150, left: -200, right: -200, transform: `rotate(-5deg) translateX(${(1 - inn) * 1200}px)`, background: C.coral, padding: "10px 0", whiteSpace: "nowrap", overflow: "hidden", boxShadow: "0 10px 0 #000" }}>
        <div style={{ fontFamily: FONT, fontWeight: 900, fontSize: 58, color: C.white, transform: `translateX(${(frame * 8) % 600}px)` }}>
          {withEmoji(new Array(8).fill(ticker).join("   •   "))}
        </div>
      </div>
      <AbsoluteFill style={{ justifyContent: "flex-end", alignItems: "center", paddingBottom: 380 }}>
        <div
          style={{
            position: "relative",
            overflow: "hidden",
            fontFamily: FONT,
            fontWeight: 900,
            fontSize: 78,
            color: C.navy,
            background: C.lime,
            padding: "18px 60px",
            borderRadius: 999,
            boxShadow: "0 14px 0 #000, 0 0 60px rgba(215,255,58,.6)",
            transform: `scale(${inn * pulse})`,
          }}
        >
          {button}
          <div style={{ position: "absolute", top: 0, bottom: 0, width: 90, left: `${shine}%`, background: "linear-gradient(90deg, transparent, rgba(255,255,255,.8), transparent)", transform: "skewX(-20deg)" }} />
        </div>
        <div style={{ marginTop: 26, fontFamily: FONT, fontWeight: 900, fontSize: 56, color: C.white, textShadow: strokeText(6), opacity: inn, transform: `translateY(${bounce * 0.3}px)` }}>{withEmoji(sub)}</div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
