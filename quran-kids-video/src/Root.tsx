import { Composition, Folder, Still } from "remotion";
import { LogoPoster } from "./LogoPoster";
import { QuranKidsPromo } from "./QuranKidsPromo";
import { Amana } from "./scenes/Amana";
import { ColdOpen } from "./scenes/ColdOpen";
import { Cta } from "./scenes/Cta";
import { Curriculum } from "./scenes/Curriculum";
import { Distraction } from "./scenes/Distraction";
import { Hadith } from "./scenes/Hadith";
import { LogoReveal } from "./scenes/LogoReveal";
import { OneOnOne } from "./scenes/OneOnOne";
import { Payoff } from "./scenes/Payoff";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="QuranKidsPromo"
        component={QuranKidsPromo}
        durationInFrames={1319}
        fps={30}
        width={1080}
        height={1920}
      />
      <Still id="LogoPoster" component={LogoPoster} width={1080} height={1080} />
      <Folder name="Scenes">
        <Composition id="ColdOpen" component={ColdOpen} durationInFrames={135} fps={30} width={1080} height={1920} />
        <Composition id="Distraction" component={Distraction} durationInFrames={190} fps={30} width={1080} height={1920} />
        <Composition id="Hadith" component={Hadith} durationInFrames={165} fps={30} width={1080} height={1920} />
        <Composition id="Amana" component={Amana} durationInFrames={135} fps={30} width={1080} height={1920} />
        <Composition id="LogoReveal" component={LogoReveal} durationInFrames={120} fps={30} width={1080} height={1920} />
        <Composition id="OneOnOne" component={OneOnOne} durationInFrames={150} fps={30} width={1080} height={1920} />
        <Composition id="Curriculum" component={Curriculum} durationInFrames={190} fps={30} width={1080} height={1920} />
        <Composition id="Payoff" component={Payoff} durationInFrames={160} fps={30} width={1080} height={1920} />
        <Composition id="Cta" component={Cta} durationInFrames={170} fps={30} width={1080} height={1920} />
      </Folder>
    </>
  );
};
