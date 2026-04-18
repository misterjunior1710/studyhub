import { useGamification } from "@/contexts/GamificationContext";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Flame, Coins, Snowflake, Target, BookOpen, MessageSquare, Brain, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";

const goalIcons = {
  study: BookOpen,
  answer: MessageSquare,
  quiz: Brain,
};

const goalLabels = {
  study: "Complete a 25-min study session",
  answer: "Answer 2 questions",
  quiz: "Finish a quiz",
};

const useTimeUntilMidnight = () => {
  const [time, setTime] = useState("");
  useEffect(() => {
    const update = () => {
      const now = new Date();
      const tomorrow = new Date(now);
      tomorrow.setHours(24, 0, 0, 0);
      const diff = tomorrow.getTime() - now.getTime();
      const h = Math.floor(diff / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      setTime(`${h}h ${m}m`);
    };
    update();
    const interval = setInterval(update, 60000);
    return () => clearInterval(interval);
  }, []);
  return time;
};

const GamificationDashboard = () => {
  const { coins, streakDays, streakFreezes, goals, purchaseStreakFreeze, loading } = useGamification();
  const timeLeft = useTimeUntilMidnight();

  if (loading) {
    return (
      <Card className="animate-pulse">
        <CardContent className="p-6 h-48 bg-muted/30" />
      </Card>
    );
  }

  const handlePurchase = async () => {
    const result = await purchaseStreakFreeze();
    if (result.success) {
      toast.success("Streak Freeze purchased! ❄️", { description: "It will auto-protect your streak if you miss a day." });
    } else if (result.reason === "insufficient_coins") {
      toast.error("Not enough coins", { description: "Streak Freeze costs 50 coins." });
    } else if (result.reason === "max_freezes_owned") {
      toast.error("You already own the max (2 freezes)");
    } else {
      toast.error("Couldn't complete purchase");
    }
  };

  const completedCount = goals.filter((g) => g.completed).length;
  const allComplete = completedCount === 3;

  return (
    <div className="grid gap-4 md:grid-cols-3">
      {/* Streak Card */}
      <Card className="relative overflow-hidden border-amber-500/20">
        <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-orange-500/10 pointer-events-none" />
        <CardContent className="p-5 relative">
          <div className="flex items-start justify-between mb-3">
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wide font-semibold">Current Streak</p>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-3xl font-bold tabular-nums">{streakDays}</span>
                <span className="text-sm text-muted-foreground">{streakDays === 1 ? "day" : "days"}</span>
              </div>
            </div>
            <Flame className={cn(
              "h-10 w-10 text-amber-500",
              streakDays > 0 && "animate-pulse-slow",
              streakDays >= 30 && "text-red-500",
              streakDays >= 100 && "text-pink-500",
            )} />
          </div>
          <p className="text-xs text-muted-foreground mb-3">
            {streakDays === 0 ? "Start your streak today!" : `Resets in ${timeLeft}`}
          </p>

          <div className="flex items-center gap-2 pt-3 border-t border-border/50">
            <Snowflake className="h-4 w-4 text-blue-400" />
            <span className="text-xs font-medium">{streakFreezes}/2 freezes</span>
            <Button
              size="sm"
              variant="outline"
              className="ml-auto h-7 text-xs"
              onClick={handlePurchase}
              disabled={streakFreezes >= 2 || coins < 50}
            >
              <Coins className="h-3 w-3 mr-1 text-amber-500" />
              50
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Daily Goals Card */}
      <Card className={cn(
        "md:col-span-2 relative overflow-hidden border-primary/20",
        allComplete && "border-success/40",
      )}>
        <div className={cn(
          "absolute inset-0 pointer-events-none",
          allComplete
            ? "bg-gradient-to-br from-success/5 to-success/10"
            : "bg-gradient-to-br from-primary/5 to-accent/10",
        )} />
        <CardContent className="p-5 relative">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Target className="h-5 w-5 text-primary" />
              <h3 className="font-semibold">Today's Goals</h3>
            </div>
            <span className="text-xs text-muted-foreground">
              {completedCount}/3 complete {allComplete && "🎉"}
            </span>
          </div>

          <div className="space-y-3">
            {goals.map((goal) => {
              const Icon = goalIcons[goal.goal_type];
              const pct = Math.min(100, (goal.progress / goal.target) * 100);
              return (
                <div key={goal.goal_type}>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <div className="flex items-center gap-1.5">
                      <Icon className="h-3.5 w-3.5 text-muted-foreground" />
                      <span className={cn("font-medium", goal.completed && "line-through text-muted-foreground")}>
                        {goalLabels[goal.goal_type]}
                      </span>
                      {goal.completed && <CheckCircle2 className="h-3.5 w-3.5 text-success" />}
                    </div>
                    <span className="tabular-nums text-muted-foreground">
                      {goal.progress}/{goal.target}
                    </span>
                  </div>
                  <Progress value={pct} className="h-1.5" />
                </div>
              );
            })}
          </div>

          {allComplete && (
            <p className="text-xs text-success font-medium mt-3 text-center">
              Perfect day! +50 bonus coins earned 🎁
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default GamificationDashboard;
