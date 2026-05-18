
-- FIX #1: Prevent self-promotion to admin via group_members INSERT
DROP POLICY IF EXISTS "Members can join groups under controlled conditions" ON public.group_members;

CREATE POLICY "Members can join groups under controlled conditions"
ON public.group_members
FOR INSERT
WITH CHECK (
  -- Group admins can add anyone with any role
  public.is_group_admin(group_id, auth.uid())
  -- Group creator (during initial creation) can add anyone with any role
  OR EXISTS (
    SELECT 1 FROM public.group_chats gc
    WHERE gc.id = group_members.group_id AND gc.created_by = auth.uid()
  )
  -- Self-joins are ONLY allowed as 'member' role, never as 'admin' or 'moderator'
  OR (
    user_id = auth.uid()
    AND role = 'member'
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

-- FIX #2: Prevent self-approval of join requests
DROP POLICY IF EXISTS "Users can create join requests" ON public.group_join_requests;

CREATE POLICY "Users can create join requests"
ON public.group_join_requests
FOR INSERT
WITH CHECK (
  auth.uid() = user_id
  AND status = 'pending'  -- Force pending; only admins can approve via UPDATE
);

-- HARDENING: Prevent users from updating their own pending requests to 'approved'.
-- The existing UPDATE policy already requires is_group_admin, but make sure no
-- alternative UPDATE policy can be exploited. (Verified: only admin UPDATE exists.)

-- HARDENING: Prevent role-escalation via UPDATE on group_members.
-- Currently there is no UPDATE policy on group_members, which means role changes
-- require DELETE + INSERT (admin-only). Add an explicit admin-only UPDATE policy
-- so admins can promote/demote without the destructive delete/insert dance,
-- while still blocking non-admins from any role change.
CREATE POLICY "Group admins can update member roles"
ON public.group_members
FOR UPDATE
USING (public.is_group_admin(group_id, auth.uid()))
WITH CHECK (public.is_group_admin(group_id, auth.uid()));
