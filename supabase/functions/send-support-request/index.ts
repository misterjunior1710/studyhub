import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";
import { Resend } from "https://esm.sh/resend@2.0.0";

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

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { name, email, category, subject, message }: SupportRequest = await req.json();

    // Validate required fields
    if (!name || !email || !category || !subject || !message) {
      console.error("Missing required fields:", { name, email, category, subject, message: !!message });
      return new Response(
        JSON.stringify({ error: "All fields are required" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      console.error("Invalid email format:", email);
      return new Response(
        JSON.stringify({ error: "Invalid email format" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

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

    // Insert support request into database
    const { data, error: dbError } = await supabase
      .from("support_requests")
      .insert({
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
        const timestamp = new Date().toLocaleString("en-US", {
          dateStyle: "full",
          timeStyle: "short",
        });

        const emailResponse = await resend.emails.send({
          from: "StudyHub Support <onboarding@resend.dev>",
          to: ["studyhub.community.web@gmail.com"],
          subject: `[Support Request] ${category}: ${subject}`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #7c3aed;">New Support Request</h2>
              <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <p><strong>From:</strong> ${name}</p>
                <p><strong>Email:</strong> <a href="mailto:${email}">${email}</a></p>
                <p><strong>Category:</strong> ${category}</p>
                <p><strong>Subject:</strong> ${subject}</p>
                <p><strong>Submitted:</strong> ${timestamp}</p>
                <p><strong>Request ID:</strong> ${data.id}</p>
              </div>
              <h3 style="color: #374151;">Message:</h3>
              <div style="background-color: #fff; padding: 20px; border: 1px solid #e5e7eb; border-radius: 8px;">
                <p style="white-space: pre-wrap;">${message}</p>
              </div>
              <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;" />
              <p style="color: #6b7280; font-size: 14px;">
                Reply directly to this email or contact the user at <a href="mailto:${email}">${email}</a>
              </p>
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
