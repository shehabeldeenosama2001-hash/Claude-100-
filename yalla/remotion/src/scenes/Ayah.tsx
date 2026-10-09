import { useCurrentFrame } from "remotion";
import { B, C, CX, FPS, REC, Y } from "../design";
import { DISPLAY, QURAN } from "../fonts";
import { Art, drawn, inOut, linear, lineStyle, Shell, textBlock } from "../kit";

const START = 180;
const scene = Y.scenes[2];

// The ayah most present in this scene's window, shown whole
const overlap = (a: (typeof REC.ayahs)[number]) =>
  Math.max(0, Math.min(a.end * FPS, scene.from + scene.duration) - Math.max(a.start * FPS, scene.from));
const ayah = REC.ayahs.reduce((best, a) => (overlap(a) > overlap(best) ? a : best));

// Scene 3 Ayah card (frames 180–330)
export const Ayah: React.FC = () => {
  const frame = useCurrentFrame();
  const film = frame + START;
  const fade = inOut(film, 186, 186 + B.ayahFade);
  // Underline sweeps right-to-left in sync with the voice
  const underline = linear(film, ayah.start * FPS, ayah.end * FPS);
  const turn = Math.max(0, film - 192) * (3 / FPS);

  return (
    <Shell start={START} enter="sweep">
      <Art>
        <g transform={`rotate(${turn} ${CX} 690)`}>
          <path
            d={Y.paths.khatam}
            transform={`translate(${CX} 690) scale(0.5)`}
            {...lineStyle}
            strokeWidth={1.5}
            opacity={0.6}
            {...drawn(inOut(film, 192, 222))}
          />
        </g>
      </Art>
      {/* Quranic text: one unit, opacity only */}
      <div style={{ ...textBlock(790), fontFamily: QURAN, fontSize: 104, lineHeight: 1.9, opacity: fade }}>
        <span style={{ position: "relative", display: "inline-block" }}>
          {ayah.text}
          <span
            style={{
              position: "absolute",
              left: 0,
              right: 0,
              bottom: 28,
              height: 2,
              background: C.cream,
              transformOrigin: "100% 50%",
              scale: `${underline} 1`,
            }}
          />
        </span>
      </div>
      <div style={{ ...textBlock(1070), fontFamily: DISPLAY, fontSize: 44, fontWeight: 500, opacity: 0.72 * fade }}>
        {`سورة ${REC.surahName} · آية ${ayah.n.toLocaleString("ar-EG")}`}
      </div>
    </Shell>
  );
};
