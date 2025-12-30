-- Fix infinite recursion in whiteboards RLS policies
-- Drop existing problematic policies
DROP POLICY IF EXISTS "Users can view their whiteboards or shared ones" ON public.whiteboards;
DROP POLICY IF EXISTS "Users can update their whiteboards or ones shared with edit acc" ON public.whiteboards;
DROP POLICY IF EXISTS "Users can delete their own whiteboards" ON public.whiteboards;
DROP POLICY IF EXISTS "Users can create whiteboards" ON public.whiteboards;

-- Recreate policies without circular references
-- INSERT policy: Users can create their own whiteboards
CREATE POLICY "Users can create whiteboards"
ON public.whiteboards
FOR INSERT
WITH CHECK (auth.uid() = created_by);

-- SELECT policy: Use simpler logic to avoid recursion
CREATE POLICY "Users can view their whiteboards or shared ones"
ON public.whiteboards
FOR SELECT
USING (
  created_by = auth.uid() 
  OR is_public = true 
  OR (group_id IS NOT NULL AND public.is_group_member(group_id, auth.uid()))
  OR EXISTS (
    SELECT 1 FROM public.whiteboard_shares ws 
    WHERE ws.whiteboard_id = id 
    AND ws.shared_with_user_id = auth.uid()
  )
);

-- UPDATE policy: Simpler logic
CREATE POLICY "Users can update their whiteboards or shared with edit"
ON public.whiteboards
FOR UPDATE
USING (
  created_by = auth.uid() 
  OR (group_id IS NOT NULL AND public.is_group_member(group_id, auth.uid()))
  OR EXISTS (
    SELECT 1 FROM public.whiteboard_shares ws 
    WHERE ws.whiteboard_id = id 
    AND ws.shared_with_user_id = auth.uid() 
    AND ws.can_edit = true
  )
);

-- DELETE policy: Only owner or group admin
CREATE POLICY "Users can delete their own whiteboards"
ON public.whiteboards
FOR DELETE
USING (
  created_by = auth.uid() 
  OR (group_id IS NOT NULL AND public.is_group_admin(group_id, auth.uid()))
);

-- Add share_token column to whiteboards for shareable links
ALTER TABLE public.whiteboards 
ADD COLUMN IF NOT EXISTS share_token text UNIQUE;

-- Create index for faster token lookups
CREATE INDEX IF NOT EXISTS idx_whiteboards_share_token ON public.whiteboards(share_token);

-- Create event_shares table for sharing events with friends
CREATE TABLE IF NOT EXISTS public.event_shares (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id uuid NOT NULL REFERENCES public.study_events(id) ON DELETE CASCADE,
  shared_with_user_id uuid NOT NULL,
  shared_by_user_id uuid NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  UNIQUE(event_id, shared_with_user_id)
);

-- Enable RLS on event_shares
ALTER TABLE public.event_shares ENABLE ROW LEVEL SECURITY;

-- Policies for event_shares
CREATE POLICY "Users can view shares for their events or shared with them"
ON public.event_shares
FOR SELECT
USING (
  shared_with_user_id = auth.uid() 
  OR shared_by_user_id = auth.uid()
);

CREATE POLICY "Event creators can share their events"
ON public.event_shares
FOR INSERT
WITH CHECK (
  shared_by_user_id = auth.uid()
  AND EXISTS (
    SELECT 1 FROM public.study_events e 
    WHERE e.id = event_id 
    AND e.created_by = auth.uid()
  )
);

CREATE POLICY "Event creators can delete shares"
ON public.event_shares
FOR DELETE
USING (
  shared_by_user_id = auth.uid()
);

-- Update study_events SELECT policy to include shared events
DROP POLICY IF EXISTS "Users can view public events or group events they belong to" ON public.study_events;

CREATE POLICY "Users can view accessible events"
ON public.study_events
FOR SELECT
USING (
  is_public = true 
  OR created_by = auth.uid()
  OR (group_id IS NOT NULL AND public.is_group_member(group_id, auth.uid()))
  OR EXISTS (
    SELECT 1 FROM public.event_shares es 
    WHERE es.event_id = id 
    AND es.shared_with_user_id = auth.uid()
  )
);