import { AbsoluteFill, useVideoConfig } from "remotion";
import { Background } from "../Background";
import { Logo } from "../Logo";

export const IntroScene: React.FC = () => {
  const { fps } = useVideoConfig();

  return (
    <AbsoluteFill>
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
        markSize={440}
      />
    </AbsoluteFill>
  );
};
