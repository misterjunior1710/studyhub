import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, spring, Sequence } from "remotion";
import { loadFont as loadGrotesk } from "@remotion/google-fonts/SpaceGrotesk";

const f = loadGrotesk("normal", { weights: ["500", "700"], subsets: ["latin"] });

// Kinetic energy — fast cuts, bold color blocks, snappy springs.
// Palette: hot coral + electric indigo on cream.
const BG = "#0f0f12";
const CREAM = "#f4ede0";
const CORAL = "#ff5e3a";
const INDIGO = "#5b5bff";

export const KineticAd = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: BG, fontFamily: f.fontFamily, overflow: "hidden" }}>
      <Sequence from={0} durationInFrames={30}>
        <BlockReveal bg={CORAL} text="STUCK" textColor={CREAM} />
      </Sequence>
      <Sequence from={30} durationInFrames={30}>
        <BlockReveal bg={INDIGO} text="ON A" textColor={CREAM} />
      </Sequence>
      <Sequence from={60} durationInFrames={36}>
        <BlockReveal bg={CREAM} text="QUESTION?" textColor={BG} />
      </Sequence>
      <Sequence from={96} durationInFrames={54}>
        <FeatureBurst />
      </Sequence>
      <Sequence from={150} durationInFrames={60}>
        <FinalCard />
      </Sequence>
    </AbsoluteFill>
  );
};

const BlockReveal = ({ bg, text, textColor }: { bg: string; text: string; textColor: string }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const sp = spring({ frame, fps, config: { damping: 18, stiffness: 220 } });
  const w = interpolate(sp, [0, 1], [0, 100]);
  const op = interpolate(frame, [4, 12], [0, 1], { extrapolateRight: "clamp" });
  const skew = interpolate(sp, [0, 1], [-8, 0]);

  return (
    <AbsoluteFill>
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundColor: bg,
          clipPath: `polygon(0 0, ${w}% 0, ${w}% 100%, 0 100%)`,
        }}
      />
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
        <h1
          style={{
            color: textColor,
            fontSize: 200,
            fontWeight: 700,
            margin: 0,
            opacity: op,
            transform: `skewX(${skew}deg)`,
            letterSpacing: -6,
          }}
        >
          {text}
        </h1>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

const FeatureBurst = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const items = [
    { t: "Nova AI", c: CORAL },
    { t: "Study Squads", c: INDIGO },
    { t: "Flashcards", c: CREAM },
    { t: "Whiteboards", c: CORAL },
    { t: "Premium themes", c: INDIGO },
  ];

  return (
    <AbsoluteFill style={{ backgroundColor: BG, alignItems: "center", justifyContent: "center", gap: 12, padding: 60 }}>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 16, justifyContent: "center", maxWidth: 1000 }}>
        {items.map((it, i) => {
          const delay = i * 5;
          const sp = spring({ frame: frame - delay, fps, config: { damping: 12, stiffness: 240 } });
          const scale = interpolate(sp, [0, 1], [0.4, 1]);
          const op = interpolate(sp, [0, 1], [0, 1]);
          const rot = interpolate(sp, [0, 1], [-6, 0]);
          return (
            <div
              key={it.t}
              style={{
                backgroundColor: it.c,
                color: it.c === CREAM ? BG : CREAM,
                padding: "22px 36px",
                borderRadius: 999,
                fontSize: 44,
                fontWeight: 700,
                opacity: op,
                transform: `scale(${scale}) rotate(${rot}deg)`,
                letterSpacing: -1,
              }}
            >
              {it.t}
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

const FinalCard = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const sp = spring({ frame, fps, config: { damping: 14, stiffness: 180 } });
  const y = interpolate(sp, [0, 1], [40, 0]);
  const op = interpolate(sp, [0, 1], [0, 1]);
  const arrow = interpolate(frame, [20, 50], [-20, 20]);

  return (
    <AbsoluteFill style={{ backgroundColor: BG, alignItems: "center", justifyContent: "center" }}>
      <div style={{ textAlign: "center", opacity: op, transform: `translateY(${y}px)` }}>
        <div style={{ color: CREAM, fontSize: 28, fontWeight: 500, opacity: 0.7, letterSpacing: 4, textTransform: "uppercase" }}>
          Try StudyHub
        </div>
        <h1 style={{ color: CREAM, fontSize: 180, fontWeight: 700, margin: "12px 0 0", letterSpacing: -6 }}>
          <span style={{ color: CORAL }}>Pro</span>
          <span style={{ display: "inline-block", transform: `translateX(${arrow}px)`, color: INDIGO, marginLeft: 16 }}>→</span>
        </h1>
        <div style={{ color: CREAM, fontSize: 24, marginTop: 24, opacity: 0.85, letterSpacing: 1 }}>
          Ad-free · Unlimited · Free 7-day try
        </div>
      </div>
    </AbsoluteFill>
  );
};
