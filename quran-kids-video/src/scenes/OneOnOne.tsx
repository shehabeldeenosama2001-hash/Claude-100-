import { Audio } from "@remotion/media";
import {
  AbsoluteFill,
  interpolate,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { balooFont } from "../fonts";
import { OneOnOneIcon } from "../Icons";
import { Atmosphere, Camera } from "../motion/Atmosphere";
import { BACK_OUT, EASE_IN, EASE_OUT, progress } from "../motion/easing";
import { Words } from "../motion/Words";
import { CORAL, CREAM, GOLD, INK, SOFT_GLOW } from "../palette";

const OUT = 132;

const Benefit: React.FC<{ readonly text: string; readonly at: number; readonly top: number }> = ({
  text,
  at,
  top,
}) => {
  const frame = useCurrentFrame();
  const enter = progress(frame, at, 22, EASE_OUT);
  const leave = progress(frame, OUT + 4, 14, EASE_IN);
  const check = progress(frame, at + 8, 16, EASE_OUT);

  return (
    <div
      style={{
        position: "absolute",
        top,
        left: 80,
        right: 80,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        gap: 22,
        direction: "rtl",
        fontFamily: balooFont,
        fontWeight: 600,
        fontSize: 54,
        color: CREAM,
        opacity: enter * (1 - leave),
        translate: `${(1 - enter) * -120}px ${-leave * 70}px`,
        filter: `blur(${(1 - enter) * 16 + leave * 16}px)`,
      }}
    >
      <svg width={66} height={66} viewBox="0 0 64 64">
        <circle cx={32} cy={32} r={30} fill={GOLD} />
        <path
          d="M18 33 L28 43 L46 23"
          pathLength={1}
          strokeDasharray={1}
          strokeDashoffset={1 - check}
          stroke={INK}
          strokeWidth={7}
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
      </svg>
      {text}
    </div>
  );
};

export const OneOnOne: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const pop = progress(frame, 8, 24, BACK_OUT);
  const leave = progress(frame, OUT, 16, EASE_IN);

  return (
    <AbsoluteFill>
      <Camera duration={150} push={0.05}>
        <Atmosphere
          id="one"
          top="#106B5B"
          bottom="#06352D"
          glow="rgba(255,214,140,0.3)"
          glowY={34}
          patternOpacity={0.07}
          particles={22}
        />
        <Words
          text="أول حاجة بتفرق"
          at={2}
          out={OUT}
          stagger={4}
          fontSize={52}
          fontFamily={balooFont}
          fontWeight={600}
          color="rgba(255,246,229,0.8)"
          style={{ top: 400 }}
        />
        <div
          style={{
            position: "absolute",
            left: 540 - 230,
            top: 530,
            width: 460,
            height: 460,
            opacity: Math.min(pop, 1) * (1 - leave),
            scale: String(interpolate(pop, [0, 1], [0.3, 1]) * (1 - leave * 0.3)),
            rotate: `${(1 - pop) * -30}deg`,
            filter: `blur(${leave * 20}px)`,
          }}
        >
          {/* Pulse rings */}
          {[0, 20].map((offset) => {
            const t = ((frame + offset) % 40) / 40;
            return (
              <div
                key={offset}
                style={{
                  position: "absolute",
                  inset: 0,
                  borderRadius: "50%",
                  border: `6px solid ${CREAM}`,
                  scale: String(1 + t * 0.45),
                  opacity: (1 - t) * 0.35 * progress(frame, 30, 10),
                }}
              />
            );
          })}
          <div
            style={{
              position: "absolute",
              inset: 0,
              borderRadius: "50%",
              backgroundColor: CORAL,
              border: `12px solid ${CREAM}`,
              boxShadow: "0 30px 60px rgba(0,0,0,0.4)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <OneOnOneIcon size={300} color={CREAM} draw={progress(frame, 20, 34)} />
          </div>
        </div>
        <Words
          text="دروس فردية"
          at={28}
          out={OUT}
          stagger={6}
          inDuration={24}
          scaleFrom={1.1}
          fontSize={150}
          fontFamily={balooFont}
          fontWeight={800}
          lineHeight={1.15}
          color={GOLD}
          glow={SOFT_GLOW}
          style={{ top: 1040 }}
        />
        <Words
          text="معلّم خاص لطفلك وحده"
          at={44}
          out={OUT + 2}
          stagger={4}
          fontSize={66}
          fontFamily={balooFont}
          fontWeight={700}
          color={CREAM}
          style={{ top: 1235 }}
        />
        <Benefit text="اهتمام كامل بطفلك" at={64} top={1380} />
        <Benefit text="يتعلّم بسرعته الخاصة" at={76} top={1480} />
      </Camera>
      <Audio src={staticFile("sfx/whoosh.wav")} premountFor={fps} volume={0.45} />
      <Audio src={staticFile("sfx/pop.wav")} from={10} premountFor={fps} volume={0.5} />
    </AbsoluteFill>
  );
};
