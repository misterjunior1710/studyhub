import { useState, memo } from "react";
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
import { Loader2, Sparkles, BookOpen, Lightbulb, FileText, HelpCircle, ExternalLink, Save, Plus, Trash2 } from "lucide-react";
import { contentGeneratorApi, GeneratedContent } from "@/lib/api/contentGenerator";
import { getGradesForSelection, getStreamsForGrade, getSubjectsForGrade } from "@/lib/constants";

const ContentGenerator = memo(() => {
  const navigate = useNavigate();
  const { user, profileData } = useAuth();
  const { toast } = useToast();

  const [topic, setTopic] = useState("");
  const [subject, setSubject] = useState("");
  const [grade, setGrade] = useState(profileData.grade || "");
  const [stream, setStream] = useState(profileData.stream || "");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedContent, setGeneratedContent] = useState<GeneratedContent | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const grades = getGradesForSelection();
  const streams = getStreamsForGrade(grade);
  const subjects = getSubjectsForGrade(grade);

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
          description: "Your study material has been saved.",
        });
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

  const handleCreatePost = () => {
    if (!generatedContent) return;
    
    // Format content for post
    const postContent = `
## ${generatedContent.topic}

${generatedContent.explanation}

### Key Concepts
${generatedContent.keyConcepts.map(c => `- **${c.term}**: ${c.definition}`).join('\n')}

### Revision Notes
${generatedContent.revisionNotes.map(n => `• ${n}`).join('\n')}
    `.trim();

    // Navigate to home with pre-filled content (via state)
    navigate("/", { 
      state: { 
        createPost: true, 
        postTitle: `Study Guide: ${generatedContent.topic}`,
        postContent,
        postSubject: generatedContent.subject,
        postGrade: generatedContent.grade,
        postStream: generatedContent.stream,
      } 
    });
  };

  return (
    <>
      <SEOHead
        title="AI Content Generator"
        description="Generate structured, syllabus-aligned study materials using AI. Get topic explanations, concept breakdowns, and revision notes."
      />
      <Navbar />
      
      <main className="container mx-auto px-4 py-6 max-w-5xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Sparkles className="h-8 w-8 text-primary" />
            AI Content Generator
          </h1>
          <p className="text-muted-foreground mt-2">
            Generate structured study materials from trusted educational sources
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1fr,1.5fr]">
          {/* Input Form */}
          <Card>
            <CardHeader>
              <CardTitle>Generate Study Material</CardTitle>
              <CardDescription>
                Enter your topic and we'll create comprehensive study content
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="topic">Topic *</Label>
                <Input
                  id="topic"
                  placeholder="e.g., Photosynthesis, Quadratic Equations, World War II"
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
                Content is sourced from Khan Academy, BYJU'S, Britannica, Wikipedia, and more
              </p>
            </CardContent>
          </Card>

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
                  <Button onClick={handleSave} disabled={isSaving} variant="outline">
                    {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                    Save Content
                  </Button>
                  <Button onClick={handleCreatePost} variant="outline">
                    <Plus className="mr-2 h-4 w-4" />
                    Create as Post
                  </Button>
                  <Button onClick={() => setGeneratedContent(null)} variant="ghost" size="icon">
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
                                {new URL(source).hostname}
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
      </main>
    </>
  );
});

ContentGenerator.displayName = "ContentGenerator";

export default ContentGenerator;
