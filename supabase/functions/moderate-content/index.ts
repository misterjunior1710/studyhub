import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// List of inappropriate words/patterns to check
const inappropriatePatterns = [
  /\bf+u+c+k+/gi, /\bs+h+i+t+/gi, /\ba+s+s+h+o+l+e+/gi, /\bb+i+t+c+h+/gi,
  /\bd+a+m+n+/gi, /\bc+u+n+t+/gi, /\bd+i+c+k+/gi, /\bp+u+s+s+y+/gi,
  /\bn+i+g+g+/gi, /\bf+a+g+/gi, /\br+e+t+a+r+d+/gi,
  /\bp+o+r+n+/gi, /\bs+e+x+y+/gi, /\bn+u+d+e+/gi,
  /\bk+i+l+l+\s*(you|your|him|her|them)/gi, /\bd+i+e+\s*(you|your)/gi,
  /\bfree\s*money/gi, /\bclick\s*here/gi, /\bwin\s*prize/gi,
];

// Spam detection patterns
const spamPatterns = [
  /([a-zA-Z0-9])\1{7,}/gi, // Repeated alphanumeric characters 8+ times (allows punctuation like !!! or ???)
  /\b(buy|sell|discount|offer|deal|promo|coupon)\b.*\b(now|today|limited)\b/gi,
  /\b(make\s*money|earn\s*cash|get\s*rich)\b/gi,
  /\b(telegram|whatsapp|discord)\s*[@:]?\s*[\w]+/gi,
  /\b(dm\s*me|contact\s*me|message\s*me)\s*(for|to)\b/gi,
  /\$\d+\s*(per|a)\s*(day|hour|week)/gi,
  /(follow|subscribe|like)\s*(my|our|the)\s*(channel|page|account)/gi,
  /\b(crypto|bitcoin|nft|forex)\s*(investment|trading|opportunity)/gi,
  /\b(100%|guaranteed|instant)\s*(results|success|money)/gi,
];

// URL pattern to detect links
const urlPattern = /(https?:\/\/[^\s]+)|(www\.[^\s]+)|([a-zA-Z0-9-]+\.(com|org|net|edu|gov|io|co|xyz|info|biz|tv|me|app|dev)[^\s]*)/gi;

// All caps detection (more than 50% caps in text over 20 chars)
const isExcessiveCaps = (text: string): boolean => {
  if (text.length < 20) return false;
  const letters = text.replace(/[^a-zA-Z]/g, '');
  if (letters.length < 10) return false;
  const upperCount = (letters.match(/[A-Z]/g) || []).length;
  return upperCount / letters.length > 0.5;
};

// Check for repeated content (copy-paste spam)
const hasRepeatedContent = (text: string): boolean => {
  const words = text.toLowerCase().split(/\s+/);
  if (words.length < 10) return false;
  
  const wordCounts: Record<string, number> = {};
  for (const word of words) {
    if (word.length > 3) {
      wordCounts[word] = (wordCounts[word] || 0) + 1;
    }
  }
  
  // Check if any word is repeated more than 5 times
  return Object.values(wordCounts).some(count => count > 5);
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { title, content } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    
    // Extract user from JWT token instead of trusting client input
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({
        isAppropriate: false,
        reason: "Authentication required",
        flaggedWords: [],
        isSpam: false
      }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const token = authHeader.replace('Bearer ', '');
    
    // Initialize Supabase client
    let userId: string | null = null;
    let userStrikes = 0;
    let isBanned = false;
    
    if (SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY) {
      const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
      
      // Get user from token
      const { data: { user }, error: authError } = await supabase.auth.getUser(token);
      
      if (authError || !user) {
        console.error("Auth error:", authError);
        return new Response(JSON.stringify({
          isAppropriate: false,
          reason: "Invalid authentication token",
          flaggedWords: [],
          isSpam: false
        }), {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      
      userId = user.id;
      
      // Check if user is banned
      const { data: profile } = await supabase
        .from("profiles")
        .select("strike_count, is_banned, banned_until")
        .eq("id", userId)
        .single();
      
      if (profile) {
        userStrikes = profile.strike_count || 0;
        isBanned = profile.is_banned || false;
        
        // Check if ban has expired
        if (isBanned && profile.banned_until) {
          const banExpiry = new Date(profile.banned_until);
          if (banExpiry < new Date()) {
            // Unban user
            await supabase
              .from("profiles")
              .update({ is_banned: false, banned_until: null })
              .eq("id", userId);
            isBanned = false;
          }
        }
      }
    }
    
    // Block banned users
    if (isBanned) {
      return new Response(JSON.stringify({
        isAppropriate: false,
        reason: "Your account has been temporarily suspended due to policy violations. Please contact support.",
        flaggedWords: [],
        isSpam: false,
        isBanned: true
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    
    const textToCheck = `${title} ${content}`.toLowerCase();
    const fullText = `${title} ${content}`;
    
    // Check for links first
    const hasLinks = urlPattern.test(textToCheck);
    if (hasLinks) {
      return new Response(JSON.stringify({
        isAppropriate: false,
        reason: "Links are not allowed in posts. Please remove any URLs.",
        flaggedWords: ["URL/link detected"],
        isSpam: true
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Spam detection checks
    const spamFlags: string[] = [];
    
    // Check spam patterns
    for (const pattern of spamPatterns) {
      if (pattern.test(fullText)) {
        spamFlags.push("promotional/spam pattern");
        break;
      }
    }
    
    // Check excessive caps
    if (isExcessiveCaps(fullText)) {
      spamFlags.push("excessive capitalization");
    }
    
    // Check repeated content
    if (hasRepeatedContent(fullText)) {
      spamFlags.push("repeated content");
    }
    
    if (spamFlags.length > 0) {
      return new Response(JSON.stringify({
        isAppropriate: false,
        reason: `Your post was flagged as potential spam: ${spamFlags.join(", ")}. Please revise and try again.`,
        flaggedWords: spamFlags,
        isSpam: true
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Check for obvious inappropriate patterns
    const flaggedWords: string[] = [];
    for (const pattern of inappropriatePatterns) {
      const matches = textToCheck.match(pattern);
      if (matches) {
        flaggedWords.push(...matches);
      }
    }

    if (flaggedWords.length > 0) {
      return new Response(JSON.stringify({
        isAppropriate: false,
        reason: "Your post contains inappropriate language. Please revise and try again.",
        flaggedWords: [...new Set(flaggedWords)],
        isSpam: false
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Use AI for more nuanced content moderation if available
    if (LOVABLE_API_KEY) {
      try {
        const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${LOVABLE_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "google/gemini-2.5-flash-lite",
            messages: [
              {
                role: "system",
                content: `You are a content moderator for an educational study platform. Analyze content for:
                - Profanity/slurs (even disguised)
                - Sexual content
                - Violence/threats
                - Harassment
                - Spam/promotional content
                - Drug/alcohol references
                - Self-harm references
                
                Allow: Educational questions, study humor, academic debates, normal social interactions.
                
                Respond with ONLY JSON: {"isAppropriate": true/false, "reason": "brief explanation if inappropriate", "isSpam": true/false, "confidence": 0-100}`
              },
              {
                role: "user",
                content: `Title: ${title}\n\nContent: ${content}`
              }
            ],
            temperature: 0.1,
            max_tokens: 200
          }),
        });

        if (response.ok) {
          const aiResponse = await response.json();
          const aiContent = aiResponse.choices?.[0]?.message?.content || "";
          
          console.log("AI moderation response:", aiContent);

          const jsonMatch = aiContent.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            const moderationResult = JSON.parse(jsonMatch[0]);
            
            if (!moderationResult.isAppropriate) {
              return new Response(JSON.stringify({
                isAppropriate: false,
                reason: moderationResult.reason || "Content flagged by AI moderation",
                flaggedWords: [],
                isSpam: moderationResult.isSpam || false
              }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
              });
            }
          }
        }
      } catch (aiError) {
        console.error("AI moderation error:", aiError);
        // Continue without AI check
      }
    }

    // Content passed all checks
    return new Response(JSON.stringify({
      isAppropriate: true,
      reason: null,
      flaggedWords: [],
      isSpam: false,
      userStrikes
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error("Content moderation error:", error);
    return new Response(JSON.stringify({
      isAppropriate: false,
      reason: "Content moderation is temporarily unavailable. Please try again.",
      flaggedWords: [],
      isSpam: false
    }), {
      status: 503,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
