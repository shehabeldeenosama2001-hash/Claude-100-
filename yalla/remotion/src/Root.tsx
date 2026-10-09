import { Composition } from "remotion";
import { YallaFilm } from "./YallaFilm";

export const RemotionRoot: React.FC = () => {
  return (
    <Composition
      id="YallaFilm"
      component={YallaFilm}
      durationInFrames={1140}
      fps={30}
      width={1080}
      height={1920}
      defaultProps={{ withRecitation: false }}
    />
  );
};
