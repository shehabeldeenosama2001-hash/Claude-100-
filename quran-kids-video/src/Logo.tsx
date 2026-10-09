import type React from "react";
import {
  Easing,
  Interactive,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
  type InteractivitySchema,
} from "remotion";
import { balooFont } from "./fonts";
import { LogoMark } from "./LogoMark";

type LogoProps = {
  readonly brandName: string;
  readonly tagline: string;
  readonly primaryColor: string;
  readonly accentColor: string;
  readonly textColor: string;
  readonly markSize: number;
  readonly style?: React.CSSProperties;
};

const LogoInner: React.FC<LogoProps> = ({
  brandName,
  tagline,
  primaryColor,
  accentColor,
  textColor,
  markSize,
  style,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const pop = spring({ frame, fps, config: { damping: 11, mass: 0.8 } });

  return (
    <Interactive.Div
      name="Logo"
      style={{
        position: "absolute",
        inset: 0,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: balooFont,
        direction: "rtl",
        ...style,
      }}
    >
      <div
        style={{
          scale: String(pop),
          rotate: `${interpolate(pop, [0, 1], [-30, 0])}deg`,
          filter: "drop-shadow(0 24px 40px rgba(0,0,0,0.35))",
        }}
      >
        <LogoMark
          size={markSize}
          primaryColor={primaryColor}
          accentColor={accentColor}
        />
      </div>
      <div
        style={{
          marginTop: markSize * 0.08,
          fontSize: markSize * 0.36,
          fontWeight: 800,
          lineHeight: 1.1,
          color: textColor,
          opacity: interpolate(frame, [0.4 * fps, 0.9 * fps], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          }),
          translate: interpolate(
            frame,
            [0.4 * fps, 0.9 * fps],
            ["0px 40px", "0px 0px"],
            {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
              easing: Easing.bezier(0.16, 1, 0.3, 1),
            },
          ),
        }}
      >
        {brandName}
      </div>
      <div
        style={{
          fontSize: markSize * 0.15,
          fontWeight: 600,
          color: accentColor,
          opacity: interpolate(frame, [0.7 * fps, 1.2 * fps], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          }),
        }}
      >
        {tagline}
      </div>
    </Interactive.Div>
  );
};

const logoSchema = {
  brandName: {
    type: "text-content",
    default: "نور القرآن",
    description: "Brand name",
  },
  tagline: {
    type: "text-content",
    default: "لتعليم القرآن للأطفال",
    description: "Tagline",
  },
  primaryColor: {
    type: "color",
    default: "#0F6B5A",
    description: "Book color",
  },
  accentColor: {
    type: "color",
    default: "#F4B942",
    description: "Accent color",
  },
  textColor: {
    type: "color",
    default: "#FFF6E5",
    description: "Text color",
  },
  markSize: {
    type: "number",
    default: 420,
    min: 100,
    max: 900,
    description: "Mark size",
    hiddenFromList: false,
  },
} as const satisfies InteractivitySchema;

export const Logo = Interactive.withSchema({
  Component: LogoInner,
  componentName: "<Logo>",
  schema: logoSchema,
  wrapInSequence: true,
});
