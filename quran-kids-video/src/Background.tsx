import type React from "react";
import {
  AbsoluteFill,
  Interactive,
  interpolate,
  useCurrentFrame,
  type InteractivitySchema,
} from "remotion";

// 8-point Islamic star, centered in a 160px pattern tile
const starPoints = new Array(16)
  .fill(true)
  .map((_, i) => {
    const r = i % 2 === 0 ? 46 : 24;
    const a = (Math.PI / 8) * i - Math.PI / 2;
    return `${80 + r * Math.cos(a)},${80 + r * Math.sin(a)}`;
  })
  .join(" ");

const sparkles = [
  { x: 120, y: 260, size: 18, delay: 0 },
  { x: 930, y: 180, size: 26, delay: 12 },
  { x: 860, y: 760, size: 14, delay: 30 },
  { x: 160, y: 1180, size: 22, delay: 18 },
  { x: 960, y: 1460, size: 18, delay: 6 },
  { x: 220, y: 1720, size: 26, delay: 24 },
  { x: 560, y: 120, size: 12, delay: 40 },
];

type BackgroundProps = {
  readonly innerColor: string;
  readonly outerColor: string;
  readonly patternColor: string;
  readonly style?: React.CSSProperties;
};

const BackgroundInner: React.FC<BackgroundProps> = ({
  innerColor,
  outerColor,
  patternColor,
  style,
}) => {
  const frame = useCurrentFrame();

  return (
    <AbsoluteFill
      style={{
        background: `radial-gradient(circle at 50% 40%, ${innerColor} 0%, ${outerColor} 75%)`,
        overflow: "hidden",
        ...style,
      }}
    >
      <svg
        width="100%"
        height="100%"
        style={{ position: "absolute", inset: 0, opacity: 0.12 }}
      >
        <defs>
          <pattern
            id="stars"
            width={160}
            height={160}
            patternUnits="userSpaceOnUse"
            patternTransform={`translate(${frame * 0.6} ${frame * 0.9})`}
          >
            <polygon
              points={starPoints}
              fill="none"
              stroke={patternColor}
              strokeWidth={3}
            />
            <circle cx={80} cy={80} r={8} fill={patternColor} />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#stars)" />
      </svg>
      {sparkles.map((s) => (
        <div
          key={`${s.x}-${s.y}`}
          style={{
            position: "absolute",
            left: s.x,
            top: s.y,
            width: s.size,
            height: s.size,
            backgroundColor: "#FFD36E",
            clipPath:
              "polygon(50% 0%, 61% 39%, 100% 50%, 61% 61%, 50% 100%, 39% 61%, 0% 50%, 39% 39%)",
            opacity: interpolate(
              Math.sin((frame + s.delay) / 12),
              [-1, 1],
              [0.25, 1],
            ),
            scale: interpolate(
              Math.sin((frame + s.delay) / 12),
              [-1, 1],
              [0.7, 1.2],
            ),
            translate: `0px ${-frame * 0.4}px`,
          }}
        />
      ))}
    </AbsoluteFill>
  );
};

const backgroundSchema = {
  innerColor: {
    type: "color",
    default: "#138A72",
    description: "Center color",
  },
  outerColor: {
    type: "color",
    default: "#0A4A3E",
    description: "Edge color",
  },
  patternColor: {
    type: "color",
    default: "#FFF6E5",
    description: "Pattern color",
  },
} as const satisfies InteractivitySchema;

export const Background = Interactive.withSchema({
  Component: BackgroundInner,
  componentName: "<Background>",
  schema: backgroundSchema,
  wrapInSequence: true,
});
