import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useCallback, useEffect, useRef } from "react";

interface Post {
  id: string;
  title: string;
  content: string;
  subject: string;
  grade: string;
  stream: string;
  country: string;
  upvotes: number;
  downvotes: number;
  share_count: number;
  created_at: string;
  file_url: string | null;
  user_id: string;
  profiles?: {
    username: string;
  };
  comments?: { count: number }[];
}

interface UsePostsOptions {
  postType: "general" | "doubt" | "update";
  sortBy?: "hot" | "new" | "top";
  searchQuery?: string;
  selectedCountry?: string | null;
  selectedSubject?: string | null;
  selectedGrade?: string | null;
  selectedStream?: string | null;
  userGrade?: string | null;
  isAdmin?: boolean;
  enabled?: boolean;
}

const fetchPosts = async ({
  postType,
  sortBy = "hot",
  searchQuery,
  selectedCountry,
  selectedSubject,
  selectedGrade,
  selectedStream,
  userGrade,
  isAdmin,
}: UsePostsOptions): Promise<Post[]> => {
  let query = supabase
    .from("posts")
    .select("*, profiles!posts_user_id_fkey(username), comments(count)")
    .eq("post_type", postType);

  if (searchQuery) {
    query = query.or(`title.ilike.%${searchQuery}%,content.ilike.%${searchQuery}%`);
  }

  if (selectedCountry) {
    query = query.eq("country", selectedCountry);
  }

  if (selectedSubject) {
    query = query.eq("subject", selectedSubject);
  }

  if (selectedGrade) {
    query = query.eq("grade", selectedGrade);
  }

  if (selectedStream) {
    query = query.eq("stream", selectedStream);
  }

  // Hide Adult (18+) content from non-adult users
  if (!isAdmin && userGrade !== "Adult (18+)") {
    query = query.neq("grade", "Adult (18+)");
  }

  // Always fetch by created_at to get a stable, complete result set, then
  // re-rank in JS for "hot" / "top". This avoids brittle multi-column ordering
  // edge cases and makes ranking transparent.
  // Was limit(500) — that's a huge payload sent to every client on every
  // Feed mount. 150 is plenty for client-side hot/top re-ranking and cuts
  // bandwidth + DB read cost by ~70%.
  query = query.order("created_at", { ascending: false }).limit(150);

  const { data, error } = await query;

  let rows: Post[];

  if (error) {
    console.error("[usePosts] Error loading posts (with relations):", error);
    // Fallback without relations
    const { data: fallbackData, error: fallbackError } = await supabase
      .from("posts")
      .select("*")
      .eq("post_type", postType)
      .order("created_at", { ascending: false })
      .limit(500);

    if (fallbackError) {
      console.error("[usePosts] Fallback query also failed:", fallbackError);
      throw fallbackError;
    }
    rows = (fallbackData as Post[]) || [];
  } else {
    rows = (data as Post[]) || [];
  }

  // Apply ranking in JS so all three modes are guaranteed to render.
  if (sortBy === "new") {
    rows.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  } else if (sortBy === "top") {
    rows.sort((a, b) => {
      const sa = (a.upvotes ?? 0) - (a.downvotes ?? 0);
      const sb = (b.upvotes ?? 0) - (b.downvotes ?? 0);
      if (sb !== sa) return sb - sa;
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });
  } else {
    // "hot": Reddit-style score combining net votes with recency decay.
    const now = Date.now();
    const hotScore = (p: Post) => {
      const net = (p.upvotes ?? 0) - (p.downvotes ?? 0);
      const sign = net > 0 ? 1 : net < 0 ? -1 : 0;
      const order = Math.log10(Math.max(Math.abs(net), 1));
      const ageHours = Math.max((now - new Date(p.created_at).getTime()) / 3_600_000, 0);
      // Decay over ~45h half-life
      return order * sign - ageHours / 45;
    };
    rows.sort((a, b) => hotScore(b) - hotScore(a));
  }

  return rows;
};

export const usePosts = (options: UsePostsOptions) => {
  const queryClient = useQueryClient();
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);

  // Normalize undefined/null values in query key to prevent unnecessary refetches
  const queryKey = [
    "posts",
    options.postType,
    options.sortBy || "hot",
    options.searchQuery || "",
    options.selectedCountry || "",
    options.selectedSubject || "",
    options.selectedGrade || "",
    options.selectedStream || "",
    options.userGrade || "",
    options.isAdmin || false,
  ];

  const query = useQuery({
    queryKey,
    queryFn: () => fetchPosts(options),
    staleTime: 60 * 1000, // 1 minute
    gcTime: 30 * 60 * 1000, // 30 minutes
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    enabled: options.enabled !== false,
  });

  const invalidatePosts = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ["posts"] });
  }, [queryClient]);

  // Set up realtime subscription with proper cleanup
  useEffect(() => {
    // Clean up existing channel if any
    if (channelRef.current) {
      supabase.removeChannel(channelRef.current);
    }

    const channel = supabase
      .channel(`posts-${options.postType}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "posts",
        },
        () => {
          invalidatePosts();
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
  }, [options.postType, invalidatePosts]);

  return {
    ...query,
    invalidatePosts,
  };
};

export const getTimeAgo = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (seconds < 60) return "just now";
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
};
