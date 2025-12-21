import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    
    const supabase = createClient(supabaseUrl, serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    // Current time: 8:30 PM IST, Dec 20, 2025 = 3:00 PM UTC
    const now = new Date("2025-12-20T15:00:00.000Z");
    
    // Test users data
    const testUsers = [
      {
        email: "priya.sharma.test@example.com",
        password: "TestUser123!",
        username: "priya_sharma",
        country: "India",
        grade: "Grade 10",
        stream: "CBSE",
        bio: "Class 10 student preparing for boards 📚",
      },
      {
        email: "alex.thompson.test@example.com",
        password: "TestUser123!",
        username: "alex_thompson",
        country: "United Kingdom",
        grade: "Grade 11",
        stream: "A-Levels",
        bio: "A-Level Physics and Chemistry enthusiast 🔬",
      },
      {
        email: "sneha.m.test@example.com",
        password: "TestUser123!",
        username: "sneha.m",
        country: "India",
        grade: "Grade 12",
        stream: "CBSE",
        bio: "Aspiring medical student 🩺",
      },
    ];

    // Posts data with timestamps relative to "now" (8:30 PM IST, Dec 20)
    const postsData = [
      {
        userIndex: 0, // priya_sharma
        title: "Why does the pH of rainwater decrease in polluted areas? (Class 10)",
        content: "I know rainwater is naturally slightly acidic, but in cities the pH is much lower.\n\nIs this mainly due to vehicle emissions, or are there other causes too?\n\nAlso, how much detail is needed for board exams?",
        subject: "Chemistry",
        grade: "Grade 10",
        stream: "CBSE",
        country: "India",
        hoursAgo: 3, // 5:30 PM IST
      },
      {
        userIndex: 1, // alex_thompson
        title: "Is Ohm's Law valid for all electrical components?",
        content: "Our textbook explains Ohm's Law clearly, but I've read that it doesn't apply everywhere.\n\nCan someone explain where it works and where it doesn't, in simple terms?",
        subject: "Physics",
        grade: "Grade 11",
        stream: "A-Levels",
        country: "United Kingdom",
        hoursAgo: 6, // 2:30 PM IST
      },
      {
        userIndex: 2, // sneha.m
        title: "Why is the surface area to volume ratio important in biology?",
        content: "This topic keeps coming up, especially in diffusion and respiration.\n\nIs it enough to explain it conceptually, or should we memorize examples?",
        subject: "Biology",
        grade: "Grade 12",
        stream: "CBSE",
        country: "India",
        hoursAgo: 24, // Yesterday 8:30 PM IST
      },
    ];

    const createdUsers: { id: string; username: string }[] = [];
    const results: string[] = [];

    // Create users and profiles
    for (const userData of testUsers) {
      // Check if user already exists by email
      const { data: existingUsers } = await supabase.auth.admin.listUsers();
      const existingUser = existingUsers?.users?.find(u => u.email === userData.email);

      if (existingUser) {
        results.push(`User ${userData.username} already exists`);
        createdUsers.push({ id: existingUser.id, username: userData.username });
        continue;
      }

      // Create auth user
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: userData.email,
        password: userData.password,
        email_confirm: true,
        user_metadata: {
          username: userData.username,
          country: userData.country,
          grade: userData.grade,
          stream: userData.stream,
        },
      });

      if (authError) {
        results.push(`Failed to create user ${userData.username}: ${authError.message}`);
        continue;
      }

      if (!authData.user) {
        results.push(`No user returned for ${userData.username}`);
        continue;
      }

      // Update profile with bio
      const { error: profileError } = await supabase
        .from("profiles")
        .update({
          bio: userData.bio,
          is_public: true,
        })
        .eq("id", authData.user.id);

      if (profileError) {
        results.push(`Profile update failed for ${userData.username}: ${profileError.message}`);
      }

      createdUsers.push({ id: authData.user.id, username: userData.username });
      results.push(`Created user: ${userData.username}`);
    }

    // Create posts
    for (const postData of postsData) {
      const user = createdUsers[postData.userIndex];
      if (!user) {
        results.push(`Skipping post - user index ${postData.userIndex} not found`);
        continue;
      }

      // Check if post already exists
      const { data: existingPost } = await supabase
        .from("posts")
        .select("id")
        .eq("title", postData.title)
        .eq("user_id", user.id)
        .single();

      if (existingPost) {
        results.push(`Post "${postData.title.substring(0, 30)}..." already exists`);
        continue;
      }

      // Calculate timestamp
      const postTime = new Date(now.getTime() - postData.hoursAgo * 60 * 60 * 1000);

      const { error: postError } = await supabase.from("posts").insert({
        user_id: user.id,
        title: postData.title,
        content: postData.content,
        subject: postData.subject,
        grade: postData.grade,
        stream: postData.stream,
        country: postData.country,
        post_type: "doubt",
        created_at: postTime.toISOString(),
        updated_at: postTime.toISOString(),
      });

      if (postError) {
        results.push(`Failed to create post: ${postError.message}`);
      } else {
        results.push(`Created post: "${postData.title.substring(0, 40)}..." by ${user.username}`);
      }
    }

    console.log("Seed results:", results);

    return new Response(
      JSON.stringify({
        success: true,
        message: "Test data seeding completed",
        results,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error: unknown) {
    console.error("Seed error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({
        success: false,
        error: errorMessage,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
