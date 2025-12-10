import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Plus, Play, Edit2, Trash2, RotateCcw, Check, X, Layers } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface Deck {
  id: string;
  title: string;
  description: string | null;
  is_public: boolean;
  created_at: string;
}

interface Flashcard {
  id: string;
  front: string;
  back: string;
  box_number: number;
  next_review_at: string;
}

export function FlashcardSystem() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [selectedDeck, setSelectedDeck] = useState<Deck | null>(null);
  const [reviewMode, setReviewMode] = useState(false);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [createDeckOpen, setCreateDeckOpen] = useState(false);
  const [createCardOpen, setCreateCardOpen] = useState(false);
  const [newDeck, setNewDeck] = useState({ title: "", description: "", is_public: false });
  const [newCard, setNewCard] = useState({ front: "", back: "" });

  const { data: decks = [], isLoading: decksLoading } = useQuery({
    queryKey: ["flashcard-decks", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("flashcard_decks")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as Deck[];
    },
    enabled: !!user,
  });

  const { data: cards = [], isLoading: cardsLoading } = useQuery({
    queryKey: ["flashcards", selectedDeck?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("flashcards")
        .select("*")
        .eq("deck_id", selectedDeck!.id)
        .order("next_review_at", { ascending: true });
      if (error) throw error;
      return data as Flashcard[];
    },
    enabled: !!selectedDeck,
  });

  const dueCards = cards.filter(c => new Date(c.next_review_at) <= new Date());

  const createDeckMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("flashcard_decks").insert({
        user_id: user!.id,
        title: newDeck.title,
        description: newDeck.description || null,
        is_public: newDeck.is_public,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["flashcard-decks"] });
      setCreateDeckOpen(false);
      setNewDeck({ title: "", description: "", is_public: false });
      toast.success("Deck created!");
    },
    onError: () => toast.error("Failed to create deck"),
  });

  const createCardMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("flashcards").insert({
        deck_id: selectedDeck!.id,
        user_id: user!.id,
        front: newCard.front,
        back: newCard.back,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["flashcards"] });
      setCreateCardOpen(false);
      setNewCard({ front: "", back: "" });
      toast.success("Card added!");
    },
    onError: () => toast.error("Failed to add card"),
  });

  const reviewCardMutation = useMutation({
    mutationFn: async ({ cardId, wasCorrect }: { cardId: string; wasCorrect: boolean }) => {
      const card = cards.find(c => c.id === cardId)!;
      let newBox = wasCorrect ? Math.min(card.box_number + 1, 5) : 1;
      const intervals = [1, 2, 4, 8, 16]; // days
      const nextReview = new Date();
      nextReview.setDate(nextReview.getDate() + intervals[newBox - 1]);

      await supabase.from("flashcard_reviews").insert({
        flashcard_id: cardId,
        user_id: user!.id,
        was_correct: wasCorrect,
      });

      await supabase.from("flashcards").update({
        box_number: newBox,
        next_review_at: nextReview.toISOString(),
      }).eq("id", cardId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["flashcards"] });
    },
  });

  const deleteDeckMutation = useMutation({
    mutationFn: async (deckId: string) => {
      const { error } = await supabase.from("flashcard_decks").delete().eq("id", deckId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["flashcard-decks"] });
      setSelectedDeck(null);
      toast.success("Deck deleted");
    },
  });

  const handleAnswer = (wasCorrect: boolean) => {
    const currentCard = dueCards[currentCardIndex];
    reviewCardMutation.mutate({ cardId: currentCard.id, wasCorrect });
    setIsFlipped(false);
    if (currentCardIndex < dueCards.length - 1) {
      setCurrentCardIndex(prev => prev + 1);
    } else {
      setReviewMode(false);
      setCurrentCardIndex(0);
      toast.success("Review session complete!");
    }
  };

  if (reviewMode && dueCards.length > 0) {
    const currentCard = dueCards[currentCardIndex];
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-6">
        <div className="text-sm text-muted-foreground">
          Card {currentCardIndex + 1} of {dueCards.length} • Box {currentCard.box_number}
        </div>
        <div
          className={cn(
            "w-full max-w-md h-64 cursor-pointer perspective-1000",
            "transition-transform duration-500"
          )}
          onClick={() => setIsFlipped(!isFlipped)}
        >
          <Card className={cn(
            "w-full h-full flex items-center justify-center text-center p-6",
            "transition-all duration-300",
            isFlipped ? "bg-primary/10" : "bg-card"
          )}>
            <CardContent className="p-0">
              <p className="text-lg font-medium">
                {isFlipped ? currentCard.back : currentCard.front}
              </p>
              {!isFlipped && (
                <p className="text-xs text-muted-foreground mt-4">Click to reveal answer</p>
              )}
            </CardContent>
          </Card>
        </div>
        {isFlipped && (
          <div className="flex gap-4">
            <Button variant="destructive" onClick={() => handleAnswer(false)}>
              <X className="h-4 w-4 mr-2" /> Incorrect
            </Button>
            <Button variant="default" onClick={() => handleAnswer(true)}>
              <Check className="h-4 w-4 mr-2" /> Correct
            </Button>
          </div>
        )}
        <Button variant="ghost" onClick={() => setReviewMode(false)}>
          Exit Review
        </Button>
      </div>
    );
  }

  if (selectedDeck) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <Button variant="ghost" onClick={() => setSelectedDeck(null)} className="mb-2">
              ← Back to Decks
            </Button>
            <h3 className="text-xl font-semibold">{selectedDeck.title}</h3>
            <p className="text-sm text-muted-foreground">{cards.length} cards • {dueCards.length} due for review</p>
          </div>
          <div className="flex gap-2">
            <Dialog open={createCardOpen} onOpenChange={setCreateCardOpen}>
              <DialogTrigger asChild>
                <Button size="sm"><Plus className="h-4 w-4 mr-2" /> Add Card</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add New Flashcard</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label>Front (Question)</Label>
                    <Textarea value={newCard.front} onChange={e => setNewCard(p => ({ ...p, front: e.target.value }))} placeholder="What is..." />
                  </div>
                  <div>
                    <Label>Back (Answer)</Label>
                    <Textarea value={newCard.back} onChange={e => setNewCard(p => ({ ...p, back: e.target.value }))} placeholder="The answer is..." />
                  </div>
                  <Button onClick={() => createCardMutation.mutate()} disabled={!newCard.front || !newCard.back}>
                    Add Card
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
            {dueCards.length > 0 && (
              <Button onClick={() => setReviewMode(true)}>
                <Play className="h-4 w-4 mr-2" /> Review ({dueCards.length})
              </Button>
            )}
          </div>
        </div>

        {cardsLoading ? (
          <div className="text-center py-8 text-muted-foreground">Loading cards...</div>
        ) : cards.length === 0 ? (
          <Card className="p-8 text-center">
            <Layers className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No cards yet. Add your first flashcard!</p>
          </Card>
        ) : (
          <div className="grid gap-3">
            {cards.map(card => (
              <Card key={card.id} className="p-4">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <p className="font-medium">{card.front}</p>
                    <p className="text-sm text-muted-foreground mt-1">{card.back}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={cn(
                      "text-xs px-2 py-1 rounded",
                      card.box_number === 1 && "bg-red-500/20 text-red-500",
                      card.box_number === 2 && "bg-orange-500/20 text-orange-500",
                      card.box_number === 3 && "bg-yellow-500/20 text-yellow-500",
                      card.box_number === 4 && "bg-blue-500/20 text-blue-500",
                      card.box_number === 5 && "bg-green-500/20 text-green-500",
                    )}>
                      Box {card.box_number}
                    </span>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Flashcard Decks</h3>
          <p className="text-sm text-muted-foreground">Create and review flashcards with spaced repetition</p>
        </div>
        <Dialog open={createDeckOpen} onOpenChange={setCreateDeckOpen}>
          <DialogTrigger asChild>
            <Button><Plus className="h-4 w-4 mr-2" /> New Deck</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Deck</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Title</Label>
                <Input value={newDeck.title} onChange={e => setNewDeck(p => ({ ...p, title: e.target.value }))} placeholder="Biology Chapter 1" />
              </div>
              <div>
                <Label>Description (optional)</Label>
                <Textarea value={newDeck.description} onChange={e => setNewDeck(p => ({ ...p, description: e.target.value }))} placeholder="Cell structure and function" />
              </div>
              <div className="flex items-center gap-2">
                <Switch checked={newDeck.is_public} onCheckedChange={v => setNewDeck(p => ({ ...p, is_public: v }))} />
                <Label>Make deck public</Label>
              </div>
              <Button onClick={() => createDeckMutation.mutate()} disabled={!newDeck.title}>
                Create Deck
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {decksLoading ? (
        <div className="text-center py-8 text-muted-foreground">Loading decks...</div>
      ) : decks.length === 0 ? (
        <Card className="p-8 text-center">
          <Layers className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">No decks yet. Create your first flashcard deck!</p>
        </Card>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {decks.map(deck => (
            <Card key={deck.id} className="p-4 cursor-pointer hover:bg-muted/50 transition-colors" onClick={() => setSelectedDeck(deck)}>
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-medium">{deck.title}</h4>
                  {deck.description && <p className="text-sm text-muted-foreground">{deck.description}</p>}
                  <p className="text-xs text-muted-foreground mt-2">
                    {deck.is_public ? "Public" : "Private"}
                  </p>
                </div>
                <Button variant="ghost" size="icon" onClick={e => { e.stopPropagation(); deleteDeckMutation.mutate(deck.id); }}>
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