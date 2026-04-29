DROP POLICY IF EXISTS "Group members can remove members" ON public.group_members;

CREATE POLICY "Members can leave and admins can remove members"
ON public.group_members
FOR DELETE
TO authenticated
USING (
  user_id = auth.uid()
  OR public.is_group_admin(group_id, auth.uid())
);

CREATE POLICY "Authenticated users can view public profiles"
ON public.profiles
FOR SELECT
TO authenticated
USING (
  COALESCE(is_public, false) = true
);