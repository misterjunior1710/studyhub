import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Plus, Loader2, Upload, X, Eye, EyeOff, BellOff } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import RichTextEditor from "./RichTextEditor";
import { useOnboarding } from "@/contexts/OnboardingContext";

interface CreatePostDialogProps {
  onPostCreated?: () => void;
}

const CreatePostDialog = ({ onPostCreated }: CreatePostDialogProps) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [subject, setSubject] = useState("");
  const [grade, setGrade] = useState("");
  const [stream, setStream] = useState("");
  const [country, setCountry] = useState("");
  const [postType, setPostType] = useState("doubt");
  const [file, setFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [quietMode, setQuietMode] = useState(false);
  const { completeTask } = useOnboarding();

  const isAdult = grade === "Adult (18+)" || grade === "Working Professional";
  const subjects = isAdult 
    ? ["General", "Career Advice", "Finance", "Technology", "Business", "Personal Development", "Health & Wellness", "Dentistry", "Oral Health", "Dental Sciences", "Other", "Mathematics", "Physics", "Chemistry", "Biology", "Computer Science", "English", "History", "Geography"]
    : ["Mathematics", "Physics", "Chemistry", "Biology", "Computer Science", "English", "History", "Geography", "General"];
  const grades = ["Grade 6", "Grade 7", "Grade 8", "Grade 9", "Grade 10", "Grade 11", "Grade 12", "Undergraduate", "Postgraduate", "Adult (18+)", "Working Professional"];
  const streams = isAdult 
    ? ["Not Applicable", "Self-Learning", "Professional Development", "BDS", "MDS", "Dental Hygiene", "Dental Technology", "Dental Nursing", "Other"]
    : ["CBSE", "IGCSE", "IB", "AP", "A-Levels", "GCSE", "State Board", "Cambridge", "Edexcel", "German Abitur", "French Baccalauréat", "Dutch VWO", "Other"];
  const countries = ["United States", "United Kingdom", "India", "Canada", "Australia", "Germany", "France", "Spain", "Italy", "Netherlands", "Sweden", "Poland", "Switzerland", "Belgium", "Austria", "Other"];
  const postTypes = [
    { value: "doubt", label: "Ask a Question" },
    { value: "general", label: "General Post" }
  ];

  useEffect(() => {
    const loadUserProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("country, grade, stream")
          .eq("id", user.id)
          .single();
        
        if (profile) {
          setCountry(profile.country || "");
          setGrade(profile.grade || "");
          setStream(profile.stream || "");
        }
      }
    };
    
    if (open) {
      loadUserProfile();
    }
  }, [open]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      const fileType = selectedFile.type;
      const validTypes = ["application/pdf", "image/jpeg", "image/jpg"];
      
      if (!validTypes.includes(fileType)) {
        toast.error("Only PDF and JPG files are allowed");
        return;
      }

      setFile(selectedFile);
      
      if (fileType.startsWith("image/")) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setFilePreview(reader.result as string);
        };
        reader.readAsDataURL(selectedFile);
      } else {
        setFilePreview(null);
      }
    }
  };

  const removeFile = () => {
    setFile(null);
    setFilePreview(null);
  };

  // Check for links in text
  const containsLinks = (text: string): boolean => {
    const urlPattern = /(https?:\/\/[^\s]+)|(www\.[^\s]+)|([a-zA-Z0-9-]+\.(com|org|net|edu|gov|io|co|xyz|info|biz|tv|me|app|dev)[^\s]*)/gi;
    return urlPattern.test(text);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title || !content || !subject || !grade || !stream || !country) {
      toast.error("Oops — fill in all the fields before posting!");
      return;
    }

    // Quick client-side link check
    if (containsLinks(title) || containsLinks(content)) {
      toast.error("No links allowed in posts — keep it original! Remove any URLs and try again.");
      return;
    }

    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast.error("You need to be logged in to post");
        return;
      }

      // Content moderation check
      toast.info("Running a quick check on your content...");
      const moderationResponse = await supabase.functions.invoke('moderate-content', {
        body: { title, content, userId: user.id }
      });

      if (moderationResponse.error) {
        // Continue anyway if moderation fails
      } else if (moderationResponse.data) {
        if (moderationResponse.data.isBanned) {
          toast.error("Your account has been suspended — you can't create posts right now.");
          setLoading(false);
          return;
        }
        if (!moderationResponse.data.isAppropriate) {
          toast.error(moderationResponse.data.reason || "That content isn't allowed — try rephrasing it");
          setLoading(false);
          return;
        }
      }

      let fileUrl = null;

      if (file) {
        const fileExt = file.name.split(".").pop();
        const fileName = `${user.id}/${Date.now()}.${fileExt}`;
        
        const { error: uploadError } = await supabase.storage
          .from("post-files")
          .upload(fileName, file);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from("post-files")
          .getPublicUrl(fileName);

        fileUrl = publicUrl;
      }

      const { error } = await supabase.from("posts").insert({
        user_id: user.id,
        title,
        content,
        subject,
        grade,
        stream,
        country,
        post_type: postType,
        file_url: fileUrl,
        is_anonymous: isAnonymous,
        quiet_mode: quietMode,
      });

      if (error) {
        throw error;
      }

      toast.success("Post is live! 🎉");
      completeTask("post");
      setTitle("");
      setContent("");
      setSubject("");
      setFile(null);
      setFilePreview(null);
      setPostType("doubt");
      setIsAnonymous(false);
      setQuietMode(false);
      setOpen(false);
      onPostCreated?.();
    } catch (error: any) {
      toast.error(error.message || "Couldn't create your post — try again!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-gradient-to-r from-accent to-accent hover:opacity-90">
          <Plus className="h-4 w-4 mr-2" />
          Create Post
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create a Study Post</DialogTitle>
          <DialogDescription>
            Share your questions, insights, or study materials with the community
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="postType">Post Type</Label>
            <Select value={postType} onValueChange={setPostType}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {postTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              placeholder="What's your question or topic?"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="content">Content</Label>
            <RichTextEditor
              content={content}
              onChange={setContent}
              placeholder="Provide details, context, or your thoughts..."
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="file">Upload File (PDF or JPG only)</Label>
            <div className="flex items-center gap-2">
              <Input
                id="file"
                type="file"
                accept=".pdf,.jpg,.jpeg"
                onChange={handleFileChange}
                className="hidden"
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => document.getElementById("file")?.click()}
                className="w-full"
              >
                <Upload className="h-4 w-4 mr-2" />
                {file ? file.name : "Choose File"}
              </Button>
              {file && (
                <Button type="button" variant="ghost" size="icon" onClick={removeFile} aria-label="Remove uploaded file">
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
            {filePreview && (
              <img src={filePreview} alt="Preview of your uploaded image" className="mt-2 max-h-40 rounded-md" />
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="subject">Subject</Label>
              <Select value={subject} onValueChange={setSubject} required>
                <SelectTrigger>
                  <SelectValue placeholder="Select subject" />
                </SelectTrigger>
                <SelectContent>
                  {subjects.map((s) => (
                    <SelectItem key={s} value={s}>
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="grade">Grade</Label>
              <Select value={grade} onValueChange={(value) => {
                const wasAdult = grade === "Adult (18+)" || grade === "Working Professional";
                const nowAdult = value === "Adult (18+)" || value === "Working Professional";
                if (wasAdult !== nowAdult) {
                  setStream("");
                  setSubject("");
                }
                setGrade(value);
              }} required>
                <SelectTrigger>
                  <SelectValue placeholder="Select grade" />
                </SelectTrigger>
                <SelectContent>
                  {grades.map((g) => (
                    <SelectItem key={g} value={g}>
                      {g}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="stream">Stream</Label>
              <Select value={stream} onValueChange={setStream} required>
                <SelectTrigger>
                  <SelectValue placeholder="Select stream" />
                </SelectTrigger>
                <SelectContent>
                  {streams.map((s) => (
                    <SelectItem key={s} value={s}>
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="country">Country</Label>
              <Select value={country} onValueChange={setCountry} required>
                <SelectTrigger>
                  <SelectValue placeholder="Select country" />
                </SelectTrigger>
                <SelectContent>
                  {countries.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Privacy & Notification Options */}
          <div className="space-y-4 pt-2 border-t">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {isAnonymous ? <EyeOff className="h-4 w-4 text-muted-foreground" /> : <Eye className="h-4 w-4 text-muted-foreground" />}
                <div>
                  <Label htmlFor="anonymous" className="text-sm font-medium">Post Anonymously</Label>
                  <p className="text-xs text-muted-foreground">Your username won't be shown</p>
                </div>
              </div>
              <Switch
                id="anonymous"
                checked={isAnonymous}
                onCheckedChange={setIsAnonymous}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BellOff className="h-4 w-4 text-muted-foreground" />
                <div>
                  <Label htmlFor="quietMode" className="text-sm font-medium">Quiet Mode</Label>
                  <p className="text-xs text-muted-foreground">Don't notify me about replies</p>
                </div>
              </div>
              <Switch
                id="quietMode"
                checked={quietMode}
                onCheckedChange={setQuietMode}
              />
            </div>
          </div>

          <div className="flex gap-2 justify-end">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                "Create Post"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreatePostDialog;
