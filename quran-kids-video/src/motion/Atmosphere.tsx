import type React from "react";
import {
  AbsoluteFill,
  Img,
  interpolate,
  random,
  staticFile,
  useCurrentFrame,
} from "remotion";

// 8-point Islamic star for the background pattern
const starPoints = new Array(16)
  .fill(true)
  .map((_, i) => {
    const r = i % 2 === 0 ? 46 : 24;
    const a = (Math.PI / 8) * i - Math.PI / 2;
    return `${80 + r * Math.cos(a)},${80 + r * Math.sin(a)}`;
  })
  .join(" ");

type AtmosphereProps = {
  readonly top: string;
  readonly bottom: string;
  readonly glow: string;
  // Vertical position of the main light, in % of height
  readonly glowY?: number;
  readonly glowSize?: number;
  readonly patternOpacity?: number;
  readonly particleColor?: string;
  readonly particles?: number;
  readonly id: string;
};

export const Atmosphere: React.FC<AtmosphereProps> = ({
  top,
  bottom,
  glow,
  glowY = 42,
  glowSize = 1300,
  patternOpacity = 0.07,
  particleColor = "255, 214, 140",
  particles = 34,
  id,
}) => {
  const frame = useCurrentFrame();

  return (
    <AbsoluteFill
      style={{
        background: `linear-gradient(180deg, ${top} 0%, ${bottom} 100%)`,
        overflow: "hidden",
      }}
    >
      {/* Main light, breathing slowly */}
      <div
        style={{
          position: "absolute",
          left: 540 - glowSize / 2 + Math.sin(frame / 50) * 40,
          top: (1920 * glowY) / 100 - glowSize / 2 + Math.cos(frame / 60) * 30,
          width: glowSize,
          height: glowSize,
          borderRadius: "50%",
          background: `radial-gradient(circle, ${glow} 0%, transparent 65%)`,
          opacity: interpolate(Math.sin(frame / 35), [-1, 1], [0.75, 1]),
        }}
      />
      {/* Secondary drifting light for depth */}
      <div
        style={{
          position: "absolute",
          left: -200 + Math.sin(frame / 70) * 120,
          top: 1250 + Math.cos(frame / 55) * 80,
          width: 900,
          height: 900,
          borderRadius: "50%",
          background: `radial-gradient(circle, ${glow} 0%, transparent 70%)`,
          opacity: 0.35,
        }}
      />
      {patternOpacity > 0 ? (
        <svg
          width="100%"
          height="100%"
          style={{ position: "absolute", inset: 0, opacity: patternOpacity }}
        >
          <defs>
            <pattern
              id={`stars-${id}`}
              width={160}
              height={160}
              patternUnits="userSpaceOnUse"
              patternTransform={`translate(${frame * 0.35} ${frame * 0.6})`}
            >
              <polygon
                points={starPoints}
                fill="none"
                stroke="#FFF6E5"
                strokeWidth={2.5}
              />
              <circle cx={80} cy={80} r={6} fill="#FFF6E5" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill={`url(#stars-${id})`} />
        </svg>
      ) : null}
      {/* Floating light motes; big ones are near the lens, so out of focus */}
      {new Array(particles).fill(true).map((_, i) => {
        const size = 4 + random(`${id}-s-${i}`) * 26;
        const speed = 0.4 + random(`${id}-v-${i}`) * 1.2;
        const x = random(`${id}-x-${i}`) * 1080;
        const y0 = random(`${id}-y-${i}`) * 2100;
        const y = ((y0 - frame * speed) % 2100 + 2100) % 2100 - 90;
        const twinkle = interpolate(
          Math.sin(frame / (10 + random(`${id}-t-${i}`) * 20) + i),
          [-1, 1],
          [0.25, 0.9],
        );
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: x + Math.sin((frame + i * 20) / 40) * 20,
              top: y,
              width: size,
              height: size,
              borderRadius: "50%",
              background: `radial-gradient(circle, rgba(${particleColor}, 1) 0%, rgba(${particleColor}, 0) 70%)`,
              opacity: twinkle * (size > 20 ? 0.5 : 1),
              filter: size > 20 ? "blur(4px)" : undefined,
            }}
          />
        );
      })}
    </AbsoluteFill>
  );
};

