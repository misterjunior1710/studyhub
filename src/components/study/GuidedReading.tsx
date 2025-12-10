import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Plus, Trash2, BookOpen, ArrowRight, ArrowLeft, CheckCircle } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface ReadingSession {
  id: string;
  title: string;
  source_material: string | null;
  survey_notes: string | null;
  questions: string | null;
  read_notes: string | null;
  recite_notes: string | null;
  review_notes: string | null;
  current_step: string;
  created_at: string;
}

const STEPS = [
  { key: "survey", title: "Survey", description: "Skim headings, subheadings, images, and summaries to get an overview.", icon: "📖" },
  { key: "question", title: "Question", description: "Turn headings into questions. What will this section answer?", icon: "❓" },
  { key: "read", title: "Read", description: "Read actively, looking for answers to your questions.", icon: "📚" },
  { key: "recite", title: "Recite", description: "Close the book and recall what you just read in your own words.", icon: "🗣️" },
  { key: "review", title: "Review", description: "Go back and review your notes. Fill in any gaps.", icon: "✅" },
];

export function GuidedReading() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [selectedSession, setSelectedSession] = useState<ReadingSession | null>(null);
  const [createSessionOpen, setCreateSessionOpen] = useState(false);
  const [newSession, setNewSession] = useState({ title: "", source_material: "" });
  const [editData, setEditData] = useState({
    survey_notes: "",
    questions: "",
    read_notes: "",
    recite_notes: "",
    review_notes: "",
  });

  const { data: sessions = [], isLoading } = useQuery({
    queryKey: ["reading-sessions", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("reading_sessions")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as ReadingSession[];
    },
    enabled: !!user,
  });

  const createSessionMutation = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.from("reading_sessions").insert({
        user_id: user!.id,
        title: newSession.title,
        source_material: newSession.source_material || null,
      }).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["reading-sessions"] });
      setCreateSessionOpen(false);
      setNewSession({ title: "", source_material: "" });
      setSelectedSession(data as ReadingSession);
      toast.success("Reading session started!");
    },
  });

  const updateSessionMutation = useMutation({
    mutationFn: async (step: string) => {
      const { error } = await supabase.from("reading_sessions").update({
        survey_notes: editData.survey_notes || null,
        questions: editData.questions || null,
        read_notes: editData.read_notes || null,
        recite_notes: editData.recite_notes || null,
        review_notes: editData.review_notes || null,
        current_step: step,
      }).eq("id", selectedSession!.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reading-sessions"] });
      toast.success("Progress saved!");
    },
  });

  const deleteSessionMutation = useMutation({
    mutationFn: async (sessionId: string) => {
      const { error } = await supabase.from("reading_sessions").delete().eq("id", sessionId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reading-sessions"] });
      setSelectedSession(null);
      toast.success("Session deleted");
    },
  });

  const handleSelectSession = (session: ReadingSession) => {
    setSelectedSession(session);
    setEditData({
      survey_notes: session.survey_notes || "",
      questions: session.questions || "",
      read_notes: session.read_notes || "",
      recite_notes: session.recite_notes || "",
      review_notes: session.review_notes || "",
    });
  };

  const getCurrentStepIndex = () => {
    return STEPS.findIndex(s => s.key === selectedSession?.current_step) || 0;
  };

  const goToStep = (stepKey: string) => {
    updateSessionMutation.mutate(stepKey);
    setSelectedSession(prev => prev ? { ...prev, current_step: stepKey } : null);
  };

  const getFieldForStep = (stepKey: string) => {
    const fields: Record<string, { value: string; setter: (v: string) => void; placeholder: string }> = {
      survey: {
        value: editData.survey_notes,
        setter: v => setEditData(p => ({ ...p, survey_notes: v })),
        placeholder: "• Main headings I noticed:\n• Key images/diagrams:\n• Summary/conclusion preview:\n• My initial impression:",
      },
      question: {
        value: editData.questions,
        setter: v => setEditData(p => ({ ...p, questions: v })),
        placeholder: "Turn headings into questions:\n• What is...?\n• Why does...?\n• How does... work?\n• What are the main...?",
      },
      read: {
        value: editData.read_notes,
        setter: v => setEditData(p => ({ ...p, read_notes: v })),
        placeholder: "Active reading notes:\n• Answer to Q1:\n• Key concept:\n• Important detail:\n• Connection to prior knowledge:",
      },
      recite: {
        value: editData.recite_notes,
        setter: v => setEditData(p => ({ ...p, recite_notes: v })),
        placeholder: "Without looking at the text, write what you remember:\n• Main idea:\n• Supporting points:\n• Examples:\n• What I'm still unsure about:",
      },
      review: {
        value: editData.review_notes,
        setter: v => setEditData(p => ({ ...p, review_notes: v })),
        placeholder: "Final review and synthesis:\n• Key takeaways:\n• How this connects to other topics:\n• Questions for further study:\n• Summary in my own words:",
      },
    };
    return fields[stepKey];
  };

  if (selectedSession) {
    const currentStepIndex = getCurrentStepIndex();
    const currentStep = STEPS[currentStepIndex];
    const field = getFieldForStep(currentStep.key);

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <Button variant="ghost" onClick={() => setSelectedSession(null)}>
            ← Back to Sessions
          </Button>
          <div className="flex gap-1">
            {STEPS.map((step, i) => (
              <button
                key={step.key}
                onClick={() => goToStep(step.key)}
                className={cn(
                  "px-3 py-1.5 rounded text-sm font-medium transition-colors",
                  i === currentStepIndex && "bg-primary text-primary-foreground",
                  i < currentStepIndex && "bg-green-500/20 text-green-600",
                  i > currentStepIndex && "bg-muted text-muted-foreground hover:bg-muted/80"
                )}
              >
                {step.icon}
              </button>
            ))}
          </div>
        </div>

        <Card className="p-6">
          <div className="mb-6">
            <h3 className="text-xl font-semibold mb-1">{selectedSession.title}</h3>
            {selectedSession.source_material && (
              <p className="text-sm text-muted-foreground">Source: {selectedSession.source_material}</p>
            )}
          </div>

          <div className="mb-6 p-4 bg-primary/5 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-2xl">{currentStep.icon}</span>
              <h4 className="text-lg font-medium">{currentStep.title}</h4>
            </div>
            <p className="text-sm text-muted-foreground">{currentStep.description}</p>
          </div>

          <div className="space-y-4">
            <Textarea
              value={field.value}
              onChange={e => field.setter(e.target.value)}
              placeholder={field.placeholder}
              className="min-h-[250px] font-mono text-sm"
            />

            <div className="flex justify-between">
              <Button
                variant="outline"
                onClick={() => goToStep(STEPS[currentStepIndex - 1]?.key)}
                disabled={currentStepIndex === 0}
              >
                <ArrowLeft className="h-4 w-4 mr-2" /> Previous
              </Button>
              {currentStepIndex < STEPS.length - 1 ? (
                <Button onClick={() => goToStep(STEPS[currentStepIndex + 1].key)}>
                  Next <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              ) : (
                <Button onClick={() => { updateSessionMutation.mutate("review"); toast.success("SQ3R session complete! 🎉"); }}>
                  <CheckCircle className="h-4 w-4 mr-2" /> Complete
                </Button>
              )}
            </div>
          </div>
        </Card>

        {/* Previous notes reference */}
        {currentStepIndex > 0 && (
          <Card className="p-4 bg-muted/30">
            <p className="text-sm font-medium mb-2">📝 Your previous notes:</p>
            <div className="space-y-2 text-sm">
              {editData.survey_notes && currentStepIndex > 0 && (
                <div><strong>Survey:</strong> {editData.survey_notes.substring(0, 100)}...</div>
              )}
              {editData.questions && currentStepIndex > 1 && (
                <div><strong>Questions:</strong> {editData.questions.substring(0, 100)}...</div>
              )}
              {editData.read_notes && currentStepIndex > 2 && (
                <div><strong>Reading:</strong> {editData.read_notes.substring(0, 100)}...</div>
              )}
              {editData.recite_notes && currentStepIndex > 3 && (
                <div><strong>Recite:</strong> {editData.recite_notes.substring(0, 100)}...</div>
              )}
            </div>
          </Card>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">SQ3R Guided Reading</h3>
          <p className="text-sm text-muted-foreground">Survey, Question, Read, Recite, Review</p>
        </div>
        <Dialog open={createSessionOpen} onOpenChange={setCreateSessionOpen}>
          <DialogTrigger asChild>
            <Button><Plus className="h-4 w-4 mr-2" /> New Session</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Start Reading Session</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>What are you reading?</Label>
                <Input
                  value={newSession.title}
                  onChange={e => setNewSession(p => ({ ...p, title: e.target.value }))}
                  placeholder="e.g., Chapter 5: Cell Division"
                />
              </div>
              <div>
                <Label>Source (optional)</Label>
                <Input
                  value={newSession.source_material}
                  onChange={e => setNewSession(p => ({ ...p, source_material: e.target.value }))}
                  placeholder="e.g., Biology Textbook, pages 120-145"
                />
              </div>
              <Button onClick={() => createSessionMutation.mutate()} disabled={!newSession.title}>
                Start Reading
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="p-4 bg-primary/5 border-primary/20">
        <div className="flex items-start gap-3">
          <BookOpen className="h-5 w-5 text-primary mt-0.5" />
          <div>
            <p className="font-medium text-sm">The SQ3R Method</p>
            <p className="text-sm text-muted-foreground">
              A proven reading comprehension strategy: Survey the material, create Questions, Read actively, Recite from memory, and Review your notes.
            </p>
          </div>
        </div>
      </Card>

      {isLoading ? (
        <div className="text-center py-8 text-muted-foreground">Loading sessions...</div>
      ) : sessions.length === 0 ? (
        <Card className="p-8 text-center">
          <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">No reading sessions yet. Start one!</p>
        </Card>
      ) : (
        <div className="grid gap-3">
          {sessions.map(session => {
            const stepIndex = STEPS.findIndex(s => s.key === session.current_step);
            return (
              <Card key={session.id} className="p-4 cursor-pointer hover:bg-muted/50 transition-colors" onClick={() => handleSelectSession(session)}>
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-medium">{session.title}</h4>
                    {session.source_material && (
                      <p className="text-sm text-muted-foreground">{session.source_material}</p>
                    )}
                    <div className="flex gap-1 mt-2">
                      {STEPS.map((step, i) => (
                        <span
                          key={step.key}
                          className={cn(
                            "text-xs px-1.5 py-0.5 rounded",
                            i <= stepIndex ? "bg-green-500/20" : "bg-muted"
                          )}
                        >
                          {step.icon}
                        </span>
                      ))}
                    </div>
                  </div>
                  <Button variant="ghost" size="icon" onClick={e => { e.stopPropagation(); deleteSessionMutation.mutate(session.id); }}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}