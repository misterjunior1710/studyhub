-- Ensure pg_net is enabled for async HTTP from triggers
CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;

-- Store the service-role key + function URL via vault if available; fallback to GUCs.
-- We use a simple settings table approach for portability.
CREATE TABLE IF NOT EXISTS public.app_config (
  key text PRIMARY KEY,
  value text NOT NULL,
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.app_config ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can manage app_config" ON public.app_config;
CREATE POLICY "Admins can manage app_config"
ON public.app_config
FOR ALL
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- Seed (or update) the web-push function URL. Service role key is set separately.
INSERT INTO public.app_config (key, value)
VALUES ('web_push_url', 'https://qrquegcexsqrbtwtcicq.supabase.co/functions/v1/web-push')
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = now();

-- Trigger function: dispatch a push for each new notification
CREATE OR REPLACE FUNCTION public.dispatch_push_for_notification()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'extensions'
AS $$
DECLARE
  v_url text;
  v_service_key text;
  v_title text;
  v_target_url text;
  v_tag text;
BEGIN
  SELECT value INTO v_url FROM public.app_config WHERE key = 'web_push_url';
  SELECT value INTO v_service_key FROM public.app_config WHERE key = 'service_role_key';

  IF v_url IS NULL OR v_service_key IS NULL THEN
    RETURN NEW; -- not configured yet, do nothing
  END IF;

  -- Map notification type -> title + URL
  CASE NEW.type
    WHEN 'comment' THEN
      v_title := 'New reply';
      v_target_url := CASE WHEN NEW.post_id IS NOT NULL
                           THEN '/post/' || NEW.post_id::text
                           ELSE '/' END;
      v_tag := 'comment';
    WHEN 'mention' THEN
      v_title := 'You were mentioned';
      v_target_url := CASE WHEN NEW.post_id IS NOT NULL
                           THEN '/post/' || NEW.post_id::text
                           ELSE '/' END;
      v_tag := 'mention';
    WHEN 'direct_message' THEN
      v_title := 'New message';
      v_target_url := '/messages';
      v_tag := 'dm';
    WHEN 'group_message' THEN
      v_title := 'New group message';
      v_target_url := '/groups';
      v_tag := 'group_msg';
    WHEN 'group_update' THEN
      v_title := 'Group update';
      v_target_url := '/groups';
      v_tag := 'group';
    WHEN 'new_follower' THEN
      v_title := 'New follower';
      v_target_url := '/friends';
      v_tag := 'follower';
    WHEN 'announcement' THEN
      v_title := 'Announcement';
      v_target_url := CASE WHEN NEW.post_id IS NOT NULL
                           THEN '/post/' || NEW.post_id::text
                           ELSE '/updates' END;
      v_tag := 'announcement';
    WHEN 'mission_complete' THEN
      v_title := 'Mission complete';
      v_target_url := '/missions';
      v_tag := 'mission';
    ELSE
      v_title := 'StudyHub';
      v_target_url := '/';
      v_tag := COALESCE(NEW.type, 'notif');
  END CASE;

  -- Fire async HTTP POST; ignore failures to never block insert
  BEGIN
    PERFORM extensions.http_post(
      url := v_url,
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer ' || v_service_key
      ),
      body := jsonb_build_object(
        'action', 'notify-user',
        'userId', NEW.user_id,
        'title', v_title,
        'body', NEW.content,
        'url', v_target_url,
        'tag', v_tag
      )
    );
  EXCEPTION WHEN OTHERS THEN
    -- swallow errors silently
    NULL;
  END;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_dispatch_push_for_notification ON public.notifications;
CREATE TRIGGER trg_dispatch_push_for_notification
AFTER INSERT ON public.notifications
FOR EACH ROW
EXECUTE FUNCTION public.dispatch_push_for_notification();