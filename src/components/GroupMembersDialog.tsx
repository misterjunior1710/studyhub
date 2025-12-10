import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Users, UserPlus, Trash2, Loader2, Search } from "lucide-react";
import { toast } from "sonner";

interface Member {
  id: string;
  user_id: string;
  role: string;
  profiles?: {
    username: string;
  };
}

interface GroupMembersDialogProps {
  groupId: string;
  onMemberChange?: () => void;
}

const GroupMembersDialog = ({ groupId, onMemberChange }: GroupMembersDialogProps) => {
  const [open, setOpen] = useState(false);
  const [members, setMembers] = useState<Member[]>([]);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [searching, setSearching] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      loadMembers();
      getCurrentUser();
    }
  }, [open, groupId]);

  const getCurrentUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setCurrentUserId(user?.id || null);
  };

  const loadMembers = async () => {
    setLoading(true);
    try {
      const { data: membersData, error } = await supabase
        .from("group_members")
        .select("id, user_id, role")
        .eq("group_id", groupId);

      if (error) throw error;

      if (membersData && membersData.length > 0) {
        const userIds = membersData.map(m => m.user_id);
        const { data: profilesData } = await supabase
          .from("profiles")
          .select("id, username")
          .in("id", userIds);

        const membersWithProfiles = membersData.map(member => ({
          ...member,
          profiles: profilesData?.find(p => p.id === member.user_id) || { username: "User" }
        }));

        setMembers(membersWithProfiles);
      } else {
        setMembers([]);
      }
    } catch (error: any) {
      console.error("Error loading members:", error);
      toast.error("Failed to load members");
    } finally {
      setLoading(false);
    }
  };

  const searchUsers = async () => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    setSearching(true);
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, username")
        .ilike("username", `%${searchQuery}%`)
        .limit(10);

      if (error) throw error;

      // Filter out existing members
      const memberIds = members.map(m => m.user_id);
      const filteredResults = (data || []).filter(user => !memberIds.includes(user.id));
      setSearchResults(filteredResults);
    } catch (error: any) {
      console.error("Error searching users:", error);
      toast.error("Failed to search users");
    } finally {
      setSearching(false);
    }
  };

  useEffect(() => {
    const debounce = setTimeout(() => {
      searchUsers();
    }, 300);
    return () => clearTimeout(debounce);
  }, [searchQuery, members]);

  const addMember = async (userId: string, username: string) => {
    try {
      const { error } = await supabase.from("group_members").insert({
        group_id: groupId,
        user_id: userId,
        role: "member",
      });

      if (error) throw error;

      toast.success(`Added ${username} to the group`);
      setSearchQuery("");
      setSearchResults([]);
      loadMembers();
      onMemberChange?.();
    } catch (error: any) {
      console.error("Error adding member:", error);
      toast.error("Failed to add member");
    }
  };

  const removeMember = async (memberId: string, userId: string, username: string) => {
    if (userId === currentUserId) {
      toast.error("You cannot remove yourself from the group");
      return;
    }

    try {
      const { error } = await supabase
        .from("group_members")
        .delete()
        .eq("id", memberId);

      if (error) throw error;

      toast.success(`Removed ${username} from the group`);
      loadMembers();
      onMemberChange?.();
    } catch (error: any) {
      console.error("Error removing member:", error);
      toast.error("Failed to remove member");
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="h-8 sm:h-9 px-2 sm:px-3" aria-label="View members">
          <Users className="h-4 w-4 sm:mr-2" />
          <span className="hidden sm:inline">Members</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md max-w-[95vw]">
        <DialogHeader>
          <DialogTitle>Group Members</DialogTitle>
          <DialogDescription>
            Add or remove members from this group
          </DialogDescription>
        </DialogHeader>

        {/* Search to add members */}
        <div className="space-y-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search users to add..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>

          {/* Search Results */}
          {searchResults.length > 0 && (
            <div className="border rounded-md max-h-32 overflow-y-auto">
              {searchResults.map((user) => (
                <div
                  key={user.id}
                  className="flex items-center justify-between p-2 hover:bg-accent"
                >
                  <div className="flex items-center gap-2">
                    <Avatar className="h-6 w-6" title={`${user.username}'s avatar`}>
                      <AvatarFallback className="text-xs">
                        {user.username?.charAt(0).toUpperCase() || "U"}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm">{user.username}</span>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => addMember(user.id, user.username)}
                  >
                    <UserPlus className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}

          {searching && (
            <div className="flex justify-center py-2">
              <Loader2 className="h-4 w-4 animate-spin" />
            </div>
          )}
        </div>

        {/* Current Members */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium">Current Members ({members.length})</h4>
          {loading ? (
            <div className="flex justify-center py-4">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          ) : (
            <div className="border rounded-md max-h-48 overflow-y-auto">
              {members.map((member) => (
                <div
                  key={member.id}
                  className="flex items-center justify-between p-2 hover:bg-accent"
                >
                  <div className="flex items-center gap-2">
                    <Avatar className="h-6 w-6" title={`${member.profiles?.username || 'User'}'s avatar`}>
                      <AvatarFallback className="text-xs bg-primary text-primary-foreground">
                        {member.profiles?.username?.charAt(0).toUpperCase() || "U"}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm">{member.profiles?.username || "User"}</span>
                    {member.role === "admin" && (
                      <span className="text-xs bg-primary/20 text-primary px-1.5 py-0.5 rounded">
                        Admin
                      </span>
                    )}
                  </div>
                  {member.user_id !== currentUserId && (
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-destructive hover:text-destructive"
                      onClick={() => removeMember(member.id, member.user_id, member.profiles?.username || "User")}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default GroupMembersDialog;
