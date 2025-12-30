import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Preset groups configuration
const COUNTRIES = [
  "India", "United States", "United Kingdom", "Canada", "Australia",
  "Nigeria", "South Africa", "Kenya", "Ghana", "Pakistan",
  "Bangladesh", "Philippines", "Indonesia", "Malaysia", "Singapore",
  "Germany", "France", "Brazil", "Mexico", "UAE"
];

const SUBJECTS = [
  "Mathematics", "Physics", "Chemistry", "Biology", "Computer Science",
  "English", "History", "Geography", "Economics", "Business Studies",
  "Accounting", "Psychology", "Sociology", "Political Science", "Law",
  "Art", "Music", "Physical Education", "Environmental Science", "Statistics"
];

const GRADES = [
  "Grade 8", "Grade 9", "Grade 10", "Grade 11", "Grade 12",
  "O Levels", "A Levels", "IB Diploma", "IGCSE", "University"
];

const STREAMS = [
  "Science", "Commerce", "Arts", "Humanities", "Engineering",
  "Medical", "Technology", "Management", "Law", "General"
];

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get the admin user ID (the one making the request or a system admin)
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "No authorization header" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Check if user is admin
    const { data: adminRole } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .eq("role", "admin")
      .single();

    if (!adminRole) {
      return new Response(JSON.stringify({ error: "Admin access required" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const groupsToCreate: { name: string; description: string; created_by: string; is_public: boolean }[] = [];

    // Country-based groups
    COUNTRIES.forEach(country => {
      groupsToCreate.push({
        name: `${country} Students`,
        description: `Study group for students in ${country}. Connect, share resources, and collaborate!`,
        created_by: user.id,
        is_public: true,
      });
    });

    // Subject-based groups
    SUBJECTS.forEach(subject => {
      groupsToCreate.push({
        name: `${subject} Learners`,
        description: `Dedicated study group for ${subject}. Ask questions, share notes, and master the subject together.`,
        created_by: user.id,
        is_public: true,
      });
    });

    // Grade-based groups
    GRADES.forEach(grade => {
      groupsToCreate.push({
        name: `${grade} Study Hub`,
        description: `Study group for ${grade} students. Share exam tips, discuss topics, and help each other succeed.`,
        created_by: user.id,
        is_public: true,
      });
    });

    // Stream-based groups
    STREAMS.forEach(stream => {
      groupsToCreate.push({
        name: `${stream} Stream`,
        description: `Connect with other ${stream} students. Share insights, resources, and career guidance.`,
        created_by: user.id,
        is_public: true,
      });
    });

    let created = 0;
    let skipped = 0;

    for (const group of groupsToCreate) {
      // Check if group already exists
      const { data: existing } = await supabase
        .from("group_chats")
        .select("id")
        .eq("name", group.name)
        .single();

      if (existing) {
        skipped++;
        continue;
      }

      // Create the group
      const { data: newGroup, error: groupError } = await supabase
        .from("group_chats")
        .insert(group)
        .select()
        .single();

      if (groupError) {
        console.error(`Error creating group ${group.name}:`, groupError);
        continue;
      }

      // Add creator as admin
      await supabase.from("group_members").insert({
        group_id: newGroup.id,
        user_id: user.id,
        role: "admin",
      });

      created++;
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: `Created ${created} groups, skipped ${skipped} existing groups`,
        total: groupsToCreate.length,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error: unknown) {
    console.error("Error seeding preset groups:", error);
    const message = error instanceof Error ? error.message : "Internal server error";
    return new Response(
      JSON.stringify({ error: message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
