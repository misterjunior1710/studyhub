import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Switch } from "@/components/ui/switch";
import { Plus, Play, Trash2, CheckCircle, XCircle, ClipboardList, Trophy } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface Quiz {
  id: string;
  title: string;
  description: string | null;
  subject: string | null;
  is_public: boolean;
}

interface Question {
  id: string;
  question_type: string;
  question: string;
  options: string[] | null;
  correct_answer: string;
  explanation: string | null;
  order_index: number;
}

export function QuizSystem() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [selectedQuiz, setSelectedQuiz] = useState<Quiz | null>(null);
  const [playMode, setPlayMode] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string>("");
  const [showResult, setShowResult] = useState(false);
  const [answers, setAnswers] = useState<{ questionId: string; answer: string; correct: boolean }[]>([]);
  const [quizComplete, setQuizComplete] = useState(false);
  const [createQuizOpen, setCreateQuizOpen] = useState(false);
  const [addQuestionOpen, setAddQuestionOpen] = useState(false);
  const [newQuiz, setNewQuiz] = useState({ title: "", description: "", subject: "", is_public: false });
  const [newQuestion, setNewQuestion] = useState({
    question: "",
    question_type: "multiple_choice",
    options: ["", "", "", ""],
    correct_answer: "",
    explanation: "",
  });

  const { data: quizzes = [], isLoading: quizzesLoading } = useQuery({
    queryKey: ["quizzes", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("quizzes")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as Quiz[];
    },
    enabled: !!user,
  });

  const { data: questions = [] } = useQuery({
    queryKey: ["quiz-questions", selectedQuiz?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("quiz_questions")
        .select("*")
        .eq("quiz_id", selectedQuiz!.id)
        .order("order_index", { ascending: true });
      if (error) throw error;
      return data as Question[];
    },
    enabled: !!selectedQuiz,
  });

  const createQuizMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("quizzes").insert({
        user_id: user!.id,
        title: newQuiz.title,
        description: newQuiz.description || null,
        subject: newQuiz.subject || null,
        is_public: newQuiz.is_public,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["quizzes"] });
      setCreateQuizOpen(false);
      setNewQuiz({ title: "", description: "", subject: "", is_public: false });
      toast.success("Quiz created!");
    },
  });

  const addQuestionMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("quiz_questions").insert({
        quiz_id: selectedQuiz!.id,
        question_type: newQuestion.question_type,
        question: newQuestion.question,
        options: newQuestion.question_type === "multiple_choice" ? newQuestion.options.filter(o => o) : null,
        correct_answer: newQuestion.correct_answer,
        explanation: newQuestion.explanation || null,
        order_index: questions.length,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["quiz-questions"] });
      setAddQuestionOpen(false);
      setNewQuestion({ question: "", question_type: "multiple_choice", options: ["", "", "", ""], correct_answer: "", explanation: "" });
      toast.success("Question added!");
    },
  });

  const saveAttemptMutation = useMutation({
    mutationFn: async () => {
      const score = answers.filter(a => a.correct).length;
      const { error } = await supabase.from("quiz_attempts").insert({
        quiz_id: selectedQuiz!.id,
        user_id: user!.id,
        score,
        total_questions: questions.length,
        answers,
      });
      if (error) throw error;
    },
  });

  const deleteQuizMutation = useMutation({
    mutationFn: async (quizId: string) => {
      const { error } = await supabase.from("quizzes").delete().eq("id", quizId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["quizzes"] });
      setSelectedQuiz(null);
      toast.success("Quiz deleted");
    },
  });

  const handleSubmitAnswer = () => {
    const currentQuestion = questions[currentQuestionIndex];
    const isCorrect = selectedAnswer === currentQuestion.correct_answer;
    setAnswers(prev => [...prev, { questionId: currentQuestion.id, answer: selectedAnswer, correct: isCorrect }]);
    setShowResult(true);
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setSelectedAnswer("");
      setShowResult(false);
    } else {
      setQuizComplete(true);
      saveAttemptMutation.mutate();
    }
  };

  const resetQuiz = () => {
    setPlayMode(false);
    setCurrentQuestionIndex(0);
    setSelectedAnswer("");
    setShowResult(false);
    setAnswers([]);
    setQuizComplete(false);
  };

  if (playMode && questions.length > 0) {
    if (quizComplete) {
      const score = answers.filter(a => a.correct).length;
      const percentage = Math.round((score / questions.length) * 100);
      return (
        <div className="flex flex-col items-center justify-center min-h-[400px] gap-6">
          <Trophy className={cn("h-16 w-16", percentage >= 70 ? "text-yellow-500" : "text-muted-foreground")} />
          <h3 className="text-2xl font-bold">Quiz Complete!</h3>
          <p className="text-lg">Score: {score}/{questions.length} ({percentage}%)</p>
          <div className="flex gap-4">
            <Button variant="outline" onClick={resetQuiz}>Back to Quiz</Button>
            <Button onClick={() => { resetQuiz(); setPlayMode(true); }}>Retry</Button>
          </div>
        </div>
      );
    }

    const currentQuestion = questions[currentQuestionIndex];
    return (
      <div className="space-y-6 max-w-2xl mx-auto">
        <div className="flex justify-between items-center">
          <span className="text-sm text-muted-foreground">
            Question {currentQuestionIndex + 1} of {questions.length}
          </span>
          <Button variant="ghost" size="sm" onClick={resetQuiz}>Exit</Button>
        </div>

        <Card className="p-6">
          <h3 className="text-lg font-medium mb-4">{currentQuestion.question}</h3>

          {currentQuestion.question_type === "multiple_choice" && currentQuestion.options && (
            <RadioGroup value={selectedAnswer} onValueChange={setSelectedAnswer} disabled={showResult}>
              {currentQuestion.options.map((option, i) => (
                <div key={i} className={cn(
                  "flex items-center space-x-2 p-3 rounded-lg border transition-colors",
                  showResult && option === currentQuestion.correct_answer && "bg-green-500/20 border-green-500",
                  showResult && selectedAnswer === option && option !== currentQuestion.correct_answer && "bg-red-500/20 border-red-500",
                  !showResult && "hover:bg-muted/50"
                )}>
                  <RadioGroupItem value={option} id={`option-${i}`} />
                  <Label htmlFor={`option-${i}`} className="flex-1 cursor-pointer">{option}</Label>
                  {showResult && option === currentQuestion.correct_answer && <CheckCircle className="h-5 w-5 text-green-500" />}
                  {showResult && selectedAnswer === option && option !== currentQuestion.correct_answer && <XCircle className="h-5 w-5 text-red-500" />}
                </div>
              ))}
            </RadioGroup>
          )}

          {currentQuestion.question_type === "true_false" && (
            <RadioGroup value={selectedAnswer} onValueChange={setSelectedAnswer} disabled={showResult}>
              {["True", "False"].map(option => (
                <div key={option} className={cn(
                  "flex items-center space-x-2 p-3 rounded-lg border transition-colors",
                  showResult && option === currentQuestion.correct_answer && "bg-green-500/20 border-green-500",
                  showResult && selectedAnswer === option && option !== currentQuestion.correct_answer && "bg-red-500/20 border-red-500",
                  !showResult && "hover:bg-muted/50"
                )}>
                  <RadioGroupItem value={option} id={option} />
                  <Label htmlFor={option} className="flex-1 cursor-pointer">{option}</Label>
                </div>
              ))}
            </RadioGroup>
          )}

          {currentQuestion.question_type === "fill_blank" && (
            <Input
              value={selectedAnswer}
              onChange={e => setSelectedAnswer(e.target.value)}
              placeholder="Type your answer..."
              disabled={showResult}
              className={cn(
                showResult && selectedAnswer.toLowerCase() === currentQuestion.correct_answer.toLowerCase() && "border-green-500",
                showResult && selectedAnswer.toLowerCase() !== currentQuestion.correct_answer.toLowerCase() && "border-red-500"
              )}
            />
          )}

          {showResult && currentQuestion.explanation && (
            <div className="mt-4 p-3 bg-muted rounded-lg">
              <p className="text-sm"><strong>Explanation:</strong> {currentQuestion.explanation}</p>
            </div>
          )}
        </Card>

        <div className="flex justify-end">
          {!showResult ? (
            <Button onClick={handleSubmitAnswer} disabled={!selectedAnswer}>Submit Answer</Button>
          ) : (
            <Button onClick={handleNextQuestion}>
              {currentQuestionIndex < questions.length - 1 ? "Next Question" : "Finish Quiz"}
            </Button>
          )}
        </div>
      </div>
    );
  }

  if (selectedQuiz) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div>
            <Button variant="ghost" onClick={() => setSelectedQuiz(null)} className="mb-2">
              ← Back to Quizzes
            </Button>
            <h3 className="text-xl font-semibold">{selectedQuiz.title}</h3>
            <p className="text-sm text-muted-foreground">{questions.length} questions</p>
          </div>
          <div className="flex gap-2">
            <Dialog open={addQuestionOpen} onOpenChange={setAddQuestionOpen}>
              <DialogTrigger asChild>
                <Button size="sm"><Plus className="h-4 w-4 mr-2" /> Add Question</Button>
              </DialogTrigger>
              <DialogContent className="max-w-lg">
                <DialogHeader>
                  <DialogTitle>Add Question</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 max-h-[60vh] overflow-y-auto">
                  <div>
                    <Label>Question Type</Label>
                    <RadioGroup value={newQuestion.question_type} onValueChange={v => setNewQuestion(p => ({ ...p, question_type: v }))}>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="multiple_choice" id="mc" />
                        <Label htmlFor="mc">Multiple Choice</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="true_false" id="tf" />
                        <Label htmlFor="tf">True/False</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="fill_blank" id="fb" />
                        <Label htmlFor="fb">Fill in the Blank</Label>
                      </div>
                    </RadioGroup>
                  </div>
                  <div>
                    <Label>Question</Label>
                    <Textarea value={newQuestion.question} onChange={e => setNewQuestion(p => ({ ...p, question: e.target.value }))} />
                  </div>
                  {newQuestion.question_type === "multiple_choice" && (
                    <div className="space-y-2">
                      <Label>Options</Label>
                      {newQuestion.options.map((opt, i) => (
                        <Input key={i} value={opt} onChange={e => {
                          const newOpts = [...newQuestion.options];
                          newOpts[i] = e.target.value;
                          setNewQuestion(p => ({ ...p, options: newOpts }));
                        }} placeholder={`Option ${i + 1}`} />
                      ))}
                    </div>
                  )}
                  <div>
                    <Label>Correct Answer</Label>
                    {newQuestion.question_type === "true_false" ? (
                      <RadioGroup value={newQuestion.correct_answer} onValueChange={v => setNewQuestion(p => ({ ...p, correct_answer: v }))}>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="True" id="true" />
                          <Label htmlFor="true">True</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="False" id="false" />
                          <Label htmlFor="false">False</Label>
                        </div>
                      </RadioGroup>
                    ) : (
                      <Input value={newQuestion.correct_answer} onChange={e => setNewQuestion(p => ({ ...p, correct_answer: e.target.value }))} placeholder="Enter correct answer" />
                    )}
                  </div>
                  <div>
                    <Label>Explanation (optional)</Label>
                    <Textarea value={newQuestion.explanation} onChange={e => setNewQuestion(p => ({ ...p, explanation: e.target.value }))} placeholder="Why this is the correct answer..." />
                  </div>
                  <Button onClick={() => addQuestionMutation.mutate()} disabled={!newQuestion.question || !newQuestion.correct_answer}>
                    Add Question
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
            {questions.length > 0 && (
              <Button onClick={() => setPlayMode(true)}>
                <Play className="h-4 w-4 mr-2" /> Start Quiz
              </Button>
            )}
          </div>
        </div>

        {questions.length === 0 ? (
          <Card className="p-8 text-center">
            <ClipboardList className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No questions yet. Add your first question!</p>
          </Card>
        ) : (
          <div className="space-y-3">
            {questions.map((q, i) => (
              <Card key={q.id} className="p-4">
                <p className="font-medium">Q{i + 1}: {q.question}</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Type: {q.question_type.replace("_", " ")} • Answer: {q.correct_answer}
                </p>
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
          <h3 className="text-lg font-semibold">Practice Quizzes</h3>
          <p className="text-sm text-muted-foreground">Test your knowledge with self-assessment quizzes</p>
        </div>
        <Dialog open={createQuizOpen} onOpenChange={setCreateQuizOpen}>
          <DialogTrigger asChild>
            <Button><Plus className="h-4 w-4 mr-2" /> New Quiz</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Quiz</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Title</Label>
                <Input value={newQuiz.title} onChange={e => setNewQuiz(p => ({ ...p, title: e.target.value }))} placeholder="Chapter 1 Review" />
              </div>
              <div>
                <Label>Subject (optional)</Label>
                <Input value={newQuiz.subject} onChange={e => setNewQuiz(p => ({ ...p, subject: e.target.value }))} placeholder="Biology" />
              </div>
              <div>
                <Label>Description (optional)</Label>
                <Textarea value={newQuiz.description} onChange={e => setNewQuiz(p => ({ ...p, description: e.target.value }))} />
              </div>
              <div className="flex items-center gap-2">
                <Switch checked={newQuiz.is_public} onCheckedChange={v => setNewQuiz(p => ({ ...p, is_public: v }))} />
                <Label>Make quiz public</Label>
              </div>
              <Button onClick={() => createQuizMutation.mutate()} disabled={!newQuiz.title}>
                Create Quiz
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {quizzesLoading ? (
        <div className="text-center py-8 text-muted-foreground">Loading quizzes...</div>
      ) : quizzes.length === 0 ? (
        <Card className="p-8 text-center">
          <ClipboardList className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">No quizzes yet. Create your first quiz!</p>
        </Card>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {quizzes.map(quiz => (
            <Card key={quiz.id} className="p-4 cursor-pointer hover:bg-muted/50 transition-colors" onClick={() => setSelectedQuiz(quiz)}>
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-medium">{quiz.title}</h4>
                  {quiz.subject && <p className="text-sm text-primary">{quiz.subject}</p>}
                  {quiz.description && <p className="text-sm text-muted-foreground">{quiz.description}</p>}
                </div>
                <Button variant="ghost" size="icon" onClick={e => { e.stopPropagation(); deleteQuizMutation.mutate(quiz.id); }}>
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