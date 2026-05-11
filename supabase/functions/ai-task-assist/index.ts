// Lovable AI–powered productivity assistant for the Tasks workspace.
// Actions:
//   - "breakdown": split a task into 3-7 actionable subtasks
//   - "schedule": suggest time blocks across upcoming tasks
//   - "prioritize": reorder a list of pending tasks by urgency/impact
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
const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;
const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY")!;

async function callAI(messages: Array<{ role: string; content: string }>) {
  const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${LOVABLE_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "google/gemini-2.5-flash",
      messages,
      response_format: { type: "json_object" },
    }),
  });
  if (res.status === 429) throw new Response(JSON.stringify({ error: "Rate limit reached. Try again in a moment." }), { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  if (res.status === 402) throw new Response(JSON.stringify({ error: "AI credits exhausted. Add credits in Workspace settings." }), { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  if (!res.ok) {
    const txt = await res.text();
    console.error("[ai-task-assist] gateway error", res.status, txt);
    throw new Response(JSON.stringify({ error: "AI service error" }), { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
  const data = await res.json();
  const raw = data?.choices?.[0]?.message?.content ?? "{}";
  try { return JSON.parse(raw); }
  catch { return { _raw: raw }; }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json(405, { error: "Method not allowed" });

  // Auth check
  const auth = req.headers.get("Authorization");
  if (!auth?.startsWith("Bearer ")) return json(401, { error: "Unauthorized" });
  const client = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    global: { headers: { Authorization: auth } },
  });
  const { data: claims, error: authErr } = await client.auth.getClaims(auth.slice(7));
  if (authErr || !claims?.claims?.sub) return json(401, { error: "Unauthorized" });

  if (!LOVABLE_API_KEY) return json(500, { error: "AI not configured" });

  let body: any;
  try { body = await req.json(); } catch { return json(400, { error: "Invalid JSON" }); }

  const action = body?.action;

  try {
    if (action === "breakdown") {
      const title = String(body.title ?? "").slice(0, 200).trim();
      const notes = String(body.notes ?? "").slice(0, 1000).trim();
      const dueAt = body.due_at ? String(body.due_at) : null;
      if (!title) return json(400, { error: "title required" });

      const result = await callAI([
        {
          role: "system",
          content:
            "You are a study productivity coach for students. Break down a task into 3–7 specific, actionable subtasks ordered chronologically. Each subtask should take 10–60 minutes. Reply with strict JSON: {\"subtasks\":[{\"title\":string,\"estimated_minutes\":number}],\"tip\":string}. Tip is one short motivating sentence.",
        },
        {
          role: "user",
          content: `Task: ${title}\nNotes: ${notes || "(none)"}\nDue: ${dueAt ?? "no deadline"}`,
        },
      ]);
      return json(200, result);
    }

    if (action === "schedule") {
      const tasks = Array.isArray(body.tasks) ? body.tasks.slice(0, 30) : [];
      if (tasks.length === 0) return json(400, { error: "tasks required" });
      const summary = tasks
        .map((t: any, i: number) =>
          `${i + 1}. [${t.priority}/${t.category}] ${String(t.title).slice(0, 120)} — due ${t.due_at ?? "no date"}`
        )
        .join("\n");

      const result = await callAI([
        {
          role: "system",
          content:
            "You are a study scheduler. Given a student's pending tasks, propose study blocks for the next 3 days using realistic 25–90 minute focus sessions and short breaks. Detect overload (>5h scheduled per day) and call it out. Reply with strict JSON: {\"blocks\":[{\"day\":string,\"start_time\":string,\"duration_minutes\":number,\"task_title\":string,\"why\":string}],\"warnings\":string[],\"summary\":string}.",
        },
        { role: "user", content: `Now: ${new Date().toISOString()}\nTasks:\n${summary}` },
      ]);
      return json(200, result);
    }

    if (action === "prioritize") {
      const tasks = Array.isArray(body.tasks) ? body.tasks.slice(0, 50) : [];
      if (tasks.length === 0) return json(400, { error: "tasks required" });
      const summary = tasks
        .map((t: any) =>
          `id=${t.id} title="${String(t.title).slice(0, 100)}" priority=${t.priority} category=${t.category} due=${t.due_at ?? "none"}`
        )
        .join("\n");

      const result = await callAI([
        {
          role: "system",
          content:
            "You are a productivity coach. Reorder tasks by urgency × impact for a student. Reply with strict JSON: {\"order\":[{\"id\":string,\"reason\":string}],\"insight\":string}.",
        },
        { role: "user", content: `Now: ${new Date().toISOString()}\nTasks:\n${summary}` },
      ]);
      return json(200, result);
    }

    return json(400, { error: "Unknown action" });
  } catch (e) {
    if (e instanceof Response) return e;
    console.error("[ai-task-assist] error", e);
    return json(500, { error: "Internal error" });
  }
});
