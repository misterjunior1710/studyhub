import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export interface AssistantThread {
  id: string;
  title: string;
  last_message_at: string;
  created_at: string;
}
export interface AssistantMessage {
  id: string;
  thread_id: string;
  role: "user" | "assistant" | "system";
  content: string;
  created_at: string;
}

export const useAssistantThreads = () => {
  const { user } = useAuth();
  const [threads, setThreads] = useState<AssistantThread[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!user) { setThreads([]); setLoading(false); return; }
    const { data, error } = await supabase
      .from("assistant_threads")
      .select("id,title,last_message_at,created_at")
      .order("last_message_at", { ascending: false })
      .limit(50);
    if (error) console.error("[assistant] threads load failed", error);
    setThreads((data ?? []) as AssistantThread[]);
    setLoading(false);
  }, [user]);

  useEffect(() => { setLoading(true); void refresh(); }, [refresh]);

  const deleteThread = useCallback(async (id: string) => {
    const { error } = await supabase.from("assistant_threads").delete().eq("id", id);
    if (error) toast.error("Couldn't delete conversation");
    else { toast.success("Conversation deleted"); void refresh(); }
  }, [refresh]);

  return { threads, loading, refresh, deleteThread };
};

export const useAssistantMessages = (threadId: string | null) => {
  const [messages, setMessages] = useState<AssistantMessage[]>([]);
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async () => {
    if (!threadId) { setMessages([]); return; }
    setLoading(true);
    const { data, error } = await supabase
      .from("assistant_messages")
      .select("id,thread_id,role,content,created_at")
      .eq("thread_id", threadId)
      .order("created_at", { ascending: true });
    if (error) console.error("[assistant] messages load failed", error);
    setMessages((data ?? []) as AssistantMessage[]);
    setLoading(false);
  }, [threadId]);

  useEffect(() => { void refresh(); }, [refresh]);

  return { messages, setMessages, loading, refresh };
};
