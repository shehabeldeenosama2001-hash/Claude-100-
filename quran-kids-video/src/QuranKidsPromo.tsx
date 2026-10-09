import { linearTiming, TransitionSeries } from "@remotion/transitions";
import { fade } from "@remotion/transitions/fade";
import { AbsoluteFill, useVideoConfig } from "remotion";
import { Finish } from "./motion/Atmosphere";
import { Amana } from "./scenes/Amana";
import { ColdOpen } from "./scenes/ColdOpen";
import { Cta } from "./scenes/Cta";
import { Curriculum } from "./scenes/Curriculum";
import { Distraction } from "./scenes/Distraction";
import { Hadith } from "./scenes/Hadith";
import { LogoReveal } from "./scenes/LogoReveal";
import { OneOnOne } from "./scenes/OneOnOne";
import { Payoff } from "./scenes/Payoff";

// 9 scenes joined by 12-frame crossfades: 1415 - 8 * 12 = 1319 frames
export const QuranKidsPromo: React.FC = () => {
  const { fps } = useVideoConfig();

  return (
    <AbsoluteFill style={{ backgroundColor: "black" }}>
      <TransitionSeries>
        <TransitionSeries.Sequence name="Cold open" durationInFrames={135} premountFor={fps}>
          <ColdOpen />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={fade()} timing={linearTiming({ durationInFrames: 12 })} />
        <TransitionSeries.Sequence name="Distraction" durationInFrames={190} premountFor={fps}>
          <Distraction />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={fade()} timing={linearTiming({ durationInFrames: 12 })} />
        <TransitionSeries.Sequence name="Hadith" durationInFrames={165} premountFor={fps}>
          <Hadith />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={fade()} timing={linearTiming({ durationInFrames: 12 })} />
        <TransitionSeries.Sequence name="Amana" durationInFrames={135} premountFor={fps}>
          <Amana />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={fade()} timing={linearTiming({ durationInFrames: 12 })} />
        <TransitionSeries.Sequence name="Logo reveal" durationInFrames={120} premountFor={fps}>
          <LogoReveal />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={fade()} timing={linearTiming({ durationInFrames: 12 })} />
        <TransitionSeries.Sequence name="One-on-one" durationInFrames={150} premountFor={fps}>
          <OneOnOne />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={fade()} timing={linearTiming({ durationInFrames: 12 })} />
        <TransitionSeries.Sequence name="Curriculum" durationInFrames={190} premountFor={fps}>
          <Curriculum />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={fade()} timing={linearTiming({ durationInFrames: 12 })} />
        <TransitionSeries.Sequence name="Payoff" durationInFrames={160} premountFor={fps}>
          <Payoff />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={fade()} timing={linearTiming({ durationInFrames: 12 })} />
        <TransitionSeries.Sequence name="Call to action" durationInFrames={170} premountFor={fps}>
          <Cta />
        </TransitionSeries.Sequence>
      </TransitionSeries>
      <Finish />
    </AbsoluteFill>
  );
};
