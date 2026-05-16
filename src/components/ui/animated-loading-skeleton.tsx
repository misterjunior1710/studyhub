import { useEffect, useState } from "react";
import { motion, useAnimation, useReducedMotion } from "framer-motion";
import { Search } from "lucide-react";

interface GridConfig {
  numCards: number;
  cols: number;
  xBase: number;
  yBase: number;
  xStep: number;
  yStep: number;
}

const getGridConfig = (width: number): GridConfig => {
  const cols = width >= 1024 ? 3 : width >= 640 ? 2 : 1;
  return {
    numCards: 6,
    cols,
    xBase: 40,
    yBase: 60,
    xStep: 210,
    yStep: 230,
  };
};

const generateSearchPath = (config: GridConfig) => {
  const { numCards, cols, xBase, yBase, xStep, yStep } = config;
  const rows = Math.ceil(numCards / cols);
  const allPositions: { x: number; y: number }[] = [];

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      if (row * cols + col < numCards) {
        allPositions.push({ x: xBase + col * xStep, y: yBase + row * yStep });
      }
    }
  }

  const shuffled = allPositions.sort(() => Math.random() - 0.5).slice(0, 4);
  if (shuffled.length > 0) shuffled.push(shuffled[0]);

  return {
    x: shuffled.map((p) => p.x),
    y: shuffled.map((p) => p.y),
    scale: Array(shuffled.length).fill(1.15),
    transition: {
      duration: shuffled.length * 2,
      repeat: Infinity,
      ease: [0.4, 0, 0.2, 1] as [number, number, number, number],
      times: shuffled.map((_, i) => i / (shuffled.length - 1)),
    },
  };
};

interface Props {
  /** Render without min-h-screen wrapper (for inline / in-card use) */
  inline?: boolean;
  className?: string;
}

const AnimatedLoadingSkeleton = ({ inline = false, className }: Props) => {
  const [windowWidth, setWindowWidth] = useState(
    typeof window !== "undefined" ? window.innerWidth : 1024,
  );
  const controls = useAnimation();
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    const onResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  useEffect(() => {
    if (prefersReducedMotion) return;
    controls.start(generateSearchPath(getGridConfig(windowWidth)));
  }, [windowWidth, controls, prefersReducedMotion]);

  const config = getGridConfig(windowWidth);

  const cardVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: (i: number) => ({
      y: 0,
      opacity: 1,
      transition: { delay: i * 0.08, duration: 0.4 },
    }),
  };

  return (
    <div
      role="status"
      aria-live="polite"
      aria-label="Loading content"
      className={[
        inline ? "w-full" : "min-h-screen w-full flex items-center justify-center",
        "bg-background p-4 sm:p-6",
        className ?? "",
      ].join(" ")}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="relative w-full max-w-5xl"
      >
        {/* Animated search icon (decorative) */}
        {!prefersReducedMotion && (
          <motion.div
            aria-hidden="true"
            animate={controls}
            className="pointer-events-none absolute -top-2 -left-2 z-10 hidden sm:flex h-10 w-10 items-center justify-center rounded-full bg-primary/15 text-primary backdrop-blur-md ring-1 ring-primary/30"
            style={{
              boxShadow:
                "0 0 24px hsl(var(--primary) / 0.35), inset 0 0 12px hsl(var(--primary) / 0.15)",
            }}
          >
            <Search className="h-4 w-4" />
          </motion.div>
        )}

        {/* Grid of placeholder cards */}
        <div
          className="grid gap-4 sm:gap-5"
          style={{ gridTemplateColumns: `repeat(${config.cols}, minmax(0, 1fr))` }}
        >
          {Array.from({ length: config.numCards }).map((_, i) => (
            <motion.div
              key={i}
              custom={i}
              variants={cardVariants}
              initial="hidden"
              animate="visible"
              className="relative overflow-hidden rounded-xl border border-border bg-card/60 p-4 backdrop-blur-sm shadow-sm"
            >
              {/* Shimmer sweep */}
              <div className="pointer-events-none absolute inset-0 -translate-x-full animate-[shimmer_2.2s_infinite] bg-gradient-to-r from-transparent via-foreground/[0.06] to-transparent" />

              <div className="mb-3 flex items-center gap-3">
                <div className="h-9 w-9 rounded-full bg-muted" />
                <div className="flex-1 space-y-2">
                  <div className="h-3 w-1/3 rounded bg-muted" />
                  <div className="h-2.5 w-1/4 rounded bg-muted/70" />
                </div>
              </div>
              <div className="space-y-2">
                <div className="h-3 w-full rounded bg-muted" />
                <div className="h-3 w-11/12 rounded bg-muted" />
                <div className="h-3 w-3/4 rounded bg-muted" />
              </div>
              <div className="mt-4 h-24 rounded-lg bg-muted/60" />
              <div className="mt-3 flex gap-2">
                <div className="h-7 w-16 rounded-md bg-muted" />
                <div className="h-7 w-16 rounded-md bg-muted/70" />
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      <span className="sr-only">Loading…</span>

      <style>{`
        @keyframes shimmer {
          100% { transform: translateX(100%); }
        }
      `}</style>
    </div>
  );
};

export default AnimatedLoadingSkeleton;
