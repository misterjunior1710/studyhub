import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { 
  Loader2, UserPlus, Users, UserCheck, UserX, Search, 
  Clock, Check, X, MessageSquare 
} from "lucide-react";
import { toast } from "sonner";

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

const Friends = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<UserProfile[]>([]);
  const [searching, setSearching] = useState(false);
  const [friends, setFriends] = useState<FriendRequest[]>([]);
  const [pendingReceived, setPendingReceived] = useState<FriendRequest[]>([]);
  const [pendingSent, setPendingSent] = useState<FriendRequest[]>([]);

  useEffect(() => {
    checkAuthAndLoad();
  }, []);

  const checkAuthAndLoad = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      navigate("/auth");
      return;
    }

    setCurrentUserId(user.id);
    await loadFriends(user.id);
    setLoading(false);
  };

  const loadFriends = async (userId: string) => {
    // Load accepted friends where I sent the request
    const { data: acceptedFriends } = await supabase
      .from("friends")
      .select(`
        *,
        profiles:friends_friend_id_fkey(id, username, avatar_url, country, grade)
      `)
      .eq("user_id", userId)
      .eq("status", "accepted");

    // Load accepted friends where I received the request
    const { data: acceptedFriends2 } = await supabase
      .from("friends")
      .select(`
        *,
        profiles:friends_user_id_fkey(id, username, avatar_url, country, grade)
      `)
      .eq("friend_id", userId)
      .eq("status", "accepted");

    setFriends([...(acceptedFriends || []), ...(acceptedFriends2 || [])] as any[]);

    // Load pending received requests
    const { data: received } = await supabase
      .from("friends")
      .select(`
        *,
        profiles:friends_user_id_fkey(id, username, avatar_url, country, grade)
      `)
      .eq("friend_id", userId)
      .eq("status", "pending");

    setPendingReceived((received || []) as any[]);

    // Load pending sent requests
    const { data: sent } = await supabase
      .from("friends")
      .select(`
        *,
        profiles:friends_friend_id_fkey(id, username, avatar_url, country, grade)
      `)
      .eq("user_id", userId)
      .eq("status", "pending");

    setPendingSent((sent || []) as any[]);
  };

  const handleSearch = async () => {
    if (!searchQuery.trim() || !currentUserId) return;

    setSearching(true);
    const { data, error } = await supabase
      .from("profiles")
      .select("id, username, avatar_url, country, grade")
      .ilike("username", `%${searchQuery}%`)
      .neq("id", currentUserId)
      .limit(20);

    if (error) {
      toast.error("Search failed");
    } else {
      setSearchResults(data || []);
    }
    setSearching(false);
  };

  const sendFriendRequest = async (friendId: string) => {
    if (!currentUserId) return;

    const { error } = await supabase
      .from("friends")
      .insert({
        user_id: currentUserId,
        friend_id: friendId,
        status: "pending",
      });

    if (error) {
      if (error.code === "23505") {
        toast.error("Friend request already exists");
      } else {
        toast.error("Failed to send request");
      }
    } else {
      toast.success("Friend request sent!");
      loadFriends(currentUserId);
    }
  };

  const acceptRequest = async (requestId: string) => {
    const { error } = await supabase
      .from("friends")
      .update({ status: "accepted" })
      .eq("id", requestId);

    if (error) {
      toast.error("Failed to accept request");
    } else {
      toast.success("Friend request accepted!");
      if (currentUserId) loadFriends(currentUserId);
    }
  };

  const rejectRequest = async (requestId: string) => {
    const { error } = await supabase
      .from("friends")
      .delete()
      .eq("id", requestId);

    if (error) {
      toast.error("Failed to reject request");
    } else {
      toast.success("Request removed");
      if (currentUserId) loadFriends(currentUserId);
    }
  };

  const removeFriend = async (requestId: string) => {
    const { error } = await supabase
      .from("friends")
      .delete()
      .eq("id", requestId);

    if (error) {
      toast.error("Failed to remove friend");
    } else {
      toast.success("Friend removed");
      if (currentUserId) loadFriends(currentUserId);
    }
  };

  const isAlreadyFriendOrPending = (userId: string) => {
    return friends.some(f => f.profiles?.id === userId) ||
           pendingSent.some(f => f.profiles?.id === userId) ||
           pendingReceived.some(f => f.profiles?.id === userId);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-8 flex justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* Hero */}
      <div className="bg-gradient-to-br from-primary via-primary to-accent py-12">
        <div className="container mx-auto px-4 text-center text-white">
          <div className="flex justify-center mb-4">
            <Users className="h-16 w-16 animate-float" />
          </div>
          <h1 className="text-4xl font-bold mb-2">Friends</h1>
          <p className="text-white/80 max-w-md mx-auto">
            Connect with fellow students, share knowledge, and study together
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Search */}
        <Card className="mb-8 -mt-8" variant="elevated">
          <CardContent className="pt-6">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search for students by username..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                  className="pl-10"
                />
              </div>
              <Button onClick={handleSearch} disabled={searching}>
                {searching ? <Loader2 className="h-4 w-4 animate-spin" /> : "Search"}
              </Button>
            </div>

            {searchResults.length > 0 && (
              <div className="mt-4 space-y-2">
                <p className="text-sm text-muted-foreground">Search Results</p>
                {searchResults.map((user) => (
                  <div key={user.id} className="flex items-center gap-4 p-3 bg-secondary/50 rounded-lg">
                    <Avatar>
                      <AvatarImage src={user.avatar_url} />
                      <AvatarFallback>{user.username?.charAt(0).toUpperCase() || "U"}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <p className="font-medium">{user.username}</p>
                      <p className="text-sm text-muted-foreground">{user.grade} • {user.country}</p>
                    </div>
                    {isAlreadyFriendOrPending(user.id) ? (
                      <Badge variant="secondary">Added</Badge>
                    ) : (
                      <Button size="sm" onClick={() => sendFriendRequest(user.id)}>
                        <UserPlus className="h-4 w-4 mr-2" />
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
              <UserCheck className="h-4 w-4" />
              Friends ({friends.length})
            </TabsTrigger>
            <TabsTrigger value="requests" className="gap-2">
              <Clock className="h-4 w-4" />
              Requests ({pendingReceived.length})
            </TabsTrigger>
            <TabsTrigger value="sent" className="gap-2">
              <UserPlus className="h-4 w-4" />
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
                  <p className="text-center text-muted-foreground py-8">
                    No friends yet. Search for students to connect!
                  </p>
                ) : (
                  <div className="space-y-3">
                    {friends.map((friend) => (
                      <div key={friend.id} className="flex items-center gap-4 p-4 bg-secondary/30 rounded-lg hover:bg-secondary/50 transition-colors">
                        <Avatar className="h-12 w-12">
                          <AvatarImage src={friend.profiles?.avatar_url} />
                          <AvatarFallback>{friend.profiles?.username?.charAt(0).toUpperCase() || "U"}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <p className="font-semibold">{friend.profiles?.username}</p>
                          <p className="text-sm text-muted-foreground">
                            {friend.profiles?.grade} • {friend.profiles?.country}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm">
                            <MessageSquare className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => removeFriend(friend.id)}>
                            <UserX className="h-4 w-4" />
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
                  <div className="space-y-3">
                    {pendingReceived.map((request) => (
                      <div key={request.id} className="flex items-center gap-4 p-4 bg-secondary/30 rounded-lg">
                        <Avatar className="h-12 w-12">
                          <AvatarImage src={request.profiles?.avatar_url} />
                          <AvatarFallback>{request.profiles?.username?.charAt(0).toUpperCase() || "U"}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <p className="font-semibold">{request.profiles?.username}</p>
                          <p className="text-sm text-muted-foreground">
                            {request.profiles?.grade} • {request.profiles?.country}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm" onClick={() => acceptRequest(request.id)}>
                            <Check className="h-4 w-4 mr-1" />
                            Accept
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => rejectRequest(request.id)}>
                            <X className="h-4 w-4" />
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
                  <div className="space-y-3">
                    {pendingSent.map((request) => (
                      <div key={request.id} className="flex items-center gap-4 p-4 bg-secondary/30 rounded-lg">
                        <Avatar className="h-12 w-12">
                          <AvatarImage src={request.profiles?.avatar_url} />
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
                          <Button variant="ghost" size="sm" onClick={() => rejectRequest(request.id)}>
                            <X className="h-4 w-4" />
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
      </div>
    </div>
  );
};

export default Friends;
