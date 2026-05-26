// AI Assistant for StudyHub — academic companion, navigator, productivity coach.
// Saves user + assistant messages to assistant_messages, updates thread metadata,
// and returns the assistant reply as JSON.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { z } from "https://deno.land/x/zod@v3.23.8/mod.ts";
import { checkRateLimit, rateLimitedResponse } from "../_shared/rateLimit.ts";
import { consumeQuota, quotaExceededResponse } from "../_shared/pro.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};
const json = (status: number, body: unknown) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;
const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY")!;

const PLATFORM_MAP = `
StudyHub key pages and what they're for:
- /            Home dashboard (gamification, tasks widget, leaderboard)
- /feed        Community study feed (posts from peers)
- /questions   Q&A hub for asking and answering academic questions
- /groups      Browse and join Study Squads (study groups)
- /tasks       Productivity & to-do system (deadlines, recurrence, AI breakdowns)
- /calendar    Study event calendar with RSVP
- /study       Study Mode toolkit (Flashcards, Quizzes, Mind Maps, Pomodoro)
- /content-generator  AI study content generator (notes, summaries, PDF export)
- /notes       Personal notes
- /whiteboards Collaborative whiteboards
- /missions    Daily missions and gamification missions
- /leaderboard Global leaderboard
- /saved       Saved posts
- /friends     Friends list and DMs
- /updates     Platform announcements
- /settings    Account, notifications, theme, password reset
- /support     Help center / report issues
- /install     Install the app (PWA)
`;

const SYSTEM_PROMPT = `You are Nova, the StudyHub AI assistant — a friendly, motivating, and intelligent companion for students aged 13+.

Your roles, in priority order:
1. Platform navigator: help users find features inside StudyHub.
2. Academic tutor: explain concepts in clear, student-friendly language. Guide reasoning, do NOT just hand over answers for homework. Encourage understanding.
3. Productivity coach: when the user has tasks/deadlines, give realistic advice on prioritization, schedules, and recovery from burnout.
4. Support helper: for bugs/account issues, point users to /settings or /support and outline next steps.

Style rules:
- Be warm, concise, conversational. No corporate jargon.
- Use Markdown: short paragraphs, bold key terms, bullet lists when listing >2 items.
- When suggesting a page, link it clearly like: [Open Tasks](/tasks).
- Never invent platform features that aren't in the platform map below.
- Refuse unsafe content (self-harm, illegal, sexual content involving minors, hate). For self-harm, gently encourage talking to a trusted adult or local helpline.
- Keep replies tight: ~120 words unless the user explicitly asks for depth.

${PLATFORM_MAP}`;

