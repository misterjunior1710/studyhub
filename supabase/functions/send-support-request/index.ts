import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

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

const SUPPORT_EMAIL = "support@yourdomain.com"; // Update this to your actual support email

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

    // Send email to support team
    const supportEmailResponse = await resend.emails.send({
      from: "StudyHub Support <onboarding@resend.dev>",
      to: [SUPPORT_EMAIL],
      subject: `[${category}] ${subject}`,
      html: `
        <h2>New Support Request</h2>
        <p><strong>From:</strong> ${name} (${email})</p>
        <p><strong>Category:</strong> ${category}</p>
        <p><strong>Subject:</strong> ${subject}</p>
        <hr/>
        <h3>Message:</h3>
        <p>${message.replace(/\n/g, '<br/>')}</p>
        <hr/>
        <p style="color: #666; font-size: 12px;">This message was sent via the StudyHub Support form.</p>
      `,
    });

    if (supportEmailResponse.error) {
      console.error("Failed to send support email:", supportEmailResponse.error);
      throw new Error("Failed to send email to support team");
    }

    console.log("Support email sent successfully:", supportEmailResponse);

    // Send confirmation email to user
    const confirmationEmailResponse = await resend.emails.send({
      from: "StudyHub <onboarding@resend.dev>",
      to: [email],
      subject: "We received your support request",
      html: `
        <h2>Thank you for contacting us, ${name}!</h2>
        <p>We have received your support request and will get back to you as soon as possible.</p>
        <p><strong>Category:</strong> ${category}</p>
        <p><strong>Subject:</strong> ${subject}</p>
        <hr/>
        <p>Your message:</p>
        <blockquote style="border-left: 3px solid #ccc; padding-left: 10px; color: #666;">
          ${message.replace(/\n/g, '<br/>')}
        </blockquote>
        <hr/>
        <p>Best regards,<br/>The StudyHub Team</p>
      `,
    });

    if (confirmationEmailResponse.error) {
      console.warn("Failed to send confirmation email:", confirmationEmailResponse.error);
      // Don't throw - support email was sent successfully
    } else {
      console.log("Confirmation email sent successfully:", confirmationEmailResponse);
    }

    return new Response(
      JSON.stringify({ success: true, message: "Support request sent successfully" }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  } catch (error: any) {
    console.error("Error in send-support-request function:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Failed to send support request" }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);
