import type React from "react";

// The course logo mark: an open Quran under a crescent and star,
// inside a cream badge with a gold ring.
export const LogoMark: React.FC<{
  readonly size: number;
  readonly primaryColor: string;
  readonly accentColor: string;
}> = ({ size, primaryColor, accentColor }) => {
  return (
    <svg width={size} height={size} viewBox="0 0 400 400">
      <defs>
        <mask id="crescent">
          <rect width={400} height={400} fill="white" />
          <circle cx={226} cy={96} r={50} fill="black" />
        </mask>
      </defs>
      <circle cx={200} cy={200} r={196} fill="#FFF6E5" />
      <circle
        cx={200}
        cy={200}
        r={176}
        fill="none"
        stroke={accentColor}
        strokeWidth={10}
        strokeDasharray="2 22"
        strokeLinecap="round"
      />
      <circle cx={200} cy={112} r={58} fill={accentColor} mask="url(#crescent)" />
      <polygon
        points="246,74 252,90 269,91 256,101 260,118 246,108 232,118 236,101 223,91 240,90"
        fill={accentColor}
      />
      <path
        d="M200 312 C 160 284, 110 282, 66 296 L 66 186 C 110 172, 160 174, 200 204 Z"
        fill={primaryColor}
      />
      <path
        d="M200 312 C 240 284, 290 282, 334 296 L 334 186 C 290 172, 240 174, 200 204 Z"
        fill={primaryColor}
      />
      <path
        d="M96 214 C 126 206, 156 208, 182 222 M96 240 C 126 232, 156 234, 182 248 M96 266 C 126 258, 156 260, 182 274"
        stroke="#FFF6E5"
        strokeWidth={7}
        strokeLinecap="round"
        fill="none"
        opacity={0.75}
      />
      <path
        d="M304 214 C 274 206, 244 208, 218 222 M304 240 C 274 232, 244 234, 218 248 M304 266 C 274 258, 244 260, 218 274"
        stroke="#FFF6E5"
        strokeWidth={7}
        strokeLinecap="round"
        fill="none"
        opacity={0.75}
      />
      <path d="M200 204 L 200 312" stroke={accentColor} strokeWidth={8} />
    </svg>
  );
};
