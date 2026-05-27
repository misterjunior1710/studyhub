GRANT SELECT, INSERT, UPDATE, DELETE ON public.flashcard_decks TO authenticated;
GRANT ALL ON public.flashcard_decks TO service_role;
GRANT SELECT ON public.flashcard_decks TO anon;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.flashcards TO authenticated;
GRANT ALL ON public.flashcards TO service_role;