import { memo } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Clock, RefreshCw, LogIn } from "lucide-react";

interface SessionExpiredDialogProps {
  open: boolean;
  onRefresh: () => void;
  onSignIn: () => void;
}

const SessionExpiredDialog = ({ open, onRefresh, onSignIn }: SessionExpiredDialogProps) => {
  return (
    <Dialog open={open}>
      <DialogContent className="sm:max-w-md" onPointerDownOutside={(e) => e.preventDefault()}>
        <DialogHeader className="text-center sm:text-left">
          <div className="mx-auto sm:mx-0 mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
            <Clock className="h-6 w-6 text-muted-foreground" />
          </div>
          <DialogTitle className="text-xl">Study Break? 😴</DialogTitle>
          <DialogDescription className="text-base">
            You've been away for a while, so we logged you out for safety.
            Refresh to jump back in, or sign in again.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex-col gap-2 sm:flex-row sm:gap-2">
          <Button
            variant="outline"
            onClick={onSignIn}
            className="w-full sm:w-auto gap-2"
          >
            <LogIn className="h-4 w-4" />
            Sign In Again
          </Button>
          <Button
            onClick={onRefresh}
            className="w-full sm:w-auto gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh Session
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default memo(SessionExpiredDialog);
