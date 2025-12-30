import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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

interface ShareEventDialogProps {
  eventId: string;
  eventTitle: string;
  userId: string;
  onShare?: () => void;
}

interface SharedUser {
  id: string;
  user_id: string;
  username?: string;
}

const ShareEventDialog = ({ eventId, eventTitle, userId, onShare }: ShareEventDialogProps) => {
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
      .from("event_shares")
      .select("id, shared_with_user_id")
      .eq("event_id", eventId);

    if (shares && shares.length > 0) {
      const userIds = shares.map(s => s.shared_with_user_id);
      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, username")
        .in("id", userIds);

      const usersWithNames = shares.map(s => ({
        id: s.id,
        user_id: s.shared_with_user_id,
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
      const sharedUserIds = sharedUsers.map(s => s.user_id);

      const { data } = await supabase
        .from("profiles")
        .select("id, username")
        .ilike("username", `%${searchQuery}%`)
        .neq("id", userId)
        .limit(5);

      const filtered = (data || []).filter(u => !sharedUserIds.includes(u.id));
      setSearchResults(filtered);
    } catch (error) {
      console.error("Error searching users:", error);
    } finally {
      setSearching(false);
    }
  };

  const shareWithUser = async (targetUserId: string, username: string) => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from("event_shares")
        .insert({
          event_id: eventId,
          shared_with_user_id: targetUserId,
          shared_by_user_id: userId,
        });

      if (error) throw error;

      toast.success(`Event shared with ${username}`);
      setSearchQuery("");
      setSearchResults([]);
      await loadSharedUsers();
      onShare?.();
    } catch (error: any) {
      console.error("Error sharing event:", error);
      if (error.code === "23505") {
        toast.error("Already shared with this user");
      } else {
        toast.error("Failed to share event");
      }
    } finally {
      setLoading(false);
    }
  };

  const removeShare = async (shareId: string) => {
    try {
      const { error } = await supabase
        .from("event_shares")
        .delete()
        .eq("id", shareId);

      if (error) throw error;

      toast.success("Share removed");
      await loadSharedUsers();
      onShare?.();
    } catch (error) {
      console.error("Error removing share:", error);
      toast.error("Failed to remove share");
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="h-6 w-6">
          <Share2 className="h-3 w-3" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Share Event</DialogTitle>
          <DialogDescription>
            Share "{eventTitle}" with friends so they can see and join.
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
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-6 w-6 text-muted-foreground hover:text-destructive"
                      onClick={() => removeShare(shared.id)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
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

export default ShareEventDialog;
