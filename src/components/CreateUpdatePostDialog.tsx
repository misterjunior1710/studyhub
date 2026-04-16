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
  const [category, setCategory] = useState("feature");
  const [customDate, setCustomDate] = useState<Date | undefined>(undefined);

  const categories = [
    { value: "feature", label: "🚀 New Feature" },
    { value: "improvement", label: "⚡ Improvement" },
    { value: "bugfix", label: "🐛 Bug Fix" },
    { value: "announcement", label: "📢 Announcement" },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !content) { toast.error("Please fill in all fields"); return; }

    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { toast.error("You must be logged in"); return; }

      const { error } = await supabase.from("announcements").insert({
        title,
        content,
        category,
        author_id: user.id,
        ...(customDate ? { published_at: customDate.toISOString() } : {}),
      });

      if (error) throw error;

      // Notify users who opted in
      const { data: optedIn } = await supabase.from("profiles").select("id").eq("notify_feature_updates", true);
      if (optedIn && optedIn.length > 0) {
        await supabase.from("notifications").insert(
          optedIn.map((p) => ({ user_id: p.id, type: "feature_update", content: `New update: ${title}`, is_read: false }))
        );
      }

      toast.success("Announcement posted!");
      setTitle(""); setContent(""); setCategory("feature"); setCustomDate(undefined);
      setOpen(false);
      onPostCreated?.();
    } catch (error: any) {
      toast.error(error.message || "Failed to create announcement");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-gradient-to-r from-accent to-accent hover:opacity-90">
          <Plus className="h-4 w-4 mr-2" /> Post Update
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Post Platform Update</DialogTitle>
          <DialogDescription>Share feature announcements, improvements, or bug fixes</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Update Type</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {categories.map((c) => (<SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Post Date (optional)</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className={cn("w-full justify-start text-left font-normal", !customDate && "text-muted-foreground")}>
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {customDate ? format(customDate, "PPP") : "Use current date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar mode="single" selected={customDate} onSelect={setCustomDate} disabled={(date) => date > new Date()} initialFocus className="p-3 pointer-events-auto" />
                  {customDate && (
                    <div className="p-2 border-t">
                      <Button variant="ghost" size="sm" className="w-full" onClick={() => setCustomDate(undefined)}>Clear date</Button>
                    </div>
                  )}
                </PopoverContent>
              </Popover>
              <p className="text-xs text-muted-foreground">Set a past date to backdate this post</p>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input id="title" placeholder="What's new?" value={title} onChange={(e) => setTitle(e.target.value)} required />
          </div>
          <div className="space-y-2">
            <Label>Content</Label>
            <RichTextEditor content={content} onChange={setContent} placeholder="Describe the update..." />
          </div>
          <div className="flex gap-2 justify-end">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button type="submit" disabled={loading}>
              {loading ? (<><Loader2 className="mr-2 h-4 w-4 animate-spin" />Posting...</>) : "Post Update"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateUpdatePostDialog;
