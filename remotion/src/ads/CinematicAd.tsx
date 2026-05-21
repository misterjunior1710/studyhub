import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, spring, Sequence } from "remotion";
import { loadFont as loadInstrument } from "@remotion/google-fonts/InstrumentSerif";
import { loadFont as loadInter } from "@remotion/google-fonts/Inter";

const serif = loadInstrument("normal", { weights: ["400"], subsets: ["latin"] });
const sans = loadInter("normal", { weights: ["400", "600"], subsets: ["latin"] });

// Editorial / cinematic — slow reveal, big serif type, deep navy + warm gold.
// Palette: bg #0a0e1a, foreground #f5f0e6, accent #c9a84c
const BG = "#0a0e1a";
const FG = "#f5f0e6";
const ACCENT = "#c9a84c";

export const CinematicAd = () => {
  const frame = useCurrentFrame();
  const { fps, width, height, durationInFrames } = useVideoConfig();

  // Subtle camera drift on the background
  const drift = interpolate(frame, [0, durationInFrames], [0, -40]);

  return (
    <AbsoluteFill style={{ backgroundColor: BG, fontFamily: sans.fontFamily, overflow: "hidden" }}>
      {/* Atmospheric vignette + grain */}
      <AbsoluteFill
        style={{
          background: `radial-gradient(ellipse at 30% 40%, rgba(201,168,76,0.18), transparent 55%), radial-gradient(ellipse at 80% 90%, rgba(80,90,140,0.25), transparent 60%)`,
          transform: `translateX(${drift}px)`,
        }}
      />
      {/* Faint grid */}
      <AbsoluteFill
        style={{
          opacity: 0.05,
          backgroundImage:
            "linear-gradient(to right, #fff 1px, transparent 1px), linear-gradient(to bottom, #fff 1px, transparent 1px)",
          backgroundSize: "80px 80px",
        }}
      />

      {/* Scene 1: "Studying alone is hard." */}
      <Sequence from={0} durationInFrames={75}>
        <LineReveal text="Studying alone is hard." color={FG} delay={6} />
      </Sequence>

      {/* Scene 2: "Cramming the night before never works." */}
      <Sequence from={75} durationInFrames={75}>
        <LineReveal text="Cramming the night before never works." color={FG} delay={6} />
      </Sequence>

      {/* Scene 3: Big payoff */}
      <Sequence from={150} durationInFrames={90}>
        <Payoff />
      </Sequence>

      {/* Top label */}
      <div
        style={{
          position: "absolute",
          top: 40,
          left: 50,
          color: ACCENT,
          fontSize: 14,
          letterSpacing: 4,
          fontWeight: 600,
          textTransform: "uppercase",
          opacity: interpolate(frame, [0, 12], [0, 1], { extrapolateRight: "clamp" }),
        }}
      >
        StudyHub™
      </div>
      <div
        style={{
          position: "absolute",
          top: 40,
          right: 50,
          color: FG,
          opacity: 0.5,
          fontSize: 12,
          letterSpacing: 2,
        }}
      >
        FOR STUDENTS
      </div>
    </AbsoluteFill>
  );
};

const LineReveal = ({ text, color, delay }: { text: string; color: string; delay: number }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const opacity = interpolate(frame, [delay, delay + 18], [0, 1], { extrapolateRight: "clamp" });
  const exit = interpolate(frame, [60, 75], [1, 0], { extrapolateLeft: "clamp" });
  const sp = spring({ frame: frame - delay, fps, config: { damping: 200 } });
  const y = interpolate(sp, [0, 1], [30, 0]);
  const blur = interpolate(frame, [delay, delay + 22], [10, 0], { extrapolateRight: "clamp" });

  return (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", padding: "0 120px" }}>
      <h1
        style={{
          fontFamily: serif.fontFamily,
          color,
          fontSize: 96,
          lineHeight: 1.1,
          fontWeight: 400,
          opacity: opacity * exit,
          transform: `translateY(${y}px)`,
          filter: `blur(${blur}px)`,
          textAlign: "center",
          margin: 0,
          letterSpacing: -1,
        }}
      >
        {text}
      </h1>
    </AbsoluteFill>
  );
};

const Payoff = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const sp1 = spring({ frame, fps, config: { damping: 30, stiffness: 120 } });
  const sp2 = spring({ frame: frame - 18, fps, config: { damping: 30, stiffness: 120 } });
  const sp3 = spring({ frame: frame - 36, fps, config: { damping: 30, stiffness: 120 } });
  const lineW = interpolate(sp1, [0, 1], [0, 80]);
  const op2 = interpolate(sp2, [0, 1], [0, 1]);
  const op3 = interpolate(sp3, [0, 1], [0, 1]);
  const yIn = interpolate(sp3, [0, 1], [20, 0]);

  return (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", padding: "0 80px" }}>
      <div style={{ width: lineW, height: 2, backgroundColor: ACCENT, marginBottom: 32 }} />
      <h2
        style={{
          fontFamily: serif.fontFamily,
          color: FG,
          fontSize: 120,
          lineHeight: 1,
          fontWeight: 400,
          opacity: op2,
          margin: 0,
          letterSpacing: -2,
          textAlign: "center",
        }}
      >
        Study <em style={{ color: ACCENT, fontStyle: "italic" }}>smarter.</em>
      </h2>
      <p
        style={{
          fontFamily: sans.fontFamily,
          color: FG,
          opacity: 0.7 * op3,
          fontSize: 22,
          marginTop: 28,
          transform: `translateY(${yIn}px)`,
          letterSpacing: 0.5,
        }}
      >
        Unlock StudyHub™ Pro — from $3.33/month
      </p>
    </AbsoluteFill>
  );
};
