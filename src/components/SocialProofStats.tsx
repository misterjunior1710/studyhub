import { memo, useEffect, useRef, useState } from "react";
import { Card } from "@/components/ui/card";
import { Eye, MousePointerClick, Percent, TrendingUp, Sparkles } from "lucide-react";
import { useScrollReveal } from "@/hooks/useScrollReveal";

// Real metrics from Google Search Console since launch (29 November 2025)
const METRICS = [
  { key: "impressions", label: "Total impressions", value: 8680, suffix: "", icon: Eye, format: "compact" as const },
  { key: "clicks", label: "Total clicks", value: 209, suffix: "", icon: MousePointerClick, format: "int" as const },
  { key: "ctr", label: "Average CTR", value: 2.4, suffix: "%", icon: Percent, format: "decimal" as const },
  {
    key: "position",
    label: "Avg. search position",
    value: 11.1,
    suffix: "",
    icon: TrendingUp,
    format: "decimal" as const,
  },
];

function formatValue(value: number, format: "compact" | "int" | "decimal") {
  if (format === "compact") {
    if (value >= 1000) return (value / 1000).toFixed(2).replace(/\.?0+$/, "") + "k";
    return Math.round(value).toLocaleString();
  }
  if (format === "decimal") return value.toFixed(1);
  return Math.round(value).toLocaleString();
}

function useCountUp(target: number, start: boolean, duration = 1400) {
  const [val, setVal] = useState(0);
  const rafRef = useRef<number | null>(null);
  useEffect(() => {
    if (!start) return;
    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReduced) {
      setVal(target);
      return;
    }
    const t0 = performance.now();
    const tick = (t: number) => {
      const p = Math.min(1, (t - t0) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      setVal(target * eased);
      if (p < 1) rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [target, start, duration]);
  return val;
}

const StatCell = memo(function StatCell({
  metric,
  start,
  delay,
}: {
  metric: (typeof METRICS)[number];
  start: boolean;
  delay: number;
}) {
  const Icon = metric.icon;
  const animated = useCountUp(metric.value, start);
  return (
    <div
      className="flex items-start gap-3 p-4 sm:p-5 rounded-xl bg-background/40 border border-border/40 backdrop-blur-sm transition-all duration-300 hover:border-primary/40 hover:bg-background/60"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="flex-shrink-0 w-9 h-9 rounded-lg bg-gradient-to-br from-primary/15 to-accent/15 border border-primary/20 flex items-center justify-center">
        <Icon className="h-4 w-4 text-primary" aria-hidden="true" />
      </div>
      <div className="min-w-0">
        <div className="text-xl sm:text-2xl font-bold tracking-tight tabular-nums">
          {formatValue(animated, metric.format)}
          {metric.suffix}
        </div>
        <div className="text-xs text-muted-foreground mt-0.5">{metric.label}</div>
      </div>
    </div>
  );
});

const SocialProofStats = memo(function SocialProofStats() {
  const [ref, visible] = useScrollReveal<HTMLDivElement>({ threshold: 0.2 });
  const heroCount = useCountUp(8680, visible);

  return (
    <section
      ref={ref}
      aria-label="Platform reach since launch"
      className="container mx-auto px-4 max-w-5xl pt-8 sm:pt-12 relative z-10"
    >
      <Card
        className={`relative overflow-hidden border-border/60 bg-card p-6 sm:p-8 transition-all duration-700 ${
          visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
        }`}
      >
        {/* decorative glow */}
        <div
          className="pointer-events-none absolute -top-24 -right-24 w-64 h-64 rounded-full bg-primary/10 blur-3xl"
          aria-hidden="true"
        />
        <div
          className="pointer-events-none absolute -bottom-24 -left-24 w-64 h-64 rounded-full bg-accent/10 blur-3xl"
          aria-hidden="true"
        />

        <div className="relative flex flex-col gap-6">
          {/* Hero proof line */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-primary/10 border border-primary/20 text-xs font-medium text-primary mb-3">
                <Sparkles className="h-3 w-3" aria-hidden="true" />
                Trusted since Launch
              </div>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight leading-tight">
                <span className="tabular-nums text-primary">{formatValue(heroCount, "int")}+</span>{" "}
                <span className="text-foreground">searches served since Launch</span>
              </h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Real students finding StudyHub through Google — and the numbers are growing every day{" "}
                <span aria-hidden="true">🚀</span>
              </p>
            </div>
          </div>

          {/* Stats grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            {METRICS.map((m, i) => (
              <StatCell key={m.key} metric={m} start={visible} delay={i * 80} />
            ))}
          </div>

          <p className="text-[11px] text-muted-foreground/80">
            Source: Google Search Console · since launch on 29 November 2025
          </p>
        </div>
      </Card>
    </section>
  );
});

export default SocialProofStats;
