import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Trash2, Loader2, AlertTriangle } from "lucide-react";
import { toast } from "sonner";

interface DeleteGroupDialogProps {
  groupId: string;
  groupName: string;
  onDelete: () => void;
}

const DeleteGroupDialog = ({ groupId, groupName, onDelete }: DeleteGroupDialogProps) => {
  const [open, setOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [confirmName, setConfirmName] = useState("");

  const canDelete = confirmName === groupName;

  const handleDelete = async () => {
    if (!canDelete) return;

    setDeleting(true);
    try {
      // Delete all messages first (cascade might handle this, but being explicit)
      await supabase
        .from("group_messages")
        .delete()
        .eq("group_id", groupId);

      // Delete all members
      await supabase
        .from("group_members")
        .delete()
        .eq("group_id", groupId);

      // Delete the group itself
      const { error } = await supabase
        .from("group_chats")
        .delete()
        .eq("id", groupId);

      if (error) throw error;

      toast.success("Group deleted successfully");
      setOpen(false);
      onDelete();
    } catch (error: any) {
      console.error("Error deleting group:", error);
      toast.error("Failed to delete group");
    } finally {
      setDeleting(false);
    }
  };

  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen);
    if (!isOpen) {
      setConfirmName("");
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={handleOpenChange}>
      <AlertDialogTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 sm:h-10 sm:w-10 text-muted-foreground hover:text-destructive"
          aria-label="Delete group"
        >
          <Trash2 className="h-4 w-4 sm:h-5 sm:w-5" />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent className="max-w-[90vw] sm:max-w-md">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="h-5 w-5" />
            Delete Group
          </AlertDialogTitle>
          <AlertDialogDescription asChild>
            <div className="space-y-3">
              <p className="font-semibold text-destructive">
                This action cannot be undone!
              </p>
              <p>
                Deleting "{groupName}" will:
              </p>
              <ul className="list-disc list-inside space-y-1 text-sm">
                <li>Remove all messages permanently</li>
                <li>Remove all members from the group</li>
                <li>Delete all shared files</li>
              </ul>
              <div className="pt-2">
                <Label htmlFor="confirm-name" className="text-foreground">
                  Type the group name to confirm:
                </Label>
                <Input
                  id="confirm-name"
                  value={confirmName}
                  onChange={(e) => setConfirmName(e.target.value)}
                  placeholder={groupName}
                  className="mt-2"
                  disabled={deleting}
                />
              </div>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="gap-2 sm:gap-0">
          <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
          <Button
            onClick={handleDelete}
            disabled={!canDelete || deleting}
            variant="destructive"
          >
            {deleting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Deleting...
              </>
            ) : (
              "Delete Permanently"
            )}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default DeleteGroupDialog;
