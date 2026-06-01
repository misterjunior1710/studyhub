import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Crown, Sparkles, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useSubscription } from "@/hooks/useSubscription";
import { useAuth } from "@/contexts/AuthContext";

export type PromoSurface =
  | "dashboard"
  | "nova"
  | "planner"
  | "calendar"
  | "groups"
  | "feed"
  | "studymode"
  | "generic";

const COPY: Record<PromoSurface, { title: string; body: string }> = {
  dashboard: {
    title: "Unlock your full study toolkit",
    body: "Pro unlocks advanced analytics, unlimited Nova AI, premium themes and more.",
  },
  nova: {
    title: "Get unlimited Nova AI",
    body: "Pro removes the free daily request cap and unlocks longer, smarter answers.",
  },
  planner: {
    title: "Plan without limits",
    body: "Pro removes task limits and unlocks AI task assist, recurring schedules and more.",
  },
  calendar: {
    title: "Power up your calendar",
    body: "Pro unlocks Google Calendar sync, smart reminders and unlimited events.",
  },
  groups: {
    title: "Better study groups with Pro",
    body: "Create unlimited groups, share whiteboards and collaborate in real time.",
  },
  feed: {
    title: "Studying with StudyHub Pro",
    body: "No interruptions, premium tools, and a Pro badge on your profile.",
  },
  studymode: {
    title: "Study smarter with Pro",
    body: "Unlimited flashcards, quizzes and mind maps — plus AI generation.",
  },
  generic: {
    title: "StudyHub Pro",
    body: "Unlock every premium feature and remove the free-tier limits.",
  },
};

interface PremiumPromoBannerProps {
  surface: PromoSurface;
  className?: string;
  /** Hide the dismiss button — banner stays persistent. Default true (dismissible). */
  dismissible?: boolean;
}

/**
 * Persistent, unobtrusive Premium promo card. Per-surface dismissal is
 * remembered in localStorage so it doesn't keep nagging the same user.
 * Hidden entirely for Pro users.
 */
const PremiumPromoBanner = ({ surface, className, dismissible = true }: PremiumPromoBannerProps) => {
  const { user } = useAuth();
  const { isPro, loading } = useSubscription();
  const storageKey = `studyhub.promoBanner.dismissed.${surface}`;
  const [dismissed, setDismissed] = useState(true); // start hidden to avoid flicker

  useEffect(() => {
    try {
      setDismissed(localStorage.getItem(storageKey) === "1");
    } catch {
      setDismissed(false);
    }
  }, [storageKey]);

  if (!user || loading || isPro || dismissed) return null;

  const { title, body } = COPY[surface];

  const handleDismiss = () => {
    try {
      localStorage.setItem(storageKey, "1");
    } catch {
      /* ignore */
    }
    setDismissed(true);
  };

  return (
    <aside
      aria-label="StudyHub Pro promotion"
      className={cn(
        "relative rounded-xl border border-primary/30 bg-gradient-to-br from-primary/10 via-background to-accent/10 p-4 shadow-sm",
        className,
      )}
    >
      {dismissible && (
        <button
          type="button"
          onClick={handleDismiss}
          aria-label="Dismiss Pro promotion"
          className="absolute right-2 top-2 rounded-md p-1 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      )}
      <div className="flex items-start gap-3 pr-6">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-primary/20 to-accent/20 text-primary">
          <Crown className="h-4 w-4" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-primary">
            StudyHub Pro
          </p>
          <h3 className="text-sm font-semibold leading-tight mt-0.5">{title}</h3>
          <p className="mt-1 text-xs text-muted-foreground leading-relaxed">{body}</p>
          <Button asChild size="sm" variant="default" className="mt-3 h-8 px-3 text-xs">
            <Link to="/pricing">
              <Sparkles className="mr-1.5 h-3 w-3" />
              See Pro
            </Link>
          </Button>
        </div>
      </div>
    </aside>
  );
};

export default PremiumPromoBanner;
