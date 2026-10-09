import { AbsoluteFill } from "remotion";
import { balooFont } from "./fonts";
import { LogoMark } from "./LogoMark";

// Static square version of the logo, for profile pictures and print
export const LogoPoster: React.FC = () => {
  return (
    <AbsoluteFill
      style={{
        background: "radial-gradient(circle at 50% 40%, #138A72 0%, #0A4A3E 80%)",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: balooFont,
        direction: "rtl",
        textAlign: "center",
      }}
    >
      <LogoMark size={520} primaryColor="#0F6B5A" accentColor="#F4B942" />
      <div
        style={{
          marginTop: 30,
          fontSize: 150,
          fontWeight: 800,
          lineHeight: 1.1,
          color: "#FFF6E5",
        }}
      >
        نور القرآن
      </div>
      <div style={{ fontSize: 64, fontWeight: 600, color: "#F4B942" }}>
        لتعليم القرآن للأطفال
      </div>
    </AbsoluteFill>
  );
};
