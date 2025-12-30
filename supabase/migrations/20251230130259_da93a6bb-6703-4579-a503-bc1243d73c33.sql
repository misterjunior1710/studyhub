-- Fix infinite recursion between whiteboards and whiteboard_shares RLS by using SECURITY DEFINER helpers

-- Helper: is owner (bypasses RLS)
CREATE OR REPLACE FUNCTION public.is_whiteboard_owner(_whiteboard_id uuid, _user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
SET row_security = off
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.whiteboards w
    WHERE w.id = _whiteboard_id
      AND w.created_by = _user_id
  );
$$;

-- Helper: can view (bypasses RLS)
CREATE OR REPLACE FUNCTION public.can_view_whiteboard(_whiteboard_id uuid, _user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
SET row_security = off
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.whiteboards w
    WHERE w.id = _whiteboard_id
      AND (
        w.is_public = true
        OR w.created_by = _user_id
        OR (w.group_id IS NOT NULL AND public.is_group_member(w.group_id, _user_id))
        OR EXISTS (
          SELECT 1
          FROM public.whiteboard_shares s
          WHERE s.whiteboard_id = w.id
            AND s.shared_with_user_id = _user_id
        )
      )
  );
$$;

-- Helper: can edit (bypasses RLS)
CREATE OR REPLACE FUNCTION public.can_edit_whiteboard(_whiteboard_id uuid, _user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
SET row_security = off
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.whiteboards w
    WHERE w.id = _whiteboard_id
      AND (
        w.created_by = _user_id
        OR (w.group_id IS NOT NULL AND public.is_group_member(w.group_id, _user_id))
        OR EXISTS (
          SELECT 1
          FROM public.whiteboard_shares s
          WHERE s.whiteboard_id = w.id
            AND s.shared_with_user_id = _user_id
            AND COALESCE(s.can_edit, true) = true
        )
      )
  );
$$;

-- Recreate whiteboards policies that caused recursion
DROP POLICY IF EXISTS "Users can view their whiteboards or shared ones" ON public.whiteboards;
DROP POLICY IF EXISTS "Users can update their whiteboards or shared with edit" ON public.whiteboards;

CREATE POLICY "Users can view accessible whiteboards"
ON public.whiteboards
FOR SELECT
USING (public.can_view_whiteboard(id, auth.uid()));

CREATE POLICY "Users can update accessible whiteboards"
ON public.whiteboards
FOR UPDATE
USING (public.can_edit_whiteboard(id, auth.uid()));

-- Recreate whiteboard_shares policies without referencing whiteboards policies directly
DROP POLICY IF EXISTS "Users can view shares for their whiteboards or shared with them" ON public.whiteboard_shares;
DROP POLICY IF EXISTS "Whiteboard owners can create shares" ON public.whiteboard_shares;
DROP POLICY IF EXISTS "Whiteboard owners can delete shares" ON public.whiteboard_shares;

CREATE POLICY "Users can view shares for accessible whiteboards"
ON public.whiteboard_shares
FOR SELECT
USING (
  shared_with_user_id = auth.uid()
  OR public.is_whiteboard_owner(whiteboard_id, auth.uid())
);

CREATE POLICY "Whiteboard owners can create shares"
ON public.whiteboard_shares
FOR INSERT
WITH CHECK (public.is_whiteboard_owner(whiteboard_id, auth.uid()));

CREATE POLICY "Whiteboard owners can delete shares"
ON public.whiteboard_shares
FOR DELETE
USING (public.is_whiteboard_owner(whiteboard_id, auth.uid()));
