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
  created_at: string;
  file_url: string | null;
  user_id: string;
  profiles?: {
    username: string;
  };
  comments?: { count: number }[];
}

interface UsePostsOptions {
  postType: "general" | "doubt" | "meme";
  sortBy?: "hot" | "new" | "top";
  searchQuery?: string;
  selectedCountry?: string | null;
  selectedSubject?: string | null;
  selectedGrade?: string | null;
  selectedStream?: string | null;
  userGrade?: string | null;
  isAdmin?: boolean;
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

  if (sortBy === "new") {
    query = query.order("created_at", { ascending: false });
  } else if (sortBy === "top") {
    query = query.order("upvotes", { ascending: false });
  } else {
    query = query.order("upvotes", { ascending: false }).order("created_at", { ascending: false });
  }

  const { data, error } = await query;

  if (error) {
    console.error("Error loading posts:", error);
    // Fallback without relations
    const { data: fallbackData, error: fallbackError } = await supabase
      .from("posts")
      .select("*")
      .eq("post_type", postType)
      .order("created_at", { ascending: false });

    if (fallbackError) throw fallbackError;
    return (fallbackData as Post[]) || [];
  }

  return (data as Post[]) || [];
};

export const usePosts = (options: UsePostsOptions) => {
  const queryClient = useQueryClient();
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);

  const queryKey = [
    "posts",
    options.postType,
    options.sortBy,
    options.searchQuery,
    options.selectedCountry,
    options.selectedSubject,
    options.selectedGrade,
    options.selectedStream,
    options.userGrade,
    options.isAdmin,
  ];

  const query = useQuery({
    queryKey,
    queryFn: () => fetchPosts(options),
    staleTime: 30 * 1000, // 30 seconds
    gcTime: 5 * 60 * 1000, // 5 minutes (formerly cacheTime)
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
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
          // Debounce invalidation to prevent excessive refetches
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

export const useUserData = () => {
  return useQuery({
    queryKey: ["currentUser"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return { user: null, grade: null, isAdmin: false };

      const [profileResult, roleResult] = await Promise.all([
        supabase.from("profiles").select("grade").eq("id", user.id).single(),
        supabase.from("user_roles").select("role").eq("user_id", user.id).eq("role", "admin").single(),
      ]);

      return {
        user,
        grade: profileResult.data?.grade || null,
        isAdmin: !!roleResult.data,
      };
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
  });
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
