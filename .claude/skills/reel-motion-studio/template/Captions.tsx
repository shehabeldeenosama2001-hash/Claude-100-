import React from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { C, FONT, strokeText, withEmoji } from "./theme";

export interface TimedWord {
  word: string;
  start: number; // composition seconds
  end: number;
}

const EMPHASIS = /(حاجة|عملي|شهادة|معتمدة|متابعة|شخصية|مشاريع|حقيقية|الحياة|ببلاش|دلوقتي|البايو|CV)/;

// Split a segment's text into words and spread them over the segment, weighted by length.
// Real word timestamps from a transcriber drop straight into TimedWord[] instead.
export function spreadWords(text: string, start: number, end: number): TimedWord[] {
  const words = text.split(/\s+/).filter(Boolean);
  const weights = words.map((w) => 0.6 + w.replace(/[،,.]/g, "").length);
  const total = weights.reduce((a, b) => a + b, 0);
  let t = start;
  return words.map((w, i) => {
    const d = ((end - start) * weights[i]) / total;
    const out = { word: w, start: t, end: t + d };
    t += d;
    return out;
  });
}

function paginate(words: TimedWord[], maxWords = 3): TimedWord[][] {
  const pages: TimedWord[][] = [];
  let cur: TimedWord[] = [];
  words.forEach((w, i) => {
    cur.push(w);
    const gapAfter = words[i + 1] ? words[i + 1].start - w.end : 99;
    if (cur.length >= maxWords || /[،,.!؟]$/.test(w.word) || gapAfter > 0.25) {
      pages.push(cur);
      cur = [];
    }
  });
  if (cur.length) pages.push(cur);
  return pages;
}

export const Captions: React.FC<{ words: TimedWord[]; bottom: number }> = ({ words, bottom }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const pages = paginate(words);
  const page = pages.find((p, i) => t >= p[0].start && t < (pages[i + 1]?.[0].start ?? p[p.length - 1].end + 0.3));
  if (!page || t > page[page.length - 1].end + 0.3) return null;

  // keep every page on one line: shrink long pages instead of wrapping
  const chars = page.reduce((n, w) => n + w.word.length, 0) + page.length * 1.5;
  const fit = Math.min(1, 21 / chars);
  const pageIn = spring({ frame: frame - Math.round(page[0].start * fps), fps, config: { damping: 14, stiffness: 220 } });

  return (
    <AbsoluteFill style={{ justifyContent: "flex-end", alignItems: "center", pointerEvents: "none" }}>
      <div
        style={{
          direction: "rtl",
          display: "flex",
          flexWrap: "nowrap",
          justifyContent: "center",
          gap: "6px 30px",
          maxWidth: 940,
          marginBottom: bottom,
          transform: `translateY(${(1 - pageIn) * 40}px) scale(${0.85 + pageIn * 0.15})`,
          opacity: pageIn,
        }}
      >
        {page.map((w, i) => {
          const active = t >= w.start && t < w.end + 0.05;
          const said = t >= w.start;
          const pop = spring({ frame: frame - Math.round(w.start * fps), fps, config: { damping: 9, stiffness: 300 } });
          const emph = EMPHASIS.test(w.word);
          const scale = active ? 1 + 0.18 * pop : 1;
          return (
            <span
              key={i}
              style={{
                fontFamily: FONT,
                fontWeight: 900,
                fontSize: (emph ? 104 : 92) * fit,
                lineHeight: 1.25,
                color: active ? C.navy : emph && said ? C.lime : C.white,
                opacity: said ? 1 : 0.55,
                textShadow: active ? "none" : strokeText(6),
                background: active ? C.lime : "transparent",
                borderRadius: 18,
                padding: "0 14px",
                transform: `scale(${scale}) rotate(${active ? interpolate(pop, [0, 1], [-4, 0]) : 0}deg)`,
                boxShadow: active ? "0 12px 0 #000, 0 18px 40px rgba(0,0,0,.4)" : "none",
                display: "inline-block",
              }}
            >
              {withEmoji(w.word)}
            </span>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};
