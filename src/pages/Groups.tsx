import { memo, useMemo, useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import SEOHead, { StructuredData, getBreadcrumbSchema } from "@/components/SEOHead";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Users } from "lucide-react";
import { toast } from "sonner";
import CreateGroupDialog from "@/components/CreateGroupDialog";

interface GroupChat {
  id: string;
  name: string;
  description: string;
  created_at: string;
  member_count?: number;
}

const fetchGroups = async (userId: string | null): Promise<GroupChat[]> => {
  if (!userId) return [];

  // Get all groups where user is a member
  const { data: memberData, error: memberError } = await supabase
    .from("group_members")
    .select("group_id")
    .eq("user_id", userId);

  if (memberError) throw memberError;

  if (!memberData || memberData.length === 0) {
    return [];
  }

  const groupIds = memberData.map(m => m.group_id);

  // Get group details and member counts in parallel
  const { data: groupsData, error: groupsError } = await supabase
    .from("group_chats")
    .select("*")
    .in("id", groupIds)
    .order("created_at", { ascending: false });

  if (groupsError) throw groupsError;

  // Get member counts for each group
  const groupsWithCounts = await Promise.all(
    (groupsData || []).map(async (group) => {
      const { count } = await supabase
        .from("group_members")
        .select("*", { count: "exact", head: true })
        .eq("group_id", group.id);
      
      return {
        ...group,
        member_count: count || 0
      };
    })
  );

  return groupsWithCounts;
};

const Groups = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate("/auth");
        return;
      }
      setUserId(user.id);
    };
    checkAuth();
  }, [navigate]);

  const { data: groups = [], isLoading: loading, error } = useQuery({
    queryKey: ["groups", userId],
    queryFn: () => fetchGroups(userId),
    enabled: !!userId,
    staleTime: 30 * 1000,
    gcTime: 5 * 60 * 1000,
  });

  const handleGroupCreated = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ["groups"] });
  }, [queryClient]);

  const breadcrumbData = useMemo(() => getBreadcrumbSchema([
    { name: "Home", url: "https://studyhub-studentportal.lovable.app/" },
    { name: "Groups", url: "https://studyhub-studentportal.lovable.app/groups" },
  ]), []);

  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (seconds < 60) return "just now";
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    return `${Math.floor(seconds / 86400)}d ago`;
  };

  if (error) {
    toast.error("Failed to load groups");
  }

  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title="Study Groups - Collaborate with Students"
        description="Join or create study groups on StudyHub. Collaborate with other students in focused study groups and learn together."
        canonical="https://studyhub-studentportal.lovable.app/groups"
      />
      <StructuredData data={breadcrumbData} />
      
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <header className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Study Groups
            </h1>
            <p className="text-muted-foreground">
              Collaborate with other students in focused study groups
            </p>
          </div>
          <CreateGroupDialog onGroupCreated={handleGroupCreated} />
        </header>

        <section aria-label="Your study groups">
          {loading ? (
            <div className="flex justify-center items-center py-12" role="status" aria-label="Loading groups">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : groups.length === 0 ? (
            <Card className="text-center py-12">
              <CardContent>
                <Users className="h-16 w-16 mx-auto mb-4 text-muted-foreground" aria-hidden="true" />
                <h2 className="text-xl font-semibold mb-2">No groups yet</h2>
                <p className="text-muted-foreground mb-4">
                  Create your first study group to start collaborating with others
                </p>
                <CreateGroupDialog onGroupCreated={handleGroupCreated} />
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {groups.map((group) => (
                <Card
                  key={group.id}
                  className="cursor-pointer hover:shadow-lg transition-shadow"
                  onClick={() => navigate(`/groups/${group.id}`)}
                  role="article"
                >
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Users className="h-5 w-5 text-primary" aria-hidden="true" />
                      {group.name}
                    </CardTitle>
                    <CardDescription>{group.description || "No description"}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <span>{group.member_count} members</span>
                      <time>Created {getTimeAgo(group.created_at)}</time>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
};

export default memo(Groups);
