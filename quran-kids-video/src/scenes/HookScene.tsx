import {
  AbsoluteFill,
  Easing,
  Interactive,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { Background } from "../Background";
import { balooFont, quranFont } from "../fonts";

export const HookScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return (
    <AbsoluteFill
      style={{
        fontFamily: balooFont,
        direction: "rtl",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
      }}
    >
      <Background
        name="Background"
        premountFor={fps}
        innerColor="#1B6FA8"
        outerColor="#0B3558"
        patternColor="#FFF6E5"
      />
      <Interactive.Div
        name="Kicker"
        style={{
          fontSize: 120,
          fontWeight: 800,
          color: "#F4B942",
          lineHeight: 1.1,
          opacity: interpolate(frame, [0, 0.5 * fps], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          }),
          translate: interpolate(frame, [0, 0.5 * fps], ["0px 60px", "0px 0px"], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
            easing: Easing.bezier(0.16, 1, 0.3, 1),
          }),
        }}
      >
        علّم طفلك
      </Interactive.Div>
      <Interactive.Div
        name="Quran title"
        style={{
          fontFamily: quranFont,
          fontSize: 190,
          color: "#FFF6E5",
          lineHeight: 1.6,
          textShadow: "0 12px 40px rgba(0,0,0,0.35)",
          scale: interpolate(frame, [0.3 * fps, 0.9 * fps], [0.4, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
            easing: Easing.spring({ damping: 12 }),
            output: "perceptual-scale",
          }),
          opacity: interpolate(frame, [0.3 * fps, 0.6 * fps], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          }),
        }}
      >
        القرآن الكريم
      </Interactive.Div>
      <Interactive.Div
        name="Promise pill"
        style={{
          marginTop: 70,
          padding: "18px 56px",
          borderRadius: 999,
          backgroundColor: "#FF7A59",
          color: "#FFF6E5",
          fontSize: 64,
          fontWeight: 700,
          boxShadow: "0 16px 36px rgba(0,0,0,0.3)",
          opacity: interpolate(frame, [0.9 * fps, 1.3 * fps], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          }),
          scale: interpolate(frame, [0.9 * fps, 1.4 * fps], [0.6, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
            easing: Easing.spring({ damping: 10 }),
            output: "perceptual-scale",
          }),
        }}
      >
        بأسلوب ممتع وبسيط
      </Interactive.Div>
    </AbsoluteFill>
  );
};
