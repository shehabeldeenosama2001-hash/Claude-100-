import { useCurrentFrame } from "remotion";
import { B, CX, FPS, L, Y } from "../design";
import { DISPLAY } from "../fonts";
import { Art, drawn, inOut, IRIS, IrisEdge, lineStyle, octaClip, Shell, soft, textBlock } from "../kit";

const START = 480;
const cards = Y.transitions.iris.at.slice(0, 4);

// Scene 5 Growing up (frames 480–750)
export const Growing: React.FC = () => {
  const frame = useCurrentFrame();
  const film = frame + START;
  const ring = L.ring;
  // Progress ring fills clockwise, one quarter per card
  const filled = cards.reduce((sum, at) => sum + 0.25 * inOut(film, at + 4, at + 4 + B.ringFill), 0);
  // The child grows a step taller with each card
  const taller = cards.slice(1).reduce((sum, at) => sum + B.childStep * soft(film, at, 18), 0);
  const child = L.child;
  const base = child.y + 462;
  const starTurn = Math.max(0, film - 489) * (4 / FPS);

  return (
    <Shell start={START} enter="iris">
      {cards.map((at, i) => {
        const open = i === 0 ? 1 : inOut(film, at, at + IRIS);
        const next = cards[i + 1];
        const gone = next === undefined ? 0 : inOut(film, next, next + 10);
        return (
          <div key={at} style={{ position: "absolute", inset: 0, clipPath: i === 0 ? undefined : octaClip(CX, L.stageCenterY, 1500 * open), opacity: 1 - gone }}>
            <div style={{ ...textBlock(820), fontFamily: DISPLAY, fontSize: 150, fontWeight: 800, lineHeight: 1.3 }}>{Y.copy.chapters[i]}</div>
          </div>
        );
      })}
      <Art>
        <circle cx={CX} cy={ring.cy} r={ring.r} {...(lineStyle as React.SVGProps<SVGCircleElement>)} strokeWidth={2} opacity={0.25} />
        <circle
          cx={CX}
          cy={ring.cy}
          r={ring.r}
          transform={`rotate(-90 ${CX} ${ring.cy})`}
          {...(lineStyle as React.SVGProps<SVGCircleElement>)}
          strokeWidth={2}
          opacity={0.7}
          {...drawn(filled)}
        />
        <g transform={`rotate(${starTurn} ${CX} ${ring.cy})`}>
          <path
            d={Y.paths.khatam}
            transform={`translate(${CX} ${ring.cy}) scale(0.95)`}
            {...lineStyle}
            strokeWidth={1.5}
            opacity={0.6}
            {...drawn(inOut(film, 489, 519))}
          />
        </g>
        <g transform={`translate(0 ${base}) scale(1 ${1 + taller}) translate(0 ${-base})`}>
          <g transform={`translate(${child.x} ${child.y})`}>
            {Y.paths.child.map((d, i) => (
              <path key={d} d={d} {...lineStyle} strokeWidth={2.5} {...drawn(inOut(film, 492 + i * 3.6, 492 + i * 3.6 + 27))} />
            ))}
          </g>
        </g>
      </Art>
      {cards.slice(1).map((at) => (
        <IrisEdge key={at} progress={inOut(film, at, at + IRIS)} />
      ))}
    </Shell>
  );
};
