import { useCurrentFrame } from "remotion";
import { B, L, Y } from "../design";
import { DISPLAY } from "../fonts";
import { Art, drawn, inOut, lineStyle, Shell, textBlock, Words } from "../kit";

const START = 330;

// Scene 4 Mother witness (frames 330–480)
export const Mother: React.FC = () => {
  const frame = useCurrentFrame();
  const film = frame + START;
  const [d0, d1] = B.silhouetteDraw;
  const each = 30;
  const step = (d1 - d0 - each) / (Y.paths.mother.length - 1);

  return (
    <Shell start={START} enter="sweep">
      <Art>
        <g transform={`translate(${L.silhouette.x} ${L.silhouette.y})`}>
          {Y.paths.mother.map((d, i) => (
            <path key={d} d={d} {...lineStyle} strokeWidth={2.5} {...drawn(inOut(film, d0 + i * step, d0 + i * step + each))} />
          ))}
        </g>
      </Art>
      <div style={{ ...textBlock(1250), fontFamily: DISPLAY, fontSize: 66, fontWeight: 600, lineHeight: 1.4 }}>
        <Words text={Y.copy.mother} at={B.motherWordsAt} frame={film} />
      </div>
    </Shell>
  );
};
