
-- 1. Add subjects array to profiles
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS subjects text[] DEFAULT '{}'::text[];

-- 2. Create or fetch a system user id for owning auto-generated groups
CREATE TABLE IF NOT EXISTS public.system_config (
  key text PRIMARY KEY,
  value text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.system_config ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can manage system_config"
  ON public.system_config FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- 3. Helper: get or create a group by name (auto-generated)
CREATE OR REPLACE FUNCTION public.ensure_auto_group(
  p_name text,
  p_description text
) RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_group_id uuid;
  v_owner uuid;
BEGIN
  SELECT id INTO v_group_id FROM public.group_chats WHERE name = p_name LIMIT 1;
  IF v_group_id IS NOT NULL THEN
    RETURN v_group_id;
  END IF;

  -- Pick first admin as owner; fallback to any user
  SELECT user_id INTO v_owner
  FROM public.user_roles WHERE role = 'admin'::app_role
  ORDER BY created_at ASC LIMIT 1;

  IF v_owner IS NULL THEN
    SELECT id INTO v_owner FROM public.profiles ORDER BY created_at ASC LIMIT 1;
  END IF;

  IF v_owner IS NULL THEN
    RETURN NULL;
  END IF;

  INSERT INTO public.group_chats (name, description, created_by, is_public, show_in_browse)
  VALUES (p_name, p_description, v_owner, true, true)
  RETURNING id INTO v_group_id;

  -- Owner becomes admin member
  INSERT INTO public.group_members (group_id, user_id, role)
  VALUES (v_group_id, v_owner, 'admin')
  ON CONFLICT DO NOTHING;

  RETURN v_group_id;
END;
$$;

-- 4. Assign a user to their demographic + subject groups
CREATE OR REPLACE FUNCTION public.auto_assign_user_to_groups(p_user_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_country text;
  v_grade text;
  v_stream text;
  v_subjects text[];
  v_subject text;
  v_group_name text;
  v_group_id uuid;
BEGIN
  SELECT country, grade, stream, COALESCE(subjects, '{}'::text[])
    INTO v_country, v_grade, v_stream, v_subjects
  FROM public.profiles WHERE id = p_user_id;

  -- Demographic group
  IF v_country IS NOT NULL AND v_grade IS NOT NULL AND v_stream IS NOT NULL
     AND v_country <> '' AND v_grade <> '' AND v_stream <> '' THEN
    v_group_name := v_grade || ' | ' || v_stream || ' | ' || v_country;
    v_group_id := public.ensure_auto_group(
      v_group_name,
      'Auto-generated study group for ' || v_grade || ' ' || v_stream || ' students in ' || v_country || '.'
    );
    IF v_group_id IS NOT NULL THEN
      INSERT INTO public.group_members (group_id, user_id, role)
      VALUES (v_group_id, p_user_id, 'member')
      ON CONFLICT DO NOTHING;
    END IF;
  END IF;

  -- Subject global groups
  FOREACH v_subject IN ARRAY v_subjects LOOP
    IF v_subject IS NOT NULL AND v_subject <> '' THEN
      v_group_name := v_subject || ' — Global';
      v_group_id := public.ensure_auto_group(
        v_group_name,
        'Global community for ' || v_subject || ' learners worldwide.'
      );
      IF v_group_id IS NOT NULL THEN
        INSERT INTO public.group_members (group_id, user_id, role)
        VALUES (v_group_id, p_user_id, 'member')
        ON CONFLICT DO NOTHING;
      END IF;
    END IF;
  END LOOP;
END;
$$;

-- 5. Trigger on profile insert/update
CREATE OR REPLACE FUNCTION public.on_profile_completed_assign_groups()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.country IS NOT NULL AND NEW.grade IS NOT NULL AND NEW.stream IS NOT NULL
     AND NEW.country <> '' AND NEW.grade <> '' AND NEW.stream <> '' THEN
    PERFORM public.auto_assign_user_to_groups(NEW.id);
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_profile_assign_groups ON public.profiles;
CREATE TRIGGER trg_profile_assign_groups
AFTER INSERT OR UPDATE OF country, grade, stream, subjects ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.on_profile_completed_assign_groups();

-- 6. Trigger on post creation: auto-join the post's subject global group
CREATE OR REPLACE FUNCTION public.on_post_assign_subject_group()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_group_name text;
  v_group_id uuid;
BEGIN
  IF NEW.subject IS NOT NULL AND NEW.subject <> '' THEN
    v_group_name := NEW.subject || ' — Global';
    v_group_id := public.ensure_auto_group(
      v_group_name,
      'Global community for ' || NEW.subject || ' learners worldwide.'
    );
    IF v_group_id IS NOT NULL THEN
      INSERT INTO public.group_members (group_id, user_id, role)
      VALUES (v_group_id, NEW.user_id, 'member')
      ON CONFLICT DO NOTHING;
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_post_assign_subject_group ON public.posts;
CREATE TRIGGER trg_post_assign_subject_group
AFTER INSERT ON public.posts
FOR EACH ROW
EXECUTE FUNCTION public.on_post_assign_subject_group();

-- 7. Backfill: assign all users with complete profiles
DO $$
DECLARE
  r record;
BEGIN
  FOR r IN
    SELECT id FROM public.profiles
    WHERE country IS NOT NULL AND grade IS NOT NULL AND stream IS NOT NULL
      AND country <> '' AND grade <> '' AND stream <> ''
  LOOP
    PERFORM public.auto_assign_user_to_groups(r.id);
  END LOOP;

  -- Also backfill subject groups from existing posts
  FOR r IN
    SELECT DISTINCT user_id, subject FROM public.posts
    WHERE subject IS NOT NULL AND subject <> ''
  LOOP
    DECLARE
      v_gid uuid;
    BEGIN
      v_gid := public.ensure_auto_group(
        r.subject || ' — Global',
        'Global community for ' || r.subject || ' learners worldwide.'
      );
      IF v_gid IS NOT NULL THEN
        INSERT INTO public.group_members (group_id, user_id, role)
        VALUES (v_gid, r.user_id, 'member')
        ON CONFLICT DO NOTHING;
      END IF;
    END;
  END LOOP;
END $$;
