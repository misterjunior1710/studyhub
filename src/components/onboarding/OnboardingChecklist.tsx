import { memo, useState, useRef, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Check, ChevronDown, ChevronUp, Sparkles, X, GripVertical } from "lucide-react";
import { useOnboarding } from "@/contexts/OnboardingContext";
import { cn } from "@/lib/utils";

const POS_KEY = "studyhub_onboarding_pos_v1";
const COLLAPSE_KEY = "studyhub_onboarding_collapsed_v1";

type Pos = { x: number; y: number };

const loadPos = (): Pos | null => {
  try {
    const raw = localStorage.getItem(POS_KEY);
    if (!raw) return null;
    const p = JSON.parse(raw);
    if (typeof p?.x === "number" && typeof p?.y === "number") return p;
  } catch {}
  return null;
};

const clampPos = (p: Pos, w: number, h: number): Pos => ({
  x: Math.min(Math.max(8, p.x), Math.max(8, window.innerWidth - w - 8)),
  y: Math.min(Math.max(8, p.y), Math.max(8, window.innerHeight - h - 8)),
});

const OnboardingChecklist = () => {
  const navigate = useNavigate();
  const { showChecklist, tasks, dismissChecklist, isOnboardingComplete, completeTask } = useOnboarding();

  // Default to collapsed so it never blocks underlying buttons.
  const [isCollapsed, setIsCollapsed] = useState(() => {
    try {
      const v = localStorage.getItem(COLLAPSE_KEY);
      return v === null ? true : v === "1";
    } catch { return true; }
  });

  const [pos, setPos] = useState<Pos | null>(() => loadPos());
  const cardRef = useRef<HTMLDivElement | null>(null);
  const dragState = useRef<{ active: boolean; dx: number; dy: number; pointerId: number | null }>({
    active: false, dx: 0, dy: 0, pointerId: null,
  });
  const movedRef = useRef(false);

  useEffect(() => {
    try { localStorage.setItem(COLLAPSE_KEY, isCollapsed ? "1" : "0"); } catch {}
  }, [isCollapsed]);

  // Keep within viewport on resize
  useEffect(() => {
    const onResize = () => {
      if (!pos || !cardRef.current) return;
      const r = cardRef.current.getBoundingClientRect();
      setPos((p) => (p ? clampPos(p, r.width, r.height) : p));
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [pos]);

  const onPointerDown = useCallback((e: React.PointerEvent) => {
    if (!cardRef.current) return;
    const r = cardRef.current.getBoundingClientRect();
    dragState.current.active = true;
    dragState.current.dx = e.clientX - r.left;
    dragState.current.dy = e.clientY - r.top;
    dragState.current.pointerId = e.pointerId;
    movedRef.current = false;
    (e.target as Element).setPointerCapture?.(e.pointerId);
  }, []);

  const onPointerMove = useCallback((e: React.PointerEvent) => {
    if (!dragState.current.active || !cardRef.current) return;
    movedRef.current = true;
    const r = cardRef.current.getBoundingClientRect();
    const next = clampPos(
      { x: e.clientX - dragState.current.dx, y: e.clientY - dragState.current.dy },
      r.width, r.height,
    );
    setPos(next);
  }, []);

  const onPointerUp = useCallback((e: React.PointerEvent) => {
    if (!dragState.current.active) return;
    dragState.current.active = false;
    try { (e.target as Element).releasePointerCapture?.(e.pointerId); } catch {}
    if (movedRef.current) {
      try { localStorage.setItem(POS_KEY, JSON.stringify(pos)); } catch {}
    }
  }, [pos]);

  if (!showChecklist || isOnboardingComplete) return null;

  const completedCount = tasks.filter((t) => t.completed).length;
  const totalCount = tasks.length;
  const progress = (completedCount / totalCount) * 100;

  const taskActions: Record<string, () => void> = {
    profile: () => navigate("/settings"),
    browse: () => {
      try { localStorage.setItem("studyhub_browsed_feed", "true"); } catch {}
      completeTask("browse");
      navigate("/feed");
    },
    group: () => navigate("/groups"),
    friend: () => navigate("/friends"),
    post: () => {
      navigate("/feed");
      setTimeout(() => {
        window.dispatchEvent(new CustomEvent("studyhub:open-create-post"));
      }, 50);
    },
  };

  // Use absolute positioning when user has moved it; otherwise default top-right.
  const positionedStyle: React.CSSProperties = pos
    ? { position: "fixed", left: pos.x, top: pos.y, right: "auto" }
    : {};

  return (
    <div
      className={cn(
        "fixed z-40 max-w-[calc(100vw-1rem)] animate-slide-in-right",
        !pos && "top-20 right-2 sm:right-4",
      )}
      style={positionedStyle}
    >
      <Card
        ref={cardRef}
        className={cn(
          "w-[260px] sm:w-72 shadow-lg border-primary/20",
          dragState.current.active && "cursor-grabbing select-none",
        )}
      >
        <CardHeader
          className="pb-2 px-3 sm:px-6 pt-3 sm:pt-6 touch-none"
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
          style={{ cursor: dragState.current.active ? "grabbing" : "grab" }}
        >
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <GripVertical className="h-3.5 w-3.5 text-muted-foreground" aria-hidden="true" />
              <Sparkles className="h-4 w-4 text-primary" />
              Your First Steps
            </CardTitle>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                aria-label={isCollapsed ? "Expand checklist" : "Collapse checklist"}
                onPointerDown={(e) => e.stopPropagation()}
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
                aria-label="Dismiss checklist"
                onPointerDown={(e) => e.stopPropagation()}
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
