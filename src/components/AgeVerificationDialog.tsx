import { useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { ShieldAlert, ExternalLink } from "lucide-react";
import { Link } from "react-router-dom";

interface AgeVerificationDialogProps {
  open: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

const AgeVerificationDialog = ({ open, onConfirm, onCancel }: AgeVerificationDialogProps) => {
  const [confirmed, setConfirmed] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  const handleConfirm = () => {
    if (confirmed && agreedToTerms) {
      onConfirm();
      setConfirmed(false);
      setAgreedToTerms(false);
    }
  };

  const handleCancel = () => {
    setConfirmed(false);
    setAgreedToTerms(false);
    onCancel();
  };

  return (
    <AlertDialog open={open} onOpenChange={(isOpen) => !isOpen && handleCancel()}>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader>
          <div className="flex items-center justify-center mb-4">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-warning to-destructive flex items-center justify-center animate-pulse">
              <ShieldAlert className="h-8 w-8 text-white" />
            </div>
          </div>
          <AlertDialogTitle className="text-center text-xl">
            Age Verification Required
          </AlertDialogTitle>
          <AlertDialogDescription className="text-center space-y-3">
            <p>
              You selected <span className="font-semibold text-foreground">Adult (18+)</span> — just need to confirm a couple things before we continue.
            </p>
            <p className="text-sm">
              This helps us keep the platform safe for everyone.
            </p>
          </AlertDialogDescription>
        </AlertDialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="flex items-start space-x-3 p-3 rounded-lg bg-muted/50 border border-border">
            <Checkbox 
              id="age-confirm" 
              checked={confirmed}
              onCheckedChange={(checked) => setConfirmed(checked === true)}
              className="mt-0.5"
            />
            <Label htmlFor="age-confirm" className="text-sm leading-relaxed cursor-pointer">
              I confirm that I am <span className="font-bold text-primary">18 years of age or older</span> and understand that this selection cannot be easily changed.
            </Label>
          </div>
          
          <div className="flex items-start space-x-3 p-3 rounded-lg bg-muted/50 border border-border">
            <Checkbox 
              id="terms-agree" 
              checked={agreedToTerms}
              onCheckedChange={(checked) => setAgreedToTerms(checked === true)}
              className="mt-0.5"
            />
            <Label htmlFor="terms-agree" className="text-sm leading-relaxed cursor-pointer">
              I agree to the{" "}
              <Link to="/terms" className="text-primary hover:underline inline-flex items-center gap-1" target="_blank">
                Terms & Conditions <ExternalLink className="h-3 w-3" />
              </Link>{" "}
              and{" "}
              <Link to="/privacy" className="text-primary hover:underline inline-flex items-center gap-1" target="_blank">
                Privacy Policy <ExternalLink className="h-3 w-3" />
              </Link>
            </Label>
          </div>
        </div>

        <AlertDialogFooter className="flex-col sm:flex-row gap-2">
          <AlertDialogCancel onClick={handleCancel} className="w-full sm:w-auto">
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction 
            onClick={handleConfirm}
            disabled={!confirmed || !agreedToTerms}
            className="w-full sm:w-auto bg-gradient-to-r from-primary to-accent hover:opacity-90 disabled:opacity-50"
          >
            Confirm & Continue
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default AgeVerificationDialog;
