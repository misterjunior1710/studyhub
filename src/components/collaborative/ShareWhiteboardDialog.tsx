import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Share2, Loader2, X, UserPlus } from "lucide-react";
import { toast } from "sonner";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface ShareWhiteboardDialogProps {
  whiteboardId: string;
  whiteboardName: string;
  onShare?: () => void;
}

interface SharedUser {
  id: string;
  user_id: string;
  can_edit: boolean;
  username?: string;
}

const ShareWhiteboardDialog = ({ whiteboardId, whiteboardName, onShare }: ShareWhiteboardDialogProps) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<{ id: string; username: string }[]>([]);
  const [sharedUsers, setSharedUsers] = useState<SharedUser[]>([]);
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    if (open) {
      loadSharedUsers();
    }
  }, [open]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery.length >= 2) {
        searchUsers();
      } else {
        setSearchResults([]);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const loadSharedUsers = async () => {
    const { data: shares } = await supabase
      .from("whiteboard_shares")
      .select("id, shared_with_user_id, can_edit")
      .eq("whiteboard_id", whiteboardId);

    if (shares && shares.length > 0) {
      const userIds = shares.map(s => s.shared_with_user_id);
      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, username")
        .in("id", userIds);

      const usersWithNames = shares.map(s => ({
        id: s.id,
        user_id: s.shared_with_user_id,
        can_edit: s.can_edit,
        username: profiles?.find(p => p.id === s.shared_with_user_id)?.username || "Unknown"
      }));

      setSharedUsers(usersWithNames);
    } else {
      setSharedUsers([]);
    }
  };

  const searchUsers = async () => {
    setSearching(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const sharedUserIds = sharedUsers.map(s => s.user_id);

      const { data } = await supabase
        .from("profiles")
        .select("id, username")
        .ilike("username", `%${searchQuery}%`)
        .neq("id", user?.id)
        .limit(5);

      // Filter out already shared users
      const filtered = (data || []).filter(u => !sharedUserIds.includes(u.id));
      setSearchResults(filtered);
    } catch (error) {
      console.error("Error searching users:", error);
    } finally {
      setSearching(false);
    }
  };

  const shareWithUser = async (userId: string, username: string) => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from("whiteboard_shares")
        .insert({
          whiteboard_id: whiteboardId,
          shared_with_user_id: userId,
          can_edit: true,
        });

      if (error) throw error;

      toast.success(`Shared with ${username}`);
      setSearchQuery("");
      setSearchResults([]);
      await loadSharedUsers();
      onShare?.();
    } catch (error: any) {
      console.error("Error sharing whiteboard:", error);
      if (error.code === "23505") {
        toast.error("Already shared with this user");
      } else {
        toast.error("Failed to share whiteboard");
      }
    } finally {
      setLoading(false);
    }
  };

  const removeShare = async (shareId: string) => {
    try {
      const { error } = await supabase
        .from("whiteboard_shares")
        .delete()
        .eq("id", shareId);

      if (error) throw error;

      toast.success("Access removed");
      await loadSharedUsers();
      onShare?.();
    } catch (error) {
      console.error("Error removing share:", error);
      toast.error("Failed to remove access");
    }
  };

  const toggleEditAccess = async (shareId: string, currentValue: boolean) => {
    try {
      const { error } = await supabase
        .from("whiteboard_shares")
        .update({ can_edit: !currentValue })
        .eq("id", shareId);

      if (error) throw error;
      await loadSharedUsers();
    } catch (error) {
      console.error("Error updating access:", error);
      toast.error("Failed to update access");
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <Share2 className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Share Whiteboard</DialogTitle>
          <DialogDescription>
            Share "{whiteboardName}" with friends to collaborate together.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label htmlFor="search-user">Add people</Label>
            <div className="relative">
              <Input
                id="search-user"
                placeholder="Search by username..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searching && (
                <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin" />
              )}
            </div>
            
            {searchResults.length > 0 && (
              <div className="mt-2 border rounded-lg divide-y">
                {searchResults.map((user) => (
                  <div
                    key={user.id}
                    className="flex items-center justify-between p-2 hover:bg-muted"
                  >
                    <div className="flex items-center gap-2">
                      <Avatar className="h-6 w-6">
                        <AvatarFallback className="text-xs">
                          {user.username?.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-sm">{user.username}</span>
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => shareWithUser(user.id, user.username)}
                      disabled={loading}
                    >
                      <UserPlus className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {sharedUsers.length > 0 && (
            <div>
              <Label>Shared with</Label>
              <div className="mt-2 border rounded-lg divide-y">
                {sharedUsers.map((shared) => (
                  <div
                    key={shared.id}
                    className="flex items-center justify-between p-2"
                  >
                    <div className="flex items-center gap-2">
                      <Avatar className="h-6 w-6">
                        <AvatarFallback className="text-xs">
                          {shared.username?.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-sm">{shared.username}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1">
                        <span className="text-xs text-muted-foreground">Edit</span>
                        <Switch
                          checked={shared.can_edit}
                          onCheckedChange={() => toggleEditAccess(shared.id, shared.can_edit)}
                        />
                      </div>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-6 w-6 text-muted-foreground hover:text-destructive"
                        onClick={() => removeShare(shared.id)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Done
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ShareWhiteboardDialog;