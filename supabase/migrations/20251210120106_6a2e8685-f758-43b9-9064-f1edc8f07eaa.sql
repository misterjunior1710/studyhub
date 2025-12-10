-- Flashcard Decks
CREATE TABLE public.flashcard_decks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  is_public BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Flashcards with Leitner System (5 boxes)
CREATE TABLE public.flashcards (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  deck_id UUID NOT NULL REFERENCES public.flashcard_decks(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  front TEXT NOT NULL,
  back TEXT NOT NULL,
  box_number INTEGER NOT NULL DEFAULT 1 CHECK (box_number >= 1 AND box_number <= 5),
  next_review_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Flashcard Review History
CREATE TABLE public.flashcard_reviews (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  flashcard_id UUID NOT NULL REFERENCES public.flashcards(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  was_correct BOOLEAN NOT NULL,
  reviewed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Quizzes
CREATE TABLE public.quizzes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  subject TEXT,
  is_public BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Quiz Questions
CREATE TABLE public.quiz_questions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  quiz_id UUID NOT NULL REFERENCES public.quizzes(id) ON DELETE CASCADE,
  question_type TEXT NOT NULL DEFAULT 'multiple_choice',
  question TEXT NOT NULL,
  options JSONB,
  correct_answer TEXT NOT NULL,
  explanation TEXT,
  order_index INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Quiz Attempts
CREATE TABLE public.quiz_attempts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  quiz_id UUID NOT NULL REFERENCES public.quizzes(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  score INTEGER NOT NULL DEFAULT 0,
  total_questions INTEGER NOT NULL,
  answers JSONB NOT NULL DEFAULT '[]'::jsonb,
  completed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Mind Maps
CREATE TABLE public.mind_maps (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  is_public BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Mind Map Nodes
CREATE TABLE public.mind_map_nodes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  mind_map_id UUID NOT NULL REFERENCES public.mind_maps(id) ON DELETE CASCADE,
  parent_id UUID REFERENCES public.mind_map_nodes(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  color TEXT DEFAULT 'blue',
  position_x NUMERIC NOT NULL DEFAULT 0,
  position_y NUMERIC NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Feynman Notes
CREATE TABLE public.feynman_notes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  concept TEXT NOT NULL,
  simple_explanation TEXT,
  gaps_identified TEXT,
  refined_explanation TEXT,
  is_public BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- SQ3R Reading Sessions
CREATE TABLE public.reading_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  source_material TEXT,
  survey_notes TEXT,
  questions TEXT,
  read_notes TEXT,
  recite_notes TEXT,
  review_notes TEXT,
  current_step TEXT NOT NULL DEFAULT 'survey',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.flashcard_decks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.flashcards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.flashcard_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quizzes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mind_maps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mind_map_nodes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feynman_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reading_sessions ENABLE ROW LEVEL SECURITY;

-- Flashcard Decks Policies
CREATE POLICY "Users can view own and public decks" ON public.flashcard_decks FOR SELECT USING (auth.uid() = user_id OR is_public = true);
CREATE POLICY "Users can create own decks" ON public.flashcard_decks FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own decks" ON public.flashcard_decks FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own decks" ON public.flashcard_decks FOR DELETE USING (auth.uid() = user_id);

-- Flashcards Policies
CREATE POLICY "Users can view own cards and public deck cards" ON public.flashcards FOR SELECT USING (auth.uid() = user_id OR deck_id IN (SELECT id FROM public.flashcard_decks WHERE is_public = true));
CREATE POLICY "Users can create own cards" ON public.flashcards FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own cards" ON public.flashcards FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own cards" ON public.flashcards FOR DELETE USING (auth.uid() = user_id);

-- Flashcard Reviews Policies
CREATE POLICY "Users can view own reviews" ON public.flashcard_reviews FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own reviews" ON public.flashcard_reviews FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Quizzes Policies
CREATE POLICY "Users can view own and public quizzes" ON public.quizzes FOR SELECT USING (auth.uid() = user_id OR is_public = true);
CREATE POLICY "Users can create own quizzes" ON public.quizzes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own quizzes" ON public.quizzes FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own quizzes" ON public.quizzes FOR DELETE USING (auth.uid() = user_id);

-- Quiz Questions Policies
CREATE POLICY "Users can view questions of accessible quizzes" ON public.quiz_questions FOR SELECT USING (quiz_id IN (SELECT id FROM public.quizzes WHERE auth.uid() = user_id OR is_public = true));
CREATE POLICY "Users can manage questions of own quizzes" ON public.quiz_questions FOR INSERT WITH CHECK (quiz_id IN (SELECT id FROM public.quizzes WHERE auth.uid() = user_id));
CREATE POLICY "Users can update questions of own quizzes" ON public.quiz_questions FOR UPDATE USING (quiz_id IN (SELECT id FROM public.quizzes WHERE auth.uid() = user_id));
CREATE POLICY "Users can delete questions of own quizzes" ON public.quiz_questions FOR DELETE USING (quiz_id IN (SELECT id FROM public.quizzes WHERE auth.uid() = user_id));

-- Quiz Attempts Policies
CREATE POLICY "Users can view own attempts" ON public.quiz_attempts FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own attempts" ON public.quiz_attempts FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Mind Maps Policies
CREATE POLICY "Users can view own and public mind maps" ON public.mind_maps FOR SELECT USING (auth.uid() = user_id OR is_public = true);
CREATE POLICY "Users can create own mind maps" ON public.mind_maps FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own mind maps" ON public.mind_maps FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own mind maps" ON public.mind_maps FOR DELETE USING (auth.uid() = user_id);

-- Mind Map Nodes Policies
CREATE POLICY "Users can view nodes of accessible maps" ON public.mind_map_nodes FOR SELECT USING (mind_map_id IN (SELECT id FROM public.mind_maps WHERE auth.uid() = user_id OR is_public = true));
CREATE POLICY "Users can manage nodes of own maps" ON public.mind_map_nodes FOR INSERT WITH CHECK (mind_map_id IN (SELECT id FROM public.mind_maps WHERE auth.uid() = user_id));
CREATE POLICY "Users can update nodes of own maps" ON public.mind_map_nodes FOR UPDATE USING (mind_map_id IN (SELECT id FROM public.mind_maps WHERE auth.uid() = user_id));
CREATE POLICY "Users can delete nodes of own maps" ON public.mind_map_nodes FOR DELETE USING (mind_map_id IN (SELECT id FROM public.mind_maps WHERE auth.uid() = user_id));

-- Feynman Notes Policies
CREATE POLICY "Users can view own and public notes" ON public.feynman_notes FOR SELECT USING (auth.uid() = user_id OR is_public = true);
CREATE POLICY "Users can create own notes" ON public.feynman_notes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own notes" ON public.feynman_notes FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own notes" ON public.feynman_notes FOR DELETE USING (auth.uid() = user_id);

-- Reading Sessions Policies
CREATE POLICY "Users can view own sessions" ON public.reading_sessions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own sessions" ON public.reading_sessions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own sessions" ON public.reading_sessions FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own sessions" ON public.reading_sessions FOR DELETE USING (auth.uid() = user_id);

-- Add updated_at triggers
CREATE TRIGGER update_flashcard_decks_updated_at BEFORE UPDATE ON public.flashcard_decks FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER update_flashcards_updated_at BEFORE UPDATE ON public.flashcards FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER update_quizzes_updated_at BEFORE UPDATE ON public.quizzes FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER update_mind_maps_updated_at BEFORE UPDATE ON public.mind_maps FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER update_feynman_notes_updated_at BEFORE UPDATE ON public.feynman_notes FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER update_reading_sessions_updated_at BEFORE UPDATE ON public.reading_sessions FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();