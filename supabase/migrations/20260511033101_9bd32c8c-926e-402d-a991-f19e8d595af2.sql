
-- Tighten group_messages: must still be a member to edit/delete
DROP POLICY IF EXISTS "Users can update their own group messages" ON public.group_messages;
DROP POLICY IF EXISTS "Users can delete their own group messages" ON public.group_messages;

CREATE POLICY "Users can update their own group messages"
ON public.group_messages
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id AND public.is_group_member(group_id, auth.uid()))
WITH CHECK (auth.uid() = user_id AND public.is_group_member(group_id, auth.uid()));

CREATE POLICY "Users can delete their own group messages"
ON public.group_messages
FOR DELETE
TO authenticated
USING (auth.uid() = user_id AND public.is_group_member(group_id, auth.uid()));

-- Tighten direct_messages: add WITH CHECK so sender_id cannot be changed
DROP POLICY IF EXISTS "Senders can update their own messages" ON public.direct_messages;
DROP POLICY IF EXISTS "Users can update their own direct messages" ON public.direct_messages;

CREATE POLICY "Senders can update their own messages"
ON public.direct_messages
FOR UPDATE
TO authenticated
USING (auth.uid() = sender_id)
WITH CHECK (auth.uid() = sender_id);

-- Fix mutable search_path warnings on email queue helpers
ALTER FUNCTION public.enqueue_email(text, jsonb)        SET search_path = public, pgmq;
ALTER FUNCTION public.read_email_batch(text, integer, integer) SET search_path = public, pgmq;
ALTER FUNCTION public.delete_email(text, bigint)        SET search_path = public, pgmq;
ALTER FUNCTION public.move_to_dlq(text, text, bigint, jsonb)   SET search_path = public, pgmq;
