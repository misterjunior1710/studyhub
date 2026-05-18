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

    return new Response(
      JSON.stringify({ success: true, message: "Support request submitted successfully", id: data.id }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  } catch (error: any) {
    console.error("Error in send-support-request function:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Failed to submit support request" }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);
