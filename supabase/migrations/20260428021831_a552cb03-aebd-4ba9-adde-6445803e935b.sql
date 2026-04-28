-- Restrict public avatar access to exact per-user avatar object paths instead of broad bucket listing
DROP POLICY IF EXISTS "Public can view avatars" ON storage.objects;

CREATE POLICY "Public can view avatar files by exact path"
ON storage.objects
FOR SELECT
TO public
USING (
  bucket_id = 'avatars'
  AND name = ((storage.foldername(name))[1] || '/avatar.' || storage.extension(name))
  AND lower(storage.extension(name)) = ANY (ARRAY['jpg', 'jpeg', 'png', 'gif', 'webp'])
);

-- Deny unrecognized Realtime channel topics by default
DROP POLICY IF EXISTS "realtime: authorize channel subscriptions" ON realtime.messages;

CREATE POLICY "realtime: authorize channel subscriptions"
ON realtime.messages
FOR SELECT
TO authenticated
USING (
  CASE
    WHEN realtime.topic() LIKE 'conversation:%' THEN
      public.is_conversation_participant(
        NULLIF(split_part(realtime.topic(), ':', 2), '')::uuid,
        auth.uid()
      )
    WHEN realtime.topic() LIKE 'group:%' THEN
      public.is_group_member(
        NULLIF(split_part(realtime.topic(), ':', 2), '')::uuid,
        auth.uid()
      )
    WHEN realtime.topic() LIKE 'wallet:%' THEN
      NULLIF(split_part(realtime.topic(), ':', 2), '')::uuid = auth.uid()
    WHEN realtime.topic() LIKE 'whiteboard:%' THEN
      public.can_view_whiteboard(
        NULLIF(split_part(realtime.topic(), ':', 2), '')::uuid,
        auth.uid()
      )
    WHEN realtime.topic() LIKE 'doc:%' THEN
      EXISTS (
        SELECT 1
        FROM public.collaborative_docs d
        WHERE d.id = NULLIF(split_part(realtime.topic(), ':', 2), '')::uuid
          AND public.is_group_member(d.group_id, auth.uid())
      )
    WHEN realtime.topic() LIKE 'goals:%' THEN
      NULLIF(split_part(realtime.topic(), ':', 2), '')::uuid = auth.uid()
    ELSE false
  END
);

-- Speed up exact case-insensitive username lookups used by mention notifications
CREATE INDEX IF NOT EXISTS idx_profiles_lower_username
ON public.profiles (lower(username))
WHERE username IS NOT NULL;

-- Replace user-controlled mention regex matching with bounded extraction and exact username matching
CREATE OR REPLACE FUNCTION public.create_comment_notification()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  post_author_id uuid;
  commenter_username text;
  author_notify_pref boolean;
  mentioned_user record;
BEGIN
  -- Get the post author
  SELECT user_id INTO post_author_id FROM public.posts WHERE id = NEW.post_id;

  -- Get commenter username
  SELECT username INTO commenter_username FROM public.profiles WHERE id = NEW.user_id;

  -- Only create notification if someone else commented (not the author)
  IF post_author_id != NEW.user_id THEN
    -- Check if the post author wants to receive doubt reply notifications
    SELECT COALESCE(notify_doubt_replies, true) INTO author_notify_pref
    FROM public.profiles WHERE id = post_author_id;

    IF author_notify_pref THEN
      INSERT INTO public.notifications (user_id, type, content, post_id)
      VALUES (
        post_author_id,
        'comment',
        COALESCE(commenter_username, 'Someone') || ' commented on your post',
        NEW.post_id
      );
    END IF;
  END IF;

  -- Handle up to 10 @mentions using a fixed, bounded extraction pattern and exact username matching.
  FOR mentioned_user IN
    WITH extracted_mentions AS (
      SELECT DISTINCT lower(match[1]) AS username
      FROM regexp_matches(LEFT(COALESCE(NEW.content, ''), 10000), '@([A-Za-z0-9_]{3,20})', 'g') AS match
      LIMIT 10
    )
    SELECT DISTINCT p.id, p.username, COALESCE(p.notify_mentions, true) AS notify_mentions
    FROM extracted_mentions em
    JOIN public.profiles p ON lower(p.username) = em.username
    WHERE p.id != NEW.user_id
  LOOP
    IF mentioned_user.notify_mentions THEN
      INSERT INTO public.notifications (user_id, type, content, post_id)
      VALUES (
        mentioned_user.id,
        'mention',
        COALESCE(commenter_username, 'Someone') || ' mentioned you in a comment',
        NEW.post_id
      );
    END IF;
  END LOOP;

  RETURN NEW;
END;
$function$;