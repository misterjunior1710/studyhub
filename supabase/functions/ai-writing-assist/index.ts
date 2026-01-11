import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { text, action } = await req.json();
    
    if (!text || !action) {
      return new Response(
        JSON.stringify({ error: 'Text and action are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      console.error('LOVABLE_API_KEY not configured');
      return new Response(
        JSON.stringify({ error: 'AI service not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Define prompts based on action - focused on STUDY-RELATED content only
    const prompts: Record<string, string> = {
      improve: `You are an academic writing assistant for students. Improve the following STUDY-RELATED text to make it clearer, more academic, and better structured. Focus on educational content improvement only. If the text is not study-related (e.g., casual chat, off-topic content), politely indicate that and return the original text unchanged. Only return the improved text, nothing else:\n\n${text}`,
      grammar: `You are an academic writing assistant for students. Fix any grammar, spelling, and punctuation errors in the following text. Focus on proper academic English. Only return the corrected text, nothing else:\n\n${text}`,
      summarize: `You are an academic writing assistant for students. Summarize the following STUDY-RELATED text in 2-3 concise sentences suitable for revision notes. If the text is not study-related, indicate that briefly. Only return the summary, nothing else:\n\n${text}`,
      simplify: `You are an academic writing assistant for students. Rewrite the following STUDY-RELATED text in simpler, easier-to-understand language while keeping the key educational concepts. Use language suitable for students. Only return the simplified text, nothing else:\n\n${text}`,
    };

    const prompt = prompts[action];
    if (!prompt) {
      return new Response(
        JSON.stringify({ error: 'Invalid action' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`AI writing assist: ${action} for ${text.length} characters`);

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          {
            role: 'system',
            content: 'You are an academic writing assistant exclusively for students on a study platform. Your purpose is to help with STUDY-RELATED content only - homework, essays, notes, academic writing, and educational materials. You should help improve, correct, summarize, or simplify academic text. If asked to help with non-academic or inappropriate content, politely decline and return the original text. Respond only with the requested text transformation, no explanations or additional text.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        console.error('AI rate limit exceeded');
        return new Response(
          JSON.stringify({ error: 'Rate limit exceeded. Please try again later.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      if (response.status === 402) {
        console.error('AI payment required');
        return new Response(
          JSON.stringify({ error: 'AI service requires payment. Please add credits.' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      const errorText = await response.text();
      console.error('AI gateway error:', response.status, errorText);
      return new Response(
        JSON.stringify({ error: 'AI service error' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const data = await response.json();
    const result = data.choices?.[0]?.message?.content?.trim();

    if (!result) {
      console.error('No content in AI response');
      return new Response(
        JSON.stringify({ error: 'No response from AI' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`AI writing assist success: ${action}`);

    return new Response(
      JSON.stringify({ result }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('AI writing assist error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
