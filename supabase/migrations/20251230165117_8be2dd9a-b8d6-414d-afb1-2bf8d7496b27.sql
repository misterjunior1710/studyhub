-- Add last_active_date column for streak tracking
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS last_active_date date DEFAULT NULL;

-- Create function to update user streak on activity
CREATE OR REPLACE FUNCTION public.update_user_streak(p_user_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_last_active date;
  v_today date := CURRENT_DATE;
BEGIN
  -- Get current last_active_date
  SELECT last_active_date INTO v_last_active 
  FROM public.profiles 
  WHERE id = p_user_id;
  
  -- If already active today, do nothing
  IF v_last_active = v_today THEN
    RETURN;
  END IF;
  
  -- If active yesterday, increment streak
  IF v_last_active = v_today - INTERVAL '1 day' THEN
    UPDATE public.profiles 
    SET 
      streak_days = COALESCE(streak_days, 0) + 1,
      last_active_date = v_today
    WHERE id = p_user_id;
  -- If first activity or gap > 1 day, reset streak to 1
  ELSE
    UPDATE public.profiles 
    SET 
      streak_days = 1,
      last_active_date = v_today
    WHERE id = p_user_id;
  END IF;
END;
$$;

-- Create trigger to update streak on post creation
CREATE OR REPLACE FUNCTION public.on_post_created_update_streak()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  PERFORM public.update_user_streak(NEW.user_id);
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS update_streak_on_post ON public.posts;
CREATE TRIGGER update_streak_on_post
  AFTER INSERT ON public.posts
  FOR EACH ROW
  EXECUTE FUNCTION public.on_post_created_update_streak();

-- Create trigger to update streak on comment creation
CREATE OR REPLACE FUNCTION public.on_comment_created_update_streak()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  PERFORM public.update_user_streak(NEW.user_id);
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS update_streak_on_comment ON public.comments;
CREATE TRIGGER update_streak_on_comment
  AFTER INSERT ON public.comments
  FOR EACH ROW
  EXECUTE FUNCTION public.on_comment_created_update_streak();