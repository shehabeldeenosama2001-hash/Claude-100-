import type React from "react";
import { useCurrentFrame } from "remotion";
import { reveal, type RevealOptions } from "./easing";

type WordsProps = Omit<RevealOptions, "at" | "out"> & {
  readonly text: string;
  readonly at: number;
  readonly out?: number;
  // Frames between consecutive words
  readonly stagger?: number;
  readonly outStagger?: number;
  readonly fontSize: number;
  readonly fontFamily: string;
  readonly color: string;
  readonly fontWeight?: number;
  readonly lineHeight?: number;
  readonly glow?: string;
  readonly style?: React.CSSProperties;
};

// Word-by-word kinetic type. Arabic letters join inside a word, so the
// word (never the letter) is the smallest unit that can animate.
export const Words: React.FC<WordsProps> = ({
  text,
  at,
  out,
  stagger = 4,
  outStagger = 2,
  fontSize,
  fontFamily,
  color,
  fontWeight = 700,
  lineHeight = 1.25,
  glow,
  style,
  ...motion
}) => {
  const frame = useCurrentFrame();
  let index = 0;

  return (
    <div
      style={{
        position: "absolute",
        left: 80,
        right: 80,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        textAlign: "center",
        direction: "rtl",
        fontFamily,
        fontSize,
        fontWeight,
        lineHeight,
        color,
        ...style,
      }}
    >
      {text.split("\n").map((line) => (
        <div
          key={line}
          style={{
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "center",
            columnGap: fontSize * 0.26,
          }}
        >
          {line.split(" ").map((word) => {
            const i = index++;
            return (
              <span
                key={`${word}-${i}`}
                style={{
                  display: "inline-block",
                  textShadow: glow,
                  ...reveal(frame, {
                    ...motion,
                    at: at + i * stagger,
                    out: out === undefined ? undefined : out + i * outStagger,
                  }),
                }}
              >
                {word}
              </span>
            );
          })}
        </div>
      ))}
    </div>
  );
};
