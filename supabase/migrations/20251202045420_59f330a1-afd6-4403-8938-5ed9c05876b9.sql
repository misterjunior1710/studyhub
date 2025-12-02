-- Allow all group members to add and remove members (not just admins)
DROP POLICY IF EXISTS "Group admins can add members" ON public.group_members;
DROP POLICY IF EXISTS "Group admins can remove members" ON public.group_members;

-- Any group member can add new members
CREATE POLICY "Group members can add members" ON public.group_members
FOR INSERT WITH CHECK (
  public.is_group_member(group_id, auth.uid()) 
  OR (SELECT created_by FROM public.group_chats WHERE id = group_id) = auth.uid()
);

-- Any group member can remove members (or user can remove themselves)
CREATE POLICY "Group members can remove members" ON public.group_members
FOR DELETE USING (
  public.is_group_member(group_id, auth.uid()) 
  OR user_id = auth.uid()
);

-- Allow admins to update any post
CREATE POLICY "Admins can update any post" ON public.posts
FOR UPDATE USING (is_admin());