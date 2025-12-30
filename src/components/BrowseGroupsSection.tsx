import { useState, useCallback } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Loader2, Users, Search, Globe, Lock, UserPlus, Check } from "lucide-react";
import { toast } from "sonner";

interface PublicGroup {
  id: string;
  name: string;
  description: string | null;
  is_public: boolean;
  member_count?: number;
  is_member?: boolean;
  has_pending_request?: boolean;
}

interface BrowseGroupsSectionProps {
  userId: string;
  onJoinGroup?: () => void;
}

const BrowseGroupsSection = ({ userId, onJoinGroup }: BrowseGroupsSectionProps) => {
  const [search, setSearch] = useState("");
  const [joiningGroupId, setJoiningGroupId] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const { data: groups = [], isLoading } = useQuery({
    queryKey: ["browse-groups", userId],
    queryFn: async () => {
      // Get all groups (both public and closed) for browsing
      const { data: allGroups, error: groupsError } = await supabase
        .from("group_chats")
        .select("*")
        .order("name", { ascending: true });

      if (groupsError) throw groupsError;

      // Get user's memberships
      const { data: memberships } = await supabase
        .from("group_members")
        .select("group_id")
        .eq("user_id", userId);

      const memberGroupIds = new Set(memberships?.map(m => m.group_id) || []);

      // Get user's pending requests
      const { data: pendingRequests } = await supabase
        .from("group_join_requests")
        .select("group_id")
        .eq("user_id", userId)
        .eq("status", "pending");

      const pendingGroupIds = new Set(pendingRequests?.map(r => r.group_id) || []);

      // Get member counts and filter out groups with no members (deleted groups)
      const groupsWithCounts = await Promise.all(
        (allGroups || []).map(async (group) => {
          const { count } = await supabase
            .from("group_members")
            .select("*", { count: "exact", head: true })
            .eq("group_id", group.id);

          return {
            ...group,
            member_count: count || 0,
            is_member: memberGroupIds.has(group.id),
            has_pending_request: pendingGroupIds.has(group.id),
          };
        })
      );

      // Filter out groups with no members (likely deleted/abandoned groups)
      // Also filter out groups where admin has disabled browse visibility
      return groupsWithCounts.filter(group => 
        group.member_count > 0 && group.show_in_browse !== false
      );
    },
    enabled: !!userId,
    staleTime: 30 * 1000,
  });

  const handleJoinGroup = useCallback(async (group: PublicGroup) => {
    setJoiningGroupId(group.id);
    try {
      if (group.is_public) {
        // Direct join for public groups
        const { error } = await supabase
          .from("group_members")
          .insert({
            group_id: group.id,
            user_id: userId,
            role: "member",
          });

        if (error) throw error;
        toast.success(`Joined "${group.name}" successfully!`);
      } else {
        // Create join request for closed groups
        const { error } = await supabase
          .from("group_join_requests")
          .insert({
            group_id: group.id,
            user_id: userId,
          });

        if (error) throw error;
        toast.success(`Join request sent for "${group.name}"`);
      }

      queryClient.invalidateQueries({ queryKey: ["browse-groups"] });
      queryClient.invalidateQueries({ queryKey: ["groups"] });
      onJoinGroup?.();
    } catch (error: any) {
      console.error("Error joining group:", error);
      if (error.code === "23505") {
        toast.error("You've already joined or requested to join this group");
      } else {
        toast.error("Failed to join group");
      }
    } finally {
      setJoiningGroupId(null);
    }
  }, [userId, queryClient, onJoinGroup]);

  const filteredGroups = groups.filter(group =>
    group.name.toLowerCase().includes(search.toLowerCase()) ||
    group.description?.toLowerCase().includes(search.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search groups..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10"
        />
      </div>

      {filteredGroups.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          <Users className="h-12 w-12 mx-auto mb-2 opacity-50" />
          <p>No groups found</p>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {filteredGroups.map((group) => (
            <Card key={group.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    {group.is_public ? (
                      <Globe className="h-4 w-4 text-primary shrink-0" />
                    ) : (
                      <Lock className="h-4 w-4 text-muted-foreground shrink-0" />
                    )}
                    <CardTitle className="text-base line-clamp-1">{group.name}</CardTitle>
                  </div>
                  <Badge variant="secondary" className="shrink-0">
                    {group.member_count} members
                  </Badge>
                </div>
                <CardDescription className="line-clamp-2 text-sm">
                  {group.description || "No description"}
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-2">
                {group.is_member ? (
                  <Button variant="secondary" size="sm" className="w-full" disabled>
                    <Check className="h-4 w-4 mr-1" />
                    Joined
                  </Button>
                ) : group.has_pending_request ? (
                  <Button variant="outline" size="sm" className="w-full" disabled>
                    Request Pending
                  </Button>
                ) : (
                  <Button
                    size="sm"
                    className="w-full"
                    onClick={() => handleJoinGroup(group)}
                    disabled={joiningGroupId === group.id}
                  >
                    {joiningGroupId === group.id ? (
                      <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                    ) : (
                      <UserPlus className="h-4 w-4 mr-1" />
                    )}
                    {group.is_public ? "Join" : "Request to Join"}
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default BrowseGroupsSection;
