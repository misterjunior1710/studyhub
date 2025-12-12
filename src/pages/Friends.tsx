import { memo, useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import SEOHead, { StructuredData, getBreadcrumbSchema } from "@/components/SEOHead";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { 
  Loader2, UserPlus, Users, UserCheck, UserX, Search, 
  Clock, Check, X 
} from "lucide-react";
import { toast } from "sonner";
import { useDebounce } from "@/hooks/useDebounce";
import DirectMessageDialog from "@/components/DirectMessageDialog";

interface FriendRequest {
  id: string;
  user_id: string;
  friend_id: string;
  status: string;
  created_at: string;
  profiles: {
    id: string;
    username: string;
    avatar_url: string;
    country: string;
    grade: string;
  };
}

interface UserProfile {
  id: string;
  username: string;
  avatar_url: string;
  country: string;
  grade: string;
}

const fetchFriendsData = async (userId: string) => {
  const [acceptedFriends, acceptedFriends2, received, sent] = await Promise.all([
    supabase
      .from("friends")
      .select(`*, profiles:friends_friend_id_fkey(id, username, avatar_url, country, grade)`)
      .eq("user_id", userId)
      .eq("status", "accepted"),
    supabase
      .from("friends")
      .select(`*, profiles:friends_user_id_fkey(id, username, avatar_url, country, grade)`)
      .eq("friend_id", userId)
      .eq("status", "accepted"),
    supabase
      .from("friends")
      .select(`*, profiles:friends_user_id_fkey(id, username, avatar_url, country, grade)`)
      .eq("friend_id", userId)
      .eq("status", "pending"),
    supabase
      .from("friends")
      .select(`*, profiles:friends_friend_id_fkey(id, username, avatar_url, country, grade)`)
      .eq("user_id", userId)
      .eq("status", "pending"),
  ]);

  return {
    friends: [...(acceptedFriends.data || []), ...(acceptedFriends2.data || [])] as unknown as FriendRequest[],
    pendingReceived: (received.data || []) as unknown as FriendRequest[],
    pendingSent: (sent.data || []) as unknown as FriendRequest[],
  };
};

const Friends = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [searchInput, setSearchInput] = useState("");
  const [searchResults, setSearchResults] = useState<UserProfile[]>([]);
  const [searching, setSearching] = useState(false);

  const searchQuery = useDebounce(searchInput, 300);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate("/auth");
        return;
      }
      setCurrentUserId(user.id);
    };
    checkAuth();
  }, [navigate]);

  const { data, isLoading: loading } = useQuery({
    queryKey: ["friends", currentUserId],
    queryFn: () => fetchFriendsData(currentUserId!),
    enabled: !!currentUserId,
    staleTime: 30 * 1000,
    gcTime: 5 * 60 * 1000,
  });

  const { friends = [], pendingReceived = [], pendingSent = [] } = data || {};

  // Search effect
  useEffect(() => {
    const search = async () => {
      if (!searchQuery.trim() || !currentUserId) {
        setSearchResults([]);
        return;
      }

      setSearching(true);
      const { data, error } = await supabase
        .from("profiles")
        .select("id, username, avatar_url, country, grade")
        .ilike("username", `%${searchQuery}%`)
        .neq("id", currentUserId)
        .limit(20);

      if (!error) {
        setSearchResults(data || []);
      }
      setSearching(false);
    };

    search();
  }, [searchQuery, currentUserId]);

  const sendRequestMutation = useMutation({
    mutationFn: async (friendId: string) => {
      const { error } = await supabase
        .from("friends")
        .insert({
          user_id: currentUserId!,
          friend_id: friendId,
          status: "pending",
        });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Friend request sent!");
      queryClient.invalidateQueries({ queryKey: ["friends"] });
    },
    onError: (error: { code?: string }) => {
      if (error.code === "23505") {
        toast.error("Friend request already exists");
      } else {
        toast.error("Failed to send request");
      }
    },
  });

  const acceptMutation = useMutation({
    mutationFn: async (requestId: string) => {
      const { error } = await supabase
        .from("friends")
        .update({ status: "accepted" })
        .eq("id", requestId);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Friend request accepted!");
      queryClient.invalidateQueries({ queryKey: ["friends"] });
    },
    onError: () => toast.error("Failed to accept request"),
  });

  const rejectMutation = useMutation({
    mutationFn: async (requestId: string) => {
      const { error } = await supabase
        .from("friends")
        .delete()
        .eq("id", requestId);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Request removed");
      queryClient.invalidateQueries({ queryKey: ["friends"] });
    },
    onError: () => toast.error("Failed to reject request"),
  });

  const isAlreadyFriendOrPending = useCallback((userId: string) => {
    return friends.some(f => f.profiles?.id === userId) ||
           pendingSent.some(f => f.profiles?.id === userId) ||
           pendingReceived.some(f => f.profiles?.id === userId);
  }, [friends, pendingSent, pendingReceived]);

  const breadcrumbData = useMemo(() => getBreadcrumbSchema([
    { name: "Home", url: "https://studyhub-studentportal.lovable.app/" },
    { name: "Friends", url: "https://studyhub-studentportal.lovable.app/friends" },
  ]), []);

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-8 flex justify-center" role="status" aria-label="Loading friends">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title="Friends - Connect with Students"
        description="Connect with fellow students on StudyHub. Find study partners, share knowledge, and build your academic network."
        canonical="https://studyhub-studentportal.lovable.app/friends"
        noIndex={true}
      />
      <StructuredData data={breadcrumbData} />
      
      <Navbar />
      
      <header className="bg-gradient-to-br from-primary via-primary to-accent py-12">
        <div className="container mx-auto px-4 text-center text-white">
          <div className="flex justify-center mb-4">
            <Users className="h-16 w-16 animate-float" aria-hidden="true" />
          </div>
          <h1 className="text-4xl font-bold mb-2">Study Friends</h1>
          <p className="text-white/80 max-w-lg mx-auto">
            Build your academic network by connecting with fellow students. Find study partners 
            who share your interests, collaborate on challenging topics, and support each other's learning journey.
          </p>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <Card className="mb-8 -mt-8" variant="elevated">
          <CardContent className="pt-6">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
                <Input
                  placeholder="Search for students by username..."
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  className="pl-10"
                  aria-label="Search for students"
                />
              </div>
              <Button disabled={searching || !searchInput.trim()}>
                {searching ? <Loader2 className="h-4 w-4 animate-spin" /> : "Search"}
              </Button>
            </div>

            {searchResults.length > 0 && (
              <div className="mt-4 space-y-2">
                <p className="text-sm text-muted-foreground">Search Results</p>
                {searchResults.map((user) => (
                  <div key={user.id} className="flex items-center gap-4 p-3 bg-secondary/50 rounded-lg">
                    <Avatar>
                      <AvatarImage src={user.avatar_url} alt={`${user.username}'s avatar`} />
                      <AvatarFallback>{user.username?.charAt(0).toUpperCase() || "U"}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <p className="font-medium">{user.username}</p>
                      <p className="text-sm text-muted-foreground">{user.grade} • {user.country}</p>
                    </div>
                    {isAlreadyFriendOrPending(user.id) ? (
                      <Badge variant="secondary">Added</Badge>
                    ) : (
                      <Button size="sm" onClick={() => sendRequestMutation.mutate(user.id)} disabled={sendRequestMutation.isPending}>
                        <UserPlus className="h-4 w-4 mr-2" aria-hidden="true" />
                        Add
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Tabs defaultValue="friends" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="friends" className="gap-2">
              <UserCheck className="h-4 w-4" aria-hidden="true" />
              Friends ({friends.length})
            </TabsTrigger>
            <TabsTrigger value="requests" className="gap-2">
              <Clock className="h-4 w-4" aria-hidden="true" />
              Requests ({pendingReceived.length})
            </TabsTrigger>
            <TabsTrigger value="sent" className="gap-2">
              <UserPlus className="h-4 w-4" aria-hidden="true" />
              Sent ({pendingSent.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="friends">
            <Card>
              <CardHeader>
                <CardTitle>My Friends</CardTitle>
              </CardHeader>
              <CardContent>
              {friends.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground mb-3">
                      No friends yet. Use the search above to find students to connect with!
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Tip: Search by username to find classmates or students studying similar subjects. 
                      You can also meet new people in <a href="/groups" className="text-primary hover:underline">Study Groups</a>.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3" role="list" aria-label="Friends list">
                    {friends.map((friend) => (
                      <div key={friend.id} className="flex items-center gap-4 p-4 bg-secondary/30 rounded-lg hover:bg-secondary/50 transition-colors" role="listitem">
                        <Avatar className="h-12 w-12">
                          <AvatarImage src={friend.profiles?.avatar_url} alt={`${friend.profiles?.username}'s avatar`} />
                          <AvatarFallback>{friend.profiles?.username?.charAt(0).toUpperCase() || "U"}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <p className="font-semibold">{friend.profiles?.username}</p>
                          <p className="text-sm text-muted-foreground">
                            {friend.profiles?.grade} • {friend.profiles?.country}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          {currentUserId && friend.profiles && (
                            <DirectMessageDialog
                              friend={{
                                id: friend.profiles.id,
                                username: friend.profiles.username,
                                avatar_url: friend.profiles.avatar_url,
                              }}
                              currentUserId={currentUserId}
                            />
                          )}
                          <Button variant="ghost" size="sm" onClick={() => rejectMutation.mutate(friend.id)} aria-label="Remove friend">
                            <UserX className="h-4 w-4" aria-hidden="true" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="requests">
            <Card>
              <CardHeader>
                <CardTitle>Friend Requests</CardTitle>
              </CardHeader>
              <CardContent>
                {pendingReceived.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">
                    No pending friend requests
                  </p>
                ) : (
                  <div className="space-y-3" role="list" aria-label="Friend requests">
                    {pendingReceived.map((request) => (
                      <div key={request.id} className="flex items-center gap-4 p-4 bg-secondary/30 rounded-lg" role="listitem">
                        <Avatar className="h-12 w-12">
                          <AvatarImage src={request.profiles?.avatar_url} alt={`${request.profiles?.username}'s avatar`} />
                          <AvatarFallback>{request.profiles?.username?.charAt(0).toUpperCase() || "U"}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <p className="font-semibold">{request.profiles?.username}</p>
                          <p className="text-sm text-muted-foreground">
                            {request.profiles?.grade} • {request.profiles?.country}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm" onClick={() => acceptMutation.mutate(request.id)} disabled={acceptMutation.isPending}>
                            <Check className="h-4 w-4 mr-1" aria-hidden="true" />
                            Accept
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => rejectMutation.mutate(request.id)} disabled={rejectMutation.isPending}>
                            <X className="h-4 w-4" aria-hidden="true" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="sent">
            <Card>
              <CardHeader>
                <CardTitle>Sent Requests</CardTitle>
              </CardHeader>
              <CardContent>
                {pendingSent.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">
                    No pending sent requests
                  </p>
                ) : (
                  <div className="space-y-3" role="list" aria-label="Sent requests">
                    {pendingSent.map((request) => (
                      <div key={request.id} className="flex items-center gap-4 p-4 bg-secondary/30 rounded-lg" role="listitem">
                        <Avatar className="h-12 w-12">
                          <AvatarImage src={request.profiles?.avatar_url} alt={`${request.profiles?.username}'s avatar`} />
                          <AvatarFallback>{request.profiles?.username?.charAt(0).toUpperCase() || "U"}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <p className="font-semibold">{request.profiles?.username}</p>
                          <p className="text-sm text-muted-foreground">
                            {request.profiles?.grade} • {request.profiles?.country}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary">Pending</Badge>
                          <Button variant="ghost" size="sm" onClick={() => rejectMutation.mutate(request.id)} disabled={rejectMutation.isPending}>
                            <X className="h-4 w-4" aria-hidden="true" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default memo(Friends);
