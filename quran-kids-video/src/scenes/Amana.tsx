import { Audio } from "@remotion/media";
import {
  AbsoluteFill,
  interpolate,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { messiriFont, quranFont } from "../fonts";
import { Atmosphere, Camera, LightRays } from "../motion/Atmosphere";
import { EASE_IN, EASE_IN_OUT, progress } from "../motion/easing";
import { Words } from "../motion/Words";
import { CREAM, GOLD_LIGHT, SOFT_GLOW } from "../palette";

// Night turns to dawn: "Your child is a trust... the greatest gift: the Quran"
export const Amana: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const dawn = progress(frame, 30, 90, EASE_IN_OUT);

  return (
    <AbsoluteFill>
      <Camera duration={135} push={0.1}>
        <Atmosphere
          id="night"
          top="#04080F"
          bottom="#0E1A2C"
          glow="rgba(90,120,190,0.22)"
          patternOpacity={0.03}
          particles={16}
          particleColor="190, 210, 255"
        />
        <AbsoluteFill style={{ opacity: dawn }}>
          <Atmosphere
            id="dawn"
            top="#0B2E3A"
            bottom="#C17B2C"
            glow="rgba(255,205,130,0.55)"
            glowY={88}
            glowSize={1800}
            patternOpacity={0.05}
            particles={34}
          />
        </AbsoluteFill>
        {/* The rising sun */}
        <div
          style={{
            position: "absolute",
            left: 540 - 520,
            top: interpolate(dawn, [0, 1], [2100, 1380]),
            width: 1040,
            height: 1040,
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(255,236,190,0.95) 0%, rgba(255,200,110,0.55) 30%, transparent 68%)",
            opacity: dawn,
          }}
        />
        <LightRays
          color="rgba(255,230,170,0.16)"
          opacity={progress(frame, 88, 30)}
          y={820}
        />
        <Words
          text="طفلك أمانة"
          at={6}
          out={50}
          stagger={8}
          inDuration={24}
          fontSize={150}
          fontFamily={messiriFont}
          color={CREAM}
          glow={SOFT_GLOW}
          style={{ top: 790 }}
        />
        <Words
          text="وأعظم هدية تقدّمها له..."
          at={52}
          out={88}
          stagger={4}
          fontSize={88}
          fontFamily={messiriFont}
          fontWeight={600}
          color={CREAM}
          glow={SOFT_GLOW}
          style={{ top: 820 }}
        />
        <Words
          text="القرآن"
          at={90}
          inDuration={26}
          scaleFrom={0.75}
          blur={36}
          distance={0}
          fontSize={300}
          fontFamily={quranFont}
          fontWeight={400}
          lineHeight={1.6}
          color={GOLD_LIGHT}
          glow="0 0 60px rgba(255,214,140,0.9), 0 0 140px rgba(255,190,90,0.6)"
          style={{ top: 600 }}
        />
      </Camera>
      {/* Burst of light into the logo reveal */}
      <AbsoluteFill
        style={{
          background:
            "radial-gradient(circle at 50% 45%, #FFFDF6 0%, #FFE8B8 60%, #F4B942 100%)",
          opacity: progress(frame, 116, 19, EASE_IN),
        }}
      />
      <Audio src={staticFile("sfx/whoosh.wav")} from={46} premountFor={fps} volume={0.35} />
      <Audio src={staticFile("sfx/riser.wav")} from={70} premountFor={fps} volume={0.7} />
    </AbsoluteFill>
  );
};
