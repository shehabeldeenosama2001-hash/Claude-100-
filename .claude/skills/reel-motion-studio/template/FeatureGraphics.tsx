import React from "react";
import { AbsoluteFill, Easing, interpolate, random, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { C, FONT, toArabicDigits, withEmoji } from "./theme";

export interface Feature {
  kind: "practical" | "certificate" | "mentor" | "projects" | "lifetime";
  title: string;
  subtitle: string;
  steps?: string[];
}

const PANEL_H = 860;
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

const useSpring = (delay: number, cfg = { damping: 12, stiffness: 160 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return spring({ frame: frame - delay, fps, config: cfg });
};

// ---------------------------------------------------------------------------
// Shared panel chrome: animated grid, drifting particles, number badge, kinetic title
// ---------------------------------------------------------------------------

const Backdrop: React.FC<{ accent: string }> = ({ accent }) => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill
      style={{
        background: `radial-gradient(120% 90% at 50% 10%, ${C.navy2} 0%, ${C.navy} 70%)`,
        overflow: "hidden",
      }}
    >
      <AbsoluteFill
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,.05) 2px, transparent 2px), linear-gradient(90deg, rgba(255,255,255,.05) 2px, transparent 2px)",
          backgroundSize: "72px 72px",
          backgroundPosition: `0 ${(f * 1.2) % 72}px`,
        }}
      />
      {new Array(18).fill(0).map((_, i) => {
        const x = random(`px${i}`) * 1080;
        const y = (random(`py${i}`) * PANEL_H - f * (0.6 + random(`ps${i}`) * 1.6) + PANEL_H * 4) % PANEL_H;
        const s = 4 + random(`pr${i}`) * 8;
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: x,
              top: y,
              width: s,
              height: s,
              borderRadius: s,
              background: i % 3 === 0 ? accent : "rgba(255,255,255,.35)",
              opacity: 0.5,
              filter: "blur(1px)",
            }}
          />
        );
      })}
      <div
        style={{
          position: "absolute",
          left: -200,
          right: -200,
          bottom: -260,
          height: 420,
          background: `radial-gradient(closest-side, ${accent}33, transparent)`,
        }}
      />
    </AbsoluteFill>
  );
};

const Header: React.FC<{ index: number; total: number; title: string; subtitle: string; accent: string }> = ({
  index,
  total,
  title,
  subtitle,
  accent,
}) => {
  const badge = useSpring(0, { damping: 8, stiffness: 200 });
  const words = title.split(" ");
  const sub = useSpring(10 + words.length * 4);
  return (
    <div style={{ position: "absolute", top: 120, left: 60, right: 60, direction: "rtl", display: "flex", alignItems: "center", gap: 28 }}>
      <div
        style={{
          width: 128,
          height: 128,
          borderRadius: 34,
          background: accent,
          color: C.navy,
          fontFamily: FONT,
          fontWeight: 900,
          fontSize: 72,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          transform: `scale(${badge}) rotate(${(1 - badge) * -40}deg)`,
          boxShadow: `0 10px 0 #000`,
          flexShrink: 0,
        }}
      >
        {toArabicDigits(index + 1)}
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ display: "flex", gap: 20, flexWrap: "wrap" }}>
          {words.map((w, i) => (
            <Word key={i} delay={6 + i * 4} text={w} />
          ))}
        </div>
        <div
          style={{
            fontFamily: FONT,
            fontWeight: 700,
            fontSize: 42,
            color: C.muted,
            opacity: sub,
            transform: `translateX(${(1 - sub) * -40}px)`,
          }}
        >
          {withEmoji(subtitle)}
        </div>
      </div>
      <div style={{ position: "absolute", left: 0, top: -64, fontFamily: FONT, fontWeight: 900, fontSize: 34, color: "rgba(255,255,255,.4)", direction: "ltr" }}>
        {String(index + 1).padStart(2, "0")} / {String(total).padStart(2, "0")}
      </div>
    </div>
  );
};

const Word: React.FC<{ text: string; delay: number }> = ({ text, delay }) => {
  const s = useSpring(delay, { damping: 11, stiffness: 180 });
  return (
    <span
      style={{
        fontFamily: FONT,
        fontWeight: 900,
        fontSize: 92,
        lineHeight: 1.15,
        color: C.white,
        display: "inline-block",
        opacity: s,
        transform: `translateY(${(1 - s) * 70}px) rotate(${(1 - s) * 8}deg)`,
      }}
    >
      {text}
    </span>
  );
};

