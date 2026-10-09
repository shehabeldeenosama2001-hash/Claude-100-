import { useCurrentFrame } from "remotion";
import { B, C, CX, L, Y } from "../design";
import { DISPLAY } from "../fonts";
import { Art, drawn, inOut, lineStyle, octaPoints, Shell, textBlock } from "../kit";

const START = 1020;

// Scene 8 Slogan (frames 1020–1140). White is used here and nowhere else.
export const Slogan: React.FC = () => {
  const frame = useCurrentFrame();
  const film = frame + START;
  const a = inOut(film, B.sloganAIn[0], B.sloganAIn[1]);
  // After a 20-frame hold, the second half reveals right-to-left
  const b = inOut(film, B.sloganBReveal[0], B.sloganBReveal[1]);
  const word = inOut(film, B.logoWordDraw[0], B.logoWordDraw[1]);

  return (
    <Shell start={START} enter="sweep">
      <div style={{ ...textBlock(690), fontFamily: DISPLAY, fontSize: 116, fontWeight: 800, lineHeight: 1.3, color: C.slogan, opacity: a }}>
        {Y.copy.sloganA}
      </div>
      <div
        style={{
          ...textBlock(860),
          fontFamily: DISPLAY,
          fontSize: 160,
          fontWeight: 900,
          lineHeight: 1.3,
          color: C.slogan,
          clipPath: `inset(0% 0% 0% ${(100 * (1 - b)).toFixed(2)}%)`,
        }}
      >
        {Y.copy.sloganB}
      </div>
      {/* Logo: the word revealed right-to-left inside a drawn octagram */}
      <Art>
        <polygon
          points={octaPoints(CX, L.logo.cy, L.logo.r)}
          {...(lineStyle as React.SVGProps<SVGPolygonElement>)}
          strokeWidth={2}
          opacity={0.7}
          {...drawn(inOut(film, B.logoStarDraw[0], B.logoStarDraw[1]))}
        />
      </Art>
      <div style={{ ...textBlock(L.logo.cy - 100), height: 200, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <span
          style={{
            display: "inline-block",
            fontFamily: DISPLAY,
            fontSize: 104,
            fontWeight: 800,
            lineHeight: 1,
            translate: "0px -6px",
            clipPath: `inset(0% 0% 0% ${(100 * (1 - word)).toFixed(2)}%)`,
          }}
        >
          {Y.copy.logo}
        </span>
      </div>
    </Shell>
  );
};
