import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Bell, Loader2, Send } from "lucide-react";
import { sendManualAlert } from "@/lib/emailAlerts";
import { toast } from "sonner";

const ManualAlertDialog = () => {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    if (!message.trim()) {
      toast.error("Please enter a message");
      return;
    }

    setLoading(true);
    try {
      const result = await sendManualAlert(message.trim());
      
      if (result.success) {
        toast.success("Alert sent successfully!");
        setMessage("");
        setOpen(false);
      } else {
        toast.error(result.message || "Failed to send alert");
      }
    } catch (error) {
      toast.error("Failed to send alert");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Bell className="h-4 w-4" />
          Send Manual Alert
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Send Manual Alert</DialogTitle>
          <DialogDescription>
            What message do you want to send?
          </DialogDescription>
        </DialogHeader>
        <Textarea
          placeholder="Enter your alert message..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="min-h-[120px]"
        />
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleSend} disabled={loading} className="gap-2">
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
            Send Alert
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ManualAlertDialog;
