-- Update whiteboards to support private sharing with friends
ALTER TABLE public.whiteboards 
  DROP CONSTRAINT IF EXISTS whiteboards_group_id_fkey,
  ALTER COLUMN group_id DROP NOT NULL;

-- Add sharing support
ALTER TABLE public.whiteboards ADD COLUMN IF NOT EXISTS is_public boolean DEFAULT false;

-- Create whiteboard shares table for private sharing
CREATE TABLE IF NOT EXISTS public.whiteboard_shares (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  whiteboard_id uuid REFERENCES public.whiteboards(id) ON DELETE CASCADE NOT NULL,
  shared_with_user_id uuid NOT NULL,
  can_edit boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  UNIQUE(whiteboard_id, shared_with_user_id)
);

ALTER TABLE public.whiteboard_shares ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view shares for their whiteboards or shared with them"
  ON public.whiteboard_shares FOR SELECT
  USING (
    shared_with_user_id = auth.uid() OR
    whiteboard_id IN (SELECT id FROM public.whiteboards WHERE created_by = auth.uid())
  );

CREATE POLICY "Whiteboard owners can create shares"
  ON public.whiteboard_shares FOR INSERT
  WITH CHECK (
    whiteboard_id IN (SELECT id FROM public.whiteboards WHERE created_by = auth.uid())
  );

CREATE POLICY "Whiteboard owners can delete shares"
  ON public.whiteboard_shares FOR DELETE
  USING (
    whiteboard_id IN (SELECT id FROM public.whiteboards WHERE created_by = auth.uid())
  );

-- Update whiteboards RLS to include private shares and owner access
DROP POLICY IF EXISTS "Group members can view whiteboards" ON public.whiteboards;
DROP POLICY IF EXISTS "Group members can create whiteboards" ON public.whiteboards;
DROP POLICY IF EXISTS "Group members can update whiteboards" ON public.whiteboards;
DROP POLICY IF EXISTS "Group admins can delete whiteboards" ON public.whiteboards;

CREATE POLICY "Users can view their whiteboards or shared ones"
  ON public.whiteboards FOR SELECT
  USING (
    created_by = auth.uid() OR
    is_public = true OR
    (group_id IS NOT NULL AND is_group_member(group_id, auth.uid())) OR
    id IN (SELECT whiteboard_id FROM public.whiteboard_shares WHERE shared_with_user_id = auth.uid())
  );

CREATE POLICY "Users can create whiteboards"
  ON public.whiteboards FOR INSERT
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update their whiteboards or ones shared with edit access"
  ON public.whiteboards FOR UPDATE
  USING (
    created_by = auth.uid() OR
    (group_id IS NOT NULL AND is_group_member(group_id, auth.uid())) OR
    id IN (SELECT whiteboard_id FROM public.whiteboard_shares WHERE shared_with_user_id = auth.uid() AND can_edit = true)
  );

CREATE POLICY "Users can delete their own whiteboards"
  ON public.whiteboards FOR DELETE
  USING (created_by = auth.uid() OR (group_id IS NOT NULL AND is_group_admin(group_id, auth.uid())));