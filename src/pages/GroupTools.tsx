import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SEOHead from "@/components/SEOHead";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, FileText, Palette, Plus, Loader2, Trash2 } from "lucide-react";
import { toast } from "sonner";
import Whiteboard from "@/components/collaborative/Whiteboard";
import CollaborativeDoc from "@/components/collaborative/CollaborativeDoc";
import EventCalendar from "@/components/calendar/EventCalendar";

interface GroupInfo {
  id: string;
  name: string;
  created_by: string;
}

interface WhiteboardItem {
  id: string;
  name: string;
  created_at: string;
}

interface DocItem {
  id: string;
  title: string;
  created_at: string;
}

const GroupTools = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [groupInfo, setGroupInfo] = useState<GroupInfo | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [whiteboards, setWhiteboards] = useState<WhiteboardItem[]>([]);
  const [docs, setDocs] = useState<DocItem[]>([]);
  const [selectedWhiteboard, setSelectedWhiteboard] = useState<string | null>(null);
  const [selectedDoc, setSelectedDoc] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate("/auth");
        return;
      }
      setUserId(user.id);

      // Check membership
      const { data: memberData } = await supabase
        .from("group_members")
        .select("role")
        .eq("group_id", id)
        .eq("user_id", user.id)
        .single();

      if (!memberData) {
        toast.error("You're not a member of this group");
        navigate("/groups");
        return;
      }

      setIsAdmin(memberData.role === "admin");

      // Load group info
      const { data: groupData } = await supabase
        .from("group_chats")
        .select("id, name, created_by")
        .eq("id", id)
        .single();

      if (groupData) {
        setGroupInfo(groupData);
      }

      await loadWhiteboards();
      await loadDocs();
      setLoading(false);
    };

    init();
  }, [id, navigate]);

  const loadWhiteboards = async () => {
    const { data } = await supabase
      .from("whiteboards")
      .select("id, name, created_at")
      .eq("group_id", id)
      .order("created_at", { ascending: false });

    setWhiteboards(data || []);
  };

  const loadDocs = async () => {
    const { data } = await supabase
      .from("collaborative_docs")
      .select("id, title, created_at")
      .eq("group_id", id)
      .order("created_at", { ascending: false });

    setDocs(data || []);
  };

  const createWhiteboard = async () => {
    if (!userId || !id) return;
    setCreating(true);
    try {
      const { data, error } = await supabase.rpc("create_whiteboard", {
        p_name: `Whiteboard ${whiteboards.length + 1}`,
        p_group_id: id,
      });

      if (error) {
        console.error("RPC error:", error.code, error.message);
        throw error;
      }
      
      toast.success("Whiteboard created");
      await loadWhiteboards();
      setSelectedWhiteboard(data);
    } catch (error: any) {
      console.error("Error creating whiteboard:", error);
      toast.error(error?.message || "Failed to create whiteboard");
    } finally {
      setCreating(false);
    }
  };

  const createDoc = async () => {
    if (!userId || !id) return;
    setCreating(true);
    try {
      const { data, error } = await supabase
        .from("collaborative_docs")
        .insert({
          group_id: id,
          created_by: userId,
          title: `Document ${docs.length + 1}`,
        })
        .select()
        .single();

      if (error) throw error;
      toast.success("Document created");
      await loadDocs();
      setSelectedDoc(data.id);
    } catch (error) {
      console.error("Error creating document:", error);
      toast.error("Failed to create document");
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
      await loadWhiteboards();
    } catch (error) {
      console.error("Error deleting whiteboard:", error);
      toast.error("Failed to delete whiteboard");
    }
  };

  const deleteDoc = async (docId: string) => {
    try {
      const { error } = await supabase
        .from("collaborative_docs")
        .delete()
        .eq("id", docId);

      if (error) throw error;
      toast.success("Document deleted");
      if (selectedDoc === docId) {
        setSelectedDoc(null);
      }
      await loadDocs();
    } catch (error) {
      console.error("Error deleting document:", error);
      toast.error("Failed to delete document");
    }
  };

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
        title={`${groupInfo?.name || "Group"} Tools | StudyHub`}
        description="Collaborative tools for your study group"
        noIndex
      />
      <Navbar />
      <main className="container mx-auto px-4 py-6 max-w-6xl">
        <div className="flex items-center gap-4 mb-6">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(`/groups/${id}`)}
            aria-label="Back to group chat"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">{groupInfo?.name} - Tools</h1>
            <p className="text-muted-foreground">Collaborative whiteboards, documents, and events</p>
          </div>
        </div>

        <Tabs defaultValue="whiteboards">
          <TabsList className="mb-4">
            <TabsTrigger value="whiteboards">
              <Palette className="h-4 w-4 mr-1" />
              Whiteboards
            </TabsTrigger>
            <TabsTrigger value="documents">
              <FileText className="h-4 w-4 mr-1" />
              Documents
            </TabsTrigger>
            <TabsTrigger value="calendar">Calendar</TabsTrigger>
          </TabsList>

          <TabsContent value="whiteboards" className="space-y-4">
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
                <Whiteboard whiteboardId={selectedWhiteboard} groupId={id!} />
              </div>
            ) : (
              <>
                <div className="flex justify-between items-center">
                  <h2 className="text-lg font-semibold">Whiteboards</h2>
                  <Button onClick={createWhiteboard} disabled={creating}>
                    {creating ? (
                      <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                    ) : (
                      <Plus className="h-4 w-4 mr-1" />
                    )}
                    New Whiteboard
                  </Button>
                </div>
                {whiteboards.length === 0 ? (
                  <Card>
                    <CardContent className="py-8 text-center text-muted-foreground">
                      <Palette className="h-12 w-12 mx-auto mb-2 opacity-50" />
                      <p>No whiteboards yet. Create one to start collaborating!</p>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {whiteboards.map((wb) => (
                      <Card key={wb.id} className="cursor-pointer hover:shadow-md transition-shadow">
                        <CardHeader className="pb-2">
                          <div className="flex items-start justify-between">
                            <CardTitle className="text-base">{wb.name}</CardTitle>
                            {isAdmin && (
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6 text-muted-foreground hover:text-destructive"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  deleteWhiteboard(wb.id);
                                }}
                                aria-label="Delete whiteboard"
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            )}
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
                )}
              </>
            )}
          </TabsContent>

          <TabsContent value="documents" className="space-y-4">
            {selectedDoc ? (
              <div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedDoc(null)}
                  className="mb-4"
                >
                  <ArrowLeft className="h-4 w-4 mr-1" />
                  Back to list
                </Button>
                <CollaborativeDoc docId={selectedDoc} groupId={id!} />
              </div>
            ) : (
              <>
                <div className="flex justify-between items-center">
                  <h2 className="text-lg font-semibold">Documents</h2>
                  <Button onClick={createDoc} disabled={creating}>
                    {creating ? (
                      <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                    ) : (
                      <Plus className="h-4 w-4 mr-1" />
                    )}
                    New Document
                  </Button>
                </div>
                {docs.length === 0 ? (
                  <Card>
                    <CardContent className="py-8 text-center text-muted-foreground">
                      <FileText className="h-12 w-12 mx-auto mb-2 opacity-50" />
                      <p>No documents yet. Create one to start collaborating!</p>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {docs.map((doc) => (
                      <Card key={doc.id} className="cursor-pointer hover:shadow-md transition-shadow">
                        <CardHeader className="pb-2">
                          <div className="flex items-start justify-between">
                            <CardTitle className="text-base">{doc.title}</CardTitle>
                            {isAdmin && (
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6 text-muted-foreground hover:text-destructive"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  deleteDoc(doc.id);
                                }}
                                aria-label="Delete document"
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            )}
                          </div>
                          <CardDescription>
                            Created {new Date(doc.created_at).toLocaleDateString()}
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <Button
                            variant="outline"
                            size="sm"
                            className="w-full"
                            onClick={() => setSelectedDoc(doc.id)}
                          >
                            Open
                          </Button>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </>
            )}
          </TabsContent>

          <TabsContent value="calendar">
            {userId && id && <EventCalendar userId={userId} groupId={id} />}
          </TabsContent>
        </Tabs>
      </main>
      <Footer />
    </div>
  );
};

export default GroupTools;