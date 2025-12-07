
-- Drop existing trigger first (the one that exists is on_comment_created, not on_comment_created_notification)
DROP TRIGGER IF EXISTS on_comment_created ON public.comments;
DROP TRIGGER IF EXISTS on_comment_created_notification ON public.comments;

-- Now drop and recreate the function
DROP FUNCTION IF EXISTS public.create_comment_notification() CASCADE;

-- Create updated comment notification function that respects user preferences
CREATE OR REPLACE FUNCTION public.create_comment_notification()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
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
        commenter_username || ' commented on your post',
        NEW.post_id
      );
    END IF;
  END IF;
  
  -- Handle @mentions in the comment content
  FOR mentioned_user IN
    SELECT DISTINCT p.id, p.username, COALESCE(p.notify_mentions, true) as notify_mentions
    FROM public.profiles p
    WHERE p.username IS NOT NULL
      AND NEW.content ~* ('@' || p.username || '([^a-zA-Z0-9_]|$)')
      AND p.id != NEW.user_id
  LOOP
    IF mentioned_user.notify_mentions THEN
      INSERT INTO public.notifications (user_id, type, content, post_id)
      VALUES (
        mentioned_user.id,
        'mention',
        commenter_username || ' mentioned you in a comment',
        NEW.post_id
      );
    END IF;
  END LOOP;
  
  RETURN NEW;
END;
$$;

-- Recreate the trigger
CREATE TRIGGER on_comment_created_notification
  AFTER INSERT ON public.comments
  FOR EACH ROW
  EXECUTE FUNCTION public.create_comment_notification();

-- Create function for group member notifications
CREATE OR REPLACE FUNCTION public.create_group_member_notification()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  group_name text;
  new_member_username text;
  member record;
BEGIN
  SELECT name INTO group_name FROM public.group_chats WHERE id = NEW.group_id;
  SELECT username INTO new_member_username FROM public.profiles WHERE id = NEW.user_id;
  
  FOR member IN
    SELECT gm.user_id, COALESCE(p.notify_group_updates, true) as notify_group_updates
    FROM public.group_members gm
    JOIN public.profiles p ON p.id = gm.user_id
    WHERE gm.group_id = NEW.group_id
      AND gm.user_id != NEW.user_id
  LOOP
    IF member.notify_group_updates THEN
      INSERT INTO public.notifications (user_id, type, content, post_id)
      VALUES (
        member.user_id,
        'group_update',
        new_member_username || ' joined ' || group_name,
        NULL
      );
    END IF;
  END LOOP;
  
  RETURN NEW;
END;
$$;

-- Create trigger for group member joins
DROP TRIGGER IF EXISTS on_group_member_joined ON public.group_members;
CREATE TRIGGER on_group_member_joined
  AFTER INSERT ON public.group_members
  FOR EACH ROW
  EXECUTE FUNCTION public.create_group_member_notification();

-- Create function for group message notifications
CREATE OR REPLACE FUNCTION public.create_group_message_notification()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  group_name text;
  sender_username text;
  member record;
BEGIN
  SELECT name INTO group_name FROM public.group_chats WHERE id = NEW.group_id;
  SELECT username INTO sender_username FROM public.profiles WHERE id = NEW.user_id;
  
  FOR member IN
    SELECT gm.user_id, COALESCE(p.notify_group_updates, true) as notify_group_updates
    FROM public.group_members gm
    JOIN public.profiles p ON p.id = gm.user_id
    WHERE gm.group_id = NEW.group_id
      AND gm.user_id != NEW.user_id
  LOOP
    IF member.notify_group_updates THEN
      INSERT INTO public.notifications (user_id, type, content, post_id)
      VALUES (
        member.user_id,
        'group_message',
        sender_username || ' sent a message in ' || group_name,
        NULL
      );
    END IF;
  END LOOP;
  
  RETURN NEW;
END;
$$;

-- Create trigger for group messages
DROP TRIGGER IF EXISTS on_group_message_sent ON public.group_messages;
CREATE TRIGGER on_group_message_sent
  AFTER INSERT ON public.group_messages
  FOR EACH ROW
  EXECUTE FUNCTION public.create_group_message_notification();
