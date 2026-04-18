import { useGamification } from "@/contexts/GamificationContext";
import { Flame } from "lucide-react";
import { cn } from "@/lib/utils";

const StreakIndicator = () => {
  const { streakDays, loading } = useGamification();

  if (loading) {
    return <div className="h-8 w-12 bg-muted/50 rounded-full animate-pulse" />;
  }

  // Scale intensity with streak length
  const intensity =
    streakDays >= 100 ? "from-purple-500/30 to-pink-500/30 border-pink-500/40 text-pink-500" :
    streakDays >= 30 ? "from-orange-500/30 to-red-500/30 border-red-500/40 text-red-500" :
    streakDays >= 7 ? "from-orange-500/20 to-yellow-500/20 border-orange-500/30 text-orange-500" :
    streakDays >= 1 ? "from-amber-500/15 to-orange-500/15 border-amber-500/25 text-amber-500" :
    "from-muted to-muted border-border text-muted-foreground";

  return (
    <div
      className={cn(
        "flex items-center gap-1.5 px-2.5 py-1 rounded-full border bg-gradient-to-r transition-all hover:scale-105",
        intensity,
      )}
      aria-label={`${streakDays} day streak`}
      title={streakDays === 0 ? "Start a streak today!" : `${streakDays} day streak 🔥`}
    >
      <Flame className={cn("h-3.5 w-3.5", streakDays > 0 && "animate-pulse-slow")} />
      <span className="text-sm font-semibold tabular-nums">{streakDays}</span>
    </div>
  );
};

export default StreakIndicator;
