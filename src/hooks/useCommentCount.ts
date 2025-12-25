import { useEffect, useState, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";

export const useCommentCount = (postId: string, initialCount: number = 0) => {
  const [count, setCount] = useState(initialCount);
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);

  useEffect(() => {
    // Fetch initial count
    const fetchCount = async () => {
      const { count: commentCount, error } = await supabase
        .from("comments")
        .select("*", { count: "exact", head: true })
        .eq("post_id", postId);

      if (!error && commentCount !== null) {
        setCount(commentCount);
      }
    };

    fetchCount();

    // Subscribe to realtime changes
    const channel = supabase
      .channel(`comments-${postId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "comments",
          filter: `post_id=eq.${postId}`,
        },
        (payload) => {
          if (payload.eventType === "INSERT") {
            setCount((prev) => prev + 1);
          } else if (payload.eventType === "DELETE") {
            setCount((prev) => Math.max(0, prev - 1));
          }
        }
      )
      .subscribe();

    channelRef.current = channel;

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, [postId]);

  return count;
};
