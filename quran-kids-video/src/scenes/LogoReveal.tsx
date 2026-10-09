import { Audio } from "@remotion/media";
import {
  AbsoluteFill,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { balooFont } from "../fonts";
import { AnimatedLogoMark } from "../motion/AnimatedLogo";
import { Atmosphere, Camera, LightRays } from "../motion/Atmosphere";
import { EASE_OUT, progress, reveal } from "../motion/easing";
import { Words } from "../motion/Words";
import { CREAM, GOLD, SOFT_GLOW } from "../palette";

export const LogoReveal: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return (
    <AbsoluteFill>
      <Camera duration={120} push={0.05}>
        <Atmosphere
          id="logo"
          top="#0F5E50"
          bottom="#052B25"
          glow="rgba(255,214,140,0.38)"
          glowY={36}
          patternOpacity={0.08}
          particles={34}
        />
        <LightRays color="rgba(255,230,170,0.15)" opacity={1} y={690} />
        <div
          style={{
            position: "absolute",
            left: 540 - 270,
            top: 520,
            ...reveal(frame, { at: 0, out: 102, inDuration: 1, blur: 24, outDistance: 90 }),
          }}
        >
          <div style={{ filter: "drop-shadow(0 30px 50px rgba(0,0,0,0.45))" }}>
            <AnimatedLogoMark size={540} delay={4} id="reveal" />
          </div>
        </div>
        <Words
          text="نور القرآن"
          at={40}
          out={100}
          stagger={6}
          inDuration={24}
          scaleFrom={1.15}
          fontSize={156}
          fontFamily={balooFont}
          fontWeight={800}
          lineHeight={1.15}
          color={CREAM}
          glow={SOFT_GLOW}
          style={{ top: 1110 }}
        />
        <Words
          text="لتعليم القرآن الكريم للأطفال"
          at={58}
          out={98}
          stagger={3}
          fontSize={60}
          fontFamily={balooFont}
          fontWeight={600}
          color={GOLD}
          style={{ top: 1310 }}
        />
      </Camera>
      {/* Fading out of the white burst from the previous scene */}
      <AbsoluteFill
        style={{
          background:
            "radial-gradient(circle at 50% 45%, #FFFDF6 0%, #FFE8B8 60%, #F4B942 100%)",
          opacity: 1 - progress(frame, 0, 22, EASE_OUT),
        }}
      />
      <Audio src={staticFile("sfx/boom.wav")} premountFor={fps} volume={0.55} />
      <Audio src={staticFile("sfx/sparkle.wav")} from={46} premountFor={fps} volume={0.6} />
    </AbsoluteFill>
  );
};
