import { useCurrentFrame } from "remotion";
import { B, C, CX, CY, FPS, L, REC, Y } from "../design";
import { DISPLAY } from "../fonts";
import { Art, clamp01, drawn, inOut, lineStyle, octaPoints, Shell, soft, textBlock } from "../kit";

const graphemes = Array.from(new Intl.Segmenter("ar", { granularity: "grapheme" }).segment(Y.copy.hook), (g) => g.segment);
const W = L.waveform;

// Amplitude follows the recitation timing
const activity = (t: number) =>
  Math.max(0, ...REC.ayahs.map((a) => clamp01((t - a.start) / W.ramp) * clamp01((a.end - t) / W.ramp)));

const waveD = (t: number) => {
  const amp = W.base + W.gain * activity(t);
  let d = "";
  for (let i = 0; i < W.points; i++) {
    const u = i / (W.points - 1);
    const x = CX - W.width / 2 + u * W.width;
    const env = Math.pow(Math.sin(Math.PI * u), 1.5);
    const y = W.y + amp * env * (0.6 * Math.sin(2 * Math.PI * W.f1 * u + W.w1 * t) + 0.4 * Math.sin(2 * Math.PI * W.f2 * u - W.w2 * t));
    d += `${i === 0 ? "M" : " L"}${x.toFixed(1)} ${y.toFixed(1)}`;
  }
  return d;
};

// Scenes 1 Hook and 2 Age reveal share one stage (frames 0–180)
export const Hook: React.FC = () => {
  const frame = useCurrentFrame();
  const t = frame / FPS;
  const [type0, type1] = B.typeOn;
  const typed = graphemes.slice(0, Math.round(clamp01((frame - type0) / (type1 - type0)) * graphemes.length)).join("");
  const typing = frame >= type0 && frame <= type1;
  const cursorOn = typing || Math.floor(t * 2.4) % 2 === 0;
  const textOut = inOut(frame, B.hookTextOut[0], B.hookTextOut[1]);
  const badge = soft(frame, B.badgeIn, 24);
  const bloom = 1 + 0.1 * soft(frame, REC.firstLongNote * FPS, 24);

  return (
    <Shell start={0} enter="none">
      <Art>
        <polygon
          points={octaPoints(CX, CY, L.octagramRadius)}
          {...(lineStyle as React.SVGProps<SVGPolygonElement>)}
          strokeWidth={2}
          opacity={0.7}
          {...drawn(inOut(frame, B.octagramDraw[0], B.octagramDraw[1]))}
        />
        {/* Rosette strokes draw in, then bloom 10% on the first long note */}
        <g transform={`translate(${CX} ${CY}) scale(${L.octagramRadius * 1.04 * bloom})`}>
          <path d={Y.paths.rosette} {...lineStyle} strokeWidth={1.5} opacity={0.55} {...drawn(inOut(frame, B.rosetteDraw[0], B.rosetteDraw[1]))} />
        </g>
        <path d={waveD(t)} {...lineStyle} strokeWidth={2.5} opacity={0.95} />
      </Art>
      <div
        style={{
          ...textBlock(790),
          fontFamily: DISPLAY,
          fontSize: 84,
          fontWeight: 700,
          lineHeight: 1.3,
          opacity: 1 - textOut,
          translate: `0px ${-24 * textOut}px`,
        }}
      >
        {/* Typed right-to-left inside a box sized to the full line */}
        <span style={{ position: "relative", display: "inline-block", whiteSpace: "nowrap" }}>
          <span style={{ visibility: "hidden" }}>{Y.copy.hook}</span>
          <span style={{ position: "absolute", top: 0, right: 0, whiteSpace: "nowrap" }}>
            {typed}
            <span
              style={{
                display: "inline-block",
                width: 5,
                height: 78,
                marginInlineStart: 10,
                verticalAlign: -10,
                background: C.cream,
                opacity: cursorOn ? 1 : 0,
              }}
            />
          </span>
        </span>
      </div>
      <div style={textBlock(806)}>
        <span
          style={{
            display: "inline-block",
            padding: "10px 48px 16px",
            border: `2px solid ${C.cream}`,
            borderRadius: 999,
            fontFamily: DISPLAY,
            fontSize: 58,
            fontWeight: 600,
            opacity: badge,
            scale: String(0.9 + 0.1 * badge),
          }}
        >
          {Y.copy.age}
        </span>
      </div>
    </Shell>
  );
};
