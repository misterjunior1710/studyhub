import { memo } from "react";
import { useNavigate } from "react-router-dom";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { MessageCircleQuestion, ArrowRight } from "lucide-react";
import { useOnboarding } from "@/contexts/OnboardingContext";
import { useAuth } from "@/contexts/AuthContext";

const OnboardingWelcome = () => {
  const navigate = useNavigate();
  const { showWelcome, dismissWelcome } = useOnboarding();
  const { username } = useAuth();

  const handleAsk = () => {
    dismissWelcome();
    navigate("/feed");
    setTimeout(() => {
      window.dispatchEvent(new CustomEvent("studyhub:open-create-post"));
    }, 80);
  };

  const handleSkip = () => {
    dismissWelcome();
  };

  return (
    <Dialog open={showWelcome} onOpenChange={(open) => !open && dismissWelcome()}>
      <DialogContent
        className="sm:max-w-md p-0 overflow-hidden border-0 bg-background"
        aria-describedby={undefined}
      >
        <div className="relative px-6 sm:px-8 pt-10 pb-7 text-center">
          {/* Soft ambient gradient */}
          <div
            className="pointer-events-none absolute inset-x-0 -top-24 h-56 bg-gradient-to-b from-primary/25 via-primary/5 to-transparent blur-2xl"
            aria-hidden="true"
          />

          <div className="relative">
            <div className="mx-auto mb-5 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 ring-1 ring-primary/20">
              <MessageCircleQuestion className="h-8 w-8 text-primary" aria-hidden="true" />
            </div>

            <h2 className="text-2xl sm:text-[28px] font-bold tracking-tight text-foreground">
              {username ? `Welcome, ${username}` : "Welcome to StudyHub"}
            </h2>
            <p className="mt-2 text-sm sm:text-base text-muted-foreground max-w-sm mx-auto">
              StudyHub works best when students help students. Start by asking your first question — the community takes it from here.
            </p>

            <Button
              onClick={handleAsk}
              size="lg"
              className="mt-7 w-full h-12 text-base font-medium"
            >
              Ask your first question
              <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
            </Button>

            <button
              type="button"
              onClick={handleSkip}
              className="mt-3 text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              I'll explore first
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default memo(OnboardingWelcome);
