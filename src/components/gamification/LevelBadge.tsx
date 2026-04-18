import { useGamification } from "@/contexts/GamificationContext";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

const LevelBadge = () => {
  const { level, levelInfo, loading } = useGamification();

  if (loading) {
    return <div className="h-8 w-12 bg-muted/50 rounded-full animate-pulse" />;
  }

  const pct = Math.round(levelInfo.progress * 100);
  const circumference = 2 * Math.PI * 14;
  const dashOffset = circumference - (circumference * pct) / 100;

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div
          className={cn(
            "relative flex items-center justify-center h-8 w-8 rounded-full",
            "bg-gradient-to-br from-primary/20 to-accent/20 border border-primary/30",
            "transition-all hover:scale-110 cursor-default",
          )}
          aria-label={`Level ${level}, ${pct}% to next level`}
        >
          <svg className="absolute inset-0 -rotate-90" viewBox="0 0 32 32">
            <circle
              cx="16"
              cy="16"
              r="14"
              fill="none"
              stroke="hsl(var(--muted))"
              strokeWidth="2"
              opacity="0.4"
            />
            <circle
              cx="16"
              cy="16"
              r="14"
              fill="none"
              stroke="hsl(var(--primary))"
              strokeWidth="2"
              strokeDasharray={circumference}
              strokeDashoffset={dashOffset}
              strokeLinecap="round"
              className="transition-all duration-500 ease-out"
            />
          </svg>
          <span className="relative text-xs font-bold tabular-nums">{level}</span>
        </div>
      </TooltipTrigger>
      <TooltipContent side="bottom">
        <div className="text-xs">
          <p className="font-semibold">Level {level}</p>
          <p className="text-muted-foreground">
            {levelInfo.currentLevelXp} / {levelInfo.nextLevelXp} XP
          </p>
        </div>
      </TooltipContent>
    </Tooltip>
  );
};

export default LevelBadge;
