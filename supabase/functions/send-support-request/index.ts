import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";
import { Resend } from "https://esm.sh/resend@2.0.0";
import { z } from "https://deno.land/x/zod@v3.23.8/mod.ts";

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
  email: z.string().trim().email().max(255),
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

    const { name, email, category, subject, message }: SupportRequest = parsed.data;

    console.log("Processing support request from:", email, "Category:", category);

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
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: "Please sign in again to contact support" }),
        { status: 401, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

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

    // Send email notification using Resend
    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    if (resendApiKey) {
      try {
        const resend = new Resend(resendApiKey);
        
        // Convert to IST (UTC+5:30)
        const now = new Date();
        const istOffset = 5.5 * 60 * 60 * 1000;
        const istDate = new Date(now.getTime() + istOffset);
        const day = istDate.getUTCDate();
        const month = istDate.toLocaleString("en-US", { month: "short", timeZone: "UTC" });
        const year = istDate.getUTCFullYear();
        const hours = istDate.getUTCHours();
        const minutes = istDate.getUTCMinutes();
        const ampm = hours >= 12 ? "PM" : "AM";
        const displayHour = hours % 12 || 12;
        const time = `${displayHour}:${minutes.toString().padStart(2, "0")} ${ampm}`;
        const timestamp = `${day} ${month} ${year} · ${time}`;
        
        // Capitalize first letter of each word in category
        const formattedCategory = category.split(' ')
          .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
          .join(' ');
        const safeName = escapeHtml(name);
        const safeEmail = escapeHtml(email);
        const safeCategory = escapeHtml(formattedCategory);
        const safeMessage = escapeHtml(message);

        const emailResponse = await resend.emails.send({
          from: "StudyHub Support <onboarding@resend.dev>",
          to: ["studyhub.community.web@gmail.com"],
          subject: `New Support Request Received — ${formattedCategory} | ${subject}`,
          html: `
            <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff;">
              <!-- Header -->
              <div style="background-color: #0e7490; padding: 24px 32px; border-radius: 8px 8px 0 0;">
                <h1 style="color: #ffffff; margin: 0; font-size: 20px; font-weight: 600;">🎓 StudyHub Support</h1>
                <p style="color: #cffafe; margin: 8px 0 0 0; font-size: 14px;">New Support Request</p>
              </div>
              
              <!-- Content -->
              <div style="padding: 32px;">
                <!-- Request Summary Card -->
                <h2 style="color: #0e7490; font-size: 14px; font-weight: 600; margin: 0 0 16px 0; text-transform: uppercase; letter-spacing: 0.5px;">Request Summary</h2>
                <div style="background-color: #f1f5f9; padding: 24px; border-radius: 8px; margin-bottom: 24px;">
                  <p style="margin: 0 0 8px 0; color: #1e293b; font-size: 15px;"><strong>From:</strong> ${safeName}</p>
                  <p style="margin: 0 0 16px 0; color: #1e293b; font-size: 15px;"><strong>Email:</strong> <a href="mailto:${safeEmail}" style="color: #0891b2; text-decoration: none;">${safeEmail}</a></p>
                  <p style="margin: 0 0 8px 0; color: #1e293b; font-size: 15px;"><strong>Category:</strong> ${safeCategory}</p>
                  <p style="margin: 0 0 8px 0; color: #1e293b; font-size: 15px;"><strong>Submitted:</strong> ${timestamp}</p>
                  <p style="margin: 0; color: #64748b; font-size: 13px;"><strong>Request ID:</strong> ${data.id}</p>
                </div>
                
                <!-- Message Section -->
                <h2 style="color: #0e7490; font-size: 14px; font-weight: 600; margin: 0 0 16px 0; text-transform: uppercase; letter-spacing: 0.5px;">📝 Message</h2>
                <div style="background-color: #ffffff; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
                  <p style="margin: 0; color: #1e293b; font-size: 15px; line-height: 1.6; white-space: pre-wrap;">${safeMessage}</p>
                </div>
              </div>
              
              <!-- Footer -->
              <div style="background-color: #f8fafc; padding: 24px 32px; border-top: 1px solid #e2e8f0; border-radius: 0 0 8px 8px;">
                <p style="margin: 0 0 12px 0; color: #64748b; font-size: 13px; line-height: 1.5;">
                  You're receiving this because a support request was submitted on StudyHub.
                </p>
                <p style="margin: 0 0 16px 0; color: #64748b; font-size: 13px; line-height: 1.5;">
                  Need to reply? Just respond to this email directly by contacting the user at <a href="mailto:${safeEmail}" style="color: #0891b2; text-decoration: none;">${safeEmail}</a>
                </p>
                <p style="margin: 0; color: #94a3b8; font-size: 12px;">
                  © 2025 StudyHub • Support Team
                </p>
              </div>
            </div>
          `,
        });

        if (emailResponse.error) {
          console.error("Resend API error:", emailResponse.error);
        } else {
          console.log("Email notification sent successfully:", emailResponse.data);
        }
      } catch (emailError: any) {
        console.error("Failed to send email notification:", emailError.message);
        // Don't fail the request if email fails - the data is already saved
      }
    } else {
      console.warn("RESEND_API_KEY not configured, skipping email notification");
    }

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
