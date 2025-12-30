import { memo, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { PartyPopper, Sparkles, HelpCircle } from "lucide-react";
import { useOnboarding } from "@/contexts/OnboardingContext";
import OnboardingConfetti from "./OnboardingConfetti";

const OnboardingCelebration = () => {
  const navigate = useNavigate();
  const { showCelebration, dismissCelebration } = useOnboarding();
  const [showConfetti, setShowConfetti] = useState(false);
  const [showMessage, setShowMessage] = useState(false);
  const [showFooter, setShowFooter] = useState(false);

  useEffect(() => {
    if (showCelebration) {
      // Trigger confetti immediately
      setShowConfetti(true);
      
      // Show main message after a brief delay
      const messageTimeout = setTimeout(() => {
        setShowMessage(true);
      }, 300);

      // Show footer message after main message
      const footerTimeout = setTimeout(() => {
        setShowFooter(true);
      }, 1500);

      return () => {
        clearTimeout(messageTimeout);
        clearTimeout(footerTimeout);
      };
    } else {
      setShowConfetti(false);
      setShowMessage(false);
      setShowFooter(false);
    }
  }, [showCelebration]);

  const handleDismiss = () => {
    dismissCelebration();
  };

  const handleSupportClick = () => {
    dismissCelebration();
    navigate("/support");
  };

  return (
    <>
      <OnboardingConfetti active={showConfetti} count={80} />
      
      <Dialog open={showCelebration} onOpenChange={(open) => !open && handleDismiss()}>
        <DialogContent className="sm:max-w-md p-0 overflow-hidden border-0">
          {/* Celebration header */}
          <div className="bg-gradient-to-br from-accent via-primary to-accent p-8 text-center text-white relative overflow-hidden">
            {/* Animated background sparkles */}
            <div className="absolute inset-0 opacity-30">
              {[...Array(6)].map((_, i) => (
                <Sparkles
                  key={i}
                  className="absolute animate-pulse"
                  style={{
                    left: `${15 + i * 15}%`,
                    top: `${20 + (i % 3) * 25}%`,
                    animationDelay: `${i * 0.2}s`,
                    width: 16 + (i % 3) * 4,
                    height: 16 + (i % 3) * 4,
                  }}
                />
              ))}
            </div>

            <div 
              className={`relative transition-all duration-500 ${
                showMessage ? "opacity-100 scale-100" : "opacity-0 scale-75"
              }`}
            >
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-white/20 backdrop-blur-sm mb-4 animate-bounce-soft">
                <PartyPopper className="h-10 w-10" />
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold mb-2">
                🎉 Congratulations! 🎉
              </h2>
              <p className="text-white/90">
                You've completed your StudyHub setup!
              </p>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 space-y-4">
            <p className="text-center text-muted-foreground">
              You're all set to explore, learn, and connect with students from around the world. 
              Your study journey starts now!
            </p>

            {/* Footer message */}
            <div 
              className={`text-center p-4 bg-secondary/50 rounded-lg transition-all duration-500 ${
                showFooter ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
              }`}
            >
              <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                <HelpCircle className="h-4 w-4" />
                <span>
                  Need help? Check out our{" "}
                  <button
                    onClick={handleSupportClick}
                    className="text-primary hover:underline font-medium"
                  >
                    Support page
                  </button>{" "}
                  where you can contact our team.
                </span>
              </div>
            </div>

            <Button 
              onClick={handleDismiss} 
              className="w-full bg-gradient-to-r from-primary to-accent hover:opacity-90"
              size="lg"
            >
              Let's Go!
              <Sparkles className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default memo(OnboardingCelebration);
