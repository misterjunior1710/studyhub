import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { MessageSquare, Send, ArrowLeft, Loader2 } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { toast } from "sonner";
import DirectMessageBubble from "./DirectMessageBubble";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Friend {
  id: string;
  username: string | null;
  avatar_url: string | null;
}

interface DirectMessageDialogProps {
  friend: Friend;
  currentUserId: string;
}

interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  is_read: boolean;
  created_at: string;
}

const DirectMessageDialog = ({ friend, currentUserId }: DirectMessageDialogProps) => {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [conversationId, setConversationId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();
  const queryClient = useQueryClient();

  // Find or create conversation
  const findOrCreateConversation = async () => {
    // Try to find existing conversation
    const { data: existing } = await supabase
      .from("conversations")
      .select("id")
      .or(
        `and(user1_id.eq.${currentUserId},user2_id.eq.${friend.id}),and(user1_id.eq.${friend.id},user2_id.eq.${currentUserId})`
      )
      .single();

    if (existing) {
      return existing.id;
    }

    // Create new conversation
    const { data: newConv, error } = await supabase
      .from("conversations")
      .insert({
        user1_id: currentUserId,
        user2_id: friend.id,
      })
      .select("id")
      .single();

    if (error) throw error;
    return newConv.id;
  };

  // Initialize conversation when dialog opens
  useEffect(() => {
    if (open) {
      findOrCreateConversation()
        .then(setConversationId)
        .catch((err) => {
          console.error("Error initializing conversation:", err);
          toast.error("Failed to start conversation");
        });
    }
  }, [open, currentUserId, friend.id]);

  // Fetch messages
  const { data: messages = [], isLoading } = useQuery({
    queryKey: ["direct-messages", conversationId],
    queryFn: async () => {
      if (!conversationId) return [];
      const { data, error } = await supabase
        .from("direct_messages")
        .select("*")
        .eq("conversation_id", conversationId)
        .order("created_at", { ascending: true });

      if (error) throw error;
      return data as Message[];
    },
    enabled: !!conversationId,
    refetchInterval: 3000, // Poll every 3s as backup
  });

  // Subscribe to realtime updates
  useEffect(() => {
    if (!conversationId) return;

    const channel = supabase
      .channel(`dm-${conversationId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "direct_messages",
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) => {
          queryClient.setQueryData(
            ["direct-messages", conversationId],
            (old: Message[] = []) => [...old, payload.new as Message]
          );
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [conversationId, queryClient]);

  // Mark messages as read
  useEffect(() => {
    if (!conversationId || !open) return;

    const markAsRead = async () => {
      await supabase
        .from("direct_messages")
        .update({ is_read: true })
        .eq("conversation_id", conversationId)
        .neq("sender_id", currentUserId)
        .eq("is_read", false);
    };

    markAsRead();
  }, [conversationId, messages, open, currentUserId]);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Send message mutation
  const sendMutation = useMutation({
    mutationFn: async (content: string) => {
      if (!conversationId) throw new Error("No conversation");
      const { error } = await supabase.from("direct_messages").insert({
        conversation_id: conversationId,
        sender_id: currentUserId,
        content,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      setMessage("");
      queryClient.invalidateQueries({ queryKey: ["direct-messages", conversationId] });
    },
    onError: () => {
      toast.error("Failed to send message");
    },
  });

  const handleSend = () => {
    const trimmed = message.trim();
    if (!trimmed) return;
    sendMutation.mutate(trimmed);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const ChatContent = () => (
    <div className="flex flex-col h-full">
      {/* Messages area */}
      <ScrollArea className="flex-1 px-4 py-3">
        {isLoading ? (
          <div className="flex items-center justify-center h-40">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-40 text-muted-foreground">
            <MessageSquare className="h-10 w-10 mb-2 opacity-50" />
            <p className="text-sm">No messages yet</p>
            <p className="text-xs">Start the conversation!</p>
          </div>
        ) : (
          <div className="space-y-1">
            {messages.map((msg) => (
              <DirectMessageBubble
                key={msg.id}
                content={msg.content}
                createdAt={msg.created_at}
                isSent={msg.sender_id === currentUserId}
                isRead={msg.is_read}
              />
            ))}
            <div ref={messagesEndRef} />
          </div>
        )}
      </ScrollArea>

      {/* Input area */}
      <div className="border-t p-3 bg-background">
        <div className="flex gap-2">
          <Input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a message..."
            className="flex-1"
            disabled={sendMutation.isPending}
          />
          <Button
            size="icon"
            onClick={handleSend}
            disabled={!message.trim() || sendMutation.isPending}
          >
            {sendMutation.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>
    </div>
  );

  const TriggerButton = (
    <Button variant="ghost" size="icon" className="h-8 w-8">
      <MessageSquare className="h-4 w-4" />
    </Button>
  );

  const HeaderContent = (
    <div className="flex items-center gap-3">
      <Avatar className="h-8 w-8">
        <AvatarImage src={friend.avatar_url || undefined} />
        <AvatarFallback className="text-xs">
          {friend.username?.charAt(0)?.toUpperCase() || "?"}
        </AvatarFallback>
      </Avatar>
      <span className="font-medium">@{friend.username || "Unknown"}</span>
    </div>
  );

  if (isMobile) {
    return (
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>{TriggerButton}</SheetTrigger>
        <SheetContent side="right" className="w-full sm:max-w-md p-0 flex flex-col">
          <SheetHeader className="border-b px-4 py-3">
            <SheetTitle className="text-left">{HeaderContent}</SheetTitle>
          </SheetHeader>
          <div className="flex-1 overflow-hidden">
            <ChatContent />
          </div>
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{TriggerButton}</DialogTrigger>
      <DialogContent className="sm:max-w-md h-[500px] flex flex-col p-0">
        <DialogHeader className="border-b px-4 py-3">
          <DialogTitle>{HeaderContent}</DialogTitle>
        </DialogHeader>
        <div className="flex-1 overflow-hidden">
          <ChatContent />
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DirectMessageDialog;
