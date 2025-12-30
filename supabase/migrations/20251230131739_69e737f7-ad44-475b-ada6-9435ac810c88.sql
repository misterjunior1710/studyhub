-- Create a secure function to create whiteboards
-- This bypasses RLS issues by using SECURITY DEFINER
CREATE OR REPLACE FUNCTION public.create_whiteboard(
  p_name text DEFAULT NULL,
  p_group_id uuid DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
SET row_security = off
AS $$
DECLARE
  v_user_id uuid;
  v_whiteboard_id uuid;
  v_name text;
BEGIN
  -- Get the authenticated user
  v_user_id := auth.uid();
  
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;
  
  -- If group_id provided, verify membership
  IF p_group_id IS NOT NULL THEN
    IF NOT public.is_group_member(p_group_id, v_user_id) THEN
      RAISE EXCEPTION 'You must be a member of the group to create a whiteboard';
    END IF;
  END IF;
  
  -- Set default name if not provided
  v_name := COALESCE(p_name, 'Untitled Whiteboard');
  
  -- Insert the whiteboard
  INSERT INTO public.whiteboards (created_by, name, group_id)
  VALUES (v_user_id, v_name, p_group_id)
  RETURNING id INTO v_whiteboard_id;
  
  RETURN v_whiteboard_id;
END;
$$;

-- Set permissions
REVOKE ALL ON FUNCTION public.create_whiteboard(text, uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.create_whiteboard(text, uuid) TO authenticated;