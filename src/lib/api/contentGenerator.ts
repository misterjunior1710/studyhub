import { supabase } from '@/integrations/supabase/client';

export interface KeyConcept {
  term: string;
  definition: string;
  importance: string;
}

export interface Example {
  problem: string;
  solution: string;
}

export interface PracticeQuestion {
  question: string;
  answer: string;
}

export interface GeneratedContent {
  topic: string;
  subject: string;
  grade: string;
  stream: string;
  explanation: string;
  keyConcepts: KeyConcept[];
  revisionNotes: string[];
  examples: Example[];
  practiceQuestions: PracticeQuestion[];
  sources: string[];
}

export interface GenerationResponse {
  success: boolean;
  error?: string;
  data?: GeneratedContent;
}

export const contentGeneratorApi = {
  async generate(
    topic: string,
    subject: string,
    grade: string,
    stream: string
  ): Promise<GenerationResponse> {
    const { data, error } = await supabase.functions.invoke('generate-study-content', {
      body: { topic, subject, grade, stream },
    });

    if (error) {
      console.error('Content generation error:', error);
      return { success: false, error: error.message };
    }

    return data;
  },

  async saveContent(
    userId: string,
    content: GeneratedContent
  ): Promise<{ success: boolean; id?: string; error?: string }> {
    // Use type assertion for the generated_study_content table since it's new
    const { data, error } = await supabase
      .from('generated_study_content' as any)
      .insert({
        user_id: userId,
        topic: content.topic,
        subject: content.subject,
        grade: content.grade,
        stream: content.stream,
        explanation: content.explanation,
        key_concepts: content.keyConcepts,
        revision_notes: content.revisionNotes.join('\n'),
        examples: content.examples,
        practice_questions: content.practiceQuestions,
        sources: content.sources,
        generation_status: 'completed',
      } as any)
      .select('id')
      .single();

    if (error) {
      console.error('Save content error:', error);
      return { success: false, error: error.message };
    }

    return { success: true, id: (data as any)?.id };
  },

  async getUserContent(userId: string) {
    const { data, error } = await supabase
      .from('generated_study_content' as any)
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Fetch content error:', error);
      return [];
    }

    return data;
  },

  async deleteContent(contentId: string) {
    const { error } = await supabase
      .from('generated_study_content' as any)
      .delete()
      .eq('id', contentId);

    if (error) {
      console.error('Delete content error:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  },
};
