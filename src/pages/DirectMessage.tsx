import { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  ArrowLeft, Loader2, Paperclip, Mic, Square, 
  X, Play, Pause, FileIcon 
} from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import Navbar from "@/components/Navbar";
import MessageInput from "@/components/MessageInput";
import { formatMessage } from "@/lib/formatMessage";

interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  is_read: boolean;
  created_at: string;
  file_url: string | null;
  file_type: string | null;
  file_name: string | null;
  audio_url: string | null;
  audio_duration: number | null;
}

interface FriendProfile {
  id: string;
  username: string | null;
  avatar_url: string | null;
}

const DirectMessage = () => {
  const { friendId } = useParams<{ friendId: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [uploading, setUploading] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recordingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Check auth
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate("/auth");
        return;
      }
      setCurrentUserId(user.id);
    };
    checkAuth();
  }, [navigate]);

  // Fetch friend profile
  const { data: friend, isLoading: friendLoading } = useQuery({
    queryKey: ["friend-profile", friendId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, username, avatar_url")
        .eq("id", friendId)
        .single();
      if (error) throw error;
      return data as FriendProfile;
    },
    enabled: !!friendId,
  });

  // Find or create conversation
  useEffect(() => {
    if (!currentUserId || !friendId) return;

    const initConversation = async () => {
      // Try to find existing conversation
      const { data: existing } = await supabase
        .from("conversations")
        .select("id")
        .or(
          `and(user1_id.eq.${currentUserId},user2_id.eq.${friendId}),and(user1_id.eq.${friendId},user2_id.eq.${currentUserId})`
        )
        .single();

      if (existing) {
        setConversationId(existing.id);
        return;
      }

      // Create new conversation
      const { data: newConv, error } = await supabase
        .from("conversations")
        .insert({
          user1_id: currentUserId,
          user2_id: friendId,
        })
        .select("id")
        .single();

      if (error) {
        toast.error("Failed to start conversation");
        return;
      }
      setConversationId(newConv.id);
    };

    initConversation();
  }, [currentUserId, friendId]);

  // Fetch messages
  const { data: messages = [], isLoading: messagesLoading } = useQuery({
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
    if (!conversationId || !currentUserId) return;

    const markAsRead = async () => {
      await supabase
        .from("direct_messages")
        .update({ is_read: true })
        .eq("conversation_id", conversationId)
        .neq("sender_id", currentUserId)
        .eq("is_read", false);
    };

    markAsRead();
  }, [conversationId, messages, currentUserId]);

  // Scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Send text message
  const sendMutation = useMutation({
    mutationFn: async (data: { content: string; file_url?: string; file_type?: string; file_name?: string; audio_url?: string; audio_duration?: number }) => {
      if (!conversationId || !currentUserId) throw new Error("No conversation");
      const { error } = await supabase.from("direct_messages").insert({
        conversation_id: conversationId,
        sender_id: currentUserId,
        content: data.content,
        file_url: data.file_url || null,
        file_type: data.file_type || null,
        file_name: data.file_name || null,
        audio_url: data.audio_url || null,
        audio_duration: data.audio_duration || null,
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
    sendMutation.mutate({ content: trimmed });
  };

  // File upload
  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !currentUserId) return;

    if (file.size > 10 * 1024 * 1024) {
      toast.error("File too large (max 10MB)");
      return;
    }

    setUploading(true);
    try {
      const fileExt = file.name.split(".").pop();
      const filePath = `${currentUserId}/${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("dm-files")
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from("dm-files")
        .getPublicUrl(filePath);

      const fileType = file.type.startsWith("image/") ? "image" : "file";
      
      await sendMutation.mutateAsync({
        content: file.name,
        file_url: publicUrl,
        file_type: fileType,
        file_name: file.name,
      });

      toast.success("File sent!");
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Failed to upload file");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  // Voice recording
  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);

      recordingIntervalRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
    } catch (error) {
      toast.error("Could not access microphone");
    }
  }, []);

  const stopRecording = useCallback(async () => {
    if (!mediaRecorderRef.current || !currentUserId) return;

    return new Promise<void>((resolve) => {
      mediaRecorderRef.current!.onstop = async () => {
        if (recordingIntervalRef.current) {
          clearInterval(recordingIntervalRef.current);
        }

        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        const duration = recordingTime;

        setUploading(true);
        try {
          const filePath = `${currentUserId}/${Date.now()}.webm`;

          const { error: uploadError } = await supabase.storage
            .from("dm-files")
            .upload(filePath, audioBlob);

          if (uploadError) throw uploadError;

          const { data: { publicUrl } } = supabase.storage
            .from("dm-files")
            .getPublicUrl(filePath);

          await sendMutation.mutateAsync({
            content: "Voice message",
            audio_url: publicUrl,
            audio_duration: duration,
          });

          toast.success("Voice message sent!");
        } catch (error) {
          console.error("Voice upload error:", error);
          toast.error("Failed to send voice message");
        } finally {
          setUploading(false);
        }

        // Stop all tracks
        mediaRecorderRef.current?.stream.getTracks().forEach((track) => track.stop());
        setIsRecording(false);
        setRecordingTime(0);
        resolve();
      };

      mediaRecorderRef.current!.stop();
    });
  }, [currentUserId, recordingTime, sendMutation]);

  const cancelRecording = useCallback(() => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stream.getTracks().forEach((track) => track.stop());
      mediaRecorderRef.current = null;
    }
    if (recordingIntervalRef.current) {
      clearInterval(recordingIntervalRef.current);
    }
    audioChunksRef.current = [];
    setIsRecording(false);
    setRecordingTime(0);
  }, []);

  const formatRecordingTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  if (friendLoading || !currentUserId) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      
      {/* Header */}
      <div className="border-b bg-card sticky top-16 z-10">
        <div className="container mx-auto px-4 py-3 flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate("/friends")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <Avatar className="h-10 w-10">
            <AvatarImage src={friend?.avatar_url || undefined} />
            <AvatarFallback>
              {friend?.username?.charAt(0)?.toUpperCase() || "?"}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="font-semibold">@{friend?.username || "Unknown"}</p>
            <p className="text-xs text-muted-foreground">Direct Message</p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 px-4 py-4">
        <div className="container mx-auto max-w-2xl space-y-3">
          {messagesLoading ? (
            <div className="flex items-center justify-center h-40">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-40 text-muted-foreground">
              <p className="text-sm">No messages yet</p>
              <p className="text-xs">Start the conversation!</p>
            </div>
          ) : (
            messages.map((msg) => (
              <MessageBubble
                key={msg.id}
                message={msg}
                isSent={msg.sender_id === currentUserId}
              />
            ))
          )}
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      {/* Input */}
      <div className="border-t bg-card p-4">
        <div className="container mx-auto max-w-2xl">
          {isRecording ? (
            <div className="flex items-center gap-3">
              <div className="flex-1 flex items-center gap-3 bg-destructive/10 rounded-lg px-4 py-3">
                <div className="h-3 w-3 rounded-full bg-destructive animate-pulse" />
                <span className="text-destructive font-medium">
                  Recording... {formatRecordingTime(recordingTime)}
                </span>
              </div>
              <Button variant="ghost" size="icon" onClick={cancelRecording}>
                <X className="h-5 w-5" />
              </Button>
              <Button size="icon" onClick={stopRecording} disabled={uploading}>
                {uploading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <Square className="h-5 w-5" />
                )}
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileSelect}
                className="hidden"
                accept="image/*,.pdf,.doc,.docx,.txt"
              />
              <Button
                variant="ghost"
                size="icon"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading || sendMutation.isPending}
              >
                <Paperclip className="h-5 w-5" />
              </Button>
              <div className="flex-1">
                <MessageInput
                  value={message}
                  onChange={setMessage}
                  onSend={handleSend}
                  placeholder="Type a message..."
                  disabled={uploading}
                  sending={sendMutation.isPending}
                />
              </div>
              {!message.trim() && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={startRecording}
                  disabled={uploading}
                >
                  <Mic className="h-5 w-5" />
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Message Bubble Component
const MessageBubble = ({ message, isSent }: { message: Message; isSent: boolean }) => {
  const [playing, setPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const toggleAudio = () => {
    if (!audioRef.current) return;
    if (playing) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setPlaying(!playing);
  };

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleEnded = () => setPlaying(false);
    audio.addEventListener("ended", handleEnded);
    return () => audio.removeEventListener("ended", handleEnded);
  }, []);

  return (
    <div className={cn("flex w-full", isSent ? "justify-end" : "justify-start")}>
      <div
        className={cn(
          "max-w-[75%] rounded-2xl px-4 py-2.5 shadow-sm",
          isSent
            ? "bg-primary text-primary-foreground rounded-br-sm"
            : "bg-muted text-foreground rounded-bl-sm"
        )}
      >
        {/* Audio message */}
        {message.audio_url && (
          <div className="flex items-center gap-3 mb-1">
            <audio ref={audioRef} src={message.audio_url} />
            <Button
              variant="ghost"
              size="icon"
              className={cn("h-8 w-8", isSent ? "text-primary-foreground hover:text-primary-foreground/80" : "")}
              onClick={toggleAudio}
            >
              {playing ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            </Button>
            <div className="flex-1">
              <div className="h-1 bg-current/20 rounded-full overflow-hidden">
                <div className="h-full w-1/2 bg-current/60 rounded-full" />
              </div>
              <span className={cn("text-xs mt-1", isSent ? "text-primary-foreground/70" : "text-muted-foreground")}>
                {message.audio_duration ? `${Math.floor(message.audio_duration / 60)}:${(message.audio_duration % 60).toString().padStart(2, "0")}` : "0:00"}
              </span>
            </div>
          </div>
        )}

        {/* File/Image */}
        {message.file_url && (
          <div className="mb-2">
            {message.file_type === "image" ? (
              <a href={message.file_url} target="_blank" rel="noopener noreferrer">
                <img
                  src={message.file_url}
                  alt={message.file_name || "Image"}
                  className="rounded-lg max-h-60 object-cover"
                />
              </a>
            ) : (
              <a
                href={message.file_url}
                target="_blank"
                rel="noopener noreferrer"
                className={cn(
                  "flex items-center gap-2 p-2 rounded-lg",
                  isSent ? "bg-primary-foreground/10" : "bg-background/50"
                )}
              >
                <FileIcon className="h-5 w-5" />
                <span className="text-sm truncate">{message.file_name || "File"}</span>
              </a>
            )}
          </div>
        )}

        {/* Text content with formatting */}
        {!message.audio_url && !message.file_url && message.content && (
          <div 
            className="text-sm whitespace-pre-wrap break-words"
            dangerouslySetInnerHTML={{ __html: formatMessage(message.content) }}
          />
        )}

        {/* Timestamp */}
        <div className={cn("flex items-center gap-1 mt-1", isSent ? "justify-end" : "justify-start")}>
          <span className={cn("text-[10px]", isSent ? "text-primary-foreground/70" : "text-muted-foreground")}>
            {format(new Date(message.created_at), "h:mm a")}
          </span>
        </div>
      </div>
    </div>
  );
};

export default DirectMessage;