// Film grain + vignette, laid over the whole video
export const Finish: React.FC = () => {
  const frame = useCurrentFrame();

  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <AbsoluteFill
        style={{
          background:
            "radial-gradient(ellipse 75% 60% at 50% 48%, transparent 45%, rgba(0,0,0,0.6) 100%)",
        }}
      />
      <div
        style={{
          position: "absolute",
          left: -Math.floor(random(`gx${frame}`) * 512),
          top: -Math.floor(random(`gy${frame}`) * 512),
          width: 512 * 4,
          display: "flex",
          flexWrap: "wrap",
          opacity: 0.07,
          mixBlendMode: "overlay",
        }}
      >
        {new Array(20).fill(true).map((_, i) => (
          <Img
            key={i}
            src={staticFile("textures/grain.png")}
            style={{ width: 512, height: 512 }}
          />
        ))}
      </div>
    </AbsoluteFill>
  );
};

// Slow camera push-in with an optional decaying shake (for impacts)
export const Camera: React.FC<{
  readonly children: React.ReactNode;
  readonly duration: number;
  readonly push?: number;
  readonly shakeAt?: number;
}> = ({ children, duration, push = 0.06, shakeAt }) => {
  const frame = useCurrentFrame();
  const shake =
    shakeAt === undefined || frame < shakeAt
      ? 0
      : 14 * Math.exp(-(frame - shakeAt) / 4);
  const sx = shake * (random(`sx${frame}`) * 2 - 1);
  const sy = shake * (random(`sy${frame}`) * 2 - 1);

  return (
    <AbsoluteFill
      style={{
        scale: String(interpolate(frame, [0, duration], [1, 1 + push])),
        translate: `${sx}px ${sy}px`,
      }}
    >
      {children}
    </AbsoluteFill>
  );
};

export const LightRays: React.FC<{
  readonly color: string;
  readonly opacity: number;
  readonly y?: number;
}> = ({ color, opacity, y = 860 }) => {
  const frame = useCurrentFrame();

  return (
    <div
      style={{
        position: "absolute",
        left: 540 - 1300,
        top: y - 1300,
        width: 2600,
        height: 2600,
        borderRadius: "50%",
        background: `repeating-conic-gradient(from 0deg, ${color} 0deg 5deg, transparent 5deg 16deg)`,
        maskImage: "radial-gradient(circle, black 0%, transparent 55%)",
        WebkitMaskImage: "radial-gradient(circle, black 0%, transparent 55%)",
        rotate: `${frame * 0.12}deg`,
        opacity,
        filter: "blur(6px)",
      }}
    />
  );
};

// A clock face drawing itself: the "time is passing" motif
export const TimeRing: React.FC<{
  readonly progress: number;
  readonly opacity: number;
  readonly size?: number;
  readonly y?: number;
}> = ({ progress: p, opacity, size = 860, y = 960 }) => {
  const r = 400;
  const c = 2 * Math.PI * r;

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 1000 1000"
      style={{
        position: "absolute",
        left: 540 - size / 2,
        top: y - size / 2,
        opacity,
      }}
    >
      <circle
        cx={500}
        cy={500}
        r={r}
        fill="none"
        stroke="rgba(255,246,229,0.12)"
        strokeWidth={3}
      />
      {new Array(60).fill(true).map((_, i) => {
        const a = (i / 60) * Math.PI * 2;
        const long = i % 5 === 0;
        const r1 = long ? 440 : 452;
        return (
          <line
            key={i}
            x1={500 + Math.sin(a) * r1}
            y1={500 - Math.cos(a) * r1}
            x2={500 + Math.sin(a) * 468}
            y2={500 - Math.cos(a) * 468}
            stroke="rgba(255,246,229,0.28)"
            strokeWidth={long ? 5 : 2}
            strokeLinecap="round"
          />
        );
      })}
      <circle
        cx={500}
        cy={500}
        r={r}
        fill="none"
        stroke="#F4B942"
        strokeWidth={6}
        strokeLinecap="round"
        strokeDasharray={c}
        strokeDashoffset={c * (1 - p)}
        transform="rotate(-90 500 500)"
        style={{ filter: "drop-shadow(0 0 12px rgba(244,185,66,0.8))" }}
      />
      <line
        x1={500}
        y1={500}
        x2={500 + Math.sin(p * Math.PI * 2) * 360}
        y2={500 - Math.cos(p * Math.PI * 2) * 360}
        stroke="rgba(255,246,229,0.5)"
        strokeWidth={4}
        strokeLinecap="round"
      />
      <circle cx={500} cy={500} r={10} fill="#F4B942" />
    </svg>
  );
};
