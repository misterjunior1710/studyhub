import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import SEOHead from "@/components/SEOHead";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Plus, Loader2, Trash2, Share2, Users, Lock, Globe, 
  Search, Palette, ArrowLeft 
} from "lucide-react";
import { toast } from "sonner";
import Whiteboard from "@/components/collaborative/Whiteboard";
import ShareWhiteboardDialog from "@/components/collaborative/ShareWhiteboardDialog";

interface WhiteboardItem {
  id: string;
  name: string;
  created_at: string;
  created_by: string;
  group_id: string | null;
  is_public: boolean;
  group_name?: string;
}

const Whiteboards = () => {
  const navigate = useNavigate();
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [whiteboards, setWhiteboards] = useState<WhiteboardItem[]>([]);
  const [sharedWhiteboards, setSharedWhiteboards] = useState<WhiteboardItem[]>([]);
  const [selectedWhiteboard, setSelectedWhiteboard] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate("/auth");
        return;
      }
      setUserId(user.id);
      
      // Check for shared whiteboard via URL
      const params = new URLSearchParams(window.location.search);
      const shareToken = params.get("share");
      if (shareToken) {
        const { data: sharedBoard } = await supabase
          .from("whiteboards")
          .select("id")
          .eq("share_token", shareToken)
          .single();
        
        if (sharedBoard) {
          setSelectedWhiteboard(sharedBoard.id);
          // Clean URL
          window.history.replaceState({}, "", "/whiteboards");
        }
      }
      
      await loadWhiteboards(user.id);
      setLoading(false);
    };

    init();
  }, [navigate]);

  const loadWhiteboards = async (uid: string) => {
    // Load user's own whiteboards
    const { data: ownWhiteboards } = await supabase
      .from("whiteboards")
      .select("id, name, created_at, created_by, group_id, is_public")
      .eq("created_by", uid)
      .order("created_at", { ascending: false });

    // Get group names for group whiteboards
    const groupIds = [...new Set((ownWhiteboards || []).filter(w => w.group_id).map(w => w.group_id))];
    let groupNames: Record<string, string> = {};
    if (groupIds.length > 0) {
      const { data: groups } = await supabase
        .from("group_chats")
        .select("id, name")
        .in("id", groupIds);
      groupNames = (groups || []).reduce((acc, g) => ({ ...acc, [g.id]: g.name }), {});
    }

    setWhiteboards((ownWhiteboards || []).map(w => ({
      ...w,
      group_name: w.group_id ? groupNames[w.group_id] : undefined
    })));

    // Load whiteboards shared with user
    const { data: shares } = await supabase
      .from("whiteboard_shares")
      .select("whiteboard_id")
      .eq("shared_with_user_id", uid);

    if (shares && shares.length > 0) {
      const sharedIds = shares.map(s => s.whiteboard_id);
      const { data: shared } = await supabase
        .from("whiteboards")
        .select("id, name, created_at, created_by, group_id, is_public")
        .in("id", sharedIds)
        .order("created_at", { ascending: false });

      setSharedWhiteboards(shared || []);
    }
  };

  const createWhiteboard = async () => {
    if (!userId) return;
    setCreating(true);
    try {
      const { data, error } = await supabase
        .from("whiteboards")
        .insert({
          created_by: userId,
          name: `Whiteboard ${whiteboards.length + 1}`,
        })
        .select()
        .single();

      if (error) throw error;
      toast.success("Whiteboard created");
      await loadWhiteboards(userId);
      setSelectedWhiteboard(data.id);
    } catch (error) {
      console.error("Error creating whiteboard:", error);
      toast.error("Failed to create whiteboard");
    } finally {
      setCreating(false);
    }
  };

  const deleteWhiteboard = async (whiteboardId: string) => {
    try {
      const { error } = await supabase
        .from("whiteboards")
        .delete()
        .eq("id", whiteboardId);

      if (error) throw error;
      toast.success("Whiteboard deleted");
      if (selectedWhiteboard === whiteboardId) {
        setSelectedWhiteboard(null);
      }
      if (userId) await loadWhiteboards(userId);
    } catch (error) {
      console.error("Error deleting whiteboard:", error);
      toast.error("Failed to delete whiteboard");
    }
  };

  const filteredWhiteboards = whiteboards.filter(wb =>
    wb.name.toLowerCase().includes(search.toLowerCase())
  );

  const filteredShared = sharedWhiteboards.filter(wb =>
    wb.name.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title="Whiteboards | StudyHub"
        description="Create and share whiteboards with friends and study groups."
      />
      <Navbar />
      <main className="container mx-auto px-4 py-6 max-w-6xl">
        {selectedWhiteboard ? (
          <div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSelectedWhiteboard(null)}
              className="mb-4"
            >
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back to list
            </Button>
            <Whiteboard whiteboardId={selectedWhiteboard} groupId="" />
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-2xl font-bold flex items-center gap-2">
                  <Palette className="h-6 w-6" />
                  My Whiteboards
                </h1>
                <p className="text-muted-foreground">Create and share whiteboards with friends or groups</p>
              </div>
              <Button onClick={createWhiteboard} disabled={creating}>
                {creating ? (
                  <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                ) : (
                  <Plus className="h-4 w-4 mr-1" />
                )}
                New Whiteboard
              </Button>
            </div>

            <div className="relative mb-6">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search whiteboards..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Own Whiteboards */}
            <div className="mb-8">
              <h2 className="text-lg font-semibold mb-4">My Whiteboards</h2>
              {filteredWhiteboards.length === 0 ? (
                <Card>
                  <CardContent className="py-8 text-center text-muted-foreground">
                    <Palette className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p>No whiteboards yet. Create one to start drawing!</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {filteredWhiteboards.map((wb) => (
                    <Card key={wb.id} className="hover:shadow-md transition-shadow">
                      <CardHeader className="pb-2">
                        <div className="flex items-start justify-between">
                          <CardTitle className="text-base">{wb.name}</CardTitle>
                          <div className="flex items-center gap-1">
                            {wb.is_public ? (
                              <Badge variant="secondary" className="text-xs">
                                <Globe className="h-3 w-3 mr-1" />
                                Public
                              </Badge>
                            ) : wb.group_id ? (
                              <Badge variant="outline" className="text-xs">
                                <Users className="h-3 w-3 mr-1" />
                                Group
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="text-xs">
                                <Lock className="h-3 w-3 mr-1" />
                                Private
                              </Badge>
                            )}
                          </div>
                        </div>
                        <CardDescription>
                          {wb.group_name && <span className="block">{wb.group_name}</span>}
                          Created {new Date(wb.created_at).toLocaleDateString()}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1"
                          onClick={() => setSelectedWhiteboard(wb.id)}
                        >
                          Open
                        </Button>
                        <ShareWhiteboardDialog 
                          whiteboardId={wb.id} 
                          whiteboardName={wb.name}
                          onShare={() => userId && loadWhiteboards(userId)}
                        />
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground hover:text-destructive"
                          onClick={() => deleteWhiteboard(wb.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>

            {/* Shared Whiteboards */}
            {filteredShared.length > 0 && (
              <div>
                <h2 className="text-lg font-semibold mb-4">Shared With Me</h2>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {filteredShared.map((wb) => (
                    <Card key={wb.id} className="hover:shadow-md transition-shadow">
                      <CardHeader className="pb-2">
                        <div className="flex items-start justify-between">
                          <CardTitle className="text-base">{wb.name}</CardTitle>
                          <Badge variant="secondary" className="text-xs">
                            <Share2 className="h-3 w-3 mr-1" />
                            Shared
                          </Badge>
                        </div>
                        <CardDescription>
                          Created {new Date(wb.created_at).toLocaleDateString()}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full"
                          onClick={() => setSelectedWhiteboard(wb.id)}
                        >
                          Open
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
};

export default Whiteboards;