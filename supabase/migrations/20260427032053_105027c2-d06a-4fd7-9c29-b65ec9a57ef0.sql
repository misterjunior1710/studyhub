DROP POLICY IF EXISTS "Anyone can read cached updates" ON public.cached_updates;

CREATE POLICY "Signed in users can read cached updates"
ON public.cached_updates
FOR SELECT
TO authenticated
USING (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Users can view accessible events" ON public.study_events;

CREATE POLICY "Users can view accessible events"
ON public.study_events
FOR SELECT
TO public
USING (
  is_public = true
  OR created_by = auth.uid()
  OR (group_id IS NOT NULL AND public.is_group_member(group_id, auth.uid()))
  OR EXISTS (
    SELECT 1
    FROM public.event_shares es
    WHERE es.event_id = study_events.id
      AND es.shared_with_user_id = auth.uid()
  )
);