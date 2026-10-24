import React from "react";
import "@fontsource/cairo/arabic-700.css";
import "@fontsource/cairo/arabic-900.css";
import "@fontsource/cairo/latin-900.css";
import "@fontsource/montserrat/latin-900.css";
import { continueRender, delayRender, staticFile } from "remotion";

export const C = {
  navy: "#0B1020",
  navy2: "#141B33",
  lime: "#D7FF3A",
  coral: "#FF5A5F",
  gold: "#FFC94D",
  white: "#FFFFFF",
  muted: "#9AA3C7",
};

export const FONT = "'Cairo', 'Montserrat', sans-serif";

// Block rendering until every face we use is decoded, so frame 0 never shows fallback glyphs.
const handle = delayRender("course-reel fonts");
Promise.all(
  [
    "900 80px Cairo",
    "700 40px Cairo",
    "900 80px Montserrat",
  ].map((f) => document.fonts.load(f, "اختبار 😳👇🔥👆⏱️✅ ABC 123"))
)
  .then(() => document.fonts.ready)
  .then(() => continueRender(handle))
  .catch(() => continueRender(handle));

export const toArabicDigits = (n: number | string) =>
  String(n).replace(/\d/g, (d) => "٠١٢٣٤٥٦٧٨٩"[Number(d)]);

export const strokeText = (px = 6, color = "#000") => {
  const s: string[] = [];
  for (let a = 0; a < 16; a++) {
    const r = (a / 16) * Math.PI * 2;
    s.push(`${(Math.cos(r) * px).toFixed(1)}px ${(Math.sin(r) * px).toFixed(1)}px 0 ${color}`);
  }
  return s.join(",") + `, 0 10px 24px rgba(0,0,0,.45)`;
};

// Emoji are drawn as Noto PNGs (public/course-reel/emoji/<codepoints>.png): headless Chromium
// renders colour-emoji web fonts unreliably, images are identical on every machine.
const EMOJI_RE = /(\p{Extended_Pictographic}(?:\uFE0F|\u200D\p{Extended_Pictographic}|\p{Emoji_Modifier})*)/gu;
export const emojiFile = (e: string) =>
  [...e].map((c) => c.codePointAt(0)!.toString(16).padStart(4, "0")).filter((c) => c !== "fe0f").join("-");
export const withEmoji = (text: string): React.ReactNode =>
  text.split(EMOJI_RE).map((part, i) =>
    i % 2 === 1
      ? React.createElement("img", {
          key: i,
          src: staticFile(`course-reel/emoji/${emojiFile(part)}.png`),
          style: { height: "1.05em", width: "1.05em", verticalAlign: "-0.18em", margin: "0 0.08em", display: "inline-block" },
        })
      : part
  );
