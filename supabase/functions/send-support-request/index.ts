import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";
import { z } from "https://deno.land/x/zod@v3.23.8/mod.ts";
import { checkRateLimit, rateLimitedResponse } from "../_shared/rateLimit.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface SupportRequest {
  name: string;
  email: string;
  category: string;
  subject: string;
  message: string;
}

const supportRequestSchema = z.object({
  name: z.string().trim().min(2).max(100),
  // email is accepted but ignored — the verified JWT email is always used
  email: z.string().trim().email().max(255).optional(),
  category: z.enum(["general", "technical", "account", "login", "password", "bug", "feature", "groups", "content", "moderation", "other"]),
  subject: z.string().trim().min(5).max(200),
  message: z.string().trim().min(20).max(2000),
});

const escapeHtml = (value: string) =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const parsed = supportRequestSchema.safeParse(await req.json().catch(() => null));
    if (!parsed.success) {
      return new Response(
        JSON.stringify({ error: "Please check the form fields and try again" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const { name, category, subject, message } = parsed.data;

    // Create Supabase client with service role key
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!supabaseUrl || !supabaseServiceKey) {
      console.error("Missing Supabase environment variables");
      return new Response(
        JSON.stringify({ error: "Server configuration error" }),
        { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const authHeader = req.headers.get("Authorization");
    const token = authHeader?.replace("Bearer ", "");
    if (!token) {
      return new Response(
        JSON.stringify({ error: "Please sign in to contact support" }),
        { status: 401, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user || !user.email) {
      return new Response(
        JSON.stringify({ error: "Please sign in again to contact support" }),
        { status: 401, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Rate limit: 5 support requests per hour per user
    const rl = await checkRateLimit({ userId: user.id, bucket: "send-support-request", max: 5, windowSeconds: 3600 });
    if (!rl.allowed) return rateLimitedResponse(rl.retryAfterSeconds, corsHeaders);

    // SECURITY: Always use the verified email from the JWT, never trust the client
    const email = user.email;

    // Insert support request into database
    const { data, error: dbError } = await supabase
      .from("support_requests")
      .insert({
        user_id: user.id,
        name,
        email,
        category,
        subject,
        message,
        status: "pending"
      })
      .select()
      .single();

    if (dbError) {
      console.error("Failed to save support request:", dbError);
      return new Response(
        JSON.stringify({ error: "Failed to save support request" }),
        { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    console.log("Support request saved successfully:", data.id);

    // Enqueue email notification to support inbox
    const SUPPORT_INBOX = "studyhub.community.web@gmail.com";
    const SITE_NAME = "StudyHub";
    const SENDER_DOMAIN = "notify.studyhub.world";
    const FROM_DOMAIN = "studyhub.world";

    const safeName = escapeHtml(name);
    const safeEmail = escapeHtml(email);
    const safeCategory = escapeHtml(category);
    const safeSubject = escapeHtml(subject);
    const safeMessage = escapeHtml(message).replace(/\n/g, "<br/>");

    const html = `<!DOCTYPE html><html><body style="font-family:Arial,sans-serif;background:#f6f7fb;padding:24px;">
      <div style="max-width:600px;margin:0 auto;background:#fff;border-radius:12px;padding:32px;">
        <h2 style="color:#4f46e5;margin:0 0 16px;">New Support Request</h2>
        <p style="margin:4px 0;"><strong>From:</strong> ${safeName} &lt;${safeEmail}&gt;</p>
        <p style="margin:4px 0;"><strong>Category:</strong> ${safeCategory}</p>
        <p style="margin:4px 0;"><strong>Subject:</strong> ${safeSubject}</p>
        <p style="margin:4px 0;"><strong>Request ID:</strong> ${data.id}</p>
        <hr style="border:none;border-top:1px solid #eee;margin:20px 0;" />
        <div style="color:#333;line-height:1.6;">${safeMessage}</div>
        <hr style="border:none;border-top:1px solid #eee;margin:20px 0;" />
        <p style="color:#888;font-size:12px;">Reply directly to ${safeEmail} to respond to this user.</p>
      </div></body></html>`;

    const text = `New Support Request\n\nFrom: ${name} <${email}>\nCategory: ${category}\nSubject: ${subject}\nRequest ID: ${data.id}\n\n${message}\n\nReply to ${email} to respond.`;

    const messageId = crypto.randomUUID();

    await supabase.from("email_send_log").insert({
      message_id: messageId,
      template_name: "support_request",
      recipient_email: SUPPORT_INBOX,
      status: "pending",
    });

    const { error: enqueueError } = await supabase.rpc("enqueue_email", {
      queue_name: "transactional_emails",
      payload: {
        message_id: messageId,
        to: SUPPORT_INBOX,
        from: `${SITE_NAME} Support <noreply@${FROM_DOMAIN}>`,
        reply_to: email,
        sender_domain: SENDER_DOMAIN,
        subject: `[Support][${category}] ${subject}`,
        html,
        text,
        purpose: "transactional",
        label: "support_request",
        queued_at: new Date().toISOString(),
      },
    });

    if (enqueueError) {
      console.error("Failed to enqueue support email:", enqueueError);
      // Don't fail the request — submission was saved
    }

    return new Response(
      JSON.stringify({ success: true, message: "Support request submitted successfully", id: data.id }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  } catch (error: any) {
    console.error("[send-support-request]", error);
    return new Response(
      JSON.stringify({ error: "Failed to submit support request" }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);
