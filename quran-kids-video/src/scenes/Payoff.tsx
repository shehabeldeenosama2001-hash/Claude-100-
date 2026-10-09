import { Audio } from "@remotion/media";
import {
  AbsoluteFill,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { messiriFont, quranFont } from "../fonts";
import { Atmosphere, Camera } from "../motion/Atmosphere";
import { EASE_IN, progress } from "../motion/easing";
import { Words } from "../motion/Words";
import { CREAM, GOLD_GLOW, GOLD_LIGHT, SOFT_GLOW } from "../palette";

const OUT = 146;

// The child's voice reciting, drawn as a soft waveform
const VoiceWave: React.FC = () => {
  const frame = useCurrentFrame();
  const level = progress(frame, 6, 40) * (1 - progress(frame, OUT, 14, EASE_IN));

  return (
    <div
      style={{
        position: "absolute",
        left: 0,
        right: 0,
        top: 960 - 260,
        height: 520,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 10,
        opacity: 0.32 * level,
        filter: "blur(1px)",
      }}
    >
      {new Array(44).fill(true).map((_, i) => {
        const center = 1 - Math.abs(i - 21.5) / 22;
        const h =
          40 +
          center *
            420 *
            (0.35 +
              0.35 * Math.abs(Math.sin(frame / 6 + i * 0.7)) +
              0.3 * Math.abs(Math.sin(frame / 11 - i * 0.4)));
        return (
          <div
            key={i}
            style={{
              width: 10,
              height: h * level,
              borderRadius: 5,
              background: "linear-gradient(180deg, #FFE3A3, #F4B942)",
            }}
          />
        );
      })}
    </div>
  );
};

// "Imagine his voice reciting the Quran... and praying for you."
export const Payoff: React.FC = () => {
  const { fps } = useVideoConfig();

  return (
    <AbsoluteFill>
      <Camera duration={160} push={0.08}>
        <Atmosphere
          id="payoff"
          top="#1E1408"
          bottom="#6B4416"
          glow="rgba(255,200,120,0.5)"
          glowY={48}
          patternOpacity={0.05}
          particles={38}
        />
        <VoiceWave />
        <Words
          text={"تخيّل صوته\nوهو بيتلو القرآن"}
          at={8}
          out={70}
          stagger={6}
          inDuration={24}
          fontSize={116}
          fontFamily={messiriFont}
          color={CREAM}
          glow={SOFT_GLOW}
          style={{ top: 720 }}
        />
        <Words
          text="...وبيدعيلك"
          at={76}
          out={OUT}
          inDuration={26}
          scaleFrom={1.2}
          blur={32}
          distance={0}
          fontSize={176}
          fontFamily={messiriFont}
          color={GOLD_LIGHT}
          glow={GOLD_GLOW}
          style={{ top: 770 }}
        />
        <Words
          text="«أَوْ وَلَدٍ صَالِحٍ يَدْعُو لَهُ»"
          at={100}
          out={OUT}
          stagger={5}
          fontSize={74}
          fontFamily={quranFont}
          fontWeight={400}
          lineHeight={1.8}
          color="rgba(255,246,229,0.9)"
          style={{ top: 1040 }}
        />
        <Words
          text="رواه مسلم"
          at={114}
          out={OUT}
          fontSize={44}
          fontFamily={messiriFont}
          fontWeight={500}
          color="rgba(255,246,229,0.65)"
          style={{ top: 1210 }}
        />
      </Camera>
      <Audio src={staticFile("sfx/swell.wav")} premountFor={fps} volume={0.6} />
      <Audio src={staticFile("sfx/sparkle.wav")} from={78} premountFor={fps} volume={0.4} />
    </AbsoluteFill>
  );
};
