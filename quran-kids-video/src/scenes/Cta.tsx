import { Audio } from "@remotion/media";
import {
  AbsoluteFill,
  interpolate,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { balooFont, messiriFont } from "../fonts";
import { AnimatedLogoMark } from "../motion/AnimatedLogo";
import { Atmosphere, Camera, TimeRing } from "../motion/Atmosphere";
import { BACK_OUT, EASE_IN_OUT, EASE_OUT, progress, reveal } from "../motion/easing";
import { Words } from "../motion/Words";
import { CREAM, GOLD, GOLD_GLOW, INK, SOFT_GLOW } from "../palette";

const recap = ["دروس فردية", "فقه", "حديث نبوي", "تحفيظ", "قراءة"];

export const Cta: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const button = progress(frame, 58, 22, BACK_OUT);
  const shine = ((frame - 80) % 50) / 50;
  const pulse = frame > 90 ? Math.sin((frame - 90) / 7) * 0.025 : 0;

  return (
    <AbsoluteFill>
      <Camera duration={170} push={0.04}>
        <Atmosphere
          id="cta"
          top="#106B5B"
          bottom="#052B25"
          glow="rgba(255,214,140,0.34)"
          glowY={30}
          patternOpacity={0.08}
          particles={34}
        />
        <TimeRing
          progress={interpolate(frame, [0, 170], [0.42, 0.62], { easing: EASE_IN_OUT })}
          opacity={progress(frame, 20, 30) * 0.22}
          size={1000}
          y={860}
        />
        <div
          style={{
            position: "absolute",
            left: 540 - 125,
            top: 250,
            ...reveal(frame, { at: 0, inDuration: 22, scaleFrom: 0.6, distance: -40 }),
          }}
        >
          <div style={{ filter: "drop-shadow(0 20px 36px rgba(0,0,0,0.4))" }}>
            <AnimatedLogoMark size={250} delay={-200} id="cta" />
          </div>
        </div>
        <Words
          text="نور القرآن"
          at={8}
          fontSize={64}
          fontFamily={balooFont}
          fontWeight={800}
          color={CREAM}
          style={{ top: 510 }}
        />
        <Words
          text="ابدأ معاه النهارده"
          at={18}
          stagger={6}
          inDuration={24}
          scaleFrom={1.1}
          fontSize={128}
          fontFamily={balooFont}
          fontWeight={800}
          lineHeight={1.15}
          color={CREAM}
          glow={SOFT_GLOW}
          style={{ top: 690 }}
        />
        <Words
          text="قبل ما يفوت الوقت"
          at={38}
          stagger={5}
          fontSize={74}
          fontFamily={messiriFont}
          color={GOLD}
          glow={GOLD_GLOW}
          style={{ top: 890 }}
        />
        <div
          style={{
            position: "absolute",
            top: 1090,
            left: 120,
            right: 120,
            padding: "30px 0",
            borderRadius: 999,
            backgroundColor: GOLD,
            overflow: "hidden",
            textAlign: "center",
            direction: "rtl",
            fontFamily: balooFont,
            fontWeight: 800,
            fontSize: 96,
            lineHeight: 1.2,
            color: INK,
            boxShadow: `0 24px 50px rgba(0,0,0,0.4), 0 0 ${40 + pulse * 1200}px rgba(244,185,66,0.55)`,
            opacity: Math.min(button, 1),
            scale: String(interpolate(button, [0, 1], [0.4, 1]) + pulse),
            filter: `blur(${(1 - Math.min(button, 1)) * 16}px)`,
          }}
        >
          <div
            style={{
              position: "absolute",
              top: -40,
              bottom: -40,
              width: 160,
              left: interpolate(shine, [0, 1], [-220, 1100]),
              background:
                "linear-gradient(90deg, transparent, rgba(255,255,255,0.75), transparent)",
              rotate: "20deg",
              opacity: frame > 80 ? 1 : 0,
            }}
          />
          <span style={{ position: "relative" }}>سجّل طفلك الآن</span>
        </div>
        <div
          style={{
            position: "absolute",
            top: 1350,
            left: 80,
            right: 80,
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "center",
            gap: 20,
            direction: "rtl",
          }}
        >
          {recap.map((item, i) => {
            const enter = progress(frame, 84 + i * 6, 18, EASE_OUT);
            return (
              <div
                key={item}
                style={{
                  padding: "14px 34px",
                  borderRadius: 999,
                  background: "rgba(255,246,229,0.1)",
                  border: "2px solid rgba(255,246,229,0.25)",
                  fontFamily: balooFont,
                  fontWeight: 700,
                  fontSize: 48,
                  color: CREAM,
                  opacity: enter,
                  translate: `0px ${(1 - enter) * 50}px`,
                  filter: `blur(${(1 - enter) * 12}px)`,
                }}
              >
                {item}
              </div>
            );
          })}
        </div>
      </Camera>
      <Audio src={staticFile("sfx/whoosh.wav")} premountFor={fps} volume={0.4} />
      <Audio src={staticFile("sfx/boom.wav")} from={58} premountFor={fps} volume={0.45} />
      <Audio src={staticFile("sfx/sparkle.wav")} from={84} premountFor={fps} volume={0.35} />
    </AbsoluteFill>
  );
};
