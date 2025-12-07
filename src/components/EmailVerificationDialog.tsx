import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Mail } from "lucide-react";

interface EmailVerificationDialogProps {
  open: boolean;
  email: string;
  onGoToLogin: () => void;
}

const EmailVerificationDialog = ({
  open,
  email,
  onGoToLogin,
}: EmailVerificationDialogProps) => {
  return (
    <AlertDialog open={open}>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center animate-bounce-soft">
              <Mail className="h-8 w-8 text-primary-foreground" />
            </div>
          </div>
          <AlertDialogTitle className="text-2xl text-center">
            Check Your Email Inbox!
          </AlertDialogTitle>
          <AlertDialogDescription className="text-center space-y-3">
            <p>
              We've sent a verification link to:
            </p>
            <p className="font-semibold text-foreground bg-muted px-3 py-2 rounded-md">
              {email}
            </p>
            <p className="text-sm">
              Please click the link in the email to verify your account before logging in.
            </p>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="sm:justify-center">
          <Button onClick={onGoToLogin} className="w-full sm:w-auto">
            Go to Login
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default EmailVerificationDialog;
