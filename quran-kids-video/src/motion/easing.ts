import { Easing, interpolate } from "remotion";

// Expo-style curves: fast start / soft landing for entrances,
// slow start / hard exit for departures.
export const EASE_OUT = Easing.bezier(0.16, 1, 0.3, 1);
export const EASE_IN = Easing.bezier(0.7, 0, 0.84, 0);
export const EASE_IN_OUT = Easing.bezier(0.65, 0, 0.35, 1);
export const BACK_OUT = Easing.bezier(0.34, 1.56, 0.64, 1);

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

export const progress = (
  frame: number,
  start: number,
  duration: number,
  easing: (t: number) => number = EASE_OUT,
) => interpolate(frame, [start, start + duration], [0, 1], { ...clamp, easing });

export type RevealOptions = {
  // Frame the element starts entering
  readonly at: number;
  // Frame the element starts leaving (omit to stay)
  readonly out?: number;
  readonly inDuration?: number;
  readonly outDuration?: number;
  // Travel distance in px; positive enters from below
  readonly distance?: number;
  // Exit travel: positive leaves upward
  readonly outDistance?: number;
  readonly blur?: number;
  readonly scaleFrom?: number;
  readonly scaleTo?: number;
  readonly easing?: (t: number) => number;
};

// Blur + slide + fade, in and out. Returns style props for one element.
export const reveal = (frame: number, o: RevealOptions) => {
  const enter = progress(frame, o.at, o.inDuration ?? 20, o.easing ?? EASE_OUT);
  const leave =
    o.out === undefined
      ? 0
      : progress(frame, o.out, o.outDuration ?? 16, EASE_IN);
  const distance = o.distance ?? 70;
  const outDistance = o.outDistance ?? distance;
  const blur = o.blur ?? 22;
  const y = (1 - enter) * distance - leave * outDistance;
  const scale =
    interpolate(enter, [0, 1], [o.scaleFrom ?? 1, 1]) *
    interpolate(leave, [0, 1], [1, o.scaleTo ?? 1]);

  return {
    opacity: enter * (1 - leave),
    translate: `0px ${y}px`,
    scale: String(scale),
    filter: `blur(${(1 - enter) * blur + leave * blur}px)`,
  } as const;
};
