import { lazy, Suspense, useEffect, useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, AlertTriangle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { ALL_GRADES, COUNTRIES, getStreamsForGrade, getSubjectsForGrade, isAdultGrade } from "@/lib/constants";

const RichTextEditor = lazy(() => import("./RichTextEditor"));

interface EditPostDialogProps {
  postId: string;
  currentTitle: string;
  currentContent: string;
  currentSubject?: string;
  currentGrade?: string;
  currentStream?: string;
  currentCountry?: string;
  /** Moderators/admins may correct tags on posts they do not own */
  canModerate?: boolean;
  /** Author can edit the text; moderators can only correct tags */
  canEditContent?: boolean;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onPostUpdated?: () => void;
}

const EditPostDialog = ({
  postId,
  currentTitle,
  currentContent,
  currentSubject = "",
  currentGrade = "",
  currentStream = "",
  currentCountry = "",
  canModerate = false,
  canEditContent = true,
  open,
  onOpenChange,
  onPostUpdated,
}: EditPostDialogProps) => {
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState(currentTitle);
  const [content, setContent] = useState(currentContent);
  const [subject, setSubject] = useState(currentSubject);
  const [grade, setGrade] = useState(currentGrade);
  const [stream, setStream] = useState(currentStream);
  const [country, setCountry] = useState(currentCountry);
  const [isMature, setIsMature] = useState(false);

  useEffect(() => {
    if (open) {
      setTitle(currentTitle);
      setContent(currentContent);
      setSubject(currentSubject);
      setGrade(currentGrade);
      setStream(currentStream);
      setCountry(currentCountry);
      supabase
        .from("posts")
        .select("is_mature")
        .eq("id", postId)
        .maybeSingle()
        .then(({ data }) => setIsMature(Boolean((data as { is_mature?: boolean } | null)?.is_mature)));
    }
  }, [open, postId, currentTitle, currentContent, currentSubject, currentGrade, currentStream, currentCountry]);

  // Check for links in text
  const containsLinks = (text: string): boolean => {
    const urlPattern = /(https?:\/\/[^\s]+)|(www\.[^\s]+)|([a-zA-Z0-9-]+\.(com|org|net|edu|gov|io|co|xyz|info|biz|tv|me|app|dev)[^\s]*)/gi;
    return urlPattern.test(text);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (canEditContent && (!title.trim() || !content.trim())) {
      toast.error("Title and content are required");
      return;
    }

    if (canEditContent && (containsLinks(title) || containsLinks(content))) {
      toast.error("Links are not allowed in posts. Please remove any URLs.");
      return;
    }



    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        toast.error("You must be logged in to edit a post");
        return;
      }

      if (canEditContent) {
        // Content moderation check
        toast.info("Checking content...");
        const moderationResponse = await supabase.functions.invoke('moderate-content', {
          body: { title, content, userId: user.id }
        });

        if (moderationResponse.error) {
          console.error("Moderation error:", moderationResponse.error);
          // Continue anyway if moderation fails
        } else if (moderationResponse.data) {
          if (moderationResponse.data.isBanned) {
            toast.error("Your account has been suspended. You cannot edit posts.");
            setLoading(false);
            return;
          }
          if (!moderationResponse.data.isAppropriate) {
            toast.error(moderationResponse.data.reason || "Content not allowed");
            setLoading(false);
            return;
          }
        }
      }

      const updates: Record<string, string | boolean> = {
        updated_at: new Date().toISOString(),
        is_mature: isMature,
      };

      if (canEditContent) {
        updates.title = title.trim();
        updates.content = content.trim();
      }
      if (subject) updates.subject = subject;
      if (grade) updates.grade = grade;
      if (stream) updates.stream = stream;
      if (country) updates.country = country;

      let query = supabase.from("posts").update(updates).eq("id", postId);
      if (!canModerate) {
        query = query.eq("user_id", user.id);
      }

      const { error } = await query;

      if (error) {
        console.error("Post update error:", error);
        throw error;
      }

      toast.success("Post updated successfully!");
      onOpenChange(false);
      onPostUpdated?.();
    } catch (error: any) {
      toast.error(error.message || "Failed to update post");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{canEditContent ? "Edit Post" : "Fix Post Tags"}</DialogTitle>
          <DialogDescription>
            {canEditContent
              ? "Make changes to your post or correct its tags"
              : "Correct the level, curriculum, subject or country tags on this post"}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {canEditContent && (
            <>
              <div className="space-y-2">
                <Label htmlFor="edit-title">Title</Label>
                <Input
                  id="edit-title"
                  placeholder="What's your question or topic?"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-content">Content</Label>
                <Suspense fallback={<div className="min-h-[200px] rounded-md border bg-muted/20 animate-pulse" aria-label="Loading editor" />}>
                  <RichTextEditor
                    content={content}
                    onChange={setContent}
                    placeholder="Provide details, context, or your thoughts..."
                  />
                </Suspense>
              </div>
            </>
          )}

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="edit-grade">Level</Label>
              <Select
                value={grade}
                onValueChange={(value) => {
                  setGrade(value);
                  if (isAdultGrade(value) !== isAdultGrade(grade)) {
                    setStream("");
                  }
                }}
              >
                <SelectTrigger id="edit-grade"><SelectValue placeholder="Select level" /></SelectTrigger>
                <SelectContent>
                  {ALL_GRADES.map((g) => <SelectItem key={g} value={g}>{g}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-country">Country</Label>
              <Select value={country} onValueChange={setCountry}>
                <SelectTrigger id="edit-country"><SelectValue placeholder="Select country" /></SelectTrigger>
                <SelectContent>
                  {COUNTRIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-stream">Curriculum</Label>
              <Select value={stream} onValueChange={setStream}>
                <SelectTrigger id="edit-stream"><SelectValue placeholder="Select curriculum" /></SelectTrigger>
                <SelectContent>
                  {getStreamsForGrade(grade).map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-subject">Subject</Label>
              <Select value={subject} onValueChange={setSubject}>
                <SelectTrigger id="edit-subject"><SelectValue placeholder="Select subject" /></SelectTrigger>
                <SelectContent>
                  {getSubjectsForGrade(grade).map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>

          <label className="flex items-start gap-3 rounded-md border border-warning/40 bg-warning/10 p-3 text-sm">
            <input
              type="checkbox"
              className="mt-1"
              checked={isMature}
              onChange={(e) => setIsMature(e.target.checked)}
            />
            <span className="flex-1">
              <span className="flex items-center gap-2 font-medium">
                <AlertTriangle className="h-4 w-4" aria-hidden="true" />
                This post contains mature (18+) content
              </span>
              <span className="text-muted-foreground">
                Only tick this if the post itself isn't suitable for students — it will be hidden from them. The level tag above doesn't hide anything.
              </span>
            </span>
          </label>


          <div className="flex gap-2 justify-end">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditPostDialog;
