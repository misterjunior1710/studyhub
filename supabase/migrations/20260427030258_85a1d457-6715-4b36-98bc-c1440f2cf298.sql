CREATE OR REPLACE FUNCTION public.create_whiteboard(p_name text DEFAULT NULL::text, p_group_id uuid DEFAULT NULL::uuid)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_user_id uuid;
  v_whiteboard_id uuid;
  v_name text;
BEGIN
  v_user_id := auth.uid();
  
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;
  
  IF p_group_id IS NOT NULL THEN
    IF NOT public.is_group_member(p_group_id, v_user_id) THEN
      RAISE EXCEPTION 'You must be a member of the group to create a whiteboard';
    END IF;
  END IF;
  
  v_name := COALESCE(NULLIF(BTRIM(p_name), ''), 'Untitled Whiteboard');
  
  INSERT INTO public.whiteboards (created_by, name, group_id)
  VALUES (v_user_id, v_name, p_group_id)
  RETURNING id INTO v_whiteboard_id;
  
  RETURN v_whiteboard_id;
END;
$function$;