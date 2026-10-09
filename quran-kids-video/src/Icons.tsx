import type React from "react";

type IconProps = {
  readonly size: number;
  readonly color: string;
  // 0..1, how much of each stroke is drawn
  readonly draw?: number;
};

// Every stroke gets pathLength 1 so the draw-on works for any shape
const Stroke: React.FC<{
  readonly d: string;
  readonly color: string;
  readonly draw: number;
}> = ({ d, color, draw }) => (
  <path
    d={d}
    pathLength={1}
    stroke={color}
    strokeWidth={7}
    strokeLinecap="round"
    strokeLinejoin="round"
    fill="none"
    strokeDasharray={1}
    strokeDashoffset={1 - draw}
  />
);

const circlePath = (cx: number, cy: number, r: number) =>
  `M${cx - r} ${cy} a${r} ${r} 0 1 0 ${2 * r} 0 a${r} ${r} 0 1 0 ${-2 * r} 0`;

const Icon: React.FC<IconProps & { readonly paths: string[] }> = ({
  size,
  color,
  draw = 1,
  paths,
}) => (
  <svg width={size} height={size} viewBox="0 0 120 120">
    {paths.map((d) => (
      <Stroke key={d} d={d} color={color} draw={draw} />
    ))}
  </svg>
);

// فقه
export const MosqueIcon: React.FC<IconProps> = (p) => (
  <Icon
    {...p}
    paths={[
      "M28 98 V68 C28 48 44 36 60 30 C76 36 92 48 92 68 V98 Z",
      "M52 98 V82 C52 76 68 76 68 82 V98",
      "M60 30 V16",
      "M100 98 V50 M94 50 H106 M100 50 V40",
      "M14 98 H108",
    ]}
  />
);

// حديث نبوي
export const ScrollIcon: React.FC<IconProps> = (p) => (
  <Icon
    {...p}
    paths={[
      "M30 24 H90 V96 H30 Z",
      "M22 24 C22 16 38 16 38 24 C38 32 22 32 22 24",
      "M82 96 C82 88 98 88 98 96 C98 104 82 104 82 96",
      "M44 44 H78 M44 58 H78 M44 72 H66",
    ]}
  />
);

// تحفيظ: an open Quran on a rehal stand
export const RehalIcon: React.FC<IconProps> = (p) => (
  <Icon
    {...p}
    paths={[
      "M60 64 C48 54 32 52 18 56 V28 C32 24 48 26 60 36 Z",
      "M60 64 C72 54 88 52 102 56 V28 C88 24 72 26 60 36 Z",
      "M30 104 L90 64 M90 104 L30 64",
    ]}
  />
);

// قراءة
export const ReadingIcon: React.FC<IconProps> = (p) => (
  <Icon
    {...p}
    paths={[
      "M60 96 C46 86 28 84 12 88 V32 C28 28 46 30 60 42 Z",
      "M60 96 C74 86 92 84 108 88 V32 C92 28 74 30 60 42 Z",
      "M24 50 C34 48 42 49 50 54 M24 66 C34 64 42 65 50 70",
      "M96 50 C86 48 78 49 70 54 M96 66 C86 64 78 65 70 70",
    ]}
  />
);

// دروس فردية: a teacher and one child
export const OneOnOneIcon: React.FC<IconProps> = (p) => (
  <Icon
    {...p}
    paths={[
      circlePath(84, 30, 12),
      "M64 100 V72 C64 58 104 58 104 72 V100",
      circlePath(34, 52, 9),
      "M18 100 V84 C18 72 50 72 50 84 V100",
      "M50 80 L60 76 L70 80",
    ]}
  />
);
