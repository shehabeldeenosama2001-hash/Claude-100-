import { useCurrentFrame } from "remotion";
import { B, Y } from "../design";
import { DISPLAY } from "../fonts";
import { inOut, Shell, textBlock, Words } from "../kit";

const START = 750;

// Scene 6 Credit turn (frames 750–900)
export const Credit: React.FC = () => {
  const frame = useCurrentFrame();
  const film = frame + START;
  // The lattice turns 3° more and brightens 10%
  const lift = inOut(frame, 0, 150);
  const firstLineWords = Y.copy.credit[0].split(" ").length;

  return (
    <Shell start={START} enter="sweep" extraTurn={B.latticeTurnDeg * lift} brighten={B.latticeBrighten * lift}>
      <div style={{ ...textBlock(760), fontFamily: DISPLAY, fontSize: 92, fontWeight: 700, lineHeight: 1.45 }}>
        <div>
          <Words text={Y.copy.credit[0]} at={B.creditWordsAt} frame={film} />
        </div>
        <div>
          <Words text={Y.copy.credit[1]} at={B.creditWordsAt} frame={film} indexOffset={firstLineWords} />
        </div>
      </div>
    </Shell>
  );
};