// Stroke-draw helper for SVG paths
const draw = (p: number, len = 1000) => ({ strokeDasharray: len, strokeDashoffset: len * (1 - p) });

// ---------------------------------------------------------------------------
// 1. Practical — laptop with live-typing code + 3-step checklist ticking
// ---------------------------------------------------------------------------

const Practical: React.FC<{ steps: string[] }> = ({ steps }) => {
  const f = useCurrentFrame();
  const enter = useSpring(4);
  const lines = [0.82, 0.55, 0.7, 0.4, 0.62, 0.5];
  return (
    <div style={{ position: "absolute", top: 400, left: 60, right: 60, height: 400, display: "flex", gap: 40, direction: "rtl" }}>
      <div style={{ display: "flex", flexDirection: "column", gap: 22, width: 360, justifyContent: "center" }}>
        {steps.map((s, i) => {
          const at = 18 + i * 16;
          const p = interpolate(f, [at, at + 12], [0, 1], clamp);
          const pill = useSpring(at - 6);
          return (
            <div
              key={i}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 18,
                background: p > 0.99 ? `${C.lime}22` : "rgba(255,255,255,.06)",
                border: `3px solid ${p > 0.99 ? C.lime : "rgba(255,255,255,.15)"}`,
                borderRadius: 26,
                padding: "16px 22px",
                transform: `translateX(${(1 - pill) * 200}px)`,
                opacity: pill,
              }}
            >
              <svg width="56" height="56" viewBox="0 0 56 56">
                <circle cx="28" cy="28" r="24" fill={p > 0.99 ? C.lime : "none"} stroke={C.lime} strokeWidth="4" />
                <path d="M16 29 L25 37 L41 19" fill="none" stroke={C.navy} strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" style={draw(p, 40)} />
              </svg>
              <span style={{ fontFamily: FONT, fontWeight: 900, fontSize: 50, color: C.white }}>{s}</span>
            </div>
          );
        })}
      </div>
      <div style={{ flex: 1, transform: `perspective(1200px) rotateY(${(1 - enter) * -50}deg) scale(${0.7 + enter * 0.3})`, opacity: enter }}>
        <div style={{ background: "#1E2645", borderRadius: "26px 26px 8px 8px", border: "6px solid #39426B", height: 300, padding: 28, direction: "ltr" }}>
          <div style={{ display: "flex", gap: 10, marginBottom: 22 }}>
            {[C.coral, C.gold, C.lime].map((c) => (
              <div key={c} style={{ width: 18, height: 18, borderRadius: 9, background: c }} />
            ))}
          </div>
          {lines.map((w, i) => {
            const p = interpolate(f, [8 + i * 7, 16 + i * 7], [0, 1], clamp);
            const showCursor = p > 0 && p < 1 && Math.floor(f / 4) % 2 === 0;
            return (
              <div key={i} style={{ display: "flex", alignItems: "center", height: 30, gap: 10, marginLeft: (i % 3) * 30 }}>
                <div style={{ height: 14, borderRadius: 7, width: `${w * p * 100}%`, background: i % 2 ? C.lime : "#8EA2FF" }} />
                {showCursor && <div style={{ width: 4, height: 24, background: C.white }} />}
              </div>
            );
          })}
        </div>
        <div style={{ height: 26, background: "#39426B", borderRadius: "0 0 30px 30px", margin: "0 -26px" }} />
      </div>
    </div>
  );
};

// ---------------------------------------------------------------------------
// 2. Certificate — card flips in, gold seal stamps with shockwave + confetti
// ---------------------------------------------------------------------------

