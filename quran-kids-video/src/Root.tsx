import { Composition, Folder, Still } from "remotion";
import { FeatureCard } from "./FeatureCard";
import { Logo } from "./Logo";
import { LogoPoster } from "./LogoPoster";
import { QuranKidsPromo } from "./QuranKidsPromo";
import { CurriculumScene } from "./scenes/CurriculumScene";
import { HookScene } from "./scenes/HookScene";
import { IntroScene } from "./scenes/IntroScene";
import { OneOnOneScene } from "./scenes/OneOnOneScene";
import { OutroScene } from "./scenes/OutroScene";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="QuranKidsPromo"
        component={QuranKidsPromo}
        durationInFrames={570}
        fps={30}
        width={1080}
        height={1920}
      />
      <Still id="LogoPoster" component={LogoPoster} width={1080} height={1080} />
      <Folder name="Scenes">
        <Composition
          id="Intro"
          component={IntroScene}
          durationInFrames={105}
          fps={30}
          width={1080}
          height={1920}
        />
        <Composition
          id="Hook"
          component={HookScene}
          durationInFrames={90}
          fps={30}
          width={1080}
          height={1920}
        />
        <Composition
          id="OneOnOne"
          component={OneOnOneScene}
          durationInFrames={120}
          fps={30}
          width={1080}
          height={1920}
        />
        <Composition
          id="Curriculum"
          component={CurriculumScene}
          durationInFrames={180}
          fps={30}
          width={1080}
          height={1920}
        />
        <Composition
          id="Outro"
          component={OutroScene}
          durationInFrames={135}
          fps={30}
          width={1080}
          height={1920}
        />
      </Folder>
      <Folder name="Elements">
        <Composition
          id="Logo"
          component={Logo}
          durationInFrames={60}
          fps={30}
          width={1080}
          height={1080}
          defaultProps={{
            brandName: "نور القرآن",
            tagline: "لتعليم القرآن للأطفال",
            primaryColor: "#0F6B5A",
            accentColor: "#F4B942",
            textColor: "#0A4A3E",
            markSize: 420,
          }}
        />
        <Composition
          id="FeatureCard"
          component={FeatureCard}
          durationInFrames={45}
          fps={30}
          width={600}
          height={660}
          defaultProps={{
            icon: "rehal",
            title: "تحفيظ",
            subtitle: "حفظ ومراجعة بإتقان",
            accentColor: "#FF7A59",
            style: { top: 80, left: 80 },
          }}
        />
      </Folder>
    </>
  );
};
