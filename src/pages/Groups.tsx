import { memo, useMemo, useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import SEOHead, { StructuredData, getBreadcrumbSchema } from "@/components/SEOHead";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Users, Globe, Lock } from "lucide-react";
import { toast } from "sonner";
import CreateGroupDialog from "@/components/CreateGroupDialog";
import BrowseGroupsSection from "@/components/BrowseGroupsSection";
import { useOnboarding } from "@/contexts/OnboardingContext";
import { useScrollReveal } from "@/hooks/useScrollReveal";

interface GroupChat {
  id: string;
  name: string;
  description: string;
  is_public: boolean;
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
  const { completeTask } = useOnboarding();
  
  // Scroll reveal for cards section
  const [cardsRef, cardsVisible] = useScrollReveal<HTMLDivElement>();

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
    completeTask("group");
  }, [queryClient, completeTask]);

  const breadcrumbData = useMemo(() => getBreadcrumbSchema([
    { name: "Home", url: "https://studyhub.world/" },
    { name: "Groups", url: "https://studyhub.world/groups" },
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
        title="Free Study Groups Online | Join Group Chats | Find Study Partners"
        description="Join free online study groups. Find study partners, group chat with students, collaborate on homework. Math study groups, science study groups, exam prep groups. Start studying together now."
        canonical="https://studyhub.world/groups"
      />
      <StructuredData data={breadcrumbData} />
      
      <Navbar />
      <main className="container mx-auto px-3 sm:px-4 py-4 sm:py-8">
        <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 sm:mb-8">
          <div className="flex-1">
            <h1 className="text-2xl sm:text-4xl font-bold mb-2 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent opacity-0 animate-hero-fade-up">
              Study Groups
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground max-w-xl opacity-0 animate-hero-fade-up" style={{ animationDelay: "100ms" }}>
              Team up with other students. Create a group, join one, and study together in real time.
            </p>
            <nav className="mt-2 sm:mt-3 text-xs sm:text-sm hidden sm:block opacity-0 animate-hero-fade-up" style={{ animationDelay: "200ms" }} aria-label="Related pages">
              <span className="text-muted-foreground">Explore: </span>
              <a href="/questions" className="text-primary hover:underline">Ask Questions</a>
              <span className="text-muted-foreground mx-2">•</span>
              <a href="/friends" className="text-primary hover:underline">Find Friends</a>
            </nav>
          </div>
          <div className="opacity-0 animate-hero-fade-up" style={{ animationDelay: "150ms" }}>
            <CreateGroupDialog onGroupCreated={handleGroupCreated} />
          </div>
        </header>

        <Tabs defaultValue="my-groups" className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="my-groups">My Groups</TabsTrigger>
            <TabsTrigger value="browse">Browse Groups</TabsTrigger>
          </TabsList>

          <TabsContent value="my-groups">
            <section aria-label="Your study groups" ref={cardsRef}>
              {loading ? (
                <div className="flex justify-center items-center py-12" role="status" aria-label="Loading groups">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : groups.length === 0 ? (
                <Card className="text-center py-12">
                  <CardContent>
                    <Users className="h-16 w-16 mx-auto mb-4 text-muted-foreground" aria-hidden="true" />
                    <h2 className="text-xl font-semibold mb-2">You're not in any groups yet</h2>
                    <p className="text-muted-foreground mb-4 max-w-md mx-auto">
                      Start your own study squad or browse existing groups. 
                      Studying is way more fun (and effective) with others.
                    </p>
                    <CreateGroupDialog onGroupCreated={handleGroupCreated} />
                  </CardContent>
                </Card>
              ) : (
                <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                  {groups.map((group, index) => (
                    <Card
                      key={group.id}
                      className={`cursor-pointer hover:shadow-lg transition-shadow ${cardsVisible ? "opacity-0 animate-reveal-up" : "opacity-0"}`}
                      style={{ animationDelay: `${Math.min(index * 100, 400)}ms` }}
                      onClick={() => navigate(`/groups/${group.id}`)}
                      role="article"
                    >
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          {group.is_public ? (
                            <Globe className="h-5 w-5 text-primary" aria-hidden="true" />
                          ) : (
                            <Lock className="h-5 w-5 text-muted-foreground" aria-hidden="true" />
                          )}
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
          </TabsContent>

          <TabsContent value="browse">
            {userId && (
              <BrowseGroupsSection userId={userId} onJoinGroup={handleGroupCreated} />
            )}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default memo(Groups);
