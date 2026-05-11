import { useEffect, useState, useCallback, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export interface TransitionModule {
  id: string;
  slug: string;
  title: string;
  phase: string;
  description: string;
  icon: string;
  accent: string;
  order_index: number;
}
export interface TransitionTopic {
  id: string;
  module_id: string;
  slug: string;
  title: string;
  description: string;
  icon: string;
  order_index: number;
}
export interface TransitionLesson {
  id: string;
  topic_id: string;
  title: string;
  content: string;
  lesson_type: string;
  estimated_minutes: number;
  order_index: number;
}

export const useTransitionsContent = () => {
  const [modules, setModules] = useState<TransitionModule[]>([]);
  const [topics, setTopics] = useState<TransitionTopic[]>([]);
  const [lessons, setLessons] = useState<TransitionLesson[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    (async () => {
      setLoading(true);
      const [m, t, l] = await Promise.all([
        supabase.from("transition_modules" as any).select("*").order("order_index"),
        supabase.from("transition_topics" as any).select("*").order("order_index"),
        supabase.from("transition_lessons" as any).select("*").order("order_index"),
      ]);
      if (!active) return;
      if (m.error || t.error || l.error) {
        toast.error("Couldn't load life skills content");
      } else {
        setModules((m.data ?? []) as any);
        setTopics((t.data ?? []) as any);
        setLessons((l.data ?? []) as any);
      }
      setLoading(false);
    })();
    return () => {
      active = false;
    };
  }, []);

  return { modules, topics, lessons, loading };
};

export const useLessonProgress = () => {
  const { user } = useAuth();
  const [completed, setCompleted] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!user) {
      setCompleted(new Set());
      setLoading(false);
      return;
    }
    const { data, error } = await supabase
      .from("user_lesson_progress" as any)
      .select("lesson_id, completed")
      .eq("user_id", user.id);
    if (!error && data) {
      setCompleted(new Set((data as any[]).filter((r) => r.completed).map((r) => r.lesson_id)));
    }
    setLoading(false);
  }, [user]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  // Realtime sync
  useEffect(() => {
    if (!user) return;
    const ch = supabase
      .channel(`lesson-progress:${user.id}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "user_lesson_progress", filter: `user_id=eq.${user.id}` },
        () => void refresh(),
      )
      .subscribe();
    return () => {
      void supabase.removeChannel(ch);
    };
  }, [user, refresh]);

  const toggleLesson = useCallback(
    async (lessonId: string) => {
      if (!user) {
        toast.error("Sign in to track progress");
        return;
      }
      const isDone = completed.has(lessonId);
      // optimistic
      setCompleted((prev) => {
        const next = new Set(prev);
        if (isDone) next.delete(lessonId);
        else next.add(lessonId);
        return next;
      });
      if (isDone) {
        await supabase.from("user_lesson_progress" as any).delete().eq("user_id", user.id).eq("lesson_id", lessonId);
      } else {
        await supabase
          .from("user_lesson_progress" as any)
          .upsert({ user_id: user.id, lesson_id: lessonId, completed: true, completed_at: new Date().toISOString() }, { onConflict: "user_id,lesson_id" });
        toast.success("Nice — lesson done!");
      }
    },
    [user, completed],
  );

  return { completed, loading, toggleLesson };
};

export const computeModuleProgress = (
  moduleId: string,
  topics: TransitionTopic[],
  lessons: TransitionLesson[],
  completed: Set<string>,
) => {
  const moduleTopicIds = topics.filter((t) => t.module_id === moduleId).map((t) => t.id);
  const moduleLessons = lessons.filter((l) => moduleTopicIds.includes(l.topic_id));
  const total = moduleLessons.length;
  const done = moduleLessons.filter((l) => completed.has(l.id)).length;
  return { total, done, pct: total === 0 ? 0 : Math.round((done / total) * 100) };
};

export const useModuleProgress = (
  moduleId: string | undefined,
  topics: TransitionTopic[],
  lessons: TransitionLesson[],
  completed: Set<string>,
) =>
  useMemo(() => (moduleId ? computeModuleProgress(moduleId, topics, lessons, completed) : { total: 0, done: 0, pct: 0 }), [
    moduleId,
    topics,
    lessons,
    completed,
  ]);
