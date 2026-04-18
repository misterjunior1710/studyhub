import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SEOHead from "@/components/SEOHead";
import RichTextEditor from "@/components/RichTextEditor";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { useDebounce } from "@/hooks/useDebounce";
import { toast } from "sonner";
import { sanitizeHtml } from "@/lib/sanitize";
import { getSubjectsForGrade } from "@/lib/curriculumTemplates";
import {
  Plus, Search, Trash2, FileText, Loader2, Check, AlertCircle, NotebookPen,
} from "lucide-react";
import { z } from "zod";

interface Note {
  id: string;
  title: string;
  subject: string | null;
  content: string;
  created_at: string;
  updated_at: string;
}

const noteSchema = z.object({
  title: z.string().trim().min(1, "Title required").max(200, "Title too long"),
  subject: z.string().max(80).nullable().optional(),
  content: z.string().max(100_000, "Note content too long"),
});

type SaveStatus = "idle" | "saving" | "saved" | "error";

const Notes = () => {
  const { user, profileData } = useAuth();
  const navigate = useNavigate();

  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [activeId, setActiveId] = useState<string | null>(null);

  const [title, setTitle] = useState("");
  const [subject, setSubject] = useState<string>("");
  const [content, setContent] = useState("");
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");
  const [searchInput, setSearchInput] = useState("");
  const searchQuery = useDebounce(searchInput, 250);

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);

  const lastSavedRef = useRef<{ title: string; subject: string; content: string } | null>(null);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const subjectOptions = useMemo(() => {
    const list = getSubjectsForGrade(profileData?.grade ?? "");
    return list.length ? list : ["General", "Mathematics", "Science", "English", "Other"];
  }, [profileData?.grade]);

  // Redirect unauthenticated users
  useEffect(() => {
    if (user === null) navigate("/auth");
  }, [user, navigate]);

  const loadNotes = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    setLoadError(null);
    const { data, error } = await supabase
      .from("notes")
      .select("*")
      .order("updated_at", { ascending: false });
    if (error) {
      console.error("Failed to load notes", error);
      setLoadError("We couldn't load your notes. Please try again.");
      setLoading(false);
      return;
    }
    setNotes((data ?? []) as Note[]);
    setLoading(false);
  }, [user]);

  useEffect(() => {
    loadNotes();
  }, [loadNotes]);

  // Load active note into editor
  const selectNote = useCallback((note: Note) => {
    setActiveId(note.id);
    setTitle(note.title);
    setSubject(note.subject ?? "");
    setContent(note.content ?? "");
    lastSavedRef.current = {
      title: note.title,
      subject: note.subject ?? "",
      content: note.content ?? "",
    };
    setSaveStatus("idle");
  }, []);

  const createNote = useCallback(async () => {
    if (!user) return;
    const { data, error } = await supabase
      .from("notes")
      .insert({ user_id: user.id, title: "Untitled Note", content: "", subject: null })
      .select("*")
      .single();
    if (error || !data) {
      toast.error("Couldn't create note");
      return;
    }
    setNotes((prev) => [data as Note, ...prev]);
    selectNote(data as Note);
    toast.success("New note created");
  }, [user, selectNote]);

  // Auto-save (debounced)
  useEffect(() => {
    if (!activeId || !user) return;
    const last = lastSavedRef.current;
    const dirty =
      !last ||
      last.title !== title ||
      last.subject !== subject ||
      last.content !== content;
    if (!dirty) return;

    setSaveStatus("saving");
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(async () => {
      const parsed = noteSchema.safeParse({
        title: title || "Untitled Note",
        subject: subject || null,
        content,
      });
      if (!parsed.success) {
        setSaveStatus("error");
        toast.error(parsed.error.errors[0]?.message ?? "Invalid note");
        return;
      }
      const { error } = await supabase
        .from("notes")
        .update({
          title: parsed.data.title,
          subject: parsed.data.subject ?? null,
          content: parsed.data.content,
        })
        .eq("id", activeId);
      if (error) {
        console.error("Auto-save failed", error);
        setSaveStatus("error");
        return;
      }
      lastSavedRef.current = { title: parsed.data.title, subject: subject, content };
      setSaveStatus("saved");
      // Update list in place
      setNotes((prev) =>
        prev
          .map((n) =>
            n.id === activeId
              ? { ...n, title: parsed.data.title, subject: parsed.data.subject ?? null, content, updated_at: new Date().toISOString() }
              : n
          )
          .sort((a, b) => (a.updated_at > b.updated_at ? -1 : 1))
      );
    }, 800);

    return () => {
      if (saveTimer.current) clearTimeout(saveTimer.current);
    };
  }, [title, subject, content, activeId, user]);

  const confirmDelete = (id: string) => {
    setPendingDeleteId(id);
    setDeleteOpen(true);
  };

  const performDelete = async () => {
    if (!pendingDeleteId) return;
    const id = pendingDeleteId;
    setDeleteOpen(false);
    setPendingDeleteId(null);
    const { error } = await supabase.from("notes").delete().eq("id", id);
    if (error) {
      toast.error("Couldn't delete note");
      return;
    }
    setNotes((prev) => prev.filter((n) => n.id !== id));
    if (activeId === id) {
      setActiveId(null);
      setTitle("");
      setSubject("");
      setContent("");
      lastSavedRef.current = null;
      setSaveStatus("idle");
    }
    toast.success("Note deleted");
  };

  const filteredNotes = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return notes;
    return notes.filter((n) => {
      const plain = (n.content ?? "").replace(/<[^>]*>/g, " ").toLowerCase();
      return (
        n.title.toLowerCase().includes(q) ||
        (n.subject ?? "").toLowerCase().includes(q) ||
        plain.includes(q)
      );
    });
  }, [notes, searchQuery]);

  const SaveIndicator = () => {
    if (saveStatus === "saving") return (
      <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <Loader2 className="h-3 w-3 animate-spin" /> Saving…
      </span>
    );
    if (saveStatus === "saved") return (
      <span className="flex items-center gap-1.5 text-xs text-success">
        <Check className="h-3 w-3" /> Saved
      </span>
    );
    if (saveStatus === "error") return (
      <span className="flex items-center gap-1.5 text-xs text-destructive">
        <AlertCircle className="h-3 w-3" /> Save failed
      </span>
    );
    return null;
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <SEOHead
        title="Notes | Rich Text Note-Taking with Auto-Save | StudyHub"
        description="Take organized study notes with a rich text editor, subject tags, search, and auto-save. Keep all your study notes in one place."
        canonical="https://studyhub.world/notes"
        noIndex
      />
      <Navbar />

      <header className="bg-gradient-to-r from-primary/10 via-accent/5 to-primary/10 border-b border-border">
        <div className="container mx-auto px-4 py-6 sm:py-8">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold mb-1 flex items-center gap-2">
                <NotebookPen className="h-7 w-7 text-primary" />
                Your Notes
              </h1>
              <p className="text-muted-foreground text-sm">
                Capture ideas with rich formatting. Everything auto-saves.
              </p>
            </div>
            <Button onClick={createNote} className="gap-2">
              <Plus className="h-4 w-4" />
              New note
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-4 sm:py-6 flex-1 w-full">
        <div className="grid lg:grid-cols-[320px_1fr] gap-4 lg:gap-6 min-h-[60vh]">
          {/* Sidebar: list + search */}
          <aside className="space-y-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search notes…"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="pl-10"
                aria-label="Search notes"
              />
            </div>

            <Card>
              <CardContent className="p-2">
                {loading ? (
                  <div className="flex items-center justify-center py-12 text-muted-foreground">
                    <Loader2 className="h-5 w-5 animate-spin" />
                  </div>
                ) : loadError ? (
                  <div className="p-6 text-center space-y-3">
                    <AlertCircle className="h-8 w-8 mx-auto text-destructive" />
                    <p className="text-sm text-muted-foreground">{loadError}</p>
                    <Button size="sm" variant="outline" onClick={loadNotes}>Try again</Button>
                  </div>
                ) : filteredNotes.length === 0 ? (
                  <div className="p-6 text-center space-y-3">
                    <FileText className="h-8 w-8 mx-auto text-muted-foreground" />
                    <p className="text-sm font-medium">
                      {searchQuery ? "No notes match your search" : "No notes yet"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {searchQuery ? "Try a different keyword." : "Create your first note to get started."}
                    </p>
                    {!searchQuery && (
                      <Button size="sm" onClick={createNote} className="gap-2">
                        <Plus className="h-3.5 w-3.5" /> New note
                      </Button>
                    )}
                  </div>
                ) : (
                  <ScrollArea className="h-[60vh] pr-1">
                    <ul className="space-y-1">
                      {filteredNotes.map((n) => {
                        const active = n.id === activeId;
                        const preview = (n.content ?? "").replace(/<[^>]*>/g, " ").trim().slice(0, 80);
                        return (
                          <li key={n.id}>
                            <button
                              type="button"
                              onClick={() => selectNote(n)}
                              className={`group w-full text-left rounded-lg p-3 transition-colors ${
                                active ? "bg-primary/10 border border-primary/30" : "hover:bg-muted"
                              }`}
                            >
                              <div className="flex items-start justify-between gap-2">
                                <div className="min-w-0 flex-1">
                                  <p className="font-medium text-sm truncate">{n.title || "Untitled Note"}</p>
                                  {preview && (
                                    <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">{preview}</p>
                                  )}
                                  <div className="flex items-center gap-2 mt-1.5">
                                    {n.subject && (
                                      <Badge variant="secondary" className="text-[10px] py-0 h-4">{n.subject}</Badge>
                                    )}
                                    <span className="text-[10px] text-muted-foreground">
                                      {new Date(n.updated_at).toLocaleDateString()}
                                    </span>
                                  </div>
                                </div>
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  className="h-7 w-7 opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive shrink-0"
                                  onClick={(e) => { e.stopPropagation(); confirmDelete(n.id); }}
                                  aria-label="Delete note"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </Button>
                              </div>
                            </button>
                          </li>
                        );
                      })}
                    </ul>
                  </ScrollArea>
                )}
              </CardContent>
            </Card>
          </aside>

          {/* Editor */}
          <main>
            {!activeId ? (
              <Card className="h-full">
                <CardContent className="flex flex-col items-center justify-center h-full min-h-[60vh] text-center p-8 gap-4">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-primary/20 to-accent/20">
                    <NotebookPen className="h-8 w-8 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold mb-1">Pick a note or start a new one</h2>
                    <p className="text-sm text-muted-foreground max-w-md">
                      Your notes are private to you, support rich formatting, and save automatically as you type.
                    </p>
                  </div>
                  <Button onClick={createNote} className="gap-2">
                    <Plus className="h-4 w-4" /> Create your first note
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="p-4 sm:p-6 space-y-4">
                  <div className="flex items-center justify-between gap-4">
                    <h2 className="text-sm font-medium text-muted-foreground">Editing note</h2>
                    <SaveIndicator />
                  </div>

                  <Input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Note title"
                    maxLength={200}
                    className="text-xl font-semibold border-0 px-0 focus-visible:ring-0 shadow-none"
                    aria-label="Note title"
                  />

                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm text-muted-foreground">Subject:</span>
                    <Select value={subject || "none"} onValueChange={(v) => setSubject(v === "none" ? "" : v)}>
                      <SelectTrigger className="w-[220px] h-8 text-sm">
                        <SelectValue placeholder="No subject" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">No subject</SelectItem>
                        {subjectOptions.map((s) => (
                          <SelectItem key={s} value={s}>{s}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <RichTextEditor
                    content={content}
                    onChange={(html) => setContent(sanitizeHtml(html))}
                    placeholder="Start writing your note…"
                  />
                </CardContent>
              </Card>
            )}
          </main>
        </div>
      </div>

      <Footer />

      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this note?</AlertDialogTitle>
            <AlertDialogDescription>
              This permanently removes the note. This action can't be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={performDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Notes;
