-- Create trigger function for admin announcement notifications
CREATE OR REPLACE FUNCTION public.create_admin_announcement_notification()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  is_poster_admin boolean;
BEGIN
  -- Check if the post creator is an admin
  SELECT public.has_role(NEW.user_id, 'admin') INTO is_poster_admin;
  
  IF is_poster_admin THEN
    -- Insert notifications for all users who have announcements enabled
    INSERT INTO public.notifications (user_id, type, content, post_id)
    SELECT 
      p.id,
      'announcement',
      '📢 Admin posted: ' || LEFT(NEW.title, 50),
      NEW.id
    FROM public.profiles p
    WHERE p.id != NEW.user_id  -- Don't notify the admin themselves
      AND COALESCE(p.notify_announcements, true) = true;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger for admin announcements
DROP TRIGGER IF EXISTS on_admin_post_created ON public.posts;
CREATE TRIGGER on_admin_post_created
  AFTER INSERT ON public.posts
  FOR EACH ROW
  EXECUTE FUNCTION public.create_admin_announcement_notification();