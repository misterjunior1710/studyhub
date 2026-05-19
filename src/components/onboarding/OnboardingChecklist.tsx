import { memo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useIsMobile } from "@/hooks/use-mobile";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Check, ChevronDown, ChevronUp, Sparkles, X } from "lucide-react";
import { useOnboarding } from "@/contexts/OnboardingContext";
import { cn } from "@/lib/utils";

const OnboardingChecklist = () => {
  const navigate = useNavigate();
  const { showChecklist, tasks, dismissChecklist, isOnboardingComplete, completeTask } = useOnboarding();
  const isMobile = useIsMobile();
  const [isCollapsed, setIsCollapsed] = useState(isMobile);

  if (!showChecklist || isOnboardingComplete) return null;

  const completedCount = tasks.filter((t) => t.completed).length;
  const totalCount = tasks.length;
  const progress = (completedCount / totalCount) * 100;

  const taskActions: Record<string, () => void> = {
    profile: () => navigate("/settings"),
    browse: () => {
      // Mark "browse the feed" complete as soon as user actually navigates there.
      try { localStorage.setItem("studyhub_browsed_feed", "true"); } catch {}
      completeTask("browse");
      navigate("/feed");
    },
    group: () => navigate("/groups"),
    friend: () => navigate("/friends"),
    post: () => {
      // CreatePostDialog (mounted in Navbar) listens for this event and opens itself.
      navigate("/feed");
      // Defer so dialog mounts after route change.
      setTimeout(() => {
        window.dispatchEvent(new CustomEvent("studyhub:open-create-post"));
      }, 50);
    },
  };

  return (
    <div className="fixed top-20 right-2 sm:right-4 z-40 animate-slide-in-right max-w-[calc(100vw-1rem)]">
      <Card className="w-[260px] sm:w-72 shadow-lg border-primary/20">
        <CardHeader className="pb-2 px-3 sm:px-6 pt-3 sm:pt-6">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" />
              Your First Steps
            </CardTitle>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={() => setIsCollapsed(!isCollapsed)}
              >
                {isCollapsed ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronUp className="h-4 w-4" />
                )}
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={dismissChecklist}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <div className="flex items-center gap-2 mt-1">
            <Progress value={progress} className="h-2 flex-1" />
            <span className="text-xs text-muted-foreground">
              {completedCount}/{totalCount}
            </span>
          </div>
        </CardHeader>

        {!isCollapsed && (
          <CardContent className="pt-2 pb-4">
            <ul className="space-y-2">
              {tasks.map((task, index) => (
                <li
                  key={task.id}
                  className={cn(
                    "flex items-center gap-3 p-2 rounded-lg transition-colors cursor-pointer",
                    task.completed
                      ? "bg-success/10"
                      : "bg-secondary/50 hover:bg-secondary"
                  )}
                  onClick={() => !task.completed && taskActions[task.id]?.()}
                >
                  <div
                    className={cn(
                      "flex items-center justify-center w-6 h-6 rounded-full shrink-0 transition-all",
                      task.completed
                        ? "bg-success text-success-foreground animate-checkmark-pop"
                        : "bg-muted text-muted-foreground"
                    )}
                  >
                    {task.completed ? (
                      <Check className="h-3.5 w-3.5" />
                    ) : (
                      <span className="text-xs font-medium">{index + 1}</span>
                    )}
                  </div>
                  <span
                    className={cn(
                      "text-sm",
                      task.completed && "line-through text-muted-foreground"
                    )}
                  >
                    {task.label}
                  </span>
                  {task.completed && (
                    <div className="ml-auto">
                      <div className="confetti-particle" />
                    </div>
                  )}
                </li>
              ))}
            </ul>
          </CardContent>
        )}
      </Card>
    </div>
  );
};

export default memo(OnboardingChecklist);
