import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Save, Loader2, Edit2 } from "lucide-react";
import { toast } from "sonner";
import { useDebounce } from "@/hooks/useDebounce";

interface CollaborativeDocProps {
  docId: string;
  groupId: string;
  isReadOnly?: boolean;
}

const CollaborativeDoc = ({ docId, groupId, isReadOnly = false }: CollaborativeDocProps) => {
  const [title, setTitle] = useState("Untitled Document");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingTitle, setEditingTitle] = useState(false);
  const debouncedContent = useDebounce(content, 1000);

  // Load document
  useEffect(() => {
    const loadDocument = async () => {
      try {
        const { data, error } = await supabase
          .from("collaborative_docs")
          .select("title, content")
          .eq("id", docId)
          .single();

        if (error) throw error;
        
        setTitle(data.title || "Untitled Document");
        setContent(data.content || "");
      } catch (error) {
        console.error("Error loading document:", error);
        toast.error("Failed to load document");
      } finally {
        setLoading(false);
      }
    };

    loadDocument();

    // Subscribe to real-time updates
    const channel = supabase
      .channel(`doc_${docId}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "collaborative_docs",
          filter: `id=eq.${docId}`,
        },
        (payload) => {
          const newData = payload.new as any;
          // Only update if it's from another user (content differs)
          if (newData?.content !== content) {
            setContent(newData.content || "");
          }
          if (newData?.title !== title) {
            setTitle(newData.title || "Untitled Document");
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [docId]);

  // Auto-save on content change
  useEffect(() => {
    if (!loading && !isReadOnly && debouncedContent !== undefined) {
      saveDocument(true);
    }
  }, [debouncedContent]);

  const saveDocument = useCallback(async (silent = false) => {
    if (!silent) setSaving(true);
    try {
      const { error } = await supabase
        .from("collaborative_docs")
        .update({
          title,
          content,
          updated_at: new Date().toISOString(),
        })
        .eq("id", docId);

      if (error) throw error;
      if (!silent) toast.success("Document saved");
    } catch (error) {
      console.error("Error saving document:", error);
      if (!silent) toast.error("Failed to save document");
    } finally {
      if (!silent) setSaving(false);
    }
  }, [title, content, docId]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center justify-between">
          <div className="flex items-center gap-2 flex-1">
            {editingTitle && !isReadOnly ? (
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                onBlur={() => {
                  setEditingTitle(false);
                  saveDocument(true);
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    setEditingTitle(false);
                    saveDocument(true);
                  }
                }}
                autoFocus
                className="font-semibold"
              />
            ) : (
              <span
                onClick={() => !isReadOnly && setEditingTitle(true)}
                className={!isReadOnly ? "cursor-pointer hover:text-primary" : ""}
              >
                {title}
              </span>
            )}
            {!isReadOnly && !editingTitle && (
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={() => setEditingTitle(true)}
              >
                <Edit2 className="h-3 w-3" />
              </Button>
            )}
          </div>
          {!isReadOnly && (
            <Button
              size="sm"
              onClick={() => saveDocument(false)}
              disabled={saving}
            >
              {saving ? (
                <Loader2 className="h-4 w-4 mr-1 animate-spin" />
              ) : (
                <Save className="h-4 w-4 mr-1" />
              )}
              Save
            </Button>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1">
        <Textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Start writing your document..."
          className="min-h-[400px] h-full resize-none font-mono"
          readOnly={isReadOnly}
        />
        <p className="text-xs text-muted-foreground mt-2">
          {isReadOnly ? "Read-only mode" : "Auto-saves as you type"}
        </p>
      </CardContent>
    </Card>
  );
};

export default CollaborativeDoc;