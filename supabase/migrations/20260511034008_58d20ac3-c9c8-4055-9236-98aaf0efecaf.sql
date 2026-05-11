
-- 1. Drop weaker overlapping group_messages policies
DROP POLICY IF EXISTS "Users can update their own messages" ON public.group_messages;
DROP POLICY IF EXISTS "Users can delete their own messages" ON public.group_messages;

-- 2. Tighten group_members INSERT policy
DROP POLICY IF EXISTS "Group admins and creators can add members" ON public.group_members;

CREATE POLICY "Members can join groups under controlled conditions"
ON public.group_members
FOR INSERT
TO authenticated
WITH CHECK (
  -- Admin or creator can add anyone
  is_group_admin(group_id, auth.uid())
  OR EXISTS (
    SELECT 1 FROM public.group_chats gc
    WHERE gc.id = group_members.group_id AND gc.created_by = auth.uid()
  )
  -- Self-join only allowed for public groups OR via approved join request
  OR (
    user_id = auth.uid()
    AND (
      EXISTS (
        SELECT 1 FROM public.group_chats gc
        WHERE gc.id = group_members.group_id AND gc.is_public = true
      )
      OR EXISTS (
        SELECT 1 FROM public.group_join_requests jr
        WHERE jr.group_id = group_members.group_id
          AND jr.user_id = auth.uid()
          AND jr.status = 'approved'
      )
    )
  )
);

-- 3. Support requests: enforce email matches authenticated user's email
DROP POLICY IF EXISTS "Authenticated users can create their own support requests" ON public.support_requests;

CREATE POLICY "Authenticated users can create their own support requests"
ON public.support_requests
FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() IS NOT NULL
  AND auth.uid() = user_id
  AND email = auth.email()
);
