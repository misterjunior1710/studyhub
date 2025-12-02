import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Loader2, AlertCircle, Send } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface BanAppealDialogProps {
  userId: string;
  bannedUntil: string | null;
}

const BanAppealDialog = ({ userId, bannedUntil }: BanAppealDialogProps) => {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);
  const [existingAppeal, setExistingAppeal] = useState(false);

  const checkExistingAppeal = async () => {
    const { data } = await supabase
      .from("ban_appeals")
      .select("id, status")
      .eq("user_id", userId)
      .eq("status", "pending")
      .maybeSingle();
    
    setExistingAppeal(!!data);
  };

  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen);
    if (isOpen) {
      checkExistingAppeal();
    }
  };

  const handleSubmit = async () => {
    if (!reason.trim()) {
      toast.error("Please provide a reason for your appeal");
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from("ban_appeals")
        .insert({
          user_id: userId,
          reason: reason.trim(),
        });

      if (error) throw error;

      toast.success("Your appeal has been submitted. An admin will review it soon.");
      setOpen(false);
      setReason("");
    } catch (error: any) {
      toast.error(error.message || "Failed to submit appeal");
    } finally {
      setLoading(false);
    }
  };

  const formatBanDate = () => {
    if (!bannedUntil) return "permanently";
    return `until ${new Date(bannedUntil).toLocaleDateString()}`;
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <AlertCircle className="h-4 w-4" />
          Appeal Ban
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Submit Ban Appeal</DialogTitle>
          <DialogDescription>
            Your account has been banned {formatBanDate()}. You can submit an appeal for review.
          </DialogDescription>
        </DialogHeader>

        {existingAppeal ? (
          <div className="bg-muted p-4 rounded-lg text-center">
            <AlertCircle className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              You already have a pending appeal. Please wait for an admin to review it.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="appeal-reason">Why should your ban be lifted?</Label>
              <Textarea
                id="appeal-reason"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Explain why you believe your ban should be reconsidered..."
                rows={4}
                maxLength={1000}
              />
              <p className="text-xs text-muted-foreground text-right">
                {reason.length}/1000 characters
              </p>
            </div>

            <Button 
              onClick={handleSubmit} 
              disabled={loading || !reason.trim()} 
              className="w-full gap-2"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
              Submit Appeal
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default BanAppealDialog;
