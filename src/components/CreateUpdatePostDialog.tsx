import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Plus, Loader2, CalendarIcon } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import RichTextEditor from "./RichTextEditor";

interface CreateUpdatePostDialogProps {
  onPostCreated?: () => void;
}

const CreateUpdatePostDialog = ({ onPostCreated }: CreateUpdatePostDialogProps) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [updateCategory, setUpdateCategory] = useState("feature");
  const [customDate, setCustomDate] = useState<Date | undefined>(undefined);

  const updateCategories = [
    { value: "feature", label: "🚀 New Feature" },
    { value: "improvement", label: "⚡ Improvement" },
    { value: "bugfix", label: "🐛 Bug Fix" },
    { value: "announcement", label: "📢 Announcement" },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title || !content) {
      toast.error("Please fill in all fields");
      return;
    }

    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast.error("You must be logged in to create an update");
        return;
      }

      // Verify admin access
      if (user.email !== "misterjunior1710@gmail.com") {
        toast.error("Only admins can post updates");
        return;
      }

      // Build the insert object
      const postData: {
        user_id: string;
        title: string;
        content: string;
        subject: string;
        grade: string;
        stream: string;
        country: string;
        post_type: string;
        created_at?: string;
      } = {
        user_id: user.id,
        title,
        content,
        subject: updateCategory,
        grade: "Platform",
        stream: "Update",
        country: "Global",
        post_type: "update",
      };

      // If custom date is set, use it for created_at
      if (customDate) {
        postData.created_at = customDate.toISOString();
      }

      const { error } = await supabase.from("posts").insert(postData);

      if (error) {
        console.error("Update creation error:", error);
        throw error;
      }

      // Send notifications to users who opted in
      await sendUpdateNotifications(title);

      toast.success("Update posted successfully!");
      setTitle("");
      setContent("");
      setUpdateCategory("feature");
      setCustomDate(undefined);
      setOpen(false);
      onPostCreated?.();
    } catch (error: any) {
      toast.error(error.message || "Failed to create update");
    } finally {
      setLoading(false);
    }
  };

  const sendUpdateNotifications = async (updateTitle: string) => {
    try {
      // Get users who have opted in to feature update notifications
      const { data: optedInUsers, error } = await supabase
        .from("profiles")
        .select("id")
        .eq("notify_feature_updates", true);

      if (error || !optedInUsers) return;

      // Create notifications for opted-in users
      const notifications = optedInUsers.map((profile) => ({
        user_id: profile.id,
        type: "feature_update",
        content: `New update: ${updateTitle}`,
        is_read: false,
      }));

      if (notifications.length > 0) {
        await supabase.from("notifications").insert(notifications);
      }
    } catch (error) {
      console.error("Failed to send update notifications:", error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-gradient-to-r from-accent to-accent hover:opacity-90">
          <Plus className="h-4 w-4 mr-2" />
          Post Update
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Post Platform Update</DialogTitle>
          <DialogDescription>
            Share feature announcements, improvements, or bug fixes with the community
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="updateCategory">Update Type</Label>
              <Select value={updateCategory} onValueChange={setUpdateCategory}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {updateCategories.map((cat) => (
                    <SelectItem key={cat.value} value={cat.value}>
                      {cat.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Post Date (optional)</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !customDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {customDate ? format(customDate, "PPP") : "Use current date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={customDate}
                    onSelect={setCustomDate}
                    disabled={(date) => date > new Date()}
                    initialFocus
                    className={cn("p-3 pointer-events-auto")}
                  />
                  {customDate && (
                    <div className="p-2 border-t">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="w-full"
                        onClick={() => setCustomDate(undefined)}
                      >
                        Clear date
                      </Button>
                    </div>
                  )}
                </PopoverContent>
              </Popover>
              <p className="text-xs text-muted-foreground">
                Set a past date to backdate this post
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              placeholder="What's new?"
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
              placeholder="Describe the update, new feature, or fix..."
            />
          </div>

          <div className="flex gap-2 justify-end">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Posting...
                </>
              ) : (
                "Post Update"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateUpdatePostDialog;
