import { memo } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { GraduationCap, Sparkles, Users, BookOpen, MessageCircle } from "lucide-react";
import { useOnboarding } from "@/contexts/OnboardingContext";

const OnboardingWelcome = () => {
  const { showWelcome, dismissWelcome } = useOnboarding();

  return (
    <Dialog open={showWelcome} onOpenChange={(open) => !open && dismissWelcome()}>
      <DialogContent className="sm:max-w-lg p-0 overflow-hidden border-0">
        {/* Header with gradient */}
        <div className="bg-gradient-to-br from-primary via-primary to-accent p-8 text-center text-white">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-white/20 backdrop-blur-sm mb-4">
            <GraduationCap className="h-10 w-10" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold mb-2">Welcome to StudyHub! 🎉</h2>
          <p className="text-white/90 text-sm sm:text-base">
            You just made your future self very happy
          </p>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          <p className="text-muted-foreground text-center">
            Connect with students worldwide, share knowledge, and crush your exams together. 
            Here's a quick look at what you can do:
          </p>

          {/* Feature highlights */}
          <div className="grid grid-cols-2 gap-3">
            <div className="flex items-center gap-2 p-3 rounded-lg bg-secondary/50">
              <Users className="h-5 w-5 text-primary shrink-0" />
              <span className="text-sm">Study Squads</span>
            </div>
            <div className="flex items-center gap-2 p-3 rounded-lg bg-secondary/50">
              <MessageCircle className="h-5 w-5 text-primary shrink-0" />
              <span className="text-sm">Ask Doubts</span>
            </div>
            <div className="flex items-center gap-2 p-3 rounded-lg bg-secondary/50">
              <BookOpen className="h-5 w-5 text-primary shrink-0" />
              <span className="text-sm">Share Notes</span>
            </div>
            <div className="flex items-center gap-2 p-3 rounded-lg bg-secondary/50">
              <Sparkles className="h-5 w-5 text-primary shrink-0" />
              <span className="text-sm">Earn XP</span>
            </div>
          </div>

          <Button 
            onClick={dismissWelcome} 
            className="w-full bg-gradient-to-r from-primary to-accent hover:opacity-90"
            size="lg"
          >
            Let's Go!
            <Sparkles className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default memo(OnboardingWelcome);
