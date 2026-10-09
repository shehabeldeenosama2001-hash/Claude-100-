import { Audio } from "@remotion/media";
import {
  AbsoluteFill,
  interpolate,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { messiriFont } from "../fonts";
import { Atmosphere, Camera, TimeRing } from "../motion/Atmosphere";
import { EASE_IN_OUT, progress } from "../motion/easing";
import { Words } from "../motion/Words";
import { CREAM, SOFT_GLOW } from "../palette";

// "Every day that passes... your child grows up."
export const ColdOpen: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return (
    <AbsoluteFill style={{ backgroundColor: "black" }}>
      <Camera duration={135} push={0.09}>
        <Atmosphere
          id="cold"
          top="#03060C"
          bottom="#0B1526"
          glow="rgba(70,110,190,0.28)"
          glowY={45}
          patternOpacity={0.03}
          particles={18}
          particleColor="190, 210, 255"
        />
        <TimeRing
          progress={interpolate(frame, [0, 135], [0, 0.42], {
            easing: EASE_IN_OUT,
          })}
          opacity={progress(frame, 4, 30) * 0.6}
          y={900}
        />
        <Words
          text="كل يوم بيعدّي..."
          at={16}
          out={60}
          stagger={6}
          fontSize={92}
          fontFamily={messiriFont}
          fontWeight={600}
          color="rgba(255,246,229,0.82)"
          glow={SOFT_GLOW}
          style={{ top: 830 }}
        />
        <Words
          text="طفلك بيكبر."
          at={68}
          out={118}
          stagger={7}
          inDuration={26}
          scaleFrom={1.12}
          blur={30}
          fontSize={160}
          fontFamily={messiriFont}
          color={CREAM}
          glow={SOFT_GLOW}
          style={{ top: 790 }}
        />
      </Camera>
      <AbsoluteFill
        style={{
          backgroundColor: "black",
          opacity: 1 - progress(frame, 0, 22),
        }}
      />
      <Audio src={staticFile("sfx/tick.wav")} from={8} premountFor={fps} volume={0.5} />
      <Audio src={staticFile("sfx/tock.wav")} from={38} premountFor={fps} volume={0.5} />
      <Audio src={staticFile("sfx/tick.wav")} from={68} premountFor={fps} volume={0.55} />
      <Audio src={staticFile("sfx/tock.wav")} from={98} premountFor={fps} volume={0.6} />
      <Audio src={staticFile("sfx/tick.wav")} from={128} premountFor={fps} volume={0.6} />
    </AbsoluteFill>
  );
};
