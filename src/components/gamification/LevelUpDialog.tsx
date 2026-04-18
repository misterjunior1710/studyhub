import { useEffect } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useGamification } from "@/contexts/GamificationContext";
import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { sounds } from "@/lib/sounds";

const LevelUpDialog = () => {
  const { levelUpEvent, dismissLevelUp } = useGamification();

  useEffect(() => {
    if (levelUpEvent) sounds.levelUp();
  }, [levelUpEvent]);

  if (!levelUpEvent) return null;

  return (
    <Dialog open onOpenChange={(open) => !open && dismissLevelUp()}>
      <DialogContent className="max-w-sm border-primary/30 bg-gradient-to-br from-primary/10 via-background to-accent/10">
        <div className="text-center py-6 space-y-4">
          <div className="relative mx-auto w-24 h-24 flex items-center justify-center">
            <div className="absolute inset-0 bg-gradient-to-br from-primary to-accent rounded-full animate-pulse opacity-30" />
            <div className="relative w-20 h-20 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-3xl font-bold text-primary-foreground">
              {levelUpEvent.level}
            </div>
            <Sparkles className="absolute -top-1 -right-1 h-6 w-6 text-amber-400 animate-pulse" />
          </div>
          <div>
            <h2 className="text-2xl font-bold">Level Up!</h2>
            <p className="text-muted-foreground text-sm mt-1">
              You reached Level {levelUpEvent.level}
            </p>
          </div>
          <Button onClick={dismissLevelUp} className="w-full">
            Keep going 🚀
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default LevelUpDialog;
