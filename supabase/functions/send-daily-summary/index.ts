import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("Starting daily summary report...");

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get today's date range
    const today = new Date();
    const startOfDay = new Date(today.setHours(0, 0, 0, 0)).toISOString();
    const endOfDay = new Date(today.setHours(23, 59, 59, 999)).toISOString();

    // Fetch today's stats
    const [postsResult, reportsResult, usersResult, flaggedResult] = await Promise.all([
      supabase.from("posts").select("id", { count: "exact" }).gte("created_at", startOfDay).lte("created_at", endOfDay),
      supabase.from("reports").select("id", { count: "exact" }).gte("created_at", startOfDay).lte("created_at", endOfDay),
      supabase.from("profiles").select("id", { count: "exact" }).gte("created_at", startOfDay).lte("created_at", endOfDay),
      supabase.from("posts").select("id", { count: "exact" }).eq("is_flagged", true),
    ]);

    const newPosts = postsResult.count || 0;
    const newReports = reportsResult.count || 0;
    const newUsers = usersResult.count || 0;
    const flaggedPosts = flaggedResult.count || 0;

    // Get total counts
    const [totalPostsResult, totalUsersResult, pendingReportsResult] = await Promise.all([
      supabase.from("posts").select("id", { count: "exact" }),
      supabase.from("profiles").select("id", { count: "exact" }),
      supabase.from("reports").select("id", { count: "exact" }).eq("status", "pending"),
    ]);

    const totalPosts = totalPostsResult.count || 0;
    const totalUsers = totalUsersResult.count || 0;
    const pendingReports = pendingReportsResult.count || 0;

    console.log("Stats fetched:", { newPosts, newReports, newUsers, flaggedPosts, totalPosts, totalUsers, pendingReports });

    // EmailJS configuration
    const serviceId = Deno.env.get("VITE_EMAILJS_SERVICE_ID");
    const templateId = Deno.env.get("EMAILJS_DAILY_TEMPLATE_ID");
    const publicKey = Deno.env.get("VITE_EMAILJS_PUBLIC_KEY");

    if (!serviceId || !templateId || !publicKey) {
      console.error("EmailJS not configured for daily summary");
      return new Response(
        JSON.stringify({ success: false, message: "EmailJS not configured" }),
        { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Format date for email
    const dateStr = new Date().toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    // Send email via EmailJS
    const emailResponse = await fetch("https://api.emailjs.com/api/v1.0/email/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        service_id: serviceId,
        template_id: templateId,
        user_id: publicKey,
        template_params: {
          date: dateStr,
          new_posts: newPosts,
          new_users: newUsers,
          new_reports: newReports,
          flagged_posts: flaggedPosts,
          total_posts: totalPosts,
          total_users: totalUsers,
          pending_reports: pendingReports,
        },
      }),
    });

    if (!emailResponse.ok) {
      const errorText = await emailResponse.text();
      console.error("EmailJS error:", errorText);
      return new Response(
        JSON.stringify({ success: false, message: "Failed to send email", error: errorText }),
        { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    console.log("Daily summary email sent successfully");

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Daily summary sent",
        stats: { newPosts, newUsers, newReports, flaggedPosts, totalPosts, totalUsers, pendingReports }
      }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  } catch (error: any) {
    console.error("Error in daily summary:", error);
    return new Response(
      JSON.stringify({ success: false, message: error.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
});
