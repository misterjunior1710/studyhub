import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Pencil, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface EditGroupDialogProps {
  groupId: string;
  currentName: string;
  currentDescription: string;
  showInBrowse?: boolean;
  onGroupUpdated: () => void;
}

const EditGroupDialog = ({
  groupId,
  currentName,
  currentDescription,
  showInBrowse = true,
  onGroupUpdated,
}: EditGroupDialogProps) => {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState(currentName);
  const [description, setDescription] = useState(currentDescription);
  const [showInBrowseState, setShowInBrowseState] = useState(showInBrowse);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setName(currentName);
    setDescription(currentDescription);
    setShowInBrowseState(showInBrowse);
  }, [currentName, currentDescription, showInBrowse]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      toast.error("Group name is required");
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from("group_chats")
        .update({
          name: name.trim(),
          description: description.trim() || null,
          show_in_browse: showInBrowseState,
        })
        .eq("id", groupId);

      if (error) throw error;

      toast.success("Group updated successfully");
      setOpen(false);
      onGroupUpdated();
    } catch (error: any) {
      console.error("Error updating group:", error);
      toast.error("Failed to update group");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8 sm:h-10 sm:w-10" aria-label="Edit group">
          <Pencil className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md max-w-[95vw]">
        <DialogHeader>
          <DialogTitle>Edit Group</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Group Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter group name"
              disabled={loading}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter group description (optional)"
              disabled={loading}
              rows={3}
            />
          </div>
          <div className="flex items-center justify-between py-2">
            <div className="space-y-0.5">
              <Label htmlFor="show-in-browse">Show in Browse</Label>
              <p className="text-xs text-muted-foreground">
                Allow others to find this group
              </p>
            </div>
            <Switch
              id="show-in-browse"
              checked={showInBrowseState}
              onCheckedChange={setShowInBrowseState}
              disabled={loading}
            />
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              "Save Changes"
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditGroupDialog;
