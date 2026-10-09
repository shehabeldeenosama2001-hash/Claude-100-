import {
  AbsoluteFill,
  Easing,
  Interactive,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { Background } from "../Background";
import { balooFont } from "../fonts";
import { Logo } from "../Logo";

export const OutroScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return (
    <AbsoluteFill
      style={{ fontFamily: balooFont, direction: "rtl", textAlign: "center" }}
    >
      <Background
        name="Background"
        premountFor={fps}
        innerColor="#138A72"
        outerColor="#0A4A3E"
        patternColor="#FFF6E5"
      />
      <Logo
        name="Logo"
        premountFor={fps}
        brandName="نور القرآن"
        tagline="لتعليم القرآن للأطفال"
        primaryColor="#0F6B5A"
        accentColor="#F4B942"
        textColor="#FFF6E5"
        markSize={360}
        style={{ translate: "0px -300px" }}
      />
      <Interactive.Div
        name="CTA button"
        style={{
          position: "absolute",
          top: 1180,
          left: 140,
          right: 140,
          padding: "26px 0",
          borderRadius: 999,
          backgroundColor: "#F4B942",
          color: "#0A4A3E",
          fontSize: 92,
          fontWeight: 800,
          lineHeight: 1.2,
          boxShadow: "0 20px 44px rgba(0,0,0,0.35)",
          opacity: interpolate(frame, [1.1 * fps, 1.4 * fps], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          }),
          scale: interpolate(
            frame,
            [1.1 * fps, 1.6 * fps, 2.2 * fps, 2.6 * fps, 3 * fps, 3.4 * fps],
            [0.5, 1, 1.07, 1, 1.07, 1],
            {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
              easing: Easing.bezier(0.45, 0, 0.55, 1),
              output: "perceptual-scale",
            },
          ),
        }}
      >
        سجّل طفلك الآن
      </Interactive.Div>
      <Interactive.Div
        name="Recap"
        style={{
          position: "absolute",
          top: 1420,
          left: 80,
          right: 80,
          fontSize: 50,
          fontWeight: 600,
          lineHeight: 1.5,
          color: "#FFF6E5",
          opacity: interpolate(frame, [1.6 * fps, 2 * fps], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          }),
        }}
      >
        دروس فردية
        <br />
        فقه • حديث نبوي • تحفيظ • قراءة
      </Interactive.Div>
    </AbsoluteFill>
  );
};
