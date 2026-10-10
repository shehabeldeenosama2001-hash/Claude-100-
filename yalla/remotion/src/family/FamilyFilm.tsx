import { Audio } from "@remotion/media";
import { AbsoluteFill, Sequence, staticFile, useVideoConfig } from "remotion";
import { Y } from "../design";
import "../fonts";
import { ClosingScene, DaughterScene, FatherScene, HookScene, MotherScene, SonScene } from "./scenes";

type Props = {
  // A voiceover file in public/ (e.g. "audio/family-voice.wav"), once recorded
  readonly voiceoverSrc: string | null;
};

// Each scene overlaps the next by the length of its dissolve or whip pan
export const FamilyFilm: React.FC<Props> = ({ voiceoverSrc }) => {
  const { fps } = useVideoConfig();

  return (
    <AbsoluteFill style={{ backgroundColor: Y.colors.navy }}>
      <Sequence name="0 Hook · mother, dolly in" durationInFrames={166} premountFor={fps}>
        <HookScene />
      </Sequence>
      <Sequence name="1 Mother · orbit left" from={158} durationInFrames={255} premountFor={fps}>
        <MotherScene />
      </Sequence>
      <Sequence name="2 Father · tilt up" from={405} durationInFrames={240} premountFor={fps}>
        <FatherScene length={240} />
      </Sequence>
      <Sequence name="3 Son · whip pan" from={635} durationInFrames={168} premountFor={fps}>
        <SonScene />
      </Sequence>
      <Sequence name="4 Daughter · dolly out" from={795} durationInFrames={180} premountFor={fps}>
        <DaughterScene />
      </Sequence>
      <Sequence name="5 Closing · family + end card" from={967} durationInFrames={360} premountFor={fps}>
        <ClosingScene />
      </Sequence>
      {/* Bed and transition effects, mixed with FFmpeg by shared/make-family-audio.sh */}
      <Audio name="Music and effects" src={staticFile(Y.audio.familyMix)} premountFor={fps} />
      {voiceoverSrc ? <Audio name="Voiceover" src={staticFile(voiceoverSrc)} premountFor={fps} /> : null}
    </AbsoluteFill>
  );
};