const Certificate: React.FC = () => {
  const f = useCurrentFrame();
  const card = useSpring(2, { damping: 14, stiffness: 120 });
  const stampAt = 26;
  const stamp = useSpring(stampAt, { damping: 7, stiffness: 260 });
  const wave = interpolate(f, [stampAt + 2, stampAt + 22], [0, 1], clamp);
  const shake = f > stampAt && f < stampAt + 8 ? Math.sin(f * 9) * 8 : 0;
  return (
    <div style={{ position: "absolute", top: 380, left: 0, right: 0, height: 440, display: "flex", justifyContent: "center", transform: `translateX(${shake}px)` }}>
      <div
        style={{
          width: 700,
          height: 420,
          background: "linear-gradient(135deg,#FFF8E7,#F3E3BF)",
          borderRadius: 18,
          border: `10px double ${C.gold}`,
          boxShadow: "0 30px 60px rgba(0,0,0,.5)",
          transform: `perspective(1400px) rotateY(${(1 - card) * 100}deg) rotateZ(${(1 - card) * -8}deg)`,
          position: "relative",
          direction: "rtl",
          padding: "34px 50px",
        }}
      >
        <div style={{ fontFamily: FONT, fontWeight: 900, fontSize: 54, color: "#3B2F12", textAlign: "center" }}>شهادة إتمام</div>
        {[0.9, 0.7, 0.8].map((w, i) => (
          <div key={i} style={{ height: 14, borderRadius: 7, background: "#C9B68A", width: `${w * interpolate(f, [10 + i * 5, 22 + i * 5], [0, 100], clamp)}%`, margin: "26px auto 0" }} />
        ))}
        <svg width="420" height="70" style={{ position: "absolute", bottom: 40, right: 50 }} viewBox="0 0 420 70">
          <path
            d="M10 45 C60 5, 90 65, 140 35 S220 10, 260 40 S350 60, 410 25"
            fill="none"
            stroke="#22305E"
            strokeWidth="6"
            strokeLinecap="round"
            style={draw(interpolate(f, [16, 34], [0, 1], clamp), 520)}
          />
        </svg>
        <div style={{ position: "absolute", left: -40, bottom: -50 }}>
          <div
            style={{
              position: "absolute",
              left: 90 - 220 * wave,
              top: 90 - 220 * wave,
              width: 440 * wave,
              height: 440 * wave,
              borderRadius: "50%",
              border: `${12 * (1 - wave)}px solid ${C.gold}`,
              opacity: 1 - wave,
            }}
          />
          <svg width="180" height="180" viewBox="0 0 180 180" style={{ transform: `scale(${f < stampAt ? 0 : 0.2 + stamp * 0.8 + (1 - stamp) * 2}) rotate(${(1 - stamp) * 60 - 12}deg)` }}>
            {new Array(24).fill(0).map((_, i) => {
              const a = (i / 24) * Math.PI * 2;
              return <circle key={i} cx={90 + Math.cos(a) * 78} cy={90 + Math.sin(a) * 78} r="12" fill={C.gold} />;
            })}
            <circle cx="90" cy="90" r="74" fill={C.gold} stroke="#B8860B" strokeWidth="6" />
            <circle cx="90" cy="90" r="56" fill="none" stroke="#fff" strokeWidth="4" strokeDasharray="6 8" />
            <path d="M62 92 L82 112 L120 70" fill="none" stroke="#fff" strokeWidth="12" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      </div>
      <Confetti at={stampAt} originX={300} originY={360} />
    </div>
  );
};

const Confetti: React.FC<{ at: number; originX: number; originY: number }> = ({ at, originX, originY }) => {
  const f = useCurrentFrame() - at;
  if (f < 0) return null;
  const colors = [C.lime, C.gold, C.coral, "#8EA2FF", C.white];
  return (
    <>
      {new Array(36).fill(0).map((_, i) => {
        const a = random(`ca${i}`) * Math.PI * 2;
        const v = 14 + random(`cv${i}`) * 22;
        const x = originX + Math.cos(a) * v * f;
        const y = originY + Math.sin(a) * v * f + 0.9 * f * f;
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: x,
              top: y,
              width: 16,
              height: 26,
              background: colors[i % colors.length],
              transform: `rotate(${f * 20 + i * 40}deg)`,
              opacity: interpolate(f, [20, 40], [1, 0], clamp),
              borderRadius: 3,
            }}
          />
        );
      })}
    </>
  );
};

// ---------------------------------------------------------------------------
// 3. Mentor — chat thread pops in, typing dots, "replied" badge
// ---------------------------------------------------------------------------

