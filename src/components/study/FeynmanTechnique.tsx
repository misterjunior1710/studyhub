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
import { Plus, Trash2, Lightbulb, ArrowRight, CheckCircle } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface FeynmanNote {
  id: string;
  concept: string;
  simple_explanation: string | null;
  gaps_identified: string | null;
  refined_explanation: string | null;
  is_public: boolean;
  created_at: string;
}

const STEPS = [
  { key: "concept", title: "1. Choose a Concept", description: "Write the concept you want to learn at the top." },
  { key: "explain", title: "2. Explain Simply", description: "Explain it as if teaching a child. Use simple words." },
  { key: "gaps", title: "3. Identify Gaps", description: "Notice where you struggled. Those are your knowledge gaps." },
  { key: "refine", title: "4. Refine & Simplify", description: "Go back to sources, fill gaps, and simplify further." },
];

export function FeynmanTechnique() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [selectedNote, setSelectedNote] = useState<FeynmanNote | null>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [createNoteOpen, setCreateNoteOpen] = useState(false);
  const [newConcept, setNewConcept] = useState("");
  const [editData, setEditData] = useState({
    simple_explanation: "",
    gaps_identified: "",
    refined_explanation: "",
  });

  const { data: notes = [], isLoading } = useQuery({
    queryKey: ["feynman-notes", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("feynman_notes")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as FeynmanNote[];
    },
    enabled: !!user,
  });

  const createNoteMutation = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.from("feynman_notes").insert({
        user_id: user!.id,
        concept: newConcept,
      }).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["feynman-notes"] });
      setCreateNoteOpen(false);
      setNewConcept("");
      setSelectedNote(data as FeynmanNote);
      setCurrentStep(1);
      toast.success("Started Feynman session!");
    },
  });

  const updateNoteMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("feynman_notes").update({
        simple_explanation: editData.simple_explanation || null,
        gaps_identified: editData.gaps_identified || null,
        refined_explanation: editData.refined_explanation || null,
      }).eq("id", selectedNote!.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["feynman-notes"] });
      toast.success("Progress saved!");
    },
  });

  const deleteNoteMutation = useMutation({
    mutationFn: async (noteId: string) => {
      const { error } = await supabase.from("feynman_notes").delete().eq("id", noteId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["feynman-notes"] });
      setSelectedNote(null);
      toast.success("Note deleted");
    },
  });

  const handleSelectNote = (note: FeynmanNote) => {
    setSelectedNote(note);
    setEditData({
      simple_explanation: note.simple_explanation || "",
      gaps_identified: note.gaps_identified || "",
      refined_explanation: note.refined_explanation || "",
    });
    // Determine current step based on progress
    if (note.refined_explanation) setCurrentStep(3);
    else if (note.gaps_identified) setCurrentStep(2);
    else if (note.simple_explanation) setCurrentStep(1);
    else setCurrentStep(0);
  };

  const handleNextStep = () => {
    updateNoteMutation.mutate();
    if (currentStep < 3) {
      setCurrentStep(prev => prev + 1);
    }
  };

  if (selectedNote) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Button variant="ghost" onClick={() => setSelectedNote(null)}>
            ← Back to Notes
          </Button>
          <div className="flex gap-2">
            {STEPS.map((step, i) => (
              <div
                key={step.key}
                className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors",
                  i < currentStep && "bg-green-500 text-white",
                  i === currentStep && "bg-primary text-primary-foreground",
                  i > currentStep && "bg-muted text-muted-foreground"
                )}
              >
                {i < currentStep ? <CheckCircle className="h-4 w-4" /> : i + 1}
              </div>
            ))}
          </div>
        </div>

        <Card className="p-6">
          <div className="mb-6">
            <h3 className="text-xl font-semibold mb-2">{selectedNote.concept}</h3>
            <div className="text-sm text-primary font-medium">{STEPS[currentStep].title}</div>
            <p className="text-sm text-muted-foreground">{STEPS[currentStep].description}</p>
          </div>

          {currentStep === 0 && (
            <div className="text-center py-8">
              <Lightbulb className="h-12 w-12 mx-auto text-yellow-500 mb-4" />
              <p className="text-muted-foreground mb-4">Your concept: <strong>{selectedNote.concept}</strong></p>
              <Button onClick={() => setCurrentStep(1)}>
                Start Explaining <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          )}

          {currentStep === 1 && (
            <div className="space-y-4">
              <div>
                <Label>Explain "{selectedNote.concept}" as if teaching a 12-year-old:</Label>
                <Textarea
                  value={editData.simple_explanation}
                  onChange={e => setEditData(p => ({ ...p, simple_explanation: e.target.value }))}
                  placeholder="Use simple words, analogies, and examples..."
                  className="mt-2 min-h-[200px]"
                />
              </div>
              <div className="bg-muted/50 p-4 rounded-lg">
                <p className="text-sm font-medium mb-2">💡 Tips for simple explanations:</p>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Avoid jargon and technical terms</li>
                  <li>• Use everyday analogies (e.g., "DNA is like a recipe book")</li>
                  <li>• Draw connections to things everyone knows</li>
                  <li>• If you can't explain it simply, you don't understand it well enough</li>
                </ul>
              </div>
              <Button onClick={handleNextStep} disabled={!editData.simple_explanation}>
                Continue to Gaps <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-4">
              <div className="bg-muted/30 p-4 rounded-lg mb-4">
                <p className="text-sm font-medium mb-2">Your explanation:</p>
                <p className="text-sm">{editData.simple_explanation}</p>
              </div>
              <div>
                <Label>What parts were hard to explain? Where did you get stuck?</Label>
                <Textarea
                  value={editData.gaps_identified}
                  onChange={e => setEditData(p => ({ ...p, gaps_identified: e.target.value }))}
                  placeholder="List the areas where you struggled or felt uncertain..."
                  className="mt-2 min-h-[150px]"
                />
              </div>
              <div className="bg-yellow-500/10 border border-yellow-500/30 p-4 rounded-lg">
                <p className="text-sm font-medium mb-2">🔍 These gaps reveal what to study next!</p>
                <p className="text-sm text-muted-foreground">
                  Go back to your source material and focus on these specific areas.
                </p>
              </div>
              <Button onClick={handleNextStep} disabled={!editData.gaps_identified}>
                Continue to Refine <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          )}

          {currentStep === 3 && (
            <div className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="bg-muted/30 p-4 rounded-lg">
                  <p className="text-sm font-medium mb-2">Original explanation:</p>
                  <p className="text-sm">{editData.simple_explanation}</p>
                </div>
                <div className="bg-yellow-500/10 p-4 rounded-lg">
                  <p className="text-sm font-medium mb-2">Gaps identified:</p>
                  <p className="text-sm">{editData.gaps_identified}</p>
                </div>
              </div>
              <div>
                <Label>Write your refined, improved explanation:</Label>
                <Textarea
                  value={editData.refined_explanation}
                  onChange={e => setEditData(p => ({ ...p, refined_explanation: e.target.value }))}
                  placeholder="Now that you've filled the gaps, explain it even more simply..."
                  className="mt-2 min-h-[200px]"
                />
              </div>
              <Button onClick={() => { updateNoteMutation.mutate(); toast.success("Feynman session complete! 🎉"); }}>
                <CheckCircle className="h-4 w-4 mr-2" /> Complete Session
              </Button>
            </div>
          )}
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Feynman Technique</h3>
          <p className="text-sm text-muted-foreground">Explain concepts simply to find gaps in understanding</p>
        </div>
        <Dialog open={createNoteOpen} onOpenChange={setCreateNoteOpen}>
          <DialogTrigger asChild>
            <Button><Plus className="h-4 w-4 mr-2" /> New Session</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Start Feynman Session</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>What concept do you want to learn?</Label>
                <Input
                  value={newConcept}
                  onChange={e => setNewConcept(e.target.value)}
                  placeholder="e.g., Photosynthesis, Newton's Laws, Supply and Demand"
                />
              </div>
              <Button onClick={() => createNoteMutation.mutate()} disabled={!newConcept}>
                Start Learning
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="p-4 bg-primary/5 border-primary/20">
        <div className="flex items-start gap-3">
          <Lightbulb className="h-5 w-5 text-primary mt-0.5" />
          <div>
            <p className="font-medium text-sm">The Feynman Technique</p>
            <p className="text-sm text-muted-foreground">
              Named after physicist Richard Feynman: If you can't explain something simply, you don't understand it well enough.
            </p>
          </div>
        </div>
      </Card>

      {isLoading ? (
        <div className="text-center py-8 text-muted-foreground">Loading notes...</div>
      ) : notes.length === 0 ? (
        <Card className="p-8 text-center">
          <Lightbulb className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">No sessions yet. Start learning a new concept!</p>
        </Card>
      ) : (
        <div className="grid gap-3">
          {notes.map(note => (
            <Card key={note.id} className="p-4 cursor-pointer hover:bg-muted/50 transition-colors" onClick={() => handleSelectNote(note)}>
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-medium">{note.concept}</h4>
                  <div className="flex gap-2 mt-2">
                    {note.simple_explanation && <span className="text-xs bg-green-500/20 text-green-500 px-2 py-0.5 rounded">Explained</span>}
                    {note.gaps_identified && <span className="text-xs bg-yellow-500/20 text-yellow-500 px-2 py-0.5 rounded">Gaps Found</span>}
                    {note.refined_explanation && <span className="text-xs bg-blue-500/20 text-blue-500 px-2 py-0.5 rounded">Refined</span>}
                  </div>
                </div>
                <Button variant="ghost" size="icon" onClick={e => { e.stopPropagation(); deleteNoteMutation.mutate(note.id); }}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}