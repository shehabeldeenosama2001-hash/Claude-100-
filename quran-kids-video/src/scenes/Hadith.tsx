import { Audio } from "@remotion/media";
import {
  AbsoluteFill,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { messiriFont, quranFont } from "../fonts";
import { Atmosphere, Camera, LightRays } from "../motion/Atmosphere";
import { EASE_IN, EASE_OUT, progress } from "../motion/easing";
import { Words } from "../motion/Words";

// Thin gold rule with a diamond, drawn from the center outwards
const Ornament: React.FC<{ readonly top: number; readonly at: number; readonly out: number }> = ({
  top,
  at,
  out,
}) => {
  const frame = useCurrentFrame();
  const grow = progress(frame, at, 30, EASE_OUT) * (1 - progress(frame, out, 14, EASE_IN));

  return (
    <div
      style={{
        position: "absolute",
        top,
        left: 190,
        right: 190,
        height: 24,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        opacity: grow,
      }}
    >
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          height: 3,
          background:
            "linear-gradient(90deg, transparent, rgba(244,185,66,0.9), transparent)",
          scale: `${grow} 1`,
        }}
      />
      <div
        style={{
          width: 18,
          height: 18,
          backgroundColor: "#F4B942",
          rotate: `${45 + (1 - grow) * 180}deg`,
          boxShadow: "0 0 16px rgba(244,185,66,0.9)",
        }}
      />
    </div>
  );
};

export const Hadith: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return (
    <AbsoluteFill>
      <Camera duration={165} push={0.07}>
        <Atmosphere
          id="hadith"
          top="#04080F"
          bottom="#0E1A2C"
          glow="rgba(244,185,66,0.24)"
          glowY={47}
          patternOpacity={0.04}
          particles={30}
        />
        <LightRays
          color="rgba(244,185,66,0.12)"
          opacity={progress(frame, 0, 60) * (1 - progress(frame, 148, 16, EASE_IN))}
          y={930}
        />
        <Words
          text="قال رسول الله صلى الله عليه وسلم"
          at={8}
          out={146}
          stagger={3}
          fontSize={50}
          fontFamily={messiriFont}
          fontWeight={500}
          color="rgba(255,246,229,0.75)"
          style={{ top: 470 }}
        />
        <Ornament top={580} at={18} out={146} />
        <Words
          text={"كُلُّكُمْ رَاعٍ\nوَكُلُّكُمْ مَسْئُولٌ\nعَنْ رَعِيَّتِهِ"}
          at={28}
          out={148}
          stagger={9}
          outStagger={1}
          inDuration={28}
          distance={34}
          blur={26}
          fontSize={112}
          fontFamily={quranFont}
          fontWeight={400}
          lineHeight={1.7}
          color="#F8DC9C"
          glow="0 0 36px rgba(244,185,66,0.5)"
          style={{ top: 620 }}
        />
        <Ornament top={1330} at={70} out={146} />
        <Words
          text="رواه البخاري ومسلم"
          at={92}
          out={146}
          fontSize={46}
          fontFamily={messiriFont}
          fontWeight={500}
          color="rgba(255,246,229,0.7)"
          style={{ top: 1380 }}
        />
      </Camera>
      <Audio src={staticFile("sfx/swell.wav")} premountFor={fps} volume={0.7} />
    </AbsoluteFill>
  );
};
