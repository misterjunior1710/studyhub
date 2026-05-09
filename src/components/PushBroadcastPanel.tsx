import { useState } from "react";
import { Send, Loader2, Megaphone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { sendBroadcast } from "@/hooks/usePushNotifications";
import { toast } from "sonner";

const PushBroadcastPanel = () => {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [url, setUrl] = useState("/");
  const [sending, setSending] = useState(false);

  const handleSend = async () => {
    if (!title.trim()) {
      toast.error("Title is required");
      return;
    }
    if (!confirm(`Send push to ALL subscribed users?\n\n${title}\n${body}`)) return;
    setSending(true);
    try {
      const res = await sendBroadcast(title.trim(), body.trim(), url.trim() || "/");
      toast.success(`Sent to ${res.sent} of ${res.total} devices`, {
        description: res.removed ? `${res.removed} dead endpoints pruned` : undefined,
      });
      setTitle("");
      setBody("");
    } catch (e: any) {
      toast.error("Broadcast failed", { description: e?.message ?? String(e) });
    } finally {
      setSending(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Megaphone className="h-5 w-5 text-primary" aria-hidden="true" />
          Push Broadcast
        </CardTitle>
        <CardDescription>
          Send a browser push notification to every user who opted in.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="push-title">Title</Label>
          <Input
            id="push-title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            maxLength={100}
            placeholder="New feature: Mind Maps"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="push-body">Body</Label>
          <Textarea
            id="push-body"
            value={body}
            onChange={(e) => setBody(e.target.value)}
            maxLength={500}
            rows={3}
            placeholder="Try the new collaborative mind map tool now."
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="push-url">Target URL (when tapped)</Label>
          <Input
            id="push-url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="/study"
          />
        </div>
        <Button onClick={handleSend} disabled={sending || !title.trim()} className="w-full sm:w-auto">
          {sending ? (
            <Loader2 className="h-4 w-4 animate-spin mr-2" aria-hidden="true" />
          ) : (
            <Send className="h-4 w-4 mr-2" aria-hidden="true" />
          )}
          Send Broadcast
        </Button>
      </CardContent>
    </Card>
  );
};

export default PushBroadcastPanel;
