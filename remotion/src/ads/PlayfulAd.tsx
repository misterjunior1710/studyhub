import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, spring, Sequence } from "remotion";
import { loadFont as loadDM } from "@remotion/google-fonts/DMSans";

const f = loadDM("normal", { weights: ["500", "700"], subsets: ["latin"] });

// Playful / pop — pastel gradient bg, bouncy shapes, emoji burst.
const BG_TOP = "#fde2e4";
const BG_BOT = "#bee1f5";
const PINK = "#ff6b9d";
const PURPLE = "#7d5fff";
const INK = "#1a1a2e";
const YELLOW = "#ffd166";

export const PlayfulAd = () => {
  const frame = useCurrentFrame();

  return (
    <AbsoluteFill
      style={{
        background: `linear-gradient(135deg, ${BG_TOP} 0%, ${BG_BOT} 100%)`,
        fontFamily: f.fontFamily,
        overflow: "hidden",
      }}
    >
      <FloatingShapes />

      <Sequence from={0} durationInFrames={70}>
        <EmojiBurst />
      </Sequence>

      <Sequence from={70} durationInFrames={70}>
        <FriendsLine />
      </Sequence>

      <Sequence from={140} durationInFrames={70}>
        <Outro />
      </Sequence>

      {/* Persistent corner badge */}
      <div
        style={{
          position: "absolute",
          bottom: 36,
          left: 50,
          color: INK,
          fontSize: 18,
          fontWeight: 700,
          opacity: interpolate(frame, [10, 30], [0, 1], { extrapolateRight: "clamp" }),
          letterSpacing: 1,
        }}
      >
        StudyHub™
      </div>
    </AbsoluteFill>
  );
};

const FloatingShapes = () => {
  const frame = useCurrentFrame();
  const shapes = [
    { x: 100, y: 120, size: 80, color: PINK, type: "circle" },
    { x: 1100, y: 150, size: 60, color: YELLOW, type: "square" },
    { x: 1150, y: 540, size: 100, color: PURPLE, type: "circle" },
    { x: 80, y: 560, size: 70, color: YELLOW, type: "square" },
    { x: 950, y: 80, size: 40, color: PINK, type: "circle" },
  ];
  return (
    <AbsoluteFill>
      {shapes.map((s, i) => {
        const drift = Math.sin((frame + i * 30) / 25) * 14;
        const rot = (frame + i * 40) * 0.4;
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: s.x,
              top: s.y + drift,
              width: s.size,
              height: s.size,
              backgroundColor: s.color,
              borderRadius: s.type === "circle" ? "50%" : 16,
              transform: `rotate(${rot}deg)`,
              opacity: 0.85,
            }}
          />
        );
      })}
    </AbsoluteFill>
  );
};

const EmojiBurst = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const emojis = ["📚", "✨", "🧠", "🎯", "🚀"];

  return (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", flexDirection: "column" }}>
      <div style={{ display: "flex", gap: 24, marginBottom: 28 }}>
        {emojis.map((e, i) => {
          const sp = spring({ frame: frame - i * 4, fps, config: { damping: 8, stiffness: 200 } });
          const scale = interpolate(sp, [0, 1], [0, 1]);
          const bob = Math.sin((frame - i * 4) / 8) * 8;
          return (
            <div key={i} style={{ fontSize: 80, transform: `scale(${scale}) translateY(${bob}px)` }}>
              {e}
            </div>
          );
        })}
      </div>
      <h1
        style={{
          color: INK,
          fontSize: 88,
          fontWeight: 700,
          margin: 0,
          textAlign: "center",
          opacity: interpolate(frame, [22, 38], [0, 1], { extrapolateRight: "clamp" }),
          transform: `translateY(${interpolate(spring({ frame: frame - 22, fps, config: { damping: 12 } }), [0, 1], [20, 0])}px)`,
          letterSpacing: -2,
        }}
      >
        Studying just got{" "}
        <span style={{ color: PINK }}>fun.</span>
      </h1>
    </AbsoluteFill>
  );
};

const FriendsLine = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const words = ["Join", "Study", "Squads", "with", "friends"];

  return (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
      <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 16, maxWidth: 1100 }}>
        {words.map((w, i) => {
          const sp = spring({ frame: frame - i * 5, fps, config: { damping: 10, stiffness: 180 } });
          const scale = interpolate(sp, [0, 1], [0.6, 1]);
          const op = interpolate(sp, [0, 1], [0, 1]);
          const rot = (i % 2 === 0 ? -1 : 1) * 2;
          const accent = i === 2;
          return (
            <span
              key={i}
              style={{
                fontSize: 96,
                fontWeight: 700,
                color: accent ? PURPLE : INK,
                opacity: op,
                transform: `scale(${scale}) rotate(${rot}deg)`,
                letterSpacing: -2,
              }}
            >
              {w}
            </span>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

const Outro = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const sp = spring({ frame, fps, config: { damping: 10, stiffness: 160 } });
  const scale = interpolate(sp, [0, 1], [0.7, 1]);
  const op = interpolate(sp, [0, 1], [0, 1]);
  const wobble = Math.sin(frame / 10) * 2;

  return (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
      <div style={{ textAlign: "center", opacity: op, transform: `scale(${scale})` }}>
        <div
          style={{
            display: "inline-block",
            backgroundColor: INK,
            color: "#fff",
            padding: "28px 56px",
            borderRadius: 999,
            fontSize: 72,
            fontWeight: 700,
            transform: `rotate(${wobble}deg)`,
            letterSpacing: -1,
            boxShadow: `0 16px 0 ${PURPLE}`,
          }}
        >
          Go Pro 🎉
        </div>
        <p style={{ color: INK, fontSize: 26, marginTop: 36, fontWeight: 500, opacity: 0.8 }}>
          studyhub.world/pricing
        </p>
      </div>
    </AbsoluteFill>
  );
};
