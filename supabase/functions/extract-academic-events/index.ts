import { createClient } from "npm:@supabase/supabase-js@2";
import { isPro } from "../_shared/pro.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY")!;
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

function bytesToBase64(bytes: Uint8Array): string {
  let binary = "";
  const chunk = 0x8000;
  for (let i = 0; i < bytes.length; i += chunk) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunk));
  }
  return btoa(binary);
}

const SYSTEM_PROMPT = `You are an academic schedule parser. Extract every class, exam, assignment deadline, and event from the provided file.
For each event return: title, type (one of: class, exam, assignment, event), date (YYYY-MM-DD), start_time (HH:MM 24h, optional), end_time (HH:MM 24h, optional), location (optional), description (optional).
If the document spans multiple weeks for a recurring class, emit one event per occurrence within the visible date range.
If a date is missing, omit that event. Always return strict JSON matching the schema. Do not invent details that aren't in the document.`;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) return json({ error: "Unauthorized" }, 401);

    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return json({ error: "Unauthorized" }, 401);

    const { filePath, importId } = await req.json();
    if (!filePath || !importId) return json({ error: "Missing filePath or importId" }, 400);

    // Ensure import row belongs to user
    const { data: imp, error: impErr } = await supabase
      .from("academic_imports").select("*").eq("id", importId).eq("user_id", user.id).single();
    if (impErr || !imp) return json({ error: "Import not found" }, 404);

    // Pro gate: image uploads are Pro-only. PDFs are allowed for all users.
    const incomingMime = (imp.mime_type || "").toLowerCase();
    if (incomingMime.startsWith("image/")) {
      const pro = await isPro(user.id);
      if (!pro) {
        await supabase.from("academic_imports")
          .update({ status: "failed", error: "Image uploads require Pro" })
          .eq("id", importId);
        return json({
          error: "pro_required",
          code: "pro_required",
          message: "Image scanning is a Pro feature. Upload a PDF or upgrade to Pro.",
          upgrade_url: "/pricing",
        }, 402);
      }
    }

    await supabase.from("academic_imports").update({ status: "processing" }).eq("id", importId);

    // Download file using service role (we've already verified ownership above)
    const adminClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    const { data: fileData, error: dlErr } = await adminClient.storage
      .from("academic-imports").download(filePath);
    if (dlErr || !fileData) {
      const msg = dlErr?.message ? `Could not read file: ${dlErr.message}` : "Could not read file";
      console.error("Storage download failed", { filePath, dlErr });
      await supabase.from("academic_imports").update({ status: "failed", error: msg }).eq("id", importId);
      return json({ error: msg }, 500);
    }

    const arrayBuf = await fileData.arrayBuffer();
    const base64 = bytesToBase64(new Uint8Array(arrayBuf));
    const mime = imp.mime_type || fileData.type || "application/octet-stream";
    const dataUrl = `data:${mime};base64,${base64}`;

    const userContent = mime.startsWith("image/") || mime === "application/pdf"
      ? [
          { type: "text", text: `Today's date is ${new Date().toISOString().slice(0,10)}. Extract all academic events from this file (${imp.file_name}).` },
          { type: "image_url", image_url: { url: dataUrl } },
        ]
      : [{ type: "text", text: `Extract academic events from file: ${imp.file_name}` }];

    const aiRes = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: userContent },
        ],
        tools: [{
          type: "function",
          function: {
            name: "submit_events",
            description: "Submit extracted academic events",
            parameters: {
              type: "object",
              properties: {
                events: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      title: { type: "string" },
                      type: { type: "string", enum: ["class", "exam", "assignment", "event"] },
                      date: { type: "string", description: "YYYY-MM-DD" },
                      start_time: { type: "string", description: "HH:MM 24h" },
                      end_time: { type: "string", description: "HH:MM 24h" },
                      location: { type: "string" },
                      description: { type: "string" },
                    },
                    required: ["title", "type", "date"],
                  },
                },
              },
              required: ["events"],
            },
          },
        }],
        tool_choice: { type: "function", function: { name: "submit_events" } },
      }),
    });

    if (!aiRes.ok) {
      const errText = await aiRes.text();
      const msg = aiRes.status === 429 ? "AI rate limit reached, try again shortly"
        : aiRes.status === 402 ? "AI credits exhausted"
        : `AI extraction failed (${aiRes.status})`;
      await supabase.from("academic_imports").update({ status: "failed", error: msg }).eq("id", importId);
      console.error("AI error", aiRes.status, errText);
      return json({ error: msg }, aiRes.status);
    }

    const aiJson = await aiRes.json();
    const toolCall = aiJson.choices?.[0]?.message?.tool_calls?.[0];
    const args = toolCall?.function?.arguments;
    let parsed: { events: any[] } = { events: [] };
    if (args) {
      try { parsed = JSON.parse(args); } catch { parsed = { events: [] }; }
    }

    await supabase.from("academic_imports").update({ status: "extracted", event_count: parsed.events.length }).eq("id", importId);

    return json({ events: parsed.events });
  } catch (e) {
    console.error("extract-academic-events error", e);
    return json({ error: (e as Error).message || "Unexpected error" }, 500);
  }
});

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
