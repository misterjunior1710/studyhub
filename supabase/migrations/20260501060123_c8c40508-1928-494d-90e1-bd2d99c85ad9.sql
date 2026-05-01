-- Explicitly deny all client-side writes to activity_feed.
-- Inserts/updates/deletes are only intended via SECURITY DEFINER functions/triggers,
-- which bypass RLS and continue to work.

DROP POLICY IF EXISTS "No direct activity feed inserts" ON public.activity_feed;
CREATE POLICY "No direct activity feed inserts"
ON public.activity_feed
FOR INSERT
TO authenticated
WITH CHECK (false);

DROP POLICY IF EXISTS "No direct activity feed updates" ON public.activity_feed;
CREATE POLICY "No direct activity feed updates"
ON public.activity_feed
FOR UPDATE
TO authenticated
USING (false)
WITH CHECK (false);

DROP POLICY IF EXISTS "No direct activity feed deletes" ON public.activity_feed;
CREATE POLICY "No direct activity feed deletes"
ON public.activity_feed
FOR DELETE
TO authenticated
USING (false);
