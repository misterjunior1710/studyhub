import React from "react";
import * as TooltipPrimitive from "@radix-ui/react-tooltip";
import { ArrowUp, Square, X, StopCircle, Mic, Paperclip, Globe, BrainCog, FileText } from "lucide-react";
import { ACCEPTED_MIME, ACCEPTED_EXT_LABEL, MAX_FILE_BYTES } from "@/lib/extractFileContent";
import { cn } from "@/lib/utils";

/**
 * AI Prompt Box — chat-style input with file attach, voice record,
 * and optional Search/Think mode toggles. Themed with StudyHub tokens.
 */

const TooltipProvider = TooltipPrimitive.Provider;
const Tooltip = TooltipPrimitive.Root;
const TooltipTrigger = TooltipPrimitive.Trigger;
const TooltipContent = React.forwardRef<
  React.ElementRef<typeof TooltipPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TooltipPrimitive.Content>
>(({ className, sideOffset = 6, ...props }, ref) => (
  <TooltipPrimitive.Content
    ref={ref}
    sideOffset={sideOffset}
    className={cn(
      "z-50 overflow-hidden rounded-md border border-border bg-popover px-3 py-1.5 text-xs text-popover-foreground shadow-md",
      className,
    )}
    {...props}
  />
));
TooltipContent.displayName = "TooltipContent";

