import { useState, useRef, KeyboardEvent } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Bold, Italic, Send, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface MessageInputProps {
  value: string;
  onChange: (value: string) => void;
  onSend: () => void;
  placeholder?: string;
  disabled?: boolean;
  sending?: boolean;
  className?: string;
}

const MessageInput = ({
  value,
  onChange,
  onSend,
  placeholder = "Type a message...",
  disabled = false,
  sending = false,
  className,
}: MessageInputProps) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const insertFormatting = (format: "bold" | "italic") => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = value.substring(start, end);
    
    const wrapper = format === "bold" ? "**" : "_";
    
    if (selectedText) {
      // Wrap selected text
      const newValue = 
        value.substring(0, start) + 
        wrapper + selectedText + wrapper + 
        value.substring(end);
      onChange(newValue);
      
      // Restore cursor position after the formatting
      setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(start, end + wrapper.length * 2);
      }, 0);
    } else {
      // Insert formatting markers and place cursor in between
      const newValue = 
        value.substring(0, start) + 
        wrapper + wrapper + 
        value.substring(end);
      onChange(newValue);
      
      setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(start + wrapper.length, start + wrapper.length);
      }, 0);
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    // Send on Enter (without Shift)
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (value.trim()) {
        onSend();
      }
    }
    
    // Bold: Ctrl/Cmd + B
    if ((e.ctrlKey || e.metaKey) && e.key === "b") {
      e.preventDefault();
      insertFormatting("bold");
    }
    
    // Italic: Ctrl/Cmd + I
    if ((e.ctrlKey || e.metaKey) && e.key === "i") {
      e.preventDefault();
      insertFormatting("italic");
    }
  };

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex items-center gap-1 px-1">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-7 w-7 p-0"
          onClick={() => insertFormatting("bold")}
          disabled={disabled}
          title="Bold (Ctrl+B)"
        >
          <Bold className="h-3.5 w-3.5" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-7 w-7 p-0"
          onClick={() => insertFormatting("italic")}
          disabled={disabled}
          title="Italic (Ctrl+I)"
        >
          <Italic className="h-3.5 w-3.5" />
        </Button>
      </div>
      <div className="flex items-end gap-2">
        <Textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled || sending}
          className="min-h-[40px] max-h-32 resize-none flex-1"
          rows={1}
        />
        <Button
          type="button"
          size="icon"
          onClick={onSend}
          disabled={disabled || sending || !value.trim()}
          className="h-10 w-10 shrink-0"
        >
          {sending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Send className="h-4 w-4" />
          )}
        </Button>
      </div>
    </div>
  );
};

export default MessageInput;
