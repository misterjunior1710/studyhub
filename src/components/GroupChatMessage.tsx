import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import AudioPlayer from "@/components/AudioPlayer";
import { FileIcon, ImageIcon, Download } from "lucide-react";
import { Button } from "@/components/ui/button";

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

interface GroupChatMessageProps {
  message: Message;
  isOwn: boolean;
  getTimeAgo: (dateString: string) => string;
}

const GroupChatMessage = ({ message, isOwn, getTimeAgo }: GroupChatMessageProps) => {
  const username = message.profiles?.username || "User";

  const renderFileContent = () => {
    if (!message.file_url) return null;

    if (message.file_type === "image") {
      return (
        <img
          src={message.file_url}
          alt={`Image shared by ${username}`}
          className="mt-2 max-w-full sm:max-w-xs md:max-w-sm rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
          onClick={() => window.open(message.file_url!, "_blank")}
        />
      );
    }

    // PDF or other file
    const handleDownload = async () => {
      try {
        const response = await fetch(message.file_url!);
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        // Extract filename from URL or use default
        const urlParts = message.file_url!.split('/');
        const fileName = urlParts[urlParts.length - 1] || 'download';
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } catch (error) {
        console.error('Download failed:', error);
        // Fallback to opening in new tab
        window.open(message.file_url!, "_blank");
      }
    };

    return (
      <div className="mt-2 flex items-center gap-2 p-2 bg-muted rounded-lg max-w-full sm:max-w-xs">
        <FileIcon className="h-8 w-8 text-primary shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium truncate">
            {message.file_type === "pdf" ? "PDF Document" : "File"}
          </p>
          <p className="text-xs text-muted-foreground">Click to download</p>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 shrink-0"
          onClick={handleDownload}
          aria-label="Download file"
        >
          <Download className="h-4 w-4" />
        </Button>
      </div>
    );
  };

  const renderAudioContent = () => {
    if (!message.audio_url) return null;

    return (
      <div className="mt-2 max-w-full sm:max-w-xs">
        <AudioPlayer
          src={message.audio_url}
          duration={message.audio_duration || undefined}
        />
      </div>
    );
  };

  return (
    <Card className={isOwn ? "bg-primary/10" : ""}>
      <CardContent className="p-3 sm:pt-4 sm:px-4">
        <div className="flex items-start gap-2 sm:gap-3">
          <Avatar 
            className="h-7 w-7 sm:h-8 sm:w-8 shrink-0" 
            title={`${username}'s avatar`}
          >
            <AvatarFallback className="bg-primary text-primary-foreground text-xs sm:text-sm">
              {username.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <div className="flex items-baseline gap-2 mb-1 flex-wrap">
              <span className="font-semibold text-xs sm:text-sm">
                {username}
              </span>
              <span className="text-[10px] sm:text-xs text-muted-foreground">
                {getTimeAgo(message.created_at)}
              </span>
            </div>
            {message.content && (
              <p className="text-xs sm:text-sm whitespace-pre-wrap break-words">
                {message.content}
              </p>
            )}
            {renderFileContent()}
            {renderAudioContent()}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default GroupChatMessage;
