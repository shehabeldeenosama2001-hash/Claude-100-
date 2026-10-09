import { useCurrentFrame } from "remotion";
import { B, C, FPS, L, Y } from "../design";
import { Art, clamp01, drawn, lineStyle, out, Shell } from "../kit";

const START = 900;

// Scene 7 Future payoff (frames 900–1020)
export const Payoff: React.FC = () => {
  const frame = useCurrentFrame();
  const film = frame + START;
  const t = frame / FPS;
  const crown = out(film, B.crownIn[0], B.crownIn[1]);
  const sparkle = clamp01((t - 0.6) / 0.8);

  return (
    <Shell start={START} enter="iris">
      <Art>
        <g transform={`translate(${L.silhouette.x} ${L.payoffSilhouetteY})`}>
          {Y.paths.mother.map((d) => (
            <path key={d} d={d} {...lineStyle} strokeWidth={2.5} />
          ))}
        </g>
        {/* The crown descends gently above her */}
        <g transform={`translate(${L.crown.x} ${L.crown.y - B.crownDrop * (1 - crown)})`} opacity={crown}>
          {Y.paths.crown.map((d) => (
            <path key={d} d={d} {...lineStyle} strokeWidth={2} {...drawn(crown)} />
          ))}
        </g>
        {/* At most 12 fine star particles, drifting slowly */}
        {Y.particles.map((p) => {
          const r = p.size;
          const q = r * 0.22;
          return (
            <path
              key={`${p.x}-${p.y}`}
              d={`M0 ${-r} L${q} ${-q} L${r} 0 L${q} ${q} L0 ${r} L${-q} ${q} L${-r} 0 L${-q} ${-q} Z`}
              fill={C.cream}
              transform={`translate(${p.x} ${(p.y - t * 14).toFixed(1)})`}
              opacity={sparkle * (0.3 + 0.35 * (1 + Math.sin(t * 1.6 + p.phase)))}
            />
          );
        })}
      </Art>
    </Shell>
  );
};
