import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import RichTextEditor from "./RichTextEditor";

interface EditPostDialogProps {
  postId: string;
  currentTitle: string;
  currentContent: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onPostUpdated?: () => void;
}

const EditPostDialog = ({ 
  postId, 
  currentTitle, 
  currentContent, 
  open, 
  onOpenChange, 
  onPostUpdated 
}: EditPostDialogProps) => {
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState(currentTitle);
  const [content, setContent] = useState(currentContent);

  // Check for links in text
  const containsLinks = (text: string): boolean => {
    const urlPattern = /(https?:\/\/[^\s]+)|(www\.[^\s]+)|([a-zA-Z0-9-]+\.(com|org|net|edu|gov|io|co|xyz|info|biz|tv|me|app|dev)[^\s]*)/gi;
    return urlPattern.test(text);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim() || !content.trim()) {
      toast.error("Title and content are required");
      return;
    }

    // Quick client-side link check
    if (containsLinks(title) || containsLinks(content)) {
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

      const { error } = await supabase
        .from("posts")
        .update({
          title: title.trim(),
          content: content.trim(),
          updated_at: new Date().toISOString(),
        })
        .eq("id", postId)
        .eq("user_id", user.id);

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
          <DialogTitle>Edit Post</DialogTitle>
          <DialogDescription>
            Make changes to your post
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
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
            <RichTextEditor
              content={content}
              onChange={setContent}
              placeholder="Provide details, context, or your thoughts..."
            />
          </div>

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
