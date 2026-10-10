import { Composition } from "remotion";
import { FamilyFilm } from "./family/FamilyFilm";
import { YallaFilm } from "./YallaFilm";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="YallaFilm"
        component={YallaFilm}
        durationInFrames={1140}
        fps={30}
        width={1080}
        height={1920}
        defaultProps={{ withRecitation: false }}
      />
      <Composition
        id="YallaFamily"
        component={FamilyFilm}
        durationInFrames={1327}
        fps={30}
        width={1080}
        height={1920}
        defaultProps={{ voiceoverSrc: null }}
      />
    </>
  );
};
