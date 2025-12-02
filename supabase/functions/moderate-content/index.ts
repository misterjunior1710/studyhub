import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// List of inappropriate words/patterns to check
const inappropriatePatterns = [
  // Profanity and slurs (basic list - AI will catch more nuanced cases)
  /\bf+u+c+k+/gi, /\bs+h+i+t+/gi, /\ba+s+s+h+o+l+e+/gi, /\bb+i+t+c+h+/gi,
  /\bd+a+m+n+/gi, /\bc+u+n+t+/gi, /\bd+i+c+k+/gi, /\bp+u+s+s+y+/gi,
  /\bn+i+g+g+/gi, /\bf+a+g+/gi, /\br+e+t+a+r+d+/gi,
  // Sexual content
  /\bp+o+r+n+/gi, /\bs+e+x+y+/gi, /\bn+u+d+e+/gi,
  // Violence
  /\bk+i+l+l+\s*(you|your|him|her|them)/gi, /\bd+i+e+\s*(you|your)/gi,
  // Spam patterns
  /\bfree\s*money/gi, /\bclick\s*here/gi, /\bwin\s*prize/gi,
];

// URL pattern to detect links
const urlPattern = /(https?:\/\/[^\s]+)|(www\.[^\s]+)|([a-zA-Z0-9-]+\.(com|org|net|edu|gov|io|co|xyz|info|biz|tv|me|app|dev)[^\s]*)/gi;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { title, content } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      console.error("LOVABLE_API_KEY is not configured");
      // Fall back to basic checks only
      return performBasicChecks(title, content);
    }

    const textToCheck = `${title} ${content}`.toLowerCase();
    
    // Check for links first
    const hasLinks = urlPattern.test(textToCheck);
    if (hasLinks) {
      return new Response(JSON.stringify({
        isAppropriate: false,
        reason: "Links are not allowed in posts. Please remove any URLs.",
        flaggedWords: ["URL/link detected"]
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
        flaggedWords: [...new Set(flaggedWords)]
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Use AI for more nuanced content moderation
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
            content: `You are a content moderator for an educational study platform used by students of all ages. 
            Analyze the following content and determine if it's appropriate.
            
            Flag content that contains:
            - Profanity, slurs, or hate speech (even disguised with numbers/symbols)
            - Sexual content or innuendo
            - Violent threats or bullying
            - Harassment or personal attacks
            - Spam or promotional content
            - Drug/alcohol references inappropriate for students
            - Self-harm or suicide references
            
            Allow content that is:
            - Educational questions and discussions
            - Study-related humor (even if slightly edgy)
            - Academic debates
            - Normal social interactions
            
            Respond with ONLY a JSON object in this exact format:
            {"isAppropriate": true/false, "reason": "brief explanation if inappropriate", "confidence": 0-100}`
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

    if (!response.ok) {
      console.error("AI gateway error:", response.status);
      // Fall back to basic checks if AI fails
      return performBasicChecks(title, content);
    }

    const aiResponse = await response.json();
    const aiContent = aiResponse.choices?.[0]?.message?.content || "";
    
    console.log("AI moderation response:", aiContent);

    try {
      // Parse AI response
      const jsonMatch = aiContent.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const moderationResult = JSON.parse(jsonMatch[0]);
        
        if (!moderationResult.isAppropriate) {
          return new Response(JSON.stringify({
            isAppropriate: false,
            reason: moderationResult.reason || "Content flagged by AI moderation",
            flaggedWords: []
          }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }
      }
    } catch (parseError) {
      console.error("Error parsing AI response:", parseError);
    }

    // Content passed all checks
    return new Response(JSON.stringify({
      isAppropriate: true,
      reason: null,
      flaggedWords: []
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error("Content moderation error:", error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : "Unknown error",
      isAppropriate: true, // Allow on error to not block users
      reason: null
    }), {
      status: 200, // Don't fail the request
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

function performBasicChecks(title: string, content: string) {
  const textToCheck = `${title} ${content}`.toLowerCase();
  
  // Check for links
  const hasLinks = urlPattern.test(textToCheck);
  if (hasLinks) {
    return new Response(JSON.stringify({
      isAppropriate: false,
      reason: "Links are not allowed in posts. Please remove any URLs.",
      flaggedWords: ["URL/link detected"]
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
      flaggedWords: [...new Set(flaggedWords)]
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  return new Response(JSON.stringify({
    isAppropriate: true,
    reason: null,
    flaggedWords: []
  }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}
