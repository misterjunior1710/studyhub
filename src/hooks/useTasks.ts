import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import type { Task } from "@/lib/tasks";
import { sortTasks, nextOccurrence } from "@/lib/tasks";
import { toast } from "sonner";

export const useTasks = () => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!user) {
      setTasks([]);
      setLoading(false);
      return;
    }
    const { data, error } = await supabase
      .from("tasks")
      .select("*")
      .neq("status", "archived")
      .order("created_at", { ascending: false });
    if (error) {
      console.error("[tasks] load failed", error);
      toast.error("Couldn't load tasks", { description: "Pull to refresh and try again." });
    } else {
      setTasks(sortTasks((data ?? []) as Task[]));
    }
    setLoading(false);
  }, [user]);

  useEffect(() => {
    setLoading(true);
    void refresh();
  }, [refresh]);

  // Realtime sync — keep tasks fresh across tabs/devices
  useEffect(() => {
    if (!user) return;
    const channel = supabase
      .channel(`tasks:${user.id}`)
      .on("postgres_changes",
        { event: "*", schema: "public", table: "tasks", filter: `user_id=eq.${user.id}` },
        () => { void refresh(); })
      .subscribe();
    return () => { void supabase.removeChannel(channel); };
  }, [user, refresh]);

  const createTask = useCallback(async (input: Partial<Task> & { title: string }) => {
    if (!user) return null;
    const { data, error } = await supabase.from("tasks").insert({
      user_id: user.id,
      title: input.title,
      notes: input.notes ?? null,
      category: input.category ?? "personal",
      priority: input.priority ?? "medium",
      tags: input.tags ?? [],
      due_at: input.due_at ?? null,
      reminder_at: input.reminder_at ?? null,
      rrule: input.rrule ?? null,
    }).select().single();
    if (error) {
      toast.error("Couldn't create task");
      return null;
    }
    toast.success("Task created");
    return data as Task;
  }, [user]);

  const updateTask = useCallback(async (id: string, patch: Partial<Task>) => {
    const { error } = await supabase.from("tasks").update(patch).eq("id", id);
    if (error) toast.error("Couldn't save changes");
  }, []);

  const completeTask = useCallback(async (task: Task) => {
    // For recurring tasks: roll the due date forward instead of marking complete forever
    if (task.rrule && task.due_at) {
      const next = nextOccurrence(task.rrule, new Date(task.due_at));
      if (next) {
        await updateTask(task.id, {
          due_at: next.toISOString(),
          reminder_at: task.reminder_at
            ? new Date(next.getTime() - (new Date(task.due_at).getTime() - new Date(task.reminder_at).getTime())).toISOString()
            : null,
          last_reminded_at: null,
        });
        toast.success("Nice! Rolled to the next occurrence.");
        return;
      }
    }
    await updateTask(task.id, { status: "completed", completed_at: new Date().toISOString() });
    toast.success("Task completed 🎉");
  }, [updateTask]);

  const reopenTask = useCallback(async (id: string) => {
    await updateTask(id, { status: "pending", completed_at: null });
  }, [updateTask]);

  const archiveTask = useCallback(async (id: string) => {
    await updateTask(id, { status: "archived" });
    toast.success("Archived");
  }, [updateTask]);

  const deleteTask = useCallback(async (id: string) => {
    const { error } = await supabase.from("tasks").delete().eq("id", id);
    if (error) toast.error("Couldn't delete task");
    else toast.success("Task deleted");
  }, []);

  return { tasks, loading, refresh, createTask, updateTask, completeTask, reopenTask, archiveTask, deleteTask };
};
