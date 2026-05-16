import { useEffect, useRef, useState, useCallback, KeyboardEvent } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Send, Loader2 } from "lucide-react";
import { NovaIcon } from "./NovaIcon";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { PromptInputBox } from "@/components/ui/ai-prompt-box";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import { renderAssistantMarkdown } from "@/lib/assistantMarkdown";
import { useAssistantMessages, type AssistantMessage } from "@/hooks/useAssistant";
import { cn } from "@/lib/utils";

const SUGGESTIONS = [
  "Where can I see my tasks?",
  "Help me plan tomorrow's study session",
  "Explain photosynthesis simply",
  "What's overdue right now?",
];

interface Props {
  threadId: string | null;
  onThreadCreated?: (id: string) => void;
  onAfterSend?: () => void;
  className?: string;
  compact?: boolean;
}

export const AssistantChat = ({ threadId, onThreadCreated, onAfterSend, className, compact }: Props) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { messages, setMessages, refresh } = useAssistantMessages(threadId);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Autoscroll on new messages
  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
  }, [messages, sending]);

  // Keep composer focused
  useEffect(() => { textareaRef.current?.focus(); }, [threadId]);

  // Auto-send initial prompt passed via navigation state (e.g. from Content Generator)
  const sentInitialRef = useRef(false);
  useEffect(() => {
    const initial = (location.state as any)?.initialPrompt as string | undefined;
    if (initial && !sentInitialRef.current && user) {
      sentInitialRef.current = true;
      // Clear state so refresh doesn't re-send
      navigate(location.pathname, { replace: true, state: {} });
      void send(initial);
    }
  }, [location.state, user, send, navigate, location.pathname]);

  const send = useCallback(async (text: string) => {
    if (!text.trim() || sending) return;
    if (!user) { toast.error("Sign in to chat with the assistant"); return; }

    const optimistic: AssistantMessage = {
      id: `tmp-${Date.now()}`,
      thread_id: threadId ?? "new",
      role: "user",
      content: text,
      created_at: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, optimistic]);
    setInput("");
    setSending(true);

    try {
      const { data, error } = await supabase.functions.invoke("ai-assistant", {
        body: { message: text, thread_id: threadId, route: location.pathname },
      });
      if (error) throw error;
      const newThreadId = data?.thread_id as string | undefined;
      if (newThreadId && newThreadId !== threadId) {
        onThreadCreated?.(newThreadId);
      } else {
        await refresh();
      }
      onAfterSend?.();
    } catch (e: any) {
      console.error(e);
      setMessages((prev) => prev.filter((m) => m.id !== optimistic.id));
      toast.error("Couldn't send", { description: e?.message ?? "Try again in a moment." });
    } finally {
      setSending(false);
      requestAnimationFrame(() => textareaRef.current?.focus());
    }
  }, [sending, user, threadId, location.pathname, setMessages, refresh, onThreadCreated, onAfterSend]);

  const onKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      void send(input);
    }
  };

  // Internal link delegation for assistant markdown links
  const onContentClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const target = e.target as HTMLElement;
    const a = target.closest("a") as HTMLAnchorElement | null;
    if (!a) return;
    const href = a.getAttribute("href") || "";
    if (href.startsWith("/")) {
      e.preventDefault();
      navigate(href);
    }
  };

  const empty = messages.length === 0;

  return (
    <div className={cn("flex flex-col h-full min-h-0", className)}>
      <ScrollArea className="flex-1 min-h-0">
        <div ref={scrollRef} className="p-4 space-y-4 max-w-3xl mx-auto" onClick={onContentClick}>
          {empty && (
            <div className="text-center py-8 space-y-4">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10">
                <NovaIcon className="h-7 w-7 text-primary" pulse />
              </div>
              <div>
                <h2 className="text-lg font-semibold">Nova</h2>
                <p className="text-sm text-muted-foreground">
                  Your academic companion. Ask anything about studying, the platform, or your tasks.
                </p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-w-xl mx-auto">
                {SUGGESTIONS.map((s) => (
                  <button
                    key={s}
                    onClick={() => void send(s)}
                    className="text-left text-sm rounded-lg glass-card hover-lift tap-press p-3"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((m) => (
            <div key={m.id} className={cn("flex", m.role === "user" ? "justify-end" : "justify-start")}>
              {m.role === "user" ? (
                <div className="max-w-[85%] rounded-2xl bg-primary text-primary-foreground px-4 py-2 text-sm whitespace-pre-wrap shadow-sm animate-fade-in">
                  {m.content}
                </div>
              ) : (
                <div
                  className="max-w-[90%] text-sm leading-relaxed prose-assistant"
                  dangerouslySetInnerHTML={{ __html: renderAssistantMarkdown(m.content) }}
                />
              )}
            </div>
          ))}

          {sending && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground animate-fade-in" aria-live="polite">
              <span className="nova-dot" />
              <span className="nova-dot" />
              <span className="nova-dot" />
              <span className="ml-1">Nova is thinking</span>
            </div>
          )}
        </div>
      </ScrollArea>

      <div className={cn("border-t border-border p-3 bg-background/60 backdrop-blur", compact && "pb-3")}>
        <div className="max-w-3xl mx-auto">
          <PromptInputBox
            onSend={(message) => {
              if (!message.trim()) return;
              setInput("");
              void send(message);
            }}
            isLoading={sending}
            placeholder="Ask Nova anything… (Enter to send, Shift+Enter for new line)"
          />
        </div>
      </div>
    </div>
  );
};
