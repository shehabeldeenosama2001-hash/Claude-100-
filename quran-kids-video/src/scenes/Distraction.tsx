import { Audio } from "@remotion/media";
import {
  AbsoluteFill,
  interpolate,
  random,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { balooFont, messiriFont } from "../fonts";
import { Atmosphere, Camera } from "../motion/Atmosphere";
import { BACK_OUT, EASE_IN, progress } from "../motion/easing";
import { Words } from "../motion/Words";
import { GOLD, GOLD_GLOW, SOFT_GLOW } from "../palette";

const COLLAPSE = 98;

const chips = [
  { text: "أغاني", x: 700, y: 560, color: "#FF5C7A", far: false },
  { text: "كرتون", x: 330, y: 700, color: "#FFB547", far: true },
  { text: "ألعاب الموبايل", x: 640, y: 850, color: "#5BC0EB", far: false },
  { text: "تريندات", x: 290, y: 1010, color: "#B47CFF", far: false },
  { text: "أسماء لاعيبة", x: 680, y: 1160, color: "#4ED39A", far: true },
  { text: "إعلانات", x: 330, y: 1310, color: "#FF8A5C", far: false },
  { text: "يوتيوبرز", x: 700, y: 1460, color: "#FF5C7A", far: true },
];

// Everything the child memorizes... then the question that hurts.
export const Distraction: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return (
    <AbsoluteFill>
      <Camera duration={190} push={0.05} shakeAt={130}>
        <Atmosphere
          id="distraction"
          top="#060912"
          bottom="#141B33"
          glow="rgba(130,90,220,0.26)"
          glowY={48}
          patternOpacity={0}
          particles={0}
        />
        <Words
          text="بيحفظ كل حاجة..."
          at={4}
          out={COLLAPSE - 4}
          stagger={5}
          fontSize={100}
          fontFamily={messiriFont}
          color="rgba(255,246,229,0.9)"
          glow={SOFT_GLOW}
          style={{ top: 280 }}
        />
        {chips.map((chip, i) => {
          const at = 16 + i * 8;
          const enter = progress(frame, at, 16, BACK_OUT);
          const fall = progress(frame, COLLAPSE + i * 2, 24, EASE_IN);
          const floatY = Math.sin((frame + i * 17) / 14) * 10;
          const spin = (random(`spin-${i}`) * 2 - 1) * 40;
          const depthBlur = chip.far ? 3 : 0;
          return (
            <div
              key={chip.text}
              style={{
                position: "absolute",
                left: chip.x,
                top: chip.y,
                translate: "-50% -50%",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 20,
                  padding: "20px 44px",
                  borderRadius: 999,
                  background: "rgba(255,255,255,0.09)",
                  border: "2px solid rgba(255,255,255,0.18)",
                  backdropFilter: "blur(14px)",
                  boxShadow: "0 18px 40px rgba(0,0,0,0.35)",
                  direction: "rtl",
                  whiteSpace: "nowrap",
                  fontFamily: balooFont,
                  fontWeight: 700,
                  fontSize: chip.far ? 48 : 58,
                  color: "white",
                  opacity: Math.min(enter, 1) * (chip.far ? 0.65 : 1) * (1 - fall),
                  scale: String(interpolate(enter, [0, 1], [0.5, 1])),
                  translate: `0px ${floatY + fall * 1100}px`,
                  rotate: `${fall * spin}deg`,
                  filter: `blur(${(1 - Math.min(enter, 1)) * 14 + depthBlur + fall * 18}px)`,
                }}
              >
                <div
                  style={{
                    width: 22,
                    height: 22,
                    borderRadius: "50%",
                    backgroundColor: chip.color,
                    boxShadow: `0 0 18px ${chip.color}`,
                  }}
                />
                {chip.text}
              </div>
            </div>
          );
        })}
        <Words
          text="بس..."
          at={112}
          out={176}
          fontSize={96}
          fontFamily={messiriFont}
          fontWeight={600}
          color="rgba(255,246,229,0.7)"
          style={{ top: 690 }}
        />
        <Words
          text="كام آية بيحفظ؟"
          at={128}
          out={176}
          stagger={3}
          inDuration={14}
          scaleFrom={1.45}
          blur={34}
          distance={0}
          fontSize={156}
          fontFamily={messiriFont}
          color={GOLD}
          glow={GOLD_GLOW}
          style={{ top: 830 }}
        />
      </Camera>
      {chips.map((chip, i) => (
        <Audio
          key={chip.text}
          src={staticFile("sfx/pop.wav")}
          from={16 + i * 8}
          premountFor={fps}
          volume={0.45}
        />
      ))}
      <Audio src={staticFile("sfx/whoosh.wav")} from={COLLAPSE - 6} premountFor={fps} volume={0.6} />
      <Audio src={staticFile("sfx/boom.wav")} from={127} premountFor={fps} volume={0.9} />
    </AbsoluteFill>
  );
};
