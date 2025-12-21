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
    
    // Diverse test users
    const testUsers = [
      { email: "priya.sharma.test@example.com", password: "TestUser123!", username: "priya_sharma", country: "India", grade: "Grade 10", stream: "CBSE", bio: "Class 10 student preparing for boards 📚" },
      { email: "alex.thompson.test@example.com", password: "TestUser123!", username: "alex_thompson", country: "United Kingdom", grade: "Grade 11", stream: "A-Levels", bio: "A-Level Physics and Chemistry enthusiast 🔬" },
      { email: "sneha.m.test@example.com", password: "TestUser123!", username: "sneha.m", country: "India", grade: "Grade 12", stream: "CBSE", bio: "Aspiring medical student 🩺" },
      { email: "marcus.chen.test@example.com", password: "TestUser123!", username: "marcus_chen", country: "United States", grade: "Grade 11", stream: "AP", bio: "AP student | Math nerd 🧮" },
      { email: "emma.wilson.test@example.com", password: "TestUser123!", username: "emma.wilson", country: "Australia", grade: "Grade 12", stream: "Cambridge", bio: "Future engineer 🛠️" },
      { email: "rahul.dev.test@example.com", password: "TestUser123!", username: "rahul_dev", country: "India", grade: "Grade 9", stream: "ICSE", bio: "Learning to code! 💻" },
      { email: "sophie.martin.test@example.com", password: "TestUser123!", username: "sophie.martin", country: "France", grade: "Grade 10", stream: "French Baccalauréat", bio: "Sciences et littérature ✨" },
      { email: "james.oconnor.test@example.com", password: "TestUser123!", username: "james_oconnor", country: "United Kingdom", grade: "Grade 10", stream: "GCSE", bio: "GCSE student, love history 📜" },
      { email: "aisha.khan.test@example.com", password: "TestUser123!", username: "aisha_khan", country: "India", grade: "Grade 11", stream: "State Board", bio: "Biology lover 🌿" },
      { email: "lucas.schmidt.test@example.com", password: "TestUser123!", username: "lucas.schmidt", country: "Germany", grade: "Grade 12", stream: "German Abitur", bio: "Abitur 2026 📖" },
      { email: "maya.patel.test@example.com", password: "TestUser123!", username: "maya_patel", country: "India", grade: "Grade 8", stream: "CBSE", bio: "Just started here! 👋" },
      { email: "oliver.brown.test@example.com", password: "TestUser123!", username: "oliver.b", country: "Canada", grade: "Grade 11", stream: "Other", bio: "Ontario curriculum 🍁" },
      { email: "ananya.roy.test@example.com", password: "TestUser123!", username: "ananya_roy", country: "India", grade: "Grade 12", stream: "CBSE", bio: "JEE aspirant 🎯" },
      { email: "tom.anderson.test@example.com", password: "TestUser123!", username: "tom.a", country: "United States", grade: "Grade 10", stream: "Other", bio: "High school life 🏈" },
      { email: "nina.kowalski.test@example.com", password: "TestUser123!", username: "nina_k", country: "Poland", grade: "Grade 11", stream: "Other", bio: "Matura prep 📝" },
      { email: "arjun.nair.test@example.com", password: "TestUser123!", username: "arjun.nair", country: "India", grade: "Grade 10", stream: "Kerala State", bio: "Physics enthusiast ⚛️" },
      { email: "lisa.vanderberg.test@example.com", password: "TestUser123!", username: "lisa.v", country: "Netherlands", grade: "Grade 12", stream: "Dutch VWO", bio: "VWO eindexamen 🎓" },
      { email: "karthik.s.test@example.com", password: "TestUser123!", username: "karthik_s", country: "India", grade: "Grade 11", stream: "CBSE", bio: "NEET preparation 💉" },
      { email: "chloe.dubois.test@example.com", password: "TestUser123!", username: "chloe.d", country: "France", grade: "Grade 11", stream: "French Baccalauréat", bio: "Terminale S 🇫🇷" },
      { email: "rohan.mehta.test@example.com", password: "TestUser123!", username: "rohan_m", country: "India", grade: "Grade 9", stream: "CBSE", bio: "Gaming + Studies ⚔️" },
    ];

    // Diverse posts with varied types, timing, and tones
    const postsData = [
      // QUESTIONS (doubt type) - various timings
      { userIndex: 0, title: "Why does the pH of rainwater decrease in polluted areas? (Class 10)", content: "I know rainwater is naturally slightly acidic, but in cities the pH is much lower.\n\nIs this mainly due to vehicle emissions, or are there other causes too?\n\nAlso, how much detail is needed for board exams?", subject: "Chemistry", grade: "Grade 10", stream: "CBSE", country: "India", postType: "doubt", hoursAgo: 3 },
      { userIndex: 1, title: "Is Ohm's Law valid for all electrical components?", content: "Our textbook explains Ohm's Law clearly, but I've read that it doesn't apply everywhere.\n\nCan someone explain where it works and where it doesn't, in simple terms?", subject: "Physics", grade: "Grade 11", stream: "A-Levels", country: "United Kingdom", postType: "doubt", hoursAgo: 6 },
      { userIndex: 2, title: "Why is the surface area to volume ratio important in biology?", content: "This topic keeps coming up, especially in diffusion and respiration.\n\nIs it enough to explain it conceptually, or should we memorize examples?", subject: "Biology", grade: "Grade 12", stream: "CBSE", country: "India", postType: "doubt", hoursAgo: 24 },
      { userIndex: 3, title: "Help with limits approaching infinity?", content: "I'm stuck on evaluating limits when x approaches infinity. The textbook examples make sense but when I try practice problems I keep getting wrong answers.\n\nAny tips or common mistakes to avoid?", subject: "Mathematics", grade: "Grade 11", stream: "AP", country: "United States", postType: "doubt", hoursAgo: 2 },
      { userIndex: 4, title: "Difference between mitosis and meiosis - confused about the stages", content: "I understand the basic difference (one produces identical cells, other produces gametes) but I keep mixing up the stages.\n\nAnyone have a good memory trick?", subject: "Biology", grade: "Grade 12", stream: "Cambridge", country: "Australia", postType: "doubt", hoursAgo: 8 },
      { userIndex: 5, title: "What's the best way to start learning Python?", content: "Our school just introduced computer science and I want to get ahead.\n\nShould I start with basics or jump into projects? Any good resources?", subject: "Computer Science", grade: "Grade 9", stream: "ICSE", country: "India", postType: "doubt", hoursAgo: 12 },
      { userIndex: 6, title: "Comment expliquer la Révolution française en 5 points clés?", content: "J'ai un examen bientôt et je dois résumer les causes principales.\n\nQuels sont les 5 points les plus importants à retenir?\n\n(English answers welcome too!)", subject: "History", grade: "Grade 10", stream: "French Baccalauréat", country: "France", postType: "doubt", hoursAgo: 48 },
      { userIndex: 7, title: "How do you calculate the gradient of a curve at a point?", content: "We just started differentiation and I'm confused about finding gradients.\n\nThe formula makes sense but applying it to actual problems is hard.", subject: "Mathematics", grade: "Grade 10", stream: "GCSE", country: "United Kingdom", postType: "doubt", hoursAgo: 5 },
      { userIndex: 8, title: "Why do plants look green if they absorb red and blue light?", content: "Photosynthesis absorbs red and blue light, so green is reflected. But if green isn't used for photosynthesis, why did plants evolve this way?\n\nSeems inefficient?", subject: "Biology", grade: "Grade 11", stream: "State Board", country: "India", postType: "doubt", hoursAgo: 36 },
      { userIndex: 9, title: "Struggling with organic chemistry nomenclature", content: "IUPAC naming is driving me crazy. Especially with multiple functional groups.\n\nIs there a systematic approach or do I just need to practice more?", subject: "Chemistry", grade: "Grade 12", stream: "German Abitur", country: "Germany", postType: "doubt", hoursAgo: 72 },
      { userIndex: 12, title: "JEE Mains vs Advanced - which topics overlap?", content: "I'm starting my JEE prep and want to focus on topics that appear in both exams.\n\nCan anyone share a list or resource?", subject: "Physics", grade: "Grade 12", stream: "CBSE", country: "India", postType: "doubt", hoursAgo: 4 },
      { userIndex: 15, title: "Simple harmonic motion - why is acceleration proportional to displacement?", content: "I can solve SHM problems using formulas but I don't really understand WHY a = -ω²x.\n\nCan someone explain the physics intuitively?", subject: "Physics", grade: "Grade 10", stream: "Kerala State", country: "India", postType: "doubt", hoursAgo: 18 },
      { userIndex: 11, title: "Best way to memorize historical dates?", content: "I have so many dates to remember for my history exam. French Revolution, American Revolution, World Wars...\n\nHow do you guys handle this?", subject: "History", grade: "Grade 11", stream: "Other", country: "Canada", postType: "doubt", hoursAgo: 96 },
      { userIndex: 17, title: "NEET Biology - how many hours should I study daily?", content: "Just started NEET prep. Some people say 6 hours, others say 10+.\n\nWhat's realistic while also attending school?", subject: "Biology", grade: "Grade 11", stream: "CBSE", country: "India", postType: "doubt", hoursAgo: 7 },
      { userIndex: 13, title: "What's the point of learning Shakespeare?", content: "Genuine question - we're reading Macbeth and I don't understand why this is required.\n\nHow is 400-year-old English relevant today?", subject: "English", grade: "Grade 10", stream: "Other", country: "United States", postType: "doubt", hoursAgo: 120 },

      // NOTES type posts
      { userIndex: 0, title: "📝 My notes on Chemical Reactions and Equations (Ch. 1)", content: "Just finished making detailed notes for Class 10 Chemistry Chapter 1.\n\n**Key points:**\n- Types of reactions (combination, decomposition, displacement)\n- Balancing equations step by step\n- Oxidation and reduction\n\nHope this helps someone!", subject: "Chemistry", grade: "Grade 10", stream: "CBSE", country: "India", postType: "note", hoursAgo: 15 },
      { userIndex: 4, title: "Complete DNA Replication Summary", content: "Made a one-page summary of DNA replication:\n\n1. Helicase unwinds\n2. Primase adds primers\n3. DNA polymerase III extends\n4. Okazaki fragments on lagging strand\n5. Ligase joins fragments\n\nSaved me so much time for revision!", subject: "Biology", grade: "Grade 12", stream: "Cambridge", country: "Australia", postType: "note", hoursAgo: 30 },
      { userIndex: 3, title: "Calculus Cheat Sheet - All derivative rules", content: "Made this for my AP Calc exam:\n\n- Power rule: d/dx(x^n) = nx^(n-1)\n- Product rule: d/dx(uv) = u'v + uv'\n- Quotient rule: d/dx(u/v) = (u'v - uv')/v²\n- Chain rule: d/dx(f(g(x))) = f'(g(x)) · g'(x)\n\nFeel free to save!", subject: "Mathematics", grade: "Grade 11", stream: "AP", country: "United States", postType: "note", hoursAgo: 168 },
      { userIndex: 8, title: "Photosynthesis vs Respiration - Quick Comparison", content: "Always getting confused between these two? Here's my comparison table:\n\n**Photosynthesis:**\n- Occurs in chloroplasts\n- Uses CO2 + H2O\n- Produces glucose + O2\n- Needs light\n\n**Respiration:**\n- Occurs in mitochondria\n- Uses glucose + O2\n- Produces CO2 + H2O + ATP\n- Continuous process", subject: "Biology", grade: "Grade 11", stream: "State Board", country: "India", postType: "note", hoursAgo: 54 },
      { userIndex: 16, title: "Dutch VWO Physics Formulas - Mechanics", content: "All the formulas you need for mechanics:\n\nv = u + at\ns = ut + ½at²\nv² = u² + 2as\nF = ma\nW = Fd\nP = W/t\n\nGood luck with eindexamen! 🎓", subject: "Physics", grade: "Grade 12", stream: "Dutch VWO", country: "Netherlands", postType: "note", hoursAgo: 200 },
      { userIndex: 12, title: "Important Organic Reactions for JEE", content: "Compiled a list of must-know reactions:\n\n1. Wurtz reaction\n2. Friedel-Crafts\n3. Cannizzaro reaction\n4. Aldol condensation\n5. Grignard reagent reactions\n\nThese appear almost every year!", subject: "Chemistry", grade: "Grade 12", stream: "CBSE", country: "India", postType: "note", hoursAgo: 40 },
      { userIndex: 7, title: "GCSE English - Essay Structure Template", content: "Use this structure for any literature essay:\n\n**Intro:** Context + thesis\n**Para 1:** First point + quote + analysis\n**Para 2:** Second point + quote + analysis  \n**Para 3:** Counter argument or deeper analysis\n**Conclusion:** Summarize + wider significance\n\nWorks every time!", subject: "English", grade: "Grade 10", stream: "GCSE", country: "United Kingdom", postType: "note", hoursAgo: 85 },

      // DISCUSSION type posts
      { userIndex: 10, title: "Is studying 8 hours a day actually effective?", content: "I see people posting about studying 8-10 hours daily. But honestly, after 4-5 hours my brain stops working.\n\nQuality vs quantity - what's your take?\n\nI feel like focused 5 hours beats distracted 8 hours.", subject: "Other", grade: "Grade 8", stream: "CBSE", country: "India", postType: "discussion", hoursAgo: 1 },
      { userIndex: 14, title: "Online resources vs textbooks - what do you prefer?", content: "I find YouTube videos more engaging than reading textbooks. But my teachers say textbooks are more reliable.\n\nWhat do you use more? And for which subjects?", subject: "Other", grade: "Grade 11", stream: "Other", country: "Poland", postType: "discussion", hoursAgo: 28 },
      { userIndex: 19, title: "Anyone else struggle with morning study sessions?", content: "My parents want me to wake up at 5 AM to study. But I literally cannot focus that early.\n\nI'm more productive at night. Is that okay or should I force the morning routine?", subject: "Other", grade: "Grade 9", stream: "CBSE", country: "India", postType: "discussion", hoursAgo: 11 },
      { userIndex: 1, title: "A-Levels: 3 subjects or 4?", content: "I'm taking Physics, Chemistry, and Maths. My school is pushing me to add a 4th subject.\n\nIs it worth the extra workload or better to focus on 3 and get higher grades?", subject: "Other", grade: "Grade 11", stream: "A-Levels", country: "United Kingdom", postType: "discussion", hoursAgo: 60 },
      { userIndex: 18, title: "Study groups - helpful or distracting?", content: "Started a study group with friends but we end up chatting more than studying lol.\n\nDo online study groups work better? Any tips?", subject: "Other", grade: "Grade 11", stream: "French Baccalauréat", country: "France", postType: "discussion", hoursAgo: 144 },
      { userIndex: 2, title: "How do you deal with exam anxiety?", content: "Boards are approaching and I'm freaking out. I know the content but during exams my mind goes blank.\n\nAny techniques that actually work?", subject: "Other", grade: "Grade 12", stream: "CBSE", country: "India", postType: "discussion", hoursAgo: 20 },
      { userIndex: 9, title: "Gap year before university - good idea?", content: "Thinking about taking a gap year after Abitur. Want to travel and figure out what I really want to study.\n\nDid anyone here take a gap year? Was it worth it?", subject: "Other", grade: "Grade 12", stream: "German Abitur", country: "Germany", postType: "discussion", hoursAgo: 240 },
      { userIndex: 11, title: "Best note-taking apps for students?", content: "Currently using Google Docs but looking for something better.\n\nNotion? Obsidian? Good old pen and paper?\n\nWhat works for you?", subject: "Computer Science", grade: "Grade 11", stream: "Other", country: "Canada", postType: "discussion", hoursAgo: 180 },

      // More questions for variety
      { userIndex: 17, title: "How to remember all the exceptions in English grammar?", content: "There are so many exceptions to grammar rules. 'I before E except after C' - but what about 'weird' and 'science'?\n\nAny tricks?", subject: "English", grade: "Grade 11", stream: "CBSE", country: "India", postType: "doubt", hoursAgo: 32 },
      { userIndex: 5, title: "What programming language should I learn after Python?", content: "Learned basics of Python. Now confused between Java, JavaScript, or C++.\n\nWhat's more useful for a student?", subject: "Computer Science", grade: "Grade 9", stream: "ICSE", country: "India", postType: "doubt", hoursAgo: 50 },
      { userIndex: 15, title: "Why do we need to learn proofs in geometry?", content: "I can solve geometry problems but writing formal proofs is so tedious.\n\nWill I ever use this skill outside exams?", subject: "Mathematics", grade: "Grade 10", stream: "Kerala State", country: "India", postType: "doubt", hoursAgo: 75 },
      { userIndex: 6, title: "Tips for improving French essay writing?", content: "My vocabulary is okay but my essays feel basic. How do I make them more sophisticated?\n\nAny useful phrases or structures?", subject: "English", grade: "Grade 10", stream: "French Baccalauréat", country: "France", postType: "doubt", hoursAgo: 100 },
      { userIndex: 13, title: "Is geography just memorization?", content: "Feels like all I do is memorize capitals, rivers, and climate zones.\n\nIs there actual analysis involved at higher levels?", subject: "Geography", grade: "Grade 10", stream: "Other", country: "United States", postType: "doubt", hoursAgo: 160 },
      { userIndex: 19, title: "How to balance gaming and studies?", content: "I love gaming but my parents think it's ruining my grades. I disagree - I still do well.\n\nHow do you guys balance hobbies and studies?", subject: "Other", grade: "Grade 9", stream: "CBSE", country: "India", postType: "doubt", hoursAgo: 9 },
    ];

    const createdUsers: { id: string; username: string }[] = [];
    const results: string[] = [];

    // Create users and profiles
    for (const userData of testUsers) {
      const { data: existingUsers } = await supabase.auth.admin.listUsers();
      const existingUser = existingUsers?.users?.find(u => u.email === userData.email);

      if (existingUser) {
        results.push(`User ${userData.username} already exists`);
        createdUsers.push({ id: existingUser.id, username: userData.username });
        continue;
      }

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

      const postTime = new Date(now.getTime() - postData.hoursAgo * 60 * 60 * 1000);

      const { error: postError } = await supabase.from("posts").insert({
        user_id: user.id,
        title: postData.title,
        content: postData.content,
        subject: postData.subject,
        grade: postData.grade,
        stream: postData.stream,
        country: postData.country,
        post_type: postData.postType,
        created_at: postTime.toISOString(),
        updated_at: postTime.toISOString(),
      });

      if (postError) {
        results.push(`Failed to create post: ${postError.message}`);
      } else {
        results.push(`Created ${postData.postType}: "${postData.title.substring(0, 40)}..."`);
      }
    }

    console.log("Seed results:", results);

    return new Response(
      JSON.stringify({
        success: true,
        message: "Test data seeding completed",
        stats: {
          users: createdUsers.length,
          posts: postsData.length,
        },
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
