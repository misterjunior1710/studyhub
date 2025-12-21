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

    // Get all created posts for adding comments
    const { data: allPosts } = await supabase
      .from("posts")
      .select("id, title")
      .order("created_at", { ascending: false })
      .limit(36);

    // Comments data - varied tones and helpful responses
    const commentsData = [
      // Comments for pH rainwater question
      { postTitle: "Why does the pH of rainwater decrease in polluted areas?", userIndex: 3, content: "Great question! It's mainly due to SO2 and NO2 from vehicles and factories. They react with water vapor to form sulfuric and nitric acid. For boards, focus on the chemical equations!", hoursAgo: 2 },
      { postTitle: "Why does the pH of rainwater decrease in polluted areas?", userIndex: 8, content: "Adding to what Marcus said - industrial emissions are actually the bigger contributor in most cities. Vehicles matter more in areas with less industry.", hoursAgo: 1 },
      
      // Comments for Ohm's Law question
      { postTitle: "Is Ohm's Law valid for all electrical components?", userIndex: 12, content: "Ohm's Law only works for 'ohmic conductors' - things like metal wires at constant temperature. It doesn't apply to diodes, LEDs, or thermistors because their resistance changes.", hoursAgo: 5 },
      { postTitle: "Is Ohm's Law valid for all electrical components?", userIndex: 15, content: "Simple way to remember: if the V-I graph is a straight line through origin, it's ohmic. Curved line = non-ohmic. That's the key for exams!", hoursAgo: 4 },
      { postTitle: "Is Ohm's Law valid for all electrical components?", userIndex: 0, content: "Thanks for asking this - I had the same doubt! The answers here really helped.", hoursAgo: 3 },
      
      // Comments for surface area to volume
      { postTitle: "Why is the surface area to volume ratio important in biology?", userIndex: 4, content: "It's super important for understanding why cells are small! As cells get bigger, volume increases faster than surface area, making diffusion inefficient. Definitely learn the concept + 2-3 examples.", hoursAgo: 20 },
      { postTitle: "Why is the surface area to volume ratio important in biology?", userIndex: 17, content: "For NEET/boards, memorize examples: alveoli (high SA for gas exchange), villi in intestines, root hair cells. Examiners love asking about these!", hoursAgo: 18 },
      
      // Comments for limits question
      { postTitle: "Help with limits approaching infinity?",  userIndex: 1, content: "Common mistake: not dividing by the highest power of x. For rational functions, divide numerator and denominator by x^n where n is the highest power. Makes it much easier!", hoursAgo: 1 },
      { postTitle: "Help with limits approaching infinity?", userIndex: 12, content: "Also remember: if degree of numerator > denominator, limit is ±∞. If equal, it's the ratio of leading coefficients. If numerator < denominator, limit is 0.", hoursAgo: 1 },
      
      // Comments for mitosis/meiosis
      { postTitle: "Difference between mitosis and meiosis", userIndex: 2, content: "Memory trick I use: PMAT for mitosis (one round), PMAT-PMAT for meiosis (two rounds). Also 'mitosis makes twins' (identical) and 'meiosis makes babies' (gametes)!", hoursAgo: 6 },
      { postTitle: "Difference between mitosis and meiosis", userIndex: 8, content: "I draw them side by side every time I study. Visual learning really helps with this topic. Also focus on where crossing over happens - that's a common exam question.", hoursAgo: 5 },
      
      // Comments for Python learning
      { postTitle: "What's the best way to start learning Python?", userIndex: 3, content: "Start with basics! Variables, loops, functions. Then move to small projects. I recommend 'Automate the Boring Stuff with Python' - it's free online and project-based.", hoursAgo: 10 },
      { postTitle: "What's the best way to start learning Python?", userIndex: 11, content: "Codecademy and freeCodeCamp are great for beginners. Don't rush into advanced stuff. Master the fundamentals first!", hoursAgo: 8 },
      { postTitle: "What's the best way to start learning Python?", userIndex: 19, content: "Same boat! I've been using Replit to practice - you can code in browser without installing anything.", hoursAgo: 6 },
      
      // Comments for French Revolution
      { postTitle: "Comment expliquer la Révolution française", userIndex: 18, content: "Les 5 points clés: 1) Crise financière 2) Inégalités sociales (3 états) 3) Influence des Lumières 4) Mauvaises récoltes 5) Faiblesse de Louis XVI. Bon courage pour l'examen!", hoursAgo: 40 },
      { postTitle: "Comment expliquer la Révolution française", userIndex: 7, content: "In English: Financial crisis, social inequality, Enlightenment ideas, food shortages, weak monarchy. The storming of the Bastille is usually the key event to mention!", hoursAgo: 36 },
      
      // Comments for gradient question
      { postTitle: "How do you calculate the gradient of a curve", userIndex: 1, content: "Gradient at a point = derivative at that point. So if y = x², then dy/dx = 2x. At x=3, gradient = 2(3) = 6. Practice with simple polynomials first!", hoursAgo: 4 },
      { postTitle: "How do you calculate the gradient of a curve", userIndex: 3, content: "Think of it as 'instantaneous rate of change'. The derivative gives you a formula for the gradient at ANY point on the curve.", hoursAgo: 3 },
      
      // Comments for photosynthesis/green plants
      { postTitle: "Why do plants look green if they absorb red and blue", userIndex: 4, content: "Actually a brilliant question! One theory is that early photosynthetic organisms already used the 'best' wavelengths, so plants evolved to use what was left. It's called the 'purple Earth hypothesis'.", hoursAgo: 30 },
      { postTitle: "Why do plants look green if they absorb red and blue", userIndex: 2, content: "Also, green light isn't completely useless - some does get absorbed, especially in shade conditions. Chlorophyll b and carotenoids help capture different wavelengths.", hoursAgo: 28 },
      
      // Comments for organic chemistry
      { postTitle: "Struggling with organic chemistry nomenclature", userIndex: 12, content: "IUPAC naming order: 1) Find longest carbon chain 2) Number from end nearest to substituent 3) Name substituents alphabetically 4) Add functional group suffix. Practice is key!", hoursAgo: 60 },
      { postTitle: "Struggling with organic chemistry nomenclature", userIndex: 9, content: "For multiple functional groups, there's a priority order: COOH > CHO > C=O > OH > NH2 > C=C > C≡C. The highest priority becomes the suffix!", hoursAgo: 55 },
      
      // Comments for JEE question
      { postTitle: "JEE Mains vs Advanced - which topics overlap?", userIndex: 17, content: "Most topics overlap actually! But Advanced goes deeper. Focus on: Mechanics, Electromagnetism, Optics, Modern Physics for Physics. Organic reactions and Equilibrium for Chemistry.", hoursAgo: 3 },
      { postTitle: "JEE Mains vs Advanced - which topics overlap?", userIndex: 2, content: "I'd say 70% overlap. Advanced has more Calculus-based physics and trickier organic chemistry. Start with Mains-level, then level up.", hoursAgo: 2 },
      
      // Comments for SHM question
      { postTitle: "Simple harmonic motion - why is acceleration proportional", userIndex: 1, content: "Think of a spring! The more you stretch it (displacement), the harder it pulls back (force). Since F = ma and F ∝ -x (Hooke's Law), acceleration must be proportional to displacement.", hoursAgo: 15 },
      { postTitle: "Simple harmonic motion - why is acceleration proportional", userIndex: 12, content: "The negative sign is crucial - it means acceleration always points TOWARD equilibrium. That's what makes it oscillate instead of just flying off!", hoursAgo: 12 },
      
      // Comments for historical dates
      { postTitle: "Best way to memorize historical dates?", userIndex: 7, content: "I create stories linking events. Like: 1789 French Revolution, 1799 Napoleon takes power - 10 years of chaos. Narratives stick better than isolated dates!", hoursAgo: 80 },
      { postTitle: "Best way to memorize historical dates?", userIndex: 6, content: "Flashcards with Anki! Spaced repetition really works for dates. Also, focus on understanding causation - it helps you estimate dates logically.", hoursAgo: 70 },
      
      // Comments for NEET study hours
      { postTitle: "NEET Biology - how many hours should I study daily?", userIndex: 2, content: "Quality > quantity. 4-5 focused hours after school is realistic. Use weekends for longer sessions. Don't burn out - consistency matters more!", hoursAgo: 5 },
      { postTitle: "NEET Biology - how many hours should I study daily?", userIndex: 12, content: "I did 5-6 hours on school days, 8-10 on weekends. But everyone's different. Track your progress, not just hours.", hoursAgo: 4 },
      { postTitle: "NEET Biology - how many hours should I study daily?", userIndex: 8, content: "Focus on NCERT first! 80% of Bio questions come from there. Better to master NCERT in 4 hours than skim 5 books in 10 hours.", hoursAgo: 3 },
      
      // Comments for Shakespeare
      { postTitle: "What's the point of learning Shakespeare?", userIndex: 7, content: "Honestly felt the same way at first. But Shakespeare invented so many phrases we use today: 'break the ice', 'wild goose chase', 'heart of gold'. The language is part of our culture!", hoursAgo: 100 },
      { postTitle: "What's the point of learning Shakespeare?", userIndex: 11, content: "Also, the themes are timeless - ambition, jealousy, love, betrayal. Macbeth is basically a study in how ambition corrupts. Still relevant to politics today!", hoursAgo: 90 },
      { postTitle: "What's the point of learning Shakespeare?", userIndex: 18, content: "Pro tip: watch a movie version first (there are good Macbeth adaptations). Makes the text SO much easier to understand.", hoursAgo: 85 },
      
      // Comments for study hours discussion
      { postTitle: "Is studying 8 hours a day actually effective?", userIndex: 2, content: "100% agree with you. I tried the 10-hour thing and just burned out. Now I do 4-5 focused hours with proper breaks and my grades actually improved.", hoursAgo: 0.5 },
      { postTitle: "Is studying 8 hours a day actually effective?", userIndex: 3, content: "Pomodoro technique changed my life. 25 min study, 5 min break. You'd be surprised how much you can cover in 4 Pomodoros!", hoursAgo: 0.5 },
      { postTitle: "Is studying 8 hours a day actually effective?", userIndex: 17, content: "Depends on the subject too. Math needs focused short sessions. Reading-heavy subjects can go longer. Mix it up!", hoursAgo: 0.5 },
      
      // Comments for online vs textbooks
      { postTitle: "Online resources vs textbooks - what do you prefer?", userIndex: 5, content: "YouTube for understanding concepts, textbooks for depth and exam-specific content. Both have their place!", hoursAgo: 20 },
      { postTitle: "Online resources vs textbooks - what do you prefer?", userIndex: 4, content: "For sciences, videos help visualize. For humanities, textbooks give more nuance. I use 70% video, 30% text.", hoursAgo: 18 },
      
      // Comments for morning study
      { postTitle: "Anyone else struggle with morning study sessions?", userIndex: 10, content: "Same! I'm a night owl. Studies show chronotypes are real - some people ARE more productive at night. Do what works for you!", hoursAgo: 8 },
      { postTitle: "Anyone else struggle with morning study sessions?", userIndex: 13, content: "I used to be a night person but switched to mornings for exams (since exams are in the morning). Took 2 weeks to adjust but worth it.", hoursAgo: 6 },
      
      // Comments for A-Levels 3 vs 4
      { postTitle: "A-Levels: 3 subjects or 4?", userIndex: 7, content: "Most unis only look at 3 subjects. Better to get A*A*A in 3 than AABB in 4. Unless you're applying to very competitive courses that specifically want 4.", hoursAgo: 50 },
      { postTitle: "A-Levels: 3 subjects or 4?", userIndex: 4, content: "I did 4 in AS, dropped to 3 for A2. It's a common strategy - gives you a backup and shows breadth.", hoursAgo: 45 },
      
      // Comments for exam anxiety
      { postTitle: "How do you deal with exam anxiety?", userIndex: 14, content: "Deep breathing before exams really helps. 4 seconds in, hold 4, out 4. Also, getting to the exam hall early so you're not rushed.", hoursAgo: 15 },
      { postTitle: "How do you deal with exam anxiety?", userIndex: 10, content: "I write down everything I'm worried about forgetting RIGHT before the exam starts. Gets it out of my head and onto paper.", hoursAgo: 12 },
      { postTitle: "How do you deal with exam anxiety?", userIndex: 4, content: "Practice papers under timed conditions! The more you simulate exam conditions, the less scary the real thing feels.", hoursAgo: 10 },
      
      // Comments for gap year
      { postTitle: "Gap year before university - good idea?", userIndex: 11, content: "Took one and don't regret it. Worked part-time, traveled a bit, figured out I actually wanted to study CS instead of business. Worth the 'delay'.", hoursAgo: 200 },
      { postTitle: "Gap year before university - good idea?", userIndex: 1, content: "UK unis are generally fine with gap years. Just make sure you have a plan - 'I want to travel and work' is fine, 'I dunno' isn't.", hoursAgo: 180 },
      
      // Comments for note-taking apps
      { postTitle: "Best note-taking apps for students?", userIndex: 5, content: "Notion is amazing for organizing but can be overwhelming. Obsidian is great if you like linking ideas. I use Notion for school stuff, Obsidian for personal learning.", hoursAgo: 150 },
      { postTitle: "Best note-taking apps for students?", userIndex: 19, content: "Unpopular opinion: pen and paper is still best for learning. Writing by hand helps memory. I digitize important notes later.", hoursAgo: 140 },
      { postTitle: "Best note-taking apps for students?", userIndex: 3, content: "OneNote if you're in the Microsoft ecosystem. Free and syncs everywhere. Not as pretty as Notion but gets the job done.", hoursAgo: 130 },
      
      // Comments for programming language
      { postTitle: "What programming language should I learn after Python?", userIndex: 3, content: "JavaScript if you want to make websites. It's everywhere and you can see results quickly. Java is great for understanding OOP deeply but more verbose.", hoursAgo: 40 },
      { postTitle: "What programming language should I learn after Python?", userIndex: 11, content: "Depends on your goal. Game dev? C++. Web? JavaScript. Android? Kotlin. For a student, I'd say JavaScript - most versatile.", hoursAgo: 35 },
      
      // Comments for geometry proofs
      { postTitle: "Why do we need to learn proofs in geometry?", userIndex: 3, content: "Proofs teach logical thinking - building arguments step by step. That skill transfers to debugging code, writing essays, even everyday problem solving!", hoursAgo: 60 },
      { postTitle: "Why do we need to learn proofs in geometry?", userIndex: 1, content: "Also, proofs are actually used in higher math, CS (algorithm correctness), and even law (building a case). The format is useful beyond geometry.", hoursAgo: 55 },
      
      // Comments for gaming and studies
      { postTitle: "How to balance gaming and studies?", userIndex: 10, content: "I game as a reward! Finish my study goals for the day, then guilt-free gaming. Works way better than trying to quit completely.", hoursAgo: 7 },
      { postTitle: "How to balance gaming and studies?", userIndex: 13, content: "Set specific gaming hours. For me it's 8-10 PM on school nights, more on weekends. Having boundaries helps.", hoursAgo: 5 },
      { postTitle: "How to balance gaming and studies?", userIndex: 5, content: "Some games actually help! Puzzle games, strategy games. I credit Minecraft with getting me into programming lol", hoursAgo: 4 },
    ];

    // Add comments
    let commentsCreated = 0;
    for (const commentData of commentsData) {
      const user = createdUsers[commentData.userIndex];
      if (!user) continue;

      const post = allPosts?.find(p => p.title.includes(commentData.postTitle.substring(0, 30)));
      if (!post) continue;

      // Check if comment exists
      const { data: existingComment } = await supabase
        .from("comments")
        .select("id")
        .eq("post_id", post.id)
        .eq("user_id", user.id)
        .eq("content", commentData.content)
        .single();

      if (existingComment) continue;

      const commentTime = new Date(now.getTime() - commentData.hoursAgo * 60 * 60 * 1000);

      const { error } = await supabase.from("comments").insert({
        post_id: post.id,
        user_id: user.id,
        content: commentData.content,
        created_at: commentTime.toISOString(),
        updated_at: commentTime.toISOString(),
      });

      if (!error) commentsCreated++;
    }

    results.push(`Created ${commentsCreated} comments`);

    console.log("Seed results:", results);

    return new Response(
      JSON.stringify({
        success: true,
        message: "Test data seeding completed",
        stats: {
          users: createdUsers.length,
          posts: postsData.length,
          comments: commentsCreated,
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