import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { z } from "https://deno.land/x/zod@v3.23.8/mod.ts";
import { checkRateLimit, rateLimitedResponse } from "../_shared/rateLimit.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const generateSchema = z.object({
  topic: z.string().trim().min(2).max(300),
  subject: z.string().trim().min(1).max(100),
  grade: z.string().trim().min(1).max(50),
  stream: z.string().trim().min(1).max(100),
});

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(JSON.stringify({ success: false, error: 'Unauthorized' }), {
        status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    const authClient = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: authHeader } } }
    );
    const { data: userData, error: userErr } = await authClient.auth.getUser();
    if (userErr || !userData?.user) {
      return new Response(JSON.stringify({ success: false, error: 'Unauthorized' }), {
        status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Rate limit: 10 generations per hour per user (expensive)
    const rl = await checkRateLimit({ userId: userData.user.id, bucket: "generate-study-content", max: 10, windowSeconds: 3600 });
    if (!rl.allowed) return rateLimitedResponse(rl.retryAfterSeconds, corsHeaders);

    const parsed = generateSchema.safeParse(await req.json().catch(() => null));
    if (!parsed.success) {
      return new Response(
        JSON.stringify({ success: false, error: 'Invalid input', details: parsed.error.flatten() }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    const { topic, subject, grade, stream } = parsed.data;

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    const FIRECRAWL_API_KEY = Deno.env.get('FIRECRAWL_API_KEY');

    if (!LOVABLE_API_KEY) {
      console.error('LOVABLE_API_KEY not configured');
      return new Response(
        JSON.stringify({ success: false, error: 'AI service not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!FIRECRAWL_API_KEY) {
      console.error('FIRECRAWL_API_KEY not configured');
      return new Response(
        JSON.stringify({ success: false, error: 'Firecrawl connector not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Generating content for: ${topic} | ${subject} | ${grade} | ${stream}`);

    // Step 1: Search for educational content
    const searchQuery = `${topic} ${subject} ${grade} explanation tutorial site:khanacademy.org OR site:byjus.com OR site:britannica.com OR site:wikipedia.org OR site:bbc.co.uk/bitesize OR site:ck12.org`;
    
    console.log('Searching for educational content...');
    const searchResponse = await fetch('https://api.firecrawl.dev/v1/search', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${FIRECRAWL_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: searchQuery,
        limit: 5,
        scrapeOptions: { formats: ['markdown'] },
      }),
    });

    if (!searchResponse.ok) {
      const searchError = await searchResponse.text();
      console.error('Search failed:', searchError);
      return new Response(
        JSON.stringify({ success: false, error: 'Failed to search for educational content' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const searchData = await searchResponse.json();
    const sources = searchData.data || [];
    console.log(`Found ${sources.length} sources`);

    // Combine scraped content
    const scrapedContent = sources
      .map((source: any) => {
        const markdown = source.markdown || source.content || '';
        return `## Source: ${source.url}\n${markdown.slice(0, 3000)}`; // Limit per source
      })
      .join('\n\n---\n\n')
      .slice(0, 15000); // Total limit

    const sourceUrls = sources.map((s: any) => s.url).filter(Boolean);

    // Step 2: Generate structured content with AI
    const systemPrompt = `You are an expert educational content creator. Create structured, syllabus-aligned study material for ${grade} students studying ${subject} under the ${stream} curriculum.

Your task is to generate comprehensive, age-appropriate study material on the given topic using the provided source content as reference.

IMPORTANT: Generate educational content that is accurate, clear, and engaging for students at the ${grade} level.`;

    const userPrompt = `Topic: ${topic}
Subject: ${subject}
Grade: ${grade}
Curriculum: ${stream}

Source Content:
${scrapedContent || 'No external sources found. Generate content based on your knowledge.'}

Generate comprehensive study material with:
1. A clear topic explanation (300-500 words)
2. 3-5 key concepts with definitions
3. Bullet-point revision notes
4. 2-3 worked examples with solutions
5. 3-5 practice questions with answers`;

    console.log('Generating AI content...');
    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        tools: [{
          type: 'function',
          function: {
            name: 'generate_study_material',
            description: 'Generate structured study material for students',
            parameters: {
              type: 'object',
              properties: {
                explanation: {
                  type: 'string',
                  description: 'A clear, comprehensive explanation of the topic (300-500 words)'
                },
                keyConcepts: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      term: { type: 'string' },
                      definition: { type: 'string' },
                      importance: { type: 'string' }
                    },
                    required: ['term', 'definition', 'importance']
                  },
                  description: '3-5 key concepts with definitions and importance'
                },
                revisionNotes: {
                  type: 'array',
                  items: { type: 'string' },
                  description: 'Bullet-point revision notes for quick review'
                },
                examples: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      problem: { type: 'string' },
                      solution: { type: 'string' }
                    },
                    required: ['problem', 'solution']
                  },
                  description: '2-3 worked examples with step-by-step solutions'
                },
                practiceQuestions: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      question: { type: 'string' },
                      answer: { type: 'string' }
                    },
                    required: ['question', 'answer']
                  },
                  description: '3-5 practice questions with answers'
                }
              },
              required: ['explanation', 'keyConcepts', 'revisionNotes', 'examples', 'practiceQuestions']
            }
          }
        }],
        tool_choice: { type: 'function', function: { name: 'generate_study_material' } }
      }),
    });

    if (!aiResponse.ok) {
      const aiError = await aiResponse.text();
      console.error('AI generation failed:', aiError);
      
      if (aiResponse.status === 429) {
        return new Response(
          JSON.stringify({ success: false, error: 'Rate limit exceeded. Please try again later.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      if (aiResponse.status === 402) {
        return new Response(
          JSON.stringify({ success: false, error: 'AI service credits exhausted. Please contact support.' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      return new Response(
        JSON.stringify({ success: false, error: 'Failed to generate content' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const aiData = await aiResponse.json();
    console.log('AI response received');

    // Parse the tool call response
    const toolCall = aiData.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall) {
      console.error('No tool call in response:', JSON.stringify(aiData));
      return new Response(
        JSON.stringify({ success: false, error: 'Invalid AI response format' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    let generatedContent;
    try {
      generatedContent = JSON.parse(toolCall.function.arguments);
    } catch (parseError) {
      console.error('Failed to parse AI response:', parseError);
      return new Response(
        JSON.stringify({ success: false, error: 'Failed to parse generated content' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Content generated successfully');

    return new Response(
      JSON.stringify({
        success: true,
        data: {
          topic,
          subject,
          grade,
          stream,
          explanation: generatedContent.explanation,
          keyConcepts: generatedContent.keyConcepts,
          revisionNotes: generatedContent.revisionNotes,
          examples: generatedContent.examples,
          practiceQuestions: generatedContent.practiceQuestions,
          sources: sourceUrls
        }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('[generate-study-content]', error);
    return new Response(
      JSON.stringify({ success: false, error: 'Failed to generate content' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
