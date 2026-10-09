import { Audio } from "@remotion/media";
import { AbsoluteFill, Sequence, staticFile, useVideoConfig } from "remotion";
import { Y } from "./design";
import "./fonts";
import { Ayah } from "./scenes/Ayah";
import { Credit } from "./scenes/Credit";
import { Growing } from "./scenes/Growing";
import { Hook } from "./scenes/Hook";
import { Mother } from "./scenes/Mother";
import { Payoff } from "./scenes/Payoff";
import { Slogan } from "./scenes/Slogan";

type Props = {
  // Turn on once the child's recitation is in public/audio/recitation.wav
  readonly withRecitation: boolean;
};

// Each scene is held 18–24 frames past its end so the next one can wipe over it
export const YallaFilm: React.FC<Props> = ({ withRecitation }) => {
  const { fps } = useVideoConfig();

  return (
    <AbsoluteFill style={{ backgroundColor: Y.colors.background }}>
      <Sequence name="1–2 Hook + Age" durationInFrames={198} premountFor={fps}>
        <Hook />
      </Sequence>
      <Sequence name="3 Ayah card" from={180} durationInFrames={168} premountFor={fps}>
        <Ayah />
      </Sequence>
      <Sequence name="4 Mother witness" from={330} durationInFrames={174} premountFor={fps}>
        <Mother />
      </Sequence>
      <Sequence name="5 Growing up" from={480} durationInFrames={288} premountFor={fps}>
        <Growing />
      </Sequence>
      <Sequence name="6 Credit turn" from={750} durationInFrames={174} premountFor={fps}>
        <Credit />
      </Sequence>
      <Sequence name="7 Future payoff" from={900} durationInFrames={138} premountFor={fps}>
        <Payoff />
      </Sequence>
      <Sequence name="8 Slogan" from={1020} durationInFrames={120} premountFor={fps}>
        <Slogan />
      </Sequence>
      <Audio name="Room tone" src={staticFile(Y.audio.roomTone)} premountFor={fps} />
      {/* No music under the recitation: the pad file is silent until frame 480 */}
      <Audio name="Pad" src={staticFile(Y.audio.pad)} premountFor={fps} />
      {withRecitation ? <Audio name="Recitation" src={staticFile(Y.audio.recitation)} premountFor={fps} /> : null}
    </AbsoluteFill>
  );
};
