import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Coins, Sparkles, CheckCircle2, Target, BookOpen, MessageSquare, Brain, Flame, Trophy, Heart, Users, Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Mission } from "@/hooks/useMissions";

const iconMap: Record<string, any> = {
  Target, BookOpen, MessageSquare, Brain, Flame, Trophy, Heart, Users, Zap, Sparkles,
};

const difficultyColors: Record<string, string> = {
  easy: "bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20",
  medium: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
  hard: "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20",
};

interface MissionCardProps {
  mission: Mission;
  compact?: boolean;
}

const MissionCard = ({ mission, compact = false }: MissionCardProps) => {
  const Icon = iconMap[mission.icon || "Target"] || Target;
  const pct = Math.min(100, (mission.progress / mission.target) * 100);
  const isComplete = mission.completed;

  return (
    <Card
      className={cn(
        "relative overflow-hidden transition-all",
        isComplete && "border-success/40 bg-success/5",
      )}
    >
      <CardContent className={cn("relative", compact ? "p-3" : "p-4")}>
        <div className="flex items-start gap-3">
          <div
            className={cn(
              "shrink-0 rounded-lg p-2",
              isComplete ? "bg-success/20 text-success" : "bg-primary/10 text-primary",
            )}
          >
            {isComplete ? <CheckCircle2 className="h-5 w-5" /> : <Icon className="h-5 w-5" />}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2 mb-1">
              <h4
                className={cn(
                  "font-semibold text-sm leading-tight",
                  isComplete && "line-through text-muted-foreground",
                )}
              >
                {mission.title}
              </h4>
              <Badge
                variant="outline"
                className={cn("text-[10px] px-1.5 py-0 h-5 shrink-0", difficultyColors[mission.difficulty])}
              >
                {mission.difficulty}
              </Badge>
            </div>

            {!compact && (
              <p className="text-xs text-muted-foreground mb-2 line-clamp-2">
                {mission.description}
              </p>
            )}

            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="tabular-nums text-muted-foreground">
                {mission.progress}/{mission.target}
              </span>
              <div className="flex items-center gap-2">
                <span className="flex items-center gap-0.5 text-amber-600 dark:text-amber-400 font-medium">
                  <Coins className="h-3 w-3" />
                  {mission.coin_reward}
                </span>
                <span className="flex items-center gap-0.5 text-primary font-medium">
                  <Sparkles className="h-3 w-3" />
                  {mission.xp_reward}
                </span>
              </div>
            </div>
            <Progress value={pct} className="h-1.5" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default MissionCard;
