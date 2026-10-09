import { Audio } from "@remotion/media";
import {
  AbsoluteFill,
  interpolate,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { balooFont } from "../fonts";
import { MosqueIcon, ReadingIcon, RehalIcon, ScrollIcon } from "../Icons";
import { Atmosphere, Camera } from "../motion/Atmosphere";
import { EASE_IN, EASE_OUT, progress } from "../motion/easing";
import { Words } from "../motion/Words";
import { CREAM, GOLD, SOFT_GLOW } from "../palette";

const OUT = 166;

const cards = [
  { title: "فقه", subtitle: "أحكام العبادات", accent: "#4C9BE0", Icon: MosqueIcon, left: 560, top: 560 },
  { title: "حديث نبوي", subtitle: "أحاديث وآداب نبوية", accent: "#8E6CE0", Icon: ScrollIcon, left: 80, top: 560 },
  { title: "تحفيظ", subtitle: "حفظ ومراجعة بإتقان", accent: "#FF7A59", Icon: RehalIcon, left: 560, top: 1080 },
  { title: "قراءة", subtitle: "تلاوة صحيحة بالتجويد", accent: "#2FB07C", Icon: ReadingIcon, left: 80, top: 1080 },
];

export const Curriculum: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return (
    <AbsoluteFill>
      <Camera duration={190} push={0.04}>
        <Atmosphere
          id="curriculum"
          top="#173F7D"
          bottom="#0A1A3A"
          glow="rgba(120,170,255,0.28)"
          glowY={40}
          patternOpacity={0.06}
          particles={24}
          particleColor="200, 220, 255"
        />
        <Words
          text="منهج متكامل"
          at={2}
          out={OUT}
          stagger={6}
          inDuration={22}
          fontSize={132}
          fontFamily={balooFont}
          fontWeight={800}
          lineHeight={1.15}
          color={CREAM}
          glow={SOFT_GLOW}
          style={{ top: 240 }}
        />
        <Words
          text="كل اللي طفلك محتاجه في مكان واحد"
          at={14}
          out={OUT}
          stagger={2}
          fontSize={52}
          fontFamily={balooFont}
          fontWeight={600}
          color={GOLD}
          style={{ top: 420 }}
        />
        {cards.map((card, i) => {
          const at = 26 + i * 9;
          const enter = progress(frame, at, 28, EASE_OUT);
          const leave = progress(frame, OUT + i * 3, 16, EASE_IN);
          const spotlight = 92 + i * 16;
          const bump = Math.sin(
            Math.PI * interpolate(frame, [spotlight, spotlight + 16], [0, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            }),
          );
          const { Icon } = card;
          return (
            <div
              key={card.title}
              style={{
                position: "absolute",
                left: card.left,
                top: card.top,
                width: 440,
                height: 480,
                boxSizing: "border-box",
                padding: "44px 24px 30px",
                borderRadius: 48,
                backgroundColor: CREAM,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                textAlign: "center",
                direction: "rtl",
                fontFamily: balooFont,
                boxShadow: `0 24px 50px rgba(0,0,0,0.35), 0 0 ${bump * 60}px ${card.accent}`,
                outline: `${bump * 6}px solid ${card.accent}`,
                transform: `perspective(1400px) rotateX(${(1 - enter) * 55}deg)`,
                transformOrigin: "50% 100%",
                opacity: enter * (1 - leave),
                translate: `0px ${(1 - enter) * 170 - leave * 90}px`,
                scale: String((0.88 + enter * 0.12) * (1 + bump * 0.06) * (1 - leave * 0.15)),
                filter: `blur(${(1 - enter) * 24 + leave * 22}px)`,
              }}
            >
              <div
                style={{
                  width: 180,
                  height: 180,
                  borderRadius: "50%",
                  backgroundColor: card.accent,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  rotate: `${(1 - enter) * -40 + bump * 8}deg`,
                  boxShadow: `0 14px 30px ${card.accent}66`,
                }}
              >
                <Icon size={124} color={CREAM} draw={progress(frame, at + 10, 30)} />
              </div>
              <div
                style={{
                  marginTop: 24,
                  fontSize: 78,
                  fontWeight: 800,
                  lineHeight: 1.1,
                  color: "#0A4A3E",
                }}
              >
                {card.title}
              </div>
              <div
                style={{
                  marginTop: 12,
                  fontSize: 44,
                  fontWeight: 600,
                  lineHeight: 1.2,
                  color: "#3E6B61",
                }}
              >
                {card.subtitle}
              </div>
            </div>
          );
        })}
      </Camera>
      <Audio src={staticFile("sfx/whoosh.wav")} premountFor={fps} volume={0.45} />
      <Audio src={staticFile("sfx/pop.wav")} from={28} premountFor={fps} volume={0.45} />
      <Audio src={staticFile("sfx/pop.wav")} from={37} premountFor={fps} volume={0.45} />
      <Audio src={staticFile("sfx/pop.wav")} from={46} premountFor={fps} volume={0.45} />
      <Audio src={staticFile("sfx/pop.wav")} from={55} premountFor={fps} volume={0.45} />
      <Audio src={staticFile("sfx/whoosh.wav")} from={OUT - 4} premountFor={fps} volume={0.35} />
    </AbsoluteFill>
  );
};
