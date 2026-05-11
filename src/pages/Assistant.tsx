import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Plus, Trash2, MessageSquare, ArrowLeft } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { AssistantChat } from "@/components/assistant/AssistantChat";
import { useAssistantThreads } from "@/hooks/useAssistant";
import { cn } from "@/lib/utils";
import SEOHead from "@/components/SEOHead";
import Navbar from "@/components/Navbar";

const Assistant = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const { threads, loading, refresh, deleteThread } = useAssistantThreads();
  const threadId = params.get("t");
  const [showSidebar, setShowSidebar] = useState(false);

  useEffect(() => {
    if (!user) navigate("/auth");
  }, [user, navigate]);

  const setThread = (id: string | null) => {
    if (id) setParams({ t: id });
    else setParams({});
    setShowSidebar(false);
  };

  return (
    <>
      <SEOHead
        title="AI Assistant — StudyHub"
        description="Your AI-powered academic companion. Get instant help with studying, navigation, and productivity."
      />
      <Navbar />
      <div className="h-[calc(100vh-4rem)] flex bg-background">
        {/* Sidebar */}
        <aside
          className={cn(
            "border-r border-border bg-card flex-col w-72 shrink-0",
            "md:flex",
            showSidebar ? "flex absolute inset-y-0 left-0 z-30 mt-16 h-[calc(100vh-4rem)]" : "hidden"
          )}
          aria-label="Conversation history"
        >
          <div className="p-3 border-b border-border">
            <Button
              onClick={() => setThread(null)}
              className="w-full justify-start gap-2"
              variant="default"
            >
              <Plus className="h-4 w-4" /> New conversation
            </Button>
          </div>
          <ScrollArea className="flex-1">
            <div className="p-2 space-y-1">
              {loading && <p className="text-xs text-muted-foreground p-2">Loading…</p>}
              {!loading && threads.length === 0 && (
                <p className="text-xs text-muted-foreground p-2">No conversations yet.</p>
              )}
              {threads.map((t) => (
                <div
                  key={t.id}
                  className={cn(
                    "group flex items-center gap-2 rounded-md p-2 hover:bg-accent transition-colors",
                    threadId === t.id && "bg-accent"
                  )}
                >
                  <button
                    onClick={() => setThread(t.id)}
                    className="flex-1 flex items-center gap-2 text-left min-w-0"
                  >
                    <MessageSquare className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden />
                    <span className="text-sm truncate">{t.title}</span>
                  </button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 opacity-0 group-hover:opacity-100"
                    onClick={() => deleteThread(t.id)}
                    aria-label={`Delete conversation: ${t.title}`}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              ))}
            </div>
          </ScrollArea>
        </aside>

        {/* Chat area */}
        <div className="flex-1 flex flex-col min-w-0">
          <div className="md:hidden flex items-center gap-2 p-2 border-b border-border">
            <Button variant="ghost" size="sm" onClick={() => setShowSidebar((s) => !s)} className="gap-1.5">
              <ArrowLeft className="h-4 w-4" /> Conversations
            </Button>
          </div>
          <AssistantChat
            key={threadId ?? "new"}
            threadId={threadId}
            onThreadCreated={(id) => { setThread(id); void refresh(); }}
          />
        </div>
      </div>
    </>
  );
};

export default Assistant;