async function callAI(messages: Array<{ role: string; content: unknown }>) {
  const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({ model: "google/gemini-2.5-flash", messages }),
  });
  if (res.status === 429) throw new Response(JSON.stringify({ error: "Rate limit reached. Try again in a moment." }), { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  if (res.status === 402) throw new Response(JSON.stringify({ error: "AI credits exhausted." }), { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  if (!res.ok) {
    const txt = await res.text();
    console.error("[ai-assistant] gateway error", res.status, txt);
    throw new Response(JSON.stringify({ error: "AI service error" }), { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
  const data = await res.json();
  return data?.choices?.[0]?.message?.content ?? "";
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json(405, { error: "Method not allowed" });

  const auth = req.headers.get("Authorization");
  if (!auth?.startsWith("Bearer ")) return json(401, { error: "Unauthorized" });

  const userClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    global: { headers: { Authorization: auth } },
  });
  const { data: userData, error: authErr } = await userClient.auth.getUser(auth.slice(7));
  const userId = userData?.user?.id;
  if (authErr || !userId) return json(401, { error: "Unauthorized" });
  if (!LOVABLE_API_KEY) return json(500, { error: "AI not configured" });

  // Rate limit: 30 AI assistant messages per 5 minutes per user
  const rl = await checkRateLimit({ userId, bucket: "ai-assistant", max: 30, windowSeconds: 300 });
  if (!rl.allowed) return rateLimitedResponse(rl.retryAfterSeconds, corsHeaders);

  // Free tier: 3 Nova messages per day. Pro: unlimited.
  const quota = await consumeQuota({ userId, bucket: "nova_chat", freeLimit: 3 });
  if (!quota.allowed) return quotaExceededResponse("nova_chat", quota.limit, corsHeaders);

  let body: any;
  try { body = await req.json(); } catch { return json(400, { error: "Invalid JSON" }); }

  const schema = z.object({
    message: z.string().trim().min(1).max(200_000),
    route: z.string().max(200).optional(),
    thread_id: z.string().uuid().optional().nullable(),
    images: z
      .array(
        z.object({
          name: z.string().max(200).optional(),
          mime_type: z.string().max(100).optional(),
          data_url: z.string().startsWith("data:").max(8_000_000),
        }),
      )
      .max(5)
      .optional(),
  });
  const parsed = schema.safeParse(body);
  if (!parsed.success) return json(400, { error: "Invalid input", details: parsed.error.flatten() });

  const message = parsed.data.message;
  const route = parsed.data.route ?? "/";
  let threadId: string | null = parsed.data.thread_id ?? null;

  const admin = createClient(SUPABASE_URL, SERVICE_ROLE);

  // Ensure thread exists (and belongs to user).
  if (threadId) {
    const { data: t } = await admin.from("assistant_threads").select("id,user_id").eq("id", threadId).maybeSingle();
    if (!t || t.user_id !== userId) return json(403, { error: "Thread not accessible" });
  } else {
    const title = message.length > 60 ? message.slice(0, 57) + "…" : message;
    const { data: created, error: cErr } = await admin
      .from("assistant_threads")
      .insert({ user_id: userId, title })
      .select("id").single();
    if (cErr || !created) return json(500, { error: "Could not start conversation" });
    threadId = created.id;
  }

  // Pull last 20 messages for context.
  const { data: history } = await admin
    .from("assistant_messages")
    .select("role,content")
    .eq("thread_id", threadId)
    .order("created_at", { ascending: true })
    .limit(20);

  // Pull lightweight user context: profile + upcoming/overdue tasks.
  const [{ data: profile }, { data: tasks }] = await Promise.all([
    admin.from("profiles").select("username,country,grade,stream").eq("id", userId).maybeSingle(),
    admin.from("tasks").select("title,priority,category,due_at,status")
      .eq("user_id", userId).neq("status", "archived").neq("status", "completed")
      .order("due_at", { ascending: true, nullsFirst: false }).limit(10),
  ]);

  const now = new Date().toISOString();
  const ctxLines: string[] = [`Now: ${now}`, `Current page: ${route}`];
  if (profile) {
    const p = profile as any;
    ctxLines.push(`User: ${p.username ?? "Student"} | Country: ${p.country ?? "?"} | Grade: ${p.grade ?? "?"} | Stream: ${p.stream ?? "?"}`);
  }
  if (tasks && tasks.length) {
    ctxLines.push("Active tasks:");
    for (const t of tasks as any[]) {
      ctxLines.push(`- [${t.priority}/${t.category}] ${t.title} — due ${t.due_at ?? "no date"}`);
    }
  } else {
    ctxLines.push("Active tasks: none.");
  }

  const messages = [
    { role: "system", content: SYSTEM_PROMPT },
    { role: "system", content: `User context:\n${ctxLines.join("\n")}` },
    ...(history ?? []).map((h: any) => ({ role: h.role, content: h.content })),
    { role: "user", content: message },
  ];

  let reply = "";
  try {
    reply = await callAI(messages);
  } catch (e) {
    if (e instanceof Response) return e;
    console.error("[ai-assistant]", e);
    return json(500, { error: "Internal error" });
  }

  // Persist user + assistant messages and bump thread activity.
  const nowIso = new Date().toISOString();
  await admin.from("assistant_messages").insert([
    { thread_id: threadId, user_id: userId, role: "user", content: message },
    { thread_id: threadId, user_id: userId, role: "assistant", content: reply },
  ]);
  await admin.from("assistant_threads").update({ last_message_at: nowIso }).eq("id", threadId);

  return json(200, { thread_id: threadId, reply });
});
