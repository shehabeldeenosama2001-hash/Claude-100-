import { springTiming, TransitionSeries } from "@remotion/transitions";
import { fade } from "@remotion/transitions/fade";
import { slide } from "@remotion/transitions/slide";
import { useVideoConfig } from "remotion";
import { CurriculumScene } from "./scenes/CurriculumScene";
import { HookScene } from "./scenes/HookScene";
import { IntroScene } from "./scenes/IntroScene";
import { OneOnOneScene } from "./scenes/OneOnOneScene";
import { OutroScene } from "./scenes/OutroScene";

export const QuranKidsPromo: React.FC = () => {
  const { fps } = useVideoConfig();

  return (
    <TransitionSeries>
      <TransitionSeries.Sequence
        name="Intro"
        durationInFrames={105}
        premountFor={fps}
      >
        <IntroScene />
      </TransitionSeries.Sequence>
      <TransitionSeries.Transition
        presentation={fade()}
        timing={springTiming({ config: { damping: 200 }, durationInFrames: 15 })}
      />
      <TransitionSeries.Sequence
        name="Hook"
        durationInFrames={90}
        premountFor={fps}
      >
        <HookScene />
      </TransitionSeries.Sequence>
      <TransitionSeries.Transition
        presentation={slide({ direction: "from-left" })}
        timing={springTiming({ config: { damping: 200 }, durationInFrames: 15 })}
      />
      <TransitionSeries.Sequence
        name="One-on-one lessons"
        durationInFrames={120}
        premountFor={fps}
      >
        <OneOnOneScene />
      </TransitionSeries.Sequence>
      <TransitionSeries.Transition
        presentation={slide({ direction: "from-left" })}
        timing={springTiming({ config: { damping: 200 }, durationInFrames: 15 })}
      />
      <TransitionSeries.Sequence
        name="Curriculum"
        durationInFrames={180}
        premountFor={fps}
      >
        <CurriculumScene />
      </TransitionSeries.Sequence>
      <TransitionSeries.Transition
        presentation={fade()}
        timing={springTiming({ config: { damping: 200 }, durationInFrames: 15 })}
      />
      <TransitionSeries.Sequence
        name="Outro"
        durationInFrames={135}
        premountFor={fps}
      >
        <OutroScene />
      </TransitionSeries.Sequence>
    </TransitionSeries>
  );
};
