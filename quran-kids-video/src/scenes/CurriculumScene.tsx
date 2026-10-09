import {
  AbsoluteFill,
  Easing,
  Interactive,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { Background } from "../Background";
import { FeatureCard } from "../FeatureCard";
import { balooFont } from "../fonts";

export const CurriculumScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return (
    <AbsoluteFill style={{ fontFamily: balooFont, direction: "rtl" }}>
      <Background
        name="Background"
        premountFor={fps}
        innerColor="#2C5A9E"
        outerColor="#14284F"
        patternColor="#FFF6E5"
      />
      <Interactive.Div
        name="Headline"
        style={{
          position: "absolute",
          top: 300,
          left: 80,
          right: 80,
          textAlign: "center",
          fontSize: 120,
          fontWeight: 800,
          lineHeight: 1.1,
          color: "#FFF6E5",
          opacity: interpolate(frame, [0, 0.5 * fps], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          }),
          translate: interpolate(frame, [0, 0.5 * fps], ["0px -50px", "0px 0px"], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
            easing: Easing.bezier(0.16, 1, 0.3, 1),
          }),
        }}
      >
        منهج متكامل
      </Interactive.Div>
      <FeatureCard
        name="Fiqh"
        from={0.6 * fps}
        premountFor={fps}
        icon="mosque"
        title="فقه"
        subtitle="أحكام العبادات"
        accentColor="#4C9BE0"
        style={{ top: 520, right: 80 }}
      />
      <FeatureCard
        name="Hadith"
        from={0.9 * fps}
        premountFor={fps}
        icon="scroll"
        title="حديث نبوي"
        subtitle="أحاديث وآداب نبوية"
        accentColor="#8E6CE0"
        style={{ top: 520, left: 80 }}
      />
      <FeatureCard
        name="Memorization"
        from={1.2 * fps}
        premountFor={fps}
        icon="rehal"
        title="تحفيظ"
        subtitle="حفظ ومراجعة بإتقان"
        accentColor="#FF7A59"
        style={{ top: 1060, right: 80 }}
      />
      <FeatureCard
        name="Reading"
        from={1.5 * fps}
        premountFor={fps}
        icon="reading"
        title="قراءة"
        subtitle="تلاوة صحيحة بالتجويد"
        accentColor="#2FB07C"
        style={{ top: 1060, left: 80 }}
      />
    </AbsoluteFill>
  );
};