interface VoiceRecorderProps {
  isRecording: boolean;
  visualizerBars?: number;
}
const VoiceRecorder: React.FC<VoiceRecorderProps> = ({ isRecording, visualizerBars = 28 }) => {
  const [time, setTime] = React.useState(0);
  React.useEffect(() => {
    if (!isRecording) {
      setTime(0);
      return;
    }
    const id = setInterval(() => setTime((t) => t + 1), 1000);
    return () => clearInterval(id);
  }, [isRecording]);
  const fmt = (s: number) =>
    `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center w-full overflow-hidden transition-all",
        isRecording ? "opacity-100 py-3" : "opacity-0 h-0",
      )}
    >
      <div className="flex items-center gap-2 mb-2">
        <span className="h-2 w-2 rounded-full bg-destructive animate-pulse" />
        <span className="font-mono text-xs text-foreground/80">{fmt(time)}</span>
      </div>
      <div className="w-full h-8 flex items-center justify-center gap-0.5 px-4">
        {Array.from({ length: visualizerBars }).map((_, i) => (
          <div
            key={i}
            className="w-0.5 rounded-full bg-foreground/40 animate-pulse"
            style={{
              height: `${Math.max(15, Math.random() * 100)}%`,
              animationDelay: `${i * 0.05}s`,
              animationDuration: `${0.5 + Math.random() * 0.5}s`,
            }}
          />
        ))}
      </div>
    </div>
  );
};

export interface PromptInputBoxProps {
  onSend: (message: string, files?: File[]) => void;
  isLoading?: boolean;
  placeholder?: string;
  className?: string;
  /** Show optional mode toggles (Search / Think) — disabled by default to keep UX simple */
  showModes?: boolean;
  /** Allow file (image) attachments */
  allowAttachments?: boolean;
  /** Allow voice-record button (calls onSend with `[Voice message – Ns]` placeholder) */
  allowVoice?: boolean;
  /** Max textarea height in px before scrolling */
  maxHeight?: number;
  autoFocus?: boolean;
}

export const PromptInputBox = React.forwardRef<HTMLDivElement, PromptInputBoxProps>(
  (
    {
      onSend,
      isLoading = false,
      placeholder = "Ask Nova anything…",
      className,
      showModes = false,
      allowAttachments = false,
      allowVoice = false,
      maxHeight = 200,
      autoFocus = false,
    },
    ref,
  ) => {
    const [input, setInput] = React.useState("");
    const [files, setFiles] = React.useState<File[]>([]);
    const [previews, setPreviews] = React.useState<Record<string, string>>({});
    const [isRecording, setIsRecording] = React.useState(false);
    const [showSearch, setShowSearch] = React.useState(false);
    const [showThink, setShowThink] = React.useState(false);
    const fileRef = React.useRef<HTMLInputElement>(null);
    const taRef = React.useRef<HTMLTextAreaElement>(null);

    React.useEffect(() => {
      if (autoFocus) taRef.current?.focus();
    }, [autoFocus]);

    React.useEffect(() => {
      if (!taRef.current) return;
      taRef.current.style.height = "auto";
      taRef.current.style.height = `${Math.min(taRef.current.scrollHeight, maxHeight)}px`;
    }, [input, maxHeight]);

    const processFiles = (incoming: File[]) => {
      const next: File[] = [...files];
      const nextPreviews: Record<string, string> = { ...previews };
      for (const file of incoming) {
        if (file.size > MAX_FILE_BYTES) continue;
        if (next.find((f) => f.name === file.name && f.size === file.size)) continue;
        next.push(file);
        if (file.type.startsWith("image/")) {
          const reader = new FileReader();
          reader.onload = (e) => {
            const url = e.target?.result as string;
            setPreviews((p) => ({ ...p, [file.name]: url }));
          };
          reader.readAsDataURL(file);
        }
        if (next.length >= 5) break;
      }
      setFiles(next);
      setPreviews(nextPreviews);
    };

    const removeFile = (name: string) => {
      setFiles((prev) => prev.filter((f) => f.name !== name));
      setPreviews((prev) => {
        const copy = { ...prev };
        delete copy[name];
        return copy;
      });
    };

    const submit = () => {
      if (isLoading || isRecording) return;
      if (!input.trim() && files.length === 0) return;
      let prefix = "";
      if (showSearch) prefix = "[Search] ";
      else if (showThink) prefix = "[Think] ";
      onSend(prefix + input, files);
      setInput("");
      setFiles([]);
      setPreviews({});
    };

    const onKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        submit();
      }
    };

    const onDrop = (e: React.DragEvent) => {
      e.preventDefault();
      const dropped = Array.from(e.dataTransfer.files);
      if (dropped.length) processFiles(dropped);
    };

    const hasContent = input.trim().length > 0 || files.length > 0;

    return (
      <TooltipProvider delayDuration={200}>
        <div
          ref={ref}
          onDragOver={(e) => e.preventDefault()}
          onDrop={onDrop}
          className={cn(
            "w-full rounded-2xl border border-border bg-card/80 backdrop-blur-xl",
            "shadow-[0_8px_30px_-12px_hsl(0_0%_0%/_0.25),inset_0_1px_0_0_hsl(0_0%_100%/_0.06)]",
            "transition-all duration-300",
            isRecording && "border-destructive/60",
            isLoading && "border-primary/40",
            className,
          )}
        >
          {/* File chip */}
          {files.length > 0 && !isRecording && (
            <div className="flex flex-wrap gap-2 p-2 pb-0">
              {files.map((file) => {
                const isImage = file.type.startsWith("image/");
                return (
                  <div key={file.name} className="relative group">
                    {isImage && previews[file.name] ? (
                      <img
                        src={previews[file.name]}
                        alt={file.name}
                        className="w-16 h-16 rounded-xl object-cover border border-border"
                      />
                    ) : (
                      <div className="w-40 h-16 rounded-xl border border-border bg-muted/50 flex items-center gap-2 px-2">
                        <FileText className="h-5 w-5 text-primary shrink-0" />
                        <span className="text-xs truncate" title={file.name}>{file.name}</span>
                      </div>
                    )}
                    <button
                      type="button"
                      onClick={() => removeFile(file.name)}
                      aria-label={`Remove ${file.name}`}
                      className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-background border border-border flex items-center justify-center opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                );
              })}
            </div>
          )}

          {/* Recording visualizer */}
          <VoiceRecorder isRecording={isRecording} />

          {/* Textarea */}
          {!isRecording && (
            <textarea
              ref={taRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={onKeyDown}
              placeholder={placeholder}
              rows={1}
              disabled={isLoading}
              aria-label={placeholder}
              className="w-full resize-none bg-transparent px-4 pt-3 pb-1 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none disabled:opacity-50 min-h-[44px]"
            />
          )}

          {/* Action bar */}
          <div className="flex items-center justify-between gap-2 p-2 pt-1">
            <div className="flex items-center gap-1">
              {allowAttachments && (
                <>
                  <input
                    ref={fileRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f) processFile(f);
                      e.target.value = "";
                    }}
                  />
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        type="button"
                        onClick={() => fileRef.current?.click()}
                        disabled={isLoading || isRecording}
                        aria-label="Attach image"
                        className="h-8 w-8 inline-flex items-center justify-center rounded-full text-muted-foreground hover:bg-accent hover:text-foreground transition-colors disabled:opacity-50"
                      >
                        <Paperclip className="h-4 w-4" />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent>Attach image</TooltipContent>
                  </Tooltip>
                </>
              )}

              {showModes && (
                <>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        type="button"
                        onClick={() => {
                          setShowSearch((v) => !v);
                          setShowThink(false);
                        }}
                        aria-pressed={showSearch}
                        aria-label="Toggle web search mode"
                        className={cn(
                          "h-8 px-2.5 inline-flex items-center gap-1.5 rounded-full text-xs transition-colors",
                          showSearch
                            ? "bg-primary/15 text-primary"
                            : "text-muted-foreground hover:bg-accent hover:text-foreground",
                        )}
                      >
                        <Globe className="h-3.5 w-3.5" />
                        <span className="hidden sm:inline">Search</span>
                      </button>
                    </TooltipTrigger>
                    <TooltipContent>Search the web</TooltipContent>
                  </Tooltip>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        type="button"
                        onClick={() => {
                          setShowThink((v) => !v);
                          setShowSearch(false);
                        }}
                        aria-pressed={showThink}
                        aria-label="Toggle deep think mode"
                        className={cn(
                          "h-8 px-2.5 inline-flex items-center gap-1.5 rounded-full text-xs transition-colors",
                          showThink
                            ? "bg-accent/40 text-foreground"
                            : "text-muted-foreground hover:bg-accent hover:text-foreground",
                        )}
                      >
                        <BrainCog className="h-3.5 w-3.5" />
                        <span className="hidden sm:inline">Think</span>
                      </button>
                    </TooltipTrigger>
                    <TooltipContent>Think step-by-step</TooltipContent>
                  </Tooltip>
                </>
              )}
            </div>

            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  type="button"
                  onClick={() => {
                    if (isLoading) return;
                    if (isRecording) {
                      setIsRecording(false);
                      onSend("[Voice message]", []);
                    } else if (hasContent) {
                      submit();
                    } else if (allowVoice) {
                      setIsRecording(true);
                    }
                  }}
                  disabled={isLoading && !hasContent}
                  aria-label={
                    isLoading
                      ? "Generating"
                      : isRecording
                        ? "Stop recording"
                        : hasContent
                          ? "Send message"
                          : allowVoice
                            ? "Record voice message"
                            : "Send"
                  }
                  className={cn(
                    "h-9 w-9 inline-flex items-center justify-center rounded-full transition-all duration-200",
                    "bg-gradient-to-b from-primary to-primary/85 text-primary-foreground",
                    "shadow-[inset_0_1px_0_0_hsl(0_0%_100%/_0.25),0_4px_14px_-4px_hsl(var(--primary)/0.45)]",
                    "hover:brightness-110 active:scale-95 disabled:opacity-50 disabled:pointer-events-none",
                    isRecording && "from-destructive to-destructive/85",
                  )}
                >
                  {isLoading ? (
                    <Square className="h-3.5 w-3.5 fill-current animate-pulse" />
                  ) : isRecording ? (
                    <StopCircle className="h-4 w-4" />
                  ) : hasContent || !allowVoice ? (
                    <ArrowUp className="h-4 w-4" />
                  ) : (
                    <Mic className="h-4 w-4" />
                  )}
                </button>
              </TooltipTrigger>
              <TooltipContent side="top">
                {hasContent ? "Send (Enter)" : allowVoice ? "Voice message" : "Send"}
              </TooltipContent>
            </Tooltip>
          </div>
        </div>
      </TooltipProvider>
    );
  },
);
PromptInputBox.displayName = "PromptInputBox";

export default PromptInputBox;
