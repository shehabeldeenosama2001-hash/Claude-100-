import {
  AbsoluteFill,
  Easing,
  Interactive,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { Background } from "../Background";
import { balooFont } from "../fonts";
import { OneOnOneIcon } from "../Icons";

export const OneOnOneScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const pop = spring({ frame, fps, config: { damping: 10, mass: 0.8 } });

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
        innerColor="#138A72"
        outerColor="#0A4A3E"
        patternColor="#FFF6E5"
      />
      <div
        style={{
          width: 520,
          height: 520,
          borderRadius: "50%",
          backgroundColor: "#FF7A59",
          border: "14px solid #FFF6E5",
          boxShadow: "0 30px 60px rgba(0,0,0,0.35)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          scale: String(pop),
        }}
      >
        <OneOnOneIcon size={340} color="#FFF6E5" />
      </div>
      <Interactive.Div
        name="Title"
        style={{
          marginTop: 60,
          fontSize: 140,
          fontWeight: 800,
          lineHeight: 1.1,
          color: "#F4B942",
          opacity: interpolate(frame, [0.4 * fps, 0.8 * fps], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          }),
          translate: interpolate(
            frame,
            [0.4 * fps, 0.8 * fps],
            ["0px 50px", "0px 0px"],
            {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
              easing: Easing.bezier(0.16, 1, 0.3, 1),
            },
          ),
        }}
      >
        دروس فردية
      </Interactive.Div>
      <Interactive.Div
        name="Subtitle"
        style={{
          position: "relative",
          marginTop: 10,
          fontSize: 64,
          fontWeight: 700,
          color: "#FFF6E5",
          opacity: interpolate(frame, [0.7 * fps, 1.1 * fps], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          }),
        }}
      >
        معلّم خاص لطفلك وحده
      </Interactive.Div>
      <Interactive.Div
        name="Benefit 1"
        style={{
          marginTop: 50,
          display: "flex",
          alignItems: "center",
          gap: 22,
          fontSize: 52,
          fontWeight: 600,
          color: "#FFF6E5",
          opacity: interpolate(frame, [1.2 * fps, 1.5 * fps], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          }),
          translate: interpolate(
            frame,
            [1.2 * fps, 1.5 * fps],
            ["-60px 0px", "0px 0px"],
            {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
              easing: Easing.bezier(0.16, 1, 0.3, 1),
            },
          ),
        }}
      >
        <Check />
        اهتمام كامل بطفلك
      </Interactive.Div>
      <Interactive.Div
        name="Benefit 2"
        style={{
          marginTop: 20,
          display: "flex",
          alignItems: "center",
          gap: 22,
          fontSize: 52,
          fontWeight: 600,
          color: "#FFF6E5",
          opacity: interpolate(frame, [1.5 * fps, 1.8 * fps], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          }),
          translate: interpolate(
            frame,
            [1.5 * fps, 1.8 * fps],
            ["-60px 0px", "0px 0px"],
            {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
              easing: Easing.bezier(0.16, 1, 0.3, 1),
            },
          ),
        }}
      >
        <Check />
        يتعلّم بسرعته الخاصة
      </Interactive.Div>
    </AbsoluteFill>
  );
};

const Check: React.FC = () => (
  <svg width={64} height={64} viewBox="0 0 64 64">
    <circle cx={32} cy={32} r={30} fill="#F4B942" />
    <path
      d="M18 33 L28 43 L46 23"
      stroke="#0A4A3E"
      strokeWidth={7}
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
    />
  </svg>
);
