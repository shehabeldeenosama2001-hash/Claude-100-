import type React from "react";
import {
  Interactive,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
  type InteractivitySchema,
} from "remotion";
import { balooFont } from "./fonts";
import {
  MosqueIcon,
  OneOnOneIcon,
  ReadingIcon,
  RehalIcon,
  ScrollIcon,
} from "./Icons";

const icons = {
  mosque: MosqueIcon,
  scroll: ScrollIcon,
  rehal: RehalIcon,
  reading: ReadingIcon,
  oneOnOne: OneOnOneIcon,
};

type FeatureCardProps = {
  readonly title: string;
  readonly subtitle: string;
  readonly accentColor: string;
  readonly icon: keyof typeof icons;
  readonly style?: React.CSSProperties;
};

const FeatureCardInner: React.FC<FeatureCardProps> = ({
  title,
  subtitle,
  accentColor,
  icon,
  style,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const pop = spring({ frame, fps, config: { damping: 10, mass: 0.7 } });
  const Icon = icons[icon];

  return (
    <Interactive.Div
      name="Feature card"
      style={{
        position: "absolute",
        width: 440,
        height: 500,
        boxSizing: "border-box",
        padding: "44px 28px 36px",
        borderRadius: 48,
        backgroundColor: "#FFF6E5",
        boxShadow: "0 24px 48px rgba(0,0,0,0.28)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        textAlign: "center",
        direction: "rtl",
        fontFamily: balooFont,
        scale: String(pop),
        ...style,
      }}
    >
      <div
        style={{
          width: 190,
          height: 190,
          borderRadius: "50%",
          backgroundColor: accentColor,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          rotate: `${interpolate(pop, [0, 1], [-25, 0])}deg`,
        }}
      >
        <Icon size={130} color="#FFF6E5" />
      </div>
      <div
        style={{
          marginTop: 26,
          fontSize: 76,
          fontWeight: 800,
          lineHeight: 1.1,
          color: "#0A4A3E",
        }}
      >
        {title}
      </div>
      <div
        style={{
          marginTop: 10,
          fontSize: 44,
          fontWeight: 600,
          lineHeight: 1.2,
          color: "#3E6B61",
        }}
      >
        {subtitle}
      </div>
    </Interactive.Div>
  );
};

const featureCardSchema = {
  title: { type: "text-content", default: "تحفيظ", description: "Title" },
  subtitle: {
    type: "text-content",
    default: "حفظ ومراجعة بإتقان",
    description: "Subtitle",
  },
  accentColor: {
    type: "color",
    default: "#FF7A59",
    description: "Icon color",
  },
} as const satisfies InteractivitySchema;

export const FeatureCard = Interactive.withSchema({
  Component: FeatureCardInner,
  componentName: "<FeatureCard>",
  schema: featureCardSchema,
  wrapInSequence: true,
});
