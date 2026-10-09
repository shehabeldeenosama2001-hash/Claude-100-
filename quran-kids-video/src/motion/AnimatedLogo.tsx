import type React from "react";
import { interpolate, useCurrentFrame } from "remotion";
import { BACK_OUT, EASE_IN_OUT, EASE_OUT, progress } from "./easing";

const PAGE_LINES_RIGHT =
  "M304 214 C 274 206, 244 208, 218 222 M304 240 C 274 232, 244 234, 218 248 M304 266 C 274 258, 244 260, 218 274";
const PAGE_LINES_LEFT =
  "M96 214 C 126 206, 156 208, 182 222 M96 240 C 126 232, 156 234, 182 248 M96 266 C 126 258, 156 260, 182 274";

// The course mark, built up piece by piece starting at `delay`
export const AnimatedLogoMark: React.FC<{
  readonly size: number;
  readonly delay?: number;
  readonly id: string;
}> = ({ size, delay = 0, id }) => {
  const f = useCurrentFrame() - delay;
  const badge = progress(f, 0, 22, BACK_OUT);
  const ring = progress(f, 6, 34, EASE_OUT);
  const pages = progress(f, 12, 24, EASE_OUT);
  const lines = progress(f, 26, 22, EASE_OUT);
  const moon = progress(f, 22, 26, EASE_OUT);
  const star = progress(f, 34, 18, BACK_OUT);
  const shine = progress(f, 46, 30, EASE_IN_OUT);

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 400 400"
      style={{ overflow: "visible" }}
    >
      <defs>
        <mask id={`crescent-${id}`}>
          <rect width={400} height={400} fill="white" />
          <circle cx={226} cy={96} r={50} fill="black" />
        </mask>
        <clipPath id={`badge-${id}`}>
          <circle cx={200} cy={200} r={196} />
        </clipPath>
        <linearGradient id={`shine-${id}`} x1="0" x2="1" y1="0" y2="0">
          <stop offset="0" stopColor="white" stopOpacity={0} />
          <stop offset="0.5" stopColor="white" stopOpacity={0.85} />
          <stop offset="1" stopColor="white" stopOpacity={0} />
        </linearGradient>
      </defs>
      <g
        transform={`translate(200 200) scale(${badge}) translate(-200 -200)`}
      >
        <circle cx={200} cy={200} r={196} fill="#FFF6E5" />
        <circle
          cx={200}
          cy={200}
          r={176}
          fill="none"
          stroke="#F4B942"
          strokeWidth={10}
          strokeDasharray="2 22"
          strokeLinecap="round"
          opacity={ring}
          transform={`rotate(${interpolate(ring, [0, 1], [-140, 0])} 200 200)`}
        />
        <g
          opacity={moon}
          transform={`translate(0 ${(1 - moon) * 40}) rotate(${(1 - moon) * -35} 200 112)`}
        >
          <circle
            cx={200}
            cy={112}
            r={58}
            fill="#F4B942"
            mask={`url(#crescent-${id})`}
          />
        </g>
        <polygon
          points="246,74 252,90 269,91 256,101 260,118 246,108 232,118 236,101 223,91 240,90"
          fill="#F4B942"
          transform={`translate(246 96) scale(${star}) rotate(${(1 - star) * 120 + Math.sin(f / 9) * 6}) translate(-246 -96)`}
        />
        <g transform={`translate(200 0) scale(${pages} 1) translate(-200 0)`}>
          <path
            d="M200 312 C 160 284, 110 282, 66 296 L 66 186 C 110 172, 160 174, 200 204 Z"
            fill="#0F6B5A"
          />
          <path
            d="M200 312 C 240 284, 290 282, 334 296 L 334 186 C 290 172, 240 174, 200 204 Z"
            fill="#0F6B5A"
          />
        </g>
        {[PAGE_LINES_LEFT, PAGE_LINES_RIGHT].map((d) => (
          <path
            key={d}
            d={d}
            pathLength={1}
            stroke="#FFF6E5"
            strokeWidth={7}
            strokeLinecap="round"
            fill="none"
            opacity={0.75}
            strokeDasharray={1}
            strokeDashoffset={1 - lines}
          />
        ))}
        <path
          d="M200 204 L 200 312"
          stroke="#F4B942"
          strokeWidth={8}
          transform={`translate(0 312) scale(1 ${pages}) translate(0 -312)`}
        />
        <g clipPath={`url(#badge-${id})`}>
          <rect
            x={interpolate(shine, [0, 1], [-320, 520])}
            y={-100}
            width={140}
            height={600}
            fill={`url(#shine-${id})`}
            transform="rotate(20 200 200)"
            opacity={shine > 0 && shine < 1 ? 0.9 : 0}
          />
        </g>
      </g>
    </svg>
  );
};
