import { createContext, ReactNode, useCallback, useContext, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Crown, Sparkles, Check, X } from "lucide-react";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useSubscription } from "@/hooks/useSubscription";
import { useAuth } from "@/contexts/AuthContext";

/**
 * Natural "moments" where it's reasonable to surface a celebratory upgrade
 * prompt. Each moment is throttled per browser so we never nag.
 */
export type PremiumMoment =
  | "session_complete"
  | "nova_limit_reached"
  | "resource_milestone"
  | "mission_complete"
  | "material_imported"
  | "feature_locked";

const THROTTLE_MS = 24 * 60 * 60 * 1000; // 24h between prompts (any moment)
const STORAGE_KEY = "studyhub.premiumMoment.lastShown";

const COPY: Record<PremiumMoment, { eyebrow: string; title: string; body: string; highlights: string[] }> = {
  session_complete: {
    eyebrow: "Nice work",
    title: "You're on a roll — go further with Pro",
    body: "You just finished a study session. Pro students unlock unlimited tools to keep that momentum.",
    highlights: ["Unlimited Nova AI requests", "Advanced study analytics", "Premium themes & Pro badge"],
  },
  nova_limit_reached: {
    eyebrow: "Daily limit reached",
    title: "You've used today's free Nova AI",
    body: "Upgrade to Pro for unlimited Nova requests, longer answers, and priority models.",
    highlights: ["Unlimited daily AI requests", "Smarter premium models", "No daily caps on any tool"],
  },
  resource_milestone: {
    eyebrow: "You're building a library",
    title: "Unlock unlimited study resources",
    body: "Free accounts have a cap on flashcards, quizzes, mind maps and notes. Pro removes them all.",
    highlights: ["Unlimited flashcards & quizzes", "Unlimited notes & mind maps", "AI-powered generation"],
  },
  mission_complete: {
    eyebrow: "Achievement unlocked",
    title: "Celebrate with StudyHub Pro",
    body: "You're putting in real work. Pro rewards you with the full toolkit and a Pro badge.",
    highlights: ["Pro badge on your profile", "Premium themes & customization", "Every Pro feature unlocked"],
  },
  material_imported: {
    eyebrow: "Great import",
    title: "Get more from your study material",
    body: "Pro unlocks unlimited AI generation, larger files and advanced study tools.",
    highlights: ["Larger file uploads", "Unlimited AI generation", "Advanced editor & formulas"],
  },
  feature_locked: {
    eyebrow: "Pro feature",
    title: "This one's part of StudyHub Pro",
    body: "Upgrade to unlock this feature and the rest of the Pro toolkit.",
    highlights: ["Collaborative whiteboards & docs", "Premium Nova AI", "Every Pro feature unlocked"],
  },
};

interface PremiumMomentContextValue {
  trigger: (moment: PremiumMoment) => void;
}

const PremiumMomentContext = createContext<PremiumMomentContextValue | null>(null);

export const PremiumMomentProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const { isPro, loading } = useSubscription();
  const [moment, setMoment] = useState<PremiumMoment | null>(null);

  const trigger = useCallback(
    (m: PremiumMoment) => {
      if (!user || loading || isPro) return;
      // Throttle: never show more than one moment per 24h, except feature_locked
      // (which is a direct user action and should always respond).
      if (m !== "feature_locked") {
        try {
          const last = Number(localStorage.getItem(STORAGE_KEY) || "0");
          if (last && Date.now() - last < THROTTLE_MS) return;
        } catch {
          /* ignore */
        }
      }
      try {
        localStorage.setItem(STORAGE_KEY, String(Date.now()));
      } catch {
        /* ignore */
      }
      setMoment(m);
    },
    [user, isPro, loading],
  );

  const value = useMemo(() => ({ trigger }), [trigger]);

  const copy = moment ? COPY[moment] : null;

  return (
    <PremiumMomentContext.Provider value={value}>
      {children}
      <Dialog open={!!moment} onOpenChange={(open) => !open && setMoment(null)}>
        <DialogContent className="max-w-md p-0 overflow-hidden border-primary/30">
          {copy && (
            <div className="relative">
              <div
                className="pointer-events-none absolute inset-x-0 -top-px h-px bg-gradient-to-r from-transparent via-primary to-transparent"
                aria-hidden
              />
              <div className="bg-gradient-to-br from-primary/10 via-background to-accent/10 p-6">
                <div className="flex items-start gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 text-primary">
                    <Crown className="h-5 w-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-primary">
                      {copy.eyebrow}
                    </p>
                    <DialogTitle className="text-lg font-bold leading-tight mt-0.5">
                      {copy.title}
                    </DialogTitle>
                  </div>
                </div>
                <DialogDescription className="mt-3 text-sm text-muted-foreground">
                  {copy.body}
                </DialogDescription>
                <ul className="mt-4 space-y-2">
                  {copy.highlights.map((h) => (
                    <li key={h} className="flex items-start gap-2 text-sm">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden />
                      <span>{h}</span>
                    </li>
                  ))}
                </ul>
                <div className="mt-5 flex flex-col sm:flex-row gap-2">
                  <Button asChild className="flex-1" onClick={() => setMoment(null)}>
                    <Link to="/pricing">
                      <Sparkles className="mr-1.5 h-3.5 w-3.5" />
                      See Pro plans
                    </Link>
                  </Button>
                  <Button variant="ghost" className="flex-1" onClick={() => setMoment(null)}>
                    Keep using free
                  </Button>
                </div>
                <p className="mt-3 text-center text-[11px] text-muted-foreground">
                  You can keep using StudyHub for free — this prompt won't show again today.
                </p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </PremiumMomentContext.Provider>
  );
};

/**
 * Trigger a celebratory, dismissible Premium upgrade prompt at a natural
 * engagement moment. No-op for Pro users and throttled to once per 24h
 * (except feature_locked, which is a direct user action).
 */
export const usePremiumMoment = (): PremiumMomentContextValue => {
  const ctx = useContext(PremiumMomentContext);
  if (!ctx) {
    // Soft fallback so callers never crash if provider isn't mounted yet
    return { trigger: () => {} };
  }
  return ctx;
};
