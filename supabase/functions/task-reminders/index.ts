// Polls tasks with due reminders and dispatches a web-push notification.
// Designed to be invoked by pg_cron every minute.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const json = (status: number, body: unknown) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const admin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

interface TaskRow {
  id: string;
  user_id: string;
  title: string;
  category: string;
  due_at: string | null;
  reminder_at: string;
}

const CAT_EMOJI: Record<string, string> = {
  assignment: "📝", exam: "📊", study: "📚", personal: "🎯",
  transition: "🌱", habit: "🔁", other: "✨",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST" && req.method !== "GET") {
    return json(405, { error: "Method not allowed" });
  }

  // Require shared secret so only the cron / authorized callers can trigger reminders
  const cronSecret = Deno.env.get("INTERNAL_PUSH_SECRET");
  const callerSecret = req.headers.get("x-cron-secret");
  if (!cronSecret || callerSecret !== cronSecret) {
    return json(401, { error: "Unauthorized" });
  }

  const startedAt = Date.now();
  const nowIso = new Date().toISOString();

  // Fetch up to 200 tasks whose reminder is due (within the last 24h to avoid backfill spam)
  // and that haven't been reminded yet (or were rolled over by a recurring completion).
  const { data: due, error } = await admin
    .from("tasks")
    .select("id, user_id, title, category, due_at, reminder_at")
    .eq("status", "pending")
    .lte("reminder_at", nowIso)
    .gte("reminder_at", new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
    .is("last_reminded_at", null)
    .limit(200);

  if (error) {
    console.error("[task-reminders] query failed", error);
    return json(500, { error: error.message });
  }

  const tasks = (due ?? []) as TaskRow[];
  if (tasks.length === 0) {
    return json(200, { ok: true, processed: 0, took_ms: Date.now() - startedAt });
  }

  let pushed = 0;
  let notified = 0;
  let failed = 0;

  await Promise.all(tasks.map(async (t) => {
    const emoji = CAT_EMOJI[t.category] || "🔔";
    const title = `${emoji} Reminder: ${t.title}`;
    const body = t.due_at
      ? `Due ${new Date(t.due_at).toLocaleString()}`
      : "Time to get on it.";

    try {
      // 1. In-app notification (idempotent via dedupe_key)
      const dedupe = `task_reminder:${t.id}:${t.reminder_at}`;
      await admin.from("notifications").insert({
        user_id: t.user_id,
        type: "task_reminder",
        content: title,
        dedupe_key: dedupe,
      }).then(({ error: nErr }) => {
        if (nErr && nErr.code !== "23505") console.warn("[task-reminders] notif insert", nErr);
        else if (!nErr) notified++;
      });

      // 2. Web push via existing edge function
      const pushRes = await fetch(`${SUPABASE_URL}/functions/v1/web-push`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${SERVICE_ROLE_KEY}`,
          apikey: SERVICE_ROLE_KEY,
        },
        body: JSON.stringify({
          action: "notify-user",
          userId: t.user_id,
          title,
          body,
          url: "/tasks",
          tag: `task:${t.id}`,
        }),
      });
      if (pushRes.ok) pushed++;
      else {
        failed++;
        console.warn("[task-reminders] push failed", t.id, pushRes.status, await pushRes.text());
      }
    } catch (e) {
      failed++;
      console.error("[task-reminders] dispatch error", t.id, e);
    }

    // 3. Mark reminded so we never double-fire
    await admin.from("tasks").update({ last_reminded_at: nowIso }).eq("id", t.id);
  }));

  return json(200, {
    ok: true,
    processed: tasks.length,
    pushed,
    notified,
    failed,
    took_ms: Date.now() - startedAt,
  });
});
