REVOKE EXECUTE ON FUNCTION public.is_group_member(uuid, uuid) FROM anon;
REVOKE EXECUTE ON FUNCTION public.is_group_admin(uuid, uuid) FROM anon;

DROP POLICY IF EXISTS "Users can view their groups or public groups" ON public.group_chats;
CREATE POLICY "Signed-in users can view their groups or public groups"
ON public.group_chats
FOR SELECT
TO authenticated
USING (
  public.is_group_member(id, auth.uid())
  OR created_by = auth.uid()
  OR is_public = true
);

DROP POLICY IF EXISTS "Users can view members of their groups" ON public.group_members;
CREATE POLICY "Signed-in users can view members of their groups"
ON public.group_members
FOR SELECT
TO authenticated
USING (public.is_group_member(group_id, auth.uid()));