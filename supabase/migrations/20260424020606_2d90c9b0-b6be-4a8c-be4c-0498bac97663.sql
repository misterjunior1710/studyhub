-- Helper: check if current user is participant in a conversation
CREATE OR REPLACE FUNCTION public.is_conversation_participant(_conversation_id uuid, _user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.conversations
    WHERE id = _conversation_id
      AND (user1_id = _user_id OR user2_id = _user_id)
  );
$$;

-- Ensure RLS is on for realtime.messages
ALTER TABLE realtime.messages ENABLE ROW LEVEL SECURITY;

-- Drop any prior policies we own (idempotent)
DROP POLICY IF EXISTS "realtime: authorize channel subscriptions" ON realtime.messages;

-- Single policy gating channel access by topic prefix.
-- Topic conventions used in the app:
--   conversation:<conversation_id>   → DMs
--   group:<group_id>                 → group messages, group docs
--   wallet:<user_id>                 → user wallet
--   whiteboard:<whiteboard_id>       → whiteboards
--   doc:<doc_id>                     → collaborative docs
--   goals:<user_id>                  → daily goals
-- Any other topic: allowed for authenticated users (existing behavior).
CREATE POLICY "realtime: authorize channel subscriptions"
ON realtime.messages
FOR SELECT
TO authenticated
USING (
  CASE
    -- Direct message conversations
    WHEN realtime.topic() LIKE 'conversation:%' THEN
      public.is_conversation_participant(
        NULLIF(split_part(realtime.topic(), ':', 2), '')::uuid,
        (SELECT auth.uid())
      )

    -- Group chats / group-scoped docs
    WHEN realtime.topic() LIKE 'group:%' THEN
      public.is_group_member(
        NULLIF(split_part(realtime.topic(), ':', 2), '')::uuid,
        (SELECT auth.uid())
      )

    -- Personal wallet
    WHEN realtime.topic() LIKE 'wallet:%' THEN
      NULLIF(split_part(realtime.topic(), ':', 2), '')::uuid = (SELECT auth.uid())

    -- Whiteboards
    WHEN realtime.topic() LIKE 'whiteboard:%' THEN
      public.can_view_whiteboard(
        NULLIF(split_part(realtime.topic(), ':', 2), '')::uuid,
        (SELECT auth.uid())
      )

    -- Collaborative docs (gate by parent group membership)
    WHEN realtime.topic() LIKE 'doc:%' THEN
      EXISTS (
        SELECT 1
        FROM public.collaborative_docs d
        WHERE d.id = NULLIF(split_part(realtime.topic(), ':', 2), '')::uuid
          AND public.is_group_member(d.group_id, (SELECT auth.uid()))
      )

    -- Personal daily goals
    WHEN realtime.topic() LIKE 'goals:%' THEN
      NULLIF(split_part(realtime.topic(), ':', 2), '')::uuid = (SELECT auth.uid())

    -- Default: allow other (non-sensitive) topics for authenticated users
    ELSE true
  END
);