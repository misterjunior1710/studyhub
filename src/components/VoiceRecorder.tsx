import { useVoiceRecorder } from "@/hooks/useVoiceRecorder";
import { Button } from "@/components/ui/button";
import { Mic, Square, X, Send, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface VoiceRecorderProps {
  onSend: (audioBlob: Blob, duration: number) => Promise<void>;
  disabled?: boolean;
  className?: string;
}

const VoiceRecorder = ({ onSend, disabled, className }: VoiceRecorderProps) => {
  const {
    isRecording,
    duration,
    audioBlob,
    startRecording,
    stopRecording,
    cancelRecording,
    resetRecording,
  } = useVoiceRecorder();

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const handleSend = async () => {
    if (audioBlob) {
      await onSend(audioBlob, duration);
      resetRecording();
    }
  };

  const handleStartRecording = async () => {
    try {
      await startRecording();
    } catch (error) {
      console.error("Microphone access denied:", error);
    }
  };

  // Recording state - show recording UI
  if (isRecording) {
    return (
      <div className={cn("flex items-center gap-2", className)}>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={cancelRecording}
          className="h-10 w-10 text-destructive hover:text-destructive"
          aria-label="Cancel recording"
        >
          <X className="h-5 w-5" />
        </Button>
        
        <div className="flex items-center gap-2 px-3 py-2 bg-destructive/10 rounded-full flex-1 min-w-0">
          <div className="h-3 w-3 rounded-full bg-destructive animate-pulse" />
          <span className="text-sm font-medium text-destructive">
            {formatDuration(duration)}
          </span>
          <span className="text-xs text-muted-foreground truncate">Recording...</span>
        </div>
        
        <Button
          type="button"
          variant="default"
          size="icon"
          onClick={stopRecording}
          className="h-10 w-10"
          aria-label="Stop recording"
        >
          <Square className="h-4 w-4" />
        </Button>
      </div>
    );
  }

  // Preview state - show recorded audio preview
  if (audioBlob) {
    return (
      <div className={cn("flex items-center gap-2", className)}>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={resetRecording}
          className="h-10 w-10 text-destructive hover:text-destructive"
          aria-label="Discard recording"
        >
          <X className="h-5 w-5" />
        </Button>
        
        <div className="flex items-center gap-2 px-3 py-2 bg-primary/10 rounded-full flex-1 min-w-0">
          <Mic className="h-4 w-4 text-primary" />
          <span className="text-sm font-medium">
            Voice message ({formatDuration(duration)})
          </span>
        </div>
        
        <Button
          type="button"
          variant="default"
          size="icon"
          onClick={handleSend}
          disabled={disabled}
          className="h-10 w-10"
          aria-label="Send voice message"
        >
          {disabled ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Send className="h-4 w-4" />
          )}
        </Button>
      </div>
    );
  }

  // Default state - show mic button
  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      onClick={handleStartRecording}
      disabled={disabled}
      className={cn("h-10 w-10 shrink-0", className)}
      aria-label="Start voice recording"
    >
      <Mic className="h-5 w-5" />
    </Button>
  );
};

export default VoiceRecorder;
