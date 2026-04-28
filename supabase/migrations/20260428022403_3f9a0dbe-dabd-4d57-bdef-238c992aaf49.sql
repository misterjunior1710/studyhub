-- Add user ownership to support requests for safe user-scoped access
ALTER TABLE public.support_requests
ADD COLUMN IF NOT EXISTS user_id uuid;

-- Tighten support request read/create access around authenticated users and ownership
DROP POLICY IF EXISTS "Admins can view all support requests" ON public.support_requests;
DROP POLICY IF EXISTS "Authenticated users can create support requests" ON public.support_requests;

CREATE POLICY "Admins can view all support requests"
ON public.support_requests
FOR SELECT
TO authenticated
USING (public.is_admin());

CREATE POLICY "Users can view their own support requests"
ON public.support_requests
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own support requests"
ON public.support_requests
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Restrict group member creation to group admins or group creators only
DROP POLICY IF EXISTS "Group members can add members" ON public.group_members;

CREATE POLICY "Group admins and creators can add members"
ON public.group_members
FOR INSERT
TO authenticated
WITH CHECK (
  public.is_group_admin(group_id, auth.uid())
  OR EXISTS (
    SELECT 1
    FROM public.group_chats gc
    WHERE gc.id = group_members.group_id
      AND gc.created_by = auth.uid()
  )
);