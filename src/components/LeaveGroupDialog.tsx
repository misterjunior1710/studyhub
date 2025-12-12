import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { LogOut, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface LeaveGroupDialogProps {
  groupId: string;
  groupName: string;
  onLeave: () => void;
}

const LeaveGroupDialog = ({ groupId, groupName, onLeave }: LeaveGroupDialogProps) => {
  const [open, setOpen] = useState(false);
  const [leaving, setLeaving] = useState(false);

  const handleLeave = async () => {
    setLeaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error("You must be logged in");
        return;
      }

      const { error } = await supabase
        .from("group_members")
        .delete()
        .eq("group_id", groupId)
        .eq("user_id", user.id);

      if (error) throw error;

      toast.success("You have left the group");
      setOpen(false);
      onLeave();
    } catch (error: any) {
      console.error("Error leaving group:", error);
      toast.error("Failed to leave group");
    } finally {
      setLeaving(false);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 sm:h-10 sm:w-10 text-muted-foreground hover:text-destructive"
          aria-label="Leave group"
        >
          <LogOut className="h-4 w-4 sm:h-5 sm:w-5" />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent className="max-w-[90vw] sm:max-w-md">
        <AlertDialogHeader>
          <AlertDialogTitle>Leave Group</AlertDialogTitle>
          <AlertDialogDescription className="space-y-2">
            <span>
              Are you sure you want to leave "{groupName}"?
            </span>
            <span className="block text-destructive">
              You will lose access to all messages and won't be able to rejoin unless invited again.
            </span>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="gap-2 sm:gap-0">
          <AlertDialogCancel disabled={leaving}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault();
              handleLeave();
            }}
            disabled={leaving}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {leaving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Leaving...
              </>
            ) : (
              "Leave Group"
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default LeaveGroupDialog;
