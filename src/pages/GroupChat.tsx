import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import SEOHead from "@/components/SEOHead";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ArrowLeft, Users, Loader2, Image, Paperclip, X, Wrench } from "lucide-react";
import { toast } from "sonner";
import GroupMembersDialog from "@/components/GroupMembersDialog";
import EditGroupDialog from "@/components/EditGroupDialog";
import GroupChatMessage from "@/components/GroupChatMessage";
import VoiceRecorder from "@/components/VoiceRecorder";
import LeaveGroupDialog from "@/components/LeaveGroupDialog";
import DeleteGroupDialog from "@/components/DeleteGroupDialog";
import MessageInput from "@/components/MessageInput";
import { formatMessage } from "@/lib/formatMessage";

interface Message {
  id: string;
  content: string;
  created_at: string;
  user_id: string;
  file_url?: string | null;
  file_type?: string | null;
  audio_url?: string | null;
  audio_duration?: number | null;
  profiles?: {
    username: string;
  };
}

interface GroupInfo {
  name: string;
  description: string;
  member_count: number;
}

const GroupChat = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [groupInfo, setGroupInfo] = useState<GroupInfo | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [uploadingFile, setUploadingFile] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    checkAuth();
    loadGroupInfo();
    loadMessages();
    checkAdminStatus();

    // Subscribe to new messages
    const channel = supabase
      .channel(`group_${id}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "group_messages",
          filter: `group_id=eq.${id}`,
        },
        () => {
          loadMessages();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [id]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Clean up file preview URL when component unmounts or file changes
    return () => {
      if (filePreview) {
        URL.revokeObjectURL(filePreview);
      }
    };
  }, [filePreview]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const checkAuth = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      navigate("/auth");
      return;
    }
    setUser(user);
  };

  const checkAdminStatus = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user || !id) return;

      const { data } = await supabase
        .from("group_members")
        .select("role")
        .eq("group_id", id)
        .eq("user_id", user.id)
        .single();

      setIsAdmin(data?.role === "admin");
    } catch (error) {
      console.error("Error checking admin status:", error);
    }
  };

  const loadGroupInfo = async () => {
    try {
      const { data: groupData, error: groupError } = await supabase
        .from("group_chats")
        .select("name, description")
        .eq("id", id)
        .single();

      if (groupError) throw groupError;

      const { count } = await supabase
        .from("group_members")
        .select("*", { count: "exact", head: true })
        .eq("group_id", id);

      setGroupInfo({
        name: groupData.name,
        description: groupData.description,
        member_count: count || 0,
      });
    } catch (error: any) {
      console.error("Error loading group info:", error);
      toast.error("Failed to load group information");
    }
  };

  const loadMessages = async () => {
    setLoading(true);
    try {
      const { data: messagesData, error: messagesError } = await supabase
        .from("group_messages")
        .select("*")
        .eq("group_id", id)
        .order("created_at", { ascending: true });

      if (messagesError) throw messagesError;

      if (messagesData && messagesData.length > 0) {
        const userIds = [...new Set(messagesData.map(m => m.user_id))];
        const { data: profilesData } = await supabase
          .from("profiles")
          .select("id, username")
          .in("id", userIds);

        const messagesWithProfiles = messagesData.map(message => ({
          ...message,
          profiles: profilesData?.find(p => p.id === message.user_id) || { username: "User" }
        }));

        setMessages(messagesWithProfiles);
      } else {
        setMessages([]);
      }
    } catch (error: any) {
      console.error("Error loading messages:", error);
      toast.error("Failed to load messages");
    } finally {
      setLoading(false);
    }
  };

  const uploadFile = async (file: File): Promise<{ url: string; type: string }> => {
    const fileExt = file.name.split(".").pop();
    const fileName = `${user.id}/${id}/${Date.now()}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from("group-chat-files")
      .upload(fileName, file);

    if (uploadError) throw uploadError;

    const { data: { publicUrl } } = supabase.storage
      .from("group-chat-files")
      .getPublicUrl(fileName);

    const fileType = file.type.startsWith("image/") ? "image" : 
                     file.type === "application/pdf" ? "pdf" : "other";

    return { url: publicUrl, type: fileType };
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>, isImage: boolean) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // File size limit: 10MB
    if (file.size > 10 * 1024 * 1024) {
      toast.error("File size must be less than 10MB");
      return;
    }

    setSelectedFile(file);

    if (file.type.startsWith("image/")) {
      setFilePreview(URL.createObjectURL(file));
    } else {
      setFilePreview(null);
    }
  };

  const clearSelectedFile = () => {
    setSelectedFile(null);
    if (filePreview) {
      URL.revokeObjectURL(filePreview);
      setFilePreview(null);
    }
    if (fileInputRef.current) fileInputRef.current.value = "";
    if (imageInputRef.current) imageInputRef.current.value = "";
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if ((!newMessage.trim() && !selectedFile) || !user) return;

    setSending(true);
    setUploadingFile(!!selectedFile);

    try {
      let fileUrl: string | null = null;
      let fileType: string | null = null;

      if (selectedFile) {
        const uploadResult = await uploadFile(selectedFile);
        fileUrl = uploadResult.url;
        fileType = uploadResult.type;
      }

      const { error } = await supabase.from("group_messages").insert({
        group_id: id,
        user_id: user.id,
        content: newMessage.trim(),
        file_url: fileUrl,
        file_type: fileType,
      });

      if (error) throw error;

      setNewMessage("");
      clearSelectedFile();
    } catch (error: any) {
      console.error("Error sending message:", error);
      toast.error("Failed to send message");
    } finally {
      setSending(false);
      setUploadingFile(false);
    }
  };

  const handleSendVoiceMessage = async (audioBlob: Blob, duration: number) => {
    if (!user || !id) return;

    setSending(true);
    try {
      const fileName = `${user.id}/${id}/${Date.now()}.webm`;
      
      const { error: uploadError } = await supabase.storage
        .from("group-chat-files")
        .upload(fileName, audioBlob);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from("group-chat-files")
        .getPublicUrl(fileName);

      const { error } = await supabase.from("group_messages").insert({
        group_id: id,
        user_id: user.id,
        content: "",
        audio_url: publicUrl,
        audio_duration: duration,
      });

      if (error) throw error;
    } catch (error: any) {
      console.error("Error sending voice message:", error);
      toast.error("Failed to send voice message");
    } finally {
      setSending(false);
    }
  };

  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (seconds < 60) return "just now";
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    return `${Math.floor(seconds / 86400)}d ago`;
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <SEOHead
        title={groupInfo?.name || "Group Chat"}
        description="Private group chat on StudyHub."
        noIndex={true}
      />
      <Navbar />
      
      {/* Group Header - Responsive */}
      <div className="border-b border-border bg-card">
        <div className="container mx-auto px-2 sm:px-4 py-2 sm:py-4">
          <div className="flex items-center gap-2 sm:gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate("/groups")}
              className="h-8 w-8 sm:h-10 sm:w-10 shrink-0"
              aria-label="Back to groups"
            >
              <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5" />
            </Button>
            <div className="flex-1 min-w-0">
              <h1 className="text-base sm:text-xl font-bold truncate">
                {groupInfo?.name || "Loading..."}
              </h1>
              {groupInfo && (
                <p className="text-xs sm:text-sm text-muted-foreground flex items-center gap-1 sm:gap-2">
                  <Users className="h-3 w-3 sm:h-4 sm:w-4" />
                  {groupInfo.member_count} members
                </p>
              )}
            </div>
            {id && groupInfo && (
              <div className="flex items-center gap-1 sm:gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => navigate(`/groups/${id}/tools`)}
                  className="h-8 w-8 sm:h-10 sm:w-10"
                  aria-label="Group tools"
                >
                  <Wrench className="h-4 w-4 sm:h-5 sm:w-5" />
                </Button>
                {isAdmin && (
                  <EditGroupDialog
                    groupId={id}
                    currentName={groupInfo.name}
                    currentDescription={groupInfo.description || ""}
                    onGroupUpdated={loadGroupInfo}
                  />
                )}
                <GroupMembersDialog groupId={id} onMemberChange={loadGroupInfo} />
                <LeaveGroupDialog
                  groupId={id}
                  groupName={groupInfo.name}
                  onLeave={() => navigate("/groups")}
                />
                {isAdmin && (
                  <DeleteGroupDialog
                    groupId={id}
                    groupName={groupInfo.name}
                    onDelete={() => navigate("/groups")}
                  />
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Messages Container - Responsive */}
      <div className="flex-1 overflow-y-auto">
        <div className="container mx-auto px-2 sm:px-4 py-3 sm:py-6 max-w-4xl">
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="h-6 w-6 sm:h-8 sm:w-8 animate-spin text-primary" />
            </div>
          ) : messages.length === 0 ? (
            <div className="text-center py-8 sm:py-12">
              <p className="text-sm sm:text-base text-muted-foreground">
                No messages yet. Start the conversation!
              </p>
            </div>
          ) : (
            <div className="space-y-2 sm:space-y-4">
              {messages.map((message) => (
                <GroupChatMessage
                  key={message.id}
                  message={message}
                  isOwn={message.user_id === user?.id}
                  getTimeAgo={getTimeAgo}
                />
              ))}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>
      </div>

      {/* Message Input - Responsive */}
      <div className="border-t border-border bg-card">
        <div className="container mx-auto px-2 sm:px-4 py-2 sm:py-4 max-w-4xl">
          {/* File Preview */}
          {selectedFile && (
            <div className="mb-2 p-2 bg-muted rounded-lg flex items-center gap-2">
              {filePreview ? (
                <img 
                  src={filePreview} 
                  alt="Preview of selected file" 
                  className="h-12 w-12 object-cover rounded"
                />
              ) : (
                <div className="h-12 w-12 bg-primary/10 rounded flex items-center justify-center">
                  <Paperclip className="h-5 w-5 text-primary" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{selectedFile.name}</p>
                <p className="text-xs text-muted-foreground">
                  {(selectedFile.size / 1024).toFixed(1)} KB
                </p>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={clearSelectedFile}
                className="h-8 w-8 shrink-0"
                aria-label="Remove file"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          )}

          <form onSubmit={handleSendMessage} className="flex items-end gap-1 sm:gap-2">
            {/* Hidden file inputs */}
            <input
              ref={imageInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => handleFileSelect(e, true)}
            />
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.doc,.docx,.txt,.zip"
              className="hidden"
              onChange={(e) => handleFileSelect(e, false)}
            />

            {/* Attachment buttons - Hidden when recording */}
            <div className="flex items-center gap-0.5 sm:gap-1">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => imageInputRef.current?.click()}
                disabled={sending}
                className="h-9 w-9 sm:h-10 sm:w-10 shrink-0"
                aria-label="Attach image"
              >
                <Image className="h-4 w-4 sm:h-5 sm:w-5" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => fileInputRef.current?.click()}
                disabled={sending}
                className="h-9 w-9 sm:h-10 sm:w-10 shrink-0"
                aria-label="Attach file"
              >
                <Paperclip className="h-4 w-4 sm:h-5 sm:w-5" />
              </Button>
            </div>

            {/* Message Input with formatting */}
            <div className="flex-1">
              <MessageInput
                value={newMessage}
                onChange={setNewMessage}
                onSend={() => {
                  if (newMessage.trim() || selectedFile) {
                    handleSendMessage({ preventDefault: () => {} } as React.FormEvent);
                  }
                }}
                placeholder="Type a message..."
                disabled={sending}
                sending={sending}
              />
            </div>

            {/* Voice Recorder */}
            <VoiceRecorder
              onSend={handleSendVoiceMessage}
              disabled={sending}
              className="shrink-0"
            />
          </form>
        </div>
      </div>
    </div>
  );
};

export default GroupChat;