const Mentor: React.FC = () => {
  const f = useCurrentFrame();
  const msgs = [
    { me: true, text: "مش فاهم الجزء ده 🤔", at: 6 },
    { me: false, text: "ولا يهمك! هشرحهولك تاني 👌", at: 40 },
    { me: true, text: "تمام كده وصلت 🔥", at: 70 },
  ];
  const typing = f > 18 && f < 40;
  return (
    <div style={{ position: "absolute", top: 350, left: 110, right: 110, height: 450, direction: "rtl", display: "flex", flexDirection: "column", gap: 14 }}>
      {msgs.map((m, i) => {
        const s = useSpring(m.at, { damping: 12, stiffness: 220 });
        if (f < m.at) return null;
        return (
          <div key={i} style={{ display: "flex", justifyContent: m.me ? "flex-start" : "flex-end", alignItems: "flex-end", gap: 14 }}>
            {!m.me && null}
            <div
              style={{
                maxWidth: 640,
                fontFamily: FONT,
                fontWeight: 700,
                fontSize: 42,
                padding: "12px 28px",
                borderRadius: 34,
                borderBottomRightRadius: m.me ? 8 : 34,
                borderBottomLeftRadius: m.me ? 34 : 8,
                background: m.me ? "#2A3563" : C.lime,
                color: m.me ? C.white : C.navy,
                transform: `scale(${s})`,
                transformOrigin: m.me ? "right bottom" : "left bottom",
                boxShadow: "0 12px 30px rgba(0,0,0,.35)",
              }}
            >
              {withEmoji(m.text)}
            </div>
            {!m.me && (
              <div style={{ width: 84, height: 84, borderRadius: 42, background: C.gold, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 46, transform: `scale(${s})` }}>
                {withEmoji("👩‍🏫")}
              </div>
            )}
          </div>
        );
      })}
      {typing && (
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 12, paddingLeft: 110 }}>
          <div style={{ background: "rgba(255,255,255,.12)", borderRadius: 30, padding: "18px 26px", display: "flex", gap: 10, direction: "ltr" }}>
            {[0, 1, 2].map((d) => (
              <div key={d} style={{ width: 18, height: 18, borderRadius: 9, background: C.white, transform: `translateY(${Math.sin((f - d * 4) / 3) * 7}px)` }} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// ---------------------------------------------------------------------------
// 4. Projects — portfolio cards fan out, growth line draws upward with counter
// ---------------------------------------------------------------------------

const Projects: React.FC = () => {
  const f = useCurrentFrame();
  const fan = useSpring(4, { damping: 13, stiffness: 120 });
  const chart = interpolate(f, [30, 70], [0, 1], { ...clamp, easing: Easing.out(Easing.cubic) });
  const pts = [
    [0, 230],
    [90, 200],
    [180, 215],
    [270, 150],
    [360, 120],
    [450, 60],
    [520, 10],
  ];
  const d = pts.map((p, i) => `${i ? "L" : "M"}${p[0]} ${p[1]}`).join(" ");
  const cards = [
    { c: "#8EA2FF", r: -14, x: -120, icon: "🛒" },
    { c: C.coral, r: 0, x: 0, icon: "📱" },
    { c: C.lime, r: 14, x: 120, icon: "📊" },
  ];
  return (
    <div style={{ position: "absolute", top: 390, left: 0, right: 0, height: 440 }}>
      <div style={{ position: "absolute", right: 120, top: 20, width: 380, height: 380 }}>
        {cards.map((c, i) => (
          <div
            key={i}
            style={{
              position: "absolute",
              left: 90,
              top: 30,
              width: 220,
              height: 300,
              borderRadius: 26,
              background: "#1E2645",
              border: `5px solid ${c.c}`,
              transform: `translateX(${c.x * fan}px) rotate(${c.r * fan}deg)`,
              transformOrigin: "50% 120%",
              boxShadow: "0 20px 40px rgba(0,0,0,.5)",
              padding: 20,
            }}
          >
            <div style={{ height: 130, borderRadius: 16, background: `${c.c}33`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 76 }}>{withEmoji(c.icon)}</div>
            <div style={{ height: 14, borderRadius: 7, background: "rgba(255,255,255,.3)", marginTop: 22, width: "80%" }} />
            <div style={{ height: 14, borderRadius: 7, background: "rgba(255,255,255,.18)", marginTop: 14, width: "55%" }} />
          </div>
        ))}
      </div>
      <div style={{ position: "absolute", left: 50, top: 70, width: 540, height: 300, transform: "scale(.8)", transformOrigin: "0 0" }}>
        <svg width="560" height="260" viewBox="-10 -10 560 260" style={{ overflow: "visible" }}>
          {[0, 1, 2, 3].map((g) => (
            <line key={g} x1="0" x2="530" y1={g * 75} y2={g * 75} stroke="rgba(255,255,255,.1)" strokeWidth="2" />
          ))}
          <path d={d} fill="none" stroke={C.lime} strokeWidth="10" strokeLinecap="round" strokeLinejoin="round" style={draw(chart, 700)} />
          {chart > 0.98 && <polygon points="520,-14 548,6 512,24" fill={C.lime} />}
        </svg>
        <div style={{ fontFamily: FONT, fontWeight: 900, fontSize: 84, color: C.lime, direction: "rtl", marginTop: -10 }}>
          {toArabicDigits(Math.round(chart * 3))} مشاريع
        </div>
      </div>
    </div>
  );
};

// ---------------------------------------------------------------------------
// 5. Lifetime — infinity symbol draws itself, comet travels the loop, years roll
// ---------------------------------------------------------------------------

const Lifetime: React.FC = () => {
  const f = useCurrentFrame();
  const p = interpolate(f, [4, 40], [0, 1], { ...clamp, easing: Easing.inOut(Easing.cubic) });
  const lem = (u: number) => {
    const a = 230;
    const s = Math.sin(u), c = Math.cos(u);
    return [a * c / (1 + s * s), a * s * c / (1 + s * s)];
  };
  const N = 120;
  const path = new Array(N + 1).fill(0).map((_, i) => {
    const [x, y] = lem((i / N) * Math.PI * 2);
    return `${i ? "L" : "M"}${x.toFixed(1)} ${y.toFixed(1)}`;
  }).join(" ");
  const comet = new Array(10).fill(0).map((_, k) => lem(((f - k * 1.2) / 30) * Math.PI));
  const year = 2026 + Math.floor(interpolate(f, [10, 90], [0, 24], clamp));
  return (
    <div style={{ position: "absolute", top: 380, left: 0, right: 0, height: 440, display: "flex", alignItems: "center", justifyContent: "center", gap: 40 }}>
      <svg width="560" height="300" viewBox="-280 -150 560 300">
        <defs>
          <linearGradient id="inf" x1="0" x2="1">
            <stop offset="0" stopColor={C.lime} />
            <stop offset="1" stopColor="#8EA2FF" />
          </linearGradient>
          <filter id="glow"><feGaussianBlur stdDeviation="6" /></filter>
        </defs>
        <path d={path} fill="none" stroke="url(#inf)" strokeWidth="26" strokeLinecap="round" style={draw(p, 1500)} filter="url(#glow)" opacity={0.6} />
        <path d={path} fill="none" stroke="url(#inf)" strokeWidth="18" strokeLinecap="round" style={draw(p, 1500)} />
        {p > 0.99 &&
          comet.map(([x, y], k) => <circle key={k} cx={x} cy={y} r={14 - k * 1.2} fill={C.white} opacity={1 - k / 10} />)}
      </svg>
      <div style={{ direction: "rtl", textAlign: "center" }}>
        <div style={{ fontFamily: FONT, fontWeight: 900, fontSize: 96, color: C.white, fontVariantNumeric: "tabular-nums" }}>{toArabicDigits(year)}</div>
        <div style={{ fontFamily: FONT, fontWeight: 900, fontSize: 52, color: C.lime }}>ولسه معاك</div>
      </div>
    </div>
  );
};

// ---------------------------------------------------------------------------

const ACCENTS: Record<Feature["kind"], string> = {
  practical: C.lime,
  certificate: C.gold,
  mentor: C.lime,
  projects: C.coral,
  lifetime: "#8EA2FF",
};

export const FeaturePanel: React.FC<{ feature: Feature; index: number; total: number }> = ({ feature, index, total }) => {
  const accent = ACCENTS[feature.kind];
  return (
    <AbsoluteFill style={{ height: PANEL_H }}>
      <Backdrop accent={accent} />
      <Header index={index} total={total} title={feature.title} subtitle={feature.subtitle} accent={accent} />
      {feature.kind === "practical" && <Practical steps={feature.steps ?? ["افهم", "طبّق", "اتقن"]} />}
      {feature.kind === "certificate" && <Certificate />}
      {feature.kind === "mentor" && <Mentor />}
      {feature.kind === "projects" && <Projects />}
      {feature.kind === "lifetime" && <Lifetime />}
    </AbsoluteFill>
  );
};

export const FEATURE_PANEL_HEIGHT = PANEL_H;
