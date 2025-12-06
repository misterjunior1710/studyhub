import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { BookOpen, Timer } from "lucide-react";

const messages = [
  "You've been scrolling for a bit! Ready to get back on track? 🎯",
  "Hey friend! Your study goals are waiting for you! 📖",
  "Memes are fun, but so is crushing your goals! 💪",
  "A little break is great—just checking in! Ready to focus? ✨",
  "Your future self will thank you for getting back to studying! 🌟",
];

interface StudyReminderDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onExtendTime: () => void;
}

const StudyReminderDialog = ({ open, onOpenChange, onExtendTime }: StudyReminderDialogProps) => {
  const navigate = useNavigate();
  const randomMessage = messages[Math.floor(Math.random() * messages.length)];

  const handleBackToStudy = () => {
    onOpenChange(false);
    navigate("/study");
  };

  const handleExtendTime = () => {
    onExtendTime();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="text-center sm:text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
            <BookOpen className="h-8 w-8 text-primary" />
          </div>
          <DialogTitle className="text-xl">Time for a Check-in! 📚</DialogTitle>
          <DialogDescription className="text-base pt-2">
            {randomMessage}
          </DialogDescription>
        </DialogHeader>
        
        <p className="text-center text-sm text-muted-foreground">
          No pressure—just a friendly nudge from your study buddy!
        </p>

        <div className="flex flex-col gap-3 mt-4">
          <Button onClick={handleBackToStudy} className="w-full gap-2">
            <BookOpen className="h-4 w-4" />
            Back to Study Mode
          </Button>
          <Button 
            variant="outline" 
            onClick={handleExtendTime} 
            className="w-full gap-2"
          >
            <Timer className="h-4 w-4" />
            5 More Minutes
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default StudyReminderDialog;
