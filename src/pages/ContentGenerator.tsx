import { useState, useEffect, memo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import Navbar from "@/components/Navbar";
import SEOHead from "@/components/SEOHead";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { 
  Loader2, Sparkles, BookOpen, Lightbulb, FileText, HelpCircle, ExternalLink, 
  Save, Plus, Trash2, Download, History, Layers, ChevronRight, Clock, Database,
  GraduationCap, Globe, CheckCircle2
} from "lucide-react";
import { contentGeneratorApi, GeneratedContent } from "@/lib/api/contentGenerator";
import { getGradesForSelection, getStreamsForGrade, getSubjectsForGrade, COUNTRIES } from "@/lib/constants";
import { getCurriculumTemplates, getAvailableCurriculums, CurriculumSubject } from "@/lib/curriculumTemplates";
import { exportContentToPDF } from "@/lib/pdfExport";
import { TRUSTED_SOURCES, getTotalSourceCount } from "@/lib/trustedSources";
import { supabase } from "@/integrations/supabase/client";
import RichTextEditor from "@/components/RichTextEditor";
import { toast as sonnerToast } from "sonner";

interface SavedContent {
  id: string;
  topic: string;
  subject: string;
  grade: string;
  stream: string;
  explanation: string;
  key_concepts: any[];
  revision_notes: string;
  examples: any[];
  practice_questions: any[];
  sources: string[];
  created_at: string;
}

const ContentGenerator = memo(() => {
  const navigate = useNavigate();
  const { user, profileData } = useAuth();
  const { toast } = useToast();

  // Form state
  const [topic, setTopic] = useState("");
  const [subject, setSubject] = useState("");
  const [grade, setGrade] = useState(profileData.grade || "");
  const [stream, setStream] = useState(profileData.stream || "");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedContent, setGeneratedContent] = useState<GeneratedContent | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // History state
  const [savedContents, setSavedContents] = useState<SavedContent[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [activeTab, setActiveTab] = useState("generate");

  // Template state
  const [showTemplates, setShowTemplates] = useState(false);
  const [selectedCurriculum, setSelectedCurriculum] = useState<string>("");
  const [curriculumSubjects, setCurriculumSubjects] = useState<CurriculumSubject[]>([]);

  // Create post dialog state
  const [showCreatePostDialog, setShowCreatePostDialog] = useState(false);
  const [postTitle, setPostTitle] = useState("");
  const [postContent, setPostContent] = useState("");
  const [postCountry, setPostCountry] = useState(profileData.country || "");
  const [isCreatingPost, setIsCreatingPost] = useState(false);

  const grades = getGradesForSelection();
  const streams = getStreamsForGrade(grade);
  const subjects = getSubjectsForGrade(grade);
  const availableCurriculums = getAvailableCurriculums();

  // Load curriculum templates when curriculum/grade changes
  useEffect(() => {
    if (selectedCurriculum && grade) {
      const templates = getCurriculumTemplates(selectedCurriculum, grade);
      setCurriculumSubjects(templates);
    } else {
      setCurriculumSubjects([]);
    }
  }, [selectedCurriculum, grade]);

  // Load history when user changes or tab changes
  const loadHistory = useCallback(async () => {
    if (!user) return;
    
    setIsLoadingHistory(true);
    try {
      const contents = await contentGeneratorApi.getUserContent(user.id);
      setSavedContents(contents as unknown as SavedContent[]);
    } catch (error) {
      console.error("Failed to load history:", error);
    } finally {
      setIsLoadingHistory(false);
    }
  }, [user]);

  useEffect(() => {
    if (activeTab === "history" && user) {
      loadHistory();
    }
  }, [activeTab, user, loadHistory]);

  const handleGenerate = async () => {
    if (!user) {
      toast({
        title: "Sign in required",
        description: "Please sign in to generate study content.",
        variant: "destructive",
      });
      navigate("/auth");
      return;
    }

    if (!topic.trim()) {
      toast({
        title: "Topic required",
        description: "Please enter a topic to generate content for.",
        variant: "destructive",
      });
      return;
    }

    if (!subject || !grade || !stream) {
      toast({
        title: "Missing information",
        description: "Please select subject, grade, and curriculum.",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    setGeneratedContent(null);

    try {
      const response = await contentGeneratorApi.generate(topic, subject, grade, stream);

      if (!response.success || !response.data) {
        throw new Error(response.error || "Failed to generate content");
      }

      setGeneratedContent(response.data);
      toast({
        title: "Content generated!",
        description: "Your study material is ready.",
      });
    } catch (error) {
      console.error("Generation error:", error);
      toast({
        title: "Generation failed",
        description: error instanceof Error ? error.message : "Failed to generate content. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSave = async () => {
    if (!user || !generatedContent) return;

    setIsSaving(true);
    try {
      const result = await contentGeneratorApi.saveContent(user.id, generatedContent);
      if (result.success) {
        toast({
          title: "Content saved!",
          description: "Your study material has been saved to your History tab.",
        });
        loadHistory();
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      toast({
        title: "Save failed",
        description: error instanceof Error ? error.message : "Failed to save content.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleExportPDF = () => {
    if (!generatedContent) return;
    
    try {
      exportContentToPDF(generatedContent);
      toast({
        title: "PDF Downloaded",
        description: "Your study guide has been saved as a PDF.",
      });
    } catch (error) {
      toast({
        title: "Export failed",
        description: "Failed to generate PDF. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleCreateFlashcards = async () => {
    if (!user || !generatedContent) return;

    try {
      const { data: deck, error: deckError } = await supabase
        .from('flashcard_decks')
        .insert({
          user_id: user.id,
          title: `${generatedContent.topic} - Study Cards`,
          description: `Auto-generated flashcards for ${generatedContent.topic}`,
          is_public: false,
        })
        .select('id')
        .single();

      if (deckError) throw deckError;

      const flashcardsToCreate = [
        ...generatedContent.keyConcepts.map(concept => ({
          deck_id: deck.id,
          user_id: user.id,
          front: concept.term,
          back: `${concept.definition}\n\nImportance: ${concept.importance}`,
        })),
        ...generatedContent.practiceQuestions.map(q => ({
          deck_id: deck.id,
          user_id: user.id,
          front: q.question,
          back: q.answer,
        })),
      ];

      const { error: cardsError } = await supabase
        .from('flashcards')
        .insert(flashcardsToCreate);

      if (cardsError) throw cardsError;

      toast({
        title: "Flashcards created!",
        description: `${flashcardsToCreate.length} flashcards have been added to your study deck.`,
      });

      navigate("/study");
    } catch (error) {
      console.error("Flashcard creation error:", error);
      toast({
        title: "Failed to create flashcards",
        description: error instanceof Error ? error.message : "Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteSaved = async (contentId: string) => {
    try {
      const result = await contentGeneratorApi.deleteContent(contentId);
      if (result.success) {
        setSavedContents(prev => prev.filter(c => c.id !== contentId));
        toast({ title: "Content deleted" });
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      toast({
        title: "Delete failed",
        description: error instanceof Error ? error.message : "Failed to delete.",
        variant: "destructive",
      });
    }
  };

  const handleLoadSaved = (saved: SavedContent) => {
    const content: GeneratedContent = {
      topic: saved.topic,
      subject: saved.subject,
      grade: saved.grade,
      stream: saved.stream,
      explanation: saved.explanation,
      keyConcepts: saved.key_concepts || [],
      revisionNotes: saved.revision_notes ? saved.revision_notes.split('\n') : [],
      examples: saved.examples || [],
      practiceQuestions: saved.practice_questions || [],
      sources: saved.sources || [],
    };
    setGeneratedContent(content);
    setActiveTab("generate");
  };

  const handleSelectTemplate = (topicName: string, subjectName: string) => {
    setTopic(topicName);
    setSubject(subjectName);
    setShowTemplates(false);
    toast({
      title: "Template selected",
      description: `Topic: ${topicName}`,
    });
  };

  const openCreatePostDialog = () => {
    if (!generatedContent) return;
    
    const formattedContent = `## ${generatedContent.topic}

${generatedContent.explanation}

### Key Concepts
${generatedContent.keyConcepts.map(c => `- **${c.term}**: ${c.definition}`).join('\n')}

### Revision Notes
${generatedContent.revisionNotes.map(n => `• ${n}`).join('\n')}

### Worked Examples
${generatedContent.examples.map((e, i) => `**Example ${i+1}:** ${e.problem}\n*Solution:* ${e.solution}`).join('\n\n')}
    `.trim();

    setPostTitle(`Study Guide: ${generatedContent.topic}`);
    setPostContent(formattedContent);
    setShowCreatePostDialog(true);
  };

  const handlePublishPost = async () => {
    if (!user || !generatedContent) return;

    if (!postTitle.trim() || !postContent.trim() || !postCountry) {
      toast({
        title: "Missing fields",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    setIsCreatingPost(true);
    try {
      sonnerToast.info("Checking content...");
      const moderationResponse = await supabase.functions.invoke('moderate-content', {
        body: { title: postTitle, content: postContent, userId: user.id }
      });

      if (moderationResponse.data && !moderationResponse.data.isAppropriate) {
        toast({
          title: "Content not allowed",
          description: moderationResponse.data.reason || "Please revise your content.",
          variant: "destructive",
        });
        setIsCreatingPost(false);
        return;
      }

      const { error } = await supabase.from("posts").insert({
        user_id: user.id,
        title: postTitle,
        content: postContent,
        subject: generatedContent.subject,
        grade: generatedContent.grade,
        stream: generatedContent.stream,
        country: postCountry,
        post_type: "general",
      });

      if (error) throw error;

      toast({
        title: "Post published!",
        description: "Your study guide has been shared with the community.",
      });
      setShowCreatePostDialog(false);
    } catch (error) {
      console.error("Post creation error:", error);
      toast({
        title: "Failed to publish",
        description: error instanceof Error ? error.message : "Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsCreatingPost(false);
    }
  };

  return (
    <>
      <SEOHead
        title="AI Content Generator"
        description="Generate structured, syllabus-aligned study materials using AI. Get topic explanations, concept breakdowns, and revision notes."
      />
      <Navbar />
      
      <main className="container mx-auto px-4 py-6 max-w-6xl">
        <div className="mb-6">
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Sparkles className="h-8 w-8 text-primary" />
            AI Content Generator
          </h1>
          <p className="text-muted-foreground mt-2">
            Generate structured study materials from {getTotalSourceCount()}+ trusted educational sources
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full max-w-lg grid-cols-3 h-auto p-1">
            <TabsTrigger value="generate" className="flex items-center gap-1.5 py-2.5 px-2 text-xs sm:text-sm sm:gap-2 sm:px-3">
              <Sparkles className="h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0" />
              <span>Generate</span>
            </TabsTrigger>
            <TabsTrigger value="history" className="flex items-center gap-1.5 py-2.5 px-2 text-xs sm:text-sm sm:gap-2 sm:px-3">
              <History className="h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0" />
              <span>History</span>
            </TabsTrigger>
            <TabsTrigger value="sources" className="flex items-center gap-1.5 py-2.5 px-2 text-xs sm:text-sm sm:gap-2 sm:px-3">
              <Globe className="h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0" />
              <span>Sources</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="generate" className="space-y-6">
            <div className="grid gap-6 lg:grid-cols-[1fr,1.5fr]">
              {/* Input Form */}
              <div className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Generate Study Material</CardTitle>
                    <CardDescription>
                      Enter your topic or select from curriculum templates
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="topic">Topic *</Label>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setShowTemplates(!showTemplates)}
                          className="text-xs"
                        >
                          <Layers className="h-3 w-3 mr-1" />
                          {showTemplates ? "Hide Templates" : "Browse Templates"}
                        </Button>
                      </div>
                      <Input
                        id="topic"
                        placeholder="e.g., Photosynthesis, Quadratic Equations"
                        value={topic}
                        onChange={(e) => setTopic(e.target.value)}
                        disabled={isGenerating}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="subject">Subject *</Label>
                      <Select value={subject} onValueChange={setSubject} disabled={isGenerating}>
                        <SelectTrigger id="subject">
                          <SelectValue placeholder="Select subject" />
                        </SelectTrigger>
                        <SelectContent>
                          {subjects.map((s) => (
                            <SelectItem key={s} value={s}>{s}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="grade">Grade *</Label>
                      <Select value={grade} onValueChange={(v) => { setGrade(v); setStream(""); }} disabled={isGenerating}>
                        <SelectTrigger id="grade">
                          <SelectValue placeholder="Select grade" />
                        </SelectTrigger>
                        <SelectContent>
                          {grades.map((g) => (
                            <SelectItem key={g} value={g}>{g}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="stream">Curriculum *</Label>
                      <Select value={stream} onValueChange={setStream} disabled={isGenerating || !grade}>
                        <SelectTrigger id="stream">
                          <SelectValue placeholder="Select curriculum" />
                        </SelectTrigger>
                        <SelectContent>
                          {streams.map((s) => (
                            <SelectItem key={s} value={s}>{s}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <Button 
                      onClick={handleGenerate} 
                      disabled={isGenerating || !topic.trim()} 
                      className="w-full"
                      size="lg"
                    >
                      {isGenerating ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Generating...
                        </>
                      ) : (
                        <>
                          <Sparkles className="mr-2 h-4 w-4" />
                          Generate Content
                        </>
                      )}
                    </Button>

                    <p className="text-xs text-muted-foreground text-center">
                      Powered by {getTotalSourceCount()}+ trusted educational sources
                    </p>
                  </CardContent>
                </Card>

                {/* Curriculum Templates */}
                {showTemplates && (
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base">Curriculum Templates</CardTitle>
                      <CardDescription className="text-xs">
                        Select a curriculum to browse chapter-wise topics
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <Select value={selectedCurriculum} onValueChange={setSelectedCurriculum}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select curriculum" />
                        </SelectTrigger>
                        <SelectContent>
                          {availableCurriculums.map((c) => (
                            <SelectItem key={c} value={c}>{c}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>

                      {curriculumSubjects.length > 0 && (
                        <ScrollArea className="h-64">
                          <Accordion type="single" collapsible className="space-y-2">
                            {curriculumSubjects.map((subj) => (
                              <AccordionItem key={subj.subject} value={subj.subject} className="border rounded-lg px-3">
                                <AccordionTrigger className="text-sm py-2 hover:no-underline">
                                  {subj.subject}
                                </AccordionTrigger>
                                <AccordionContent>
                                  <div className="space-y-2">
                                    {subj.chapters.map((chapter) => (
                                      <div key={chapter.chapter} className="space-y-1">
                                        <p className="text-xs font-medium text-muted-foreground">{chapter.chapter}</p>
                                        <div className="flex flex-wrap gap-1">
                                          {chapter.topics.map((t) => (
                                            <Badge
                                              key={t}
                                              variant="outline"
                                              className="text-xs cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors"
                                              onClick={() => handleSelectTemplate(t, subj.subject)}
                                            >
                                              {t}
                                              <ChevronRight className="h-3 w-3 ml-1" />
                                            </Badge>
                                          ))}
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </AccordionContent>
                              </AccordionItem>
                            ))}
                          </Accordion>
                        </ScrollArea>
                      )}

                      {selectedCurriculum && curriculumSubjects.length === 0 && (
                        <p className="text-xs text-muted-foreground text-center py-4">
                          No templates available for {selectedCurriculum} - {grade}
                        </p>
                      )}
                    </CardContent>
                  </Card>
                )}

                {/* Info Card */}
                <Card className="bg-muted/50">
                  <CardContent className="pt-4">
                    <div className="flex items-start gap-3">
                      <Database className="h-5 w-5 text-primary mt-0.5" />
                      <div>
                        <p className="text-sm font-medium">Where does saved content go?</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Saved study materials are stored in the <strong>History</strong> tab. 
                          You can view, reload, or delete them anytime.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Generated Content Preview */}
              <div className="space-y-4">
                {isGenerating && (
                  <Card className="border-primary/50">
                    <CardContent className="py-12 text-center">
                      <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
                      <p className="text-lg font-medium">Generating your study material...</p>
                      <p className="text-sm text-muted-foreground mt-2">
                        Searching educational sources and creating structured content
                      </p>
                    </CardContent>
                  </Card>
                )}

                {!isGenerating && !generatedContent && (
                  <Card className="border-dashed">
                    <CardContent className="py-12 text-center">
                      <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-lg font-medium text-muted-foreground">
                        No content generated yet
                      </p>
                      <p className="text-sm text-muted-foreground mt-2">
                        Enter a topic and click "Generate Content" to get started
                      </p>
                    </CardContent>
                  </Card>
                )}

                {generatedContent && (
                  <div className="space-y-4">
                    {/* Action Buttons */}
                    <div className="flex gap-2 flex-wrap">
                      <Button onClick={handleSave} disabled={isSaving} variant="outline" size="sm">
                        {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                        Save
                      </Button>
                      <Button onClick={handleExportPDF} variant="outline" size="sm">
                        <Download className="mr-2 h-4 w-4" />
                        Download PDF
                      </Button>
                      <Button onClick={handleCreateFlashcards} variant="outline" size="sm">
                        <Layers className="mr-2 h-4 w-4" />
                        Create Flashcards
                      </Button>
                      <Button onClick={openCreatePostDialog} variant="outline" size="sm">
                        <Plus className="mr-2 h-4 w-4" />
                        Create Post
                      </Button>
                      <Button onClick={() => setGeneratedContent(null)} variant="ghost" size="icon" className="ml-auto">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>

                    {/* Topic Header */}
                    <Card>
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <div>
                            <CardTitle className="text-xl">{generatedContent.topic}</CardTitle>
                            <div className="flex gap-2 mt-2 flex-wrap">
                              <Badge variant="secondary">{generatedContent.subject}</Badge>
                              <Badge variant="outline">{generatedContent.grade}</Badge>
                              <Badge variant="outline">{generatedContent.stream}</Badge>
                            </div>
                          </div>
                        </div>
                      </CardHeader>
                    </Card>

                    {/* Content Accordion */}
                    <Accordion type="multiple" defaultValue={["explanation", "concepts"]} className="space-y-2">
                      <AccordionItem value="explanation" className="border rounded-lg px-4">
                        <AccordionTrigger className="hover:no-underline">
                          <span className="flex items-center gap-2">
                            <BookOpen className="h-4 w-4 text-primary" />
                            Explanation
                          </span>
                        </AccordionTrigger>
                        <AccordionContent>
                          <p className="text-sm leading-relaxed whitespace-pre-wrap">
                            {generatedContent.explanation}
                          </p>
                        </AccordionContent>
                      </AccordionItem>

                      <AccordionItem value="concepts" className="border rounded-lg px-4">
                        <AccordionTrigger className="hover:no-underline">
                          <span className="flex items-center gap-2">
                            <Lightbulb className="h-4 w-4 text-yellow-500" />
                            Key Concepts ({generatedContent.keyConcepts.length})
                          </span>
                        </AccordionTrigger>
                        <AccordionContent>
                          <div className="space-y-4">
                            {generatedContent.keyConcepts.map((concept, i) => (
                              <div key={i} className="border-l-2 border-primary pl-4">
                                <h4 className="font-semibold">{concept.term}</h4>
                                <p className="text-sm text-muted-foreground">{concept.definition}</p>
                                <p className="text-xs text-primary mt-1">Why it matters: {concept.importance}</p>
                              </div>
                            ))}
                          </div>
                        </AccordionContent>
                      </AccordionItem>

                      <AccordionItem value="revision" className="border rounded-lg px-4">
                        <AccordionTrigger className="hover:no-underline">
                          <span className="flex items-center gap-2">
                            <FileText className="h-4 w-4 text-green-500" />
                            Revision Notes ({generatedContent.revisionNotes.length})
                          </span>
                        </AccordionTrigger>
                        <AccordionContent>
                          <ul className="space-y-2">
                            {generatedContent.revisionNotes.map((note, i) => (
                              <li key={i} className="flex items-start gap-2 text-sm">
                                <span className="text-primary">•</span>
                                {note}
                              </li>
                            ))}
                          </ul>
                        </AccordionContent>
                      </AccordionItem>

                      <AccordionItem value="examples" className="border rounded-lg px-4">
                        <AccordionTrigger className="hover:no-underline">
                          <span className="flex items-center gap-2">
                            <BookOpen className="h-4 w-4 text-blue-500" />
                            Worked Examples ({generatedContent.examples.length})
                          </span>
                        </AccordionTrigger>
                        <AccordionContent>
                          <div className="space-y-4">
                            {generatedContent.examples.map((example, i) => (
                              <div key={i} className="bg-muted/50 rounded-lg p-4">
                                <p className="font-medium text-sm mb-2">Problem {i + 1}:</p>
                                <p className="text-sm mb-3">{example.problem}</p>
                                <p className="font-medium text-sm mb-2 text-green-600 dark:text-green-400">Solution:</p>
                                <p className="text-sm whitespace-pre-wrap">{example.solution}</p>
                              </div>
                            ))}
                          </div>
                        </AccordionContent>
                      </AccordionItem>

                      <AccordionItem value="questions" className="border rounded-lg px-4">
                        <AccordionTrigger className="hover:no-underline">
                          <span className="flex items-center gap-2">
                            <HelpCircle className="h-4 w-4 text-purple-500" />
                            Practice Questions ({generatedContent.practiceQuestions.length})
                          </span>
                        </AccordionTrigger>
                        <AccordionContent>
                          <div className="space-y-4">
                            {generatedContent.practiceQuestions.map((q, i) => (
                              <div key={i} className="border rounded-lg p-4">
                                <p className="font-medium text-sm mb-2">Q{i + 1}: {q.question}</p>
                                <details className="mt-2">
                                  <summary className="text-sm text-primary cursor-pointer hover:underline">
                                    Show Answer
                                  </summary>
                                  <p className="text-sm mt-2 pl-4 border-l-2 border-green-500">
                                    {q.answer}
                                  </p>
                                </details>
                              </div>
                            ))}
                          </div>
                        </AccordionContent>
                      </AccordionItem>

                      {generatedContent.sources.length > 0 && (
                        <AccordionItem value="sources" className="border rounded-lg px-4">
                          <AccordionTrigger className="hover:no-underline">
                            <span className="flex items-center gap-2">
                              <ExternalLink className="h-4 w-4 text-muted-foreground" />
                              Sources ({generatedContent.sources.length})
                            </span>
                          </AccordionTrigger>
                          <AccordionContent>
                            <ul className="space-y-2">
                              {generatedContent.sources.map((source, i) => (
                                <li key={i}>
                                  <a 
                                    href={source} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="text-sm text-primary hover:underline flex items-center gap-1"
                                  >
                                    <ExternalLink className="h-3 w-3" />
                                    {(() => { try { return new URL(source).hostname; } catch { return source; } })()}
                                  </a>
                                </li>
                              ))}
                            </ul>
                          </AccordionContent>
                        </AccordionItem>
                      )}
                    </Accordion>
                  </div>
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="history" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <History className="h-5 w-5" />
                  Generated Content History
                </CardTitle>
                <CardDescription>
                  View and manage your previously generated study materials
                </CardDescription>
              </CardHeader>
              <CardContent>
                {!user ? (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">Sign in to view your history</p>
                    <Button onClick={() => navigate("/auth")} className="mt-4">
                      Sign In
                    </Button>
                  </div>
                ) : isLoadingHistory ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : savedContents.length === 0 ? (
                  <div className="text-center py-8">
                    <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">No saved content yet</p>
                    <p className="text-sm text-muted-foreground mt-2">
                      Generate and save content to see it here
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {savedContents.map((content) => (
                      <Card key={content.id} className="hover:bg-muted/50 transition-colors">
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1 min-w-0">
                              <h3 className="font-semibold truncate">{content.topic}</h3>
                              <div className="flex gap-2 mt-1 flex-wrap">
                                <Badge variant="secondary" className="text-xs">{content.subject}</Badge>
                                <Badge variant="outline" className="text-xs">{content.grade}</Badge>
                                <Badge variant="outline" className="text-xs">{content.stream}</Badge>
                              </div>
                              <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {new Date(content.created_at).toLocaleDateString()}
                              </p>
                            </div>
                            <div className="flex gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleLoadSaved(content)}
                              >
                                View
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleDeleteSaved(content.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="sources" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="h-5 w-5" />
                  {getTotalSourceCount()}+ Trusted Educational Sources
                </CardTitle>
                <CardDescription>
                  Our AI references content from these verified educational platforms and institutions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Accordion type="multiple" className="space-y-2">
                  {TRUSTED_SOURCES.map((category) => (
                    <AccordionItem key={category.category} value={category.category} className="border rounded-lg px-4">
                      <AccordionTrigger className="hover:no-underline">
                        <div className="flex items-center gap-2">
                          <GraduationCap className="h-4 w-4 text-primary" />
                          <span>{category.category}</span>
                          <Badge variant="secondary" className="ml-2">{category.sources.length}</Badge>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent>
                        <p className="text-sm text-muted-foreground mb-4">{category.description}</p>
                        <div className="grid gap-2 sm:grid-cols-2">
                          {category.sources.map((source) => (
                            <div key={source.name} className="flex items-start gap-2 p-2 rounded-lg hover:bg-muted/50">
                              <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                              <div className="min-w-0">
                                {source.url ? (
                                  <a 
                                    href={source.url} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="text-sm font-medium text-primary hover:underline"
                                  >
                                    {source.name}
                                  </a>
                                ) : (
                                  <p className="text-sm font-medium">{source.name}</p>
                                )}
                                <p className="text-xs text-muted-foreground">{source.description}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      {/* Create Post Dialog */}
      <Dialog open={showCreatePostDialog} onOpenChange={setShowCreatePostDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create Post from Study Material</DialogTitle>
            <DialogDescription>
              Review and edit your post before publishing to the community
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="post-title">Title</Label>
              <Input
                id="post-title"
                value={postTitle}
                onChange={(e) => setPostTitle(e.target.value)}
                placeholder="Enter post title"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="post-content">Content</Label>
              <RichTextEditor
                content={postContent}
                onChange={setPostContent}
                placeholder="Edit your post content..."
              />
            </div>

            {generatedContent && (
              <div className="flex gap-2 flex-wrap">
                <Badge variant="secondary">{generatedContent.subject}</Badge>
                <Badge variant="outline">{generatedContent.grade}</Badge>
                <Badge variant="outline">{generatedContent.stream}</Badge>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="post-country">Country *</Label>
              <Select value={postCountry} onValueChange={setPostCountry}>
                <SelectTrigger id="post-country">
                  <SelectValue placeholder="Select country" />
                </SelectTrigger>
                <SelectContent>
                  {COUNTRIES.map((c) => (
                    <SelectItem key={c} value={c}>{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setShowCreatePostDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handlePublishPost} disabled={isCreatingPost}>
                {isCreatingPost ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Publishing...
                  </>
                ) : (
                  <>
                    <Plus className="mr-2 h-4 w-4" />
                    Publish Post
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
});

ContentGenerator.displayName = "ContentGenerator";

export default ContentGenerator;
