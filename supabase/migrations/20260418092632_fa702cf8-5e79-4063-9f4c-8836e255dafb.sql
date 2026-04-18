CREATE OR REPLACE FUNCTION public.get_user_level(p_total_xp integer)
RETURNS jsonb
LANGUAGE sql
IMMUTABLE
SET search_path TO 'public'
AS $$
  SELECT jsonb_build_object(
    'level', GREATEST(1, FLOOR(SQRT(GREATEST(p_total_xp, 0)::numeric / 100))::integer + 1),
    'current_level_xp', GREATEST(p_total_xp, 0) - (POWER(GREATEST(1, FLOOR(SQRT(GREATEST(p_total_xp, 0)::numeric / 100))::integer + 1) - 1, 2) * 100)::integer,
    'next_level_xp', (POWER(GREATEST(1, FLOOR(SQRT(GREATEST(p_total_xp, 0)::numeric / 100))::integer + 1), 2) * 100)::integer - (POWER(GREATEST(1, FLOOR(SQRT(GREATEST(p_total_xp, 0)::numeric / 100))::integer + 1) - 1, 2) * 100)::integer
  );
$$;