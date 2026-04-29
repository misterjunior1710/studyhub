-- Replace the public profile view with a safe, non-sensitive table
DROP VIEW IF EXISTS public.public_profiles;

CREATE TABLE IF NOT EXISTS public.public_profiles (
  id uuid PRIMARY KEY,
  username text,
  avatar_url text,
  bio text,
  country text,
  grade text,
  stream text,
  points integer,
  streak_days integer,
  created_at timestamptz,
  is_public boolean NOT NULL DEFAULT false
);

ALTER TABLE public.public_profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Authenticated users can view public profile cards" ON public.public_profiles;
CREATE POLICY "Authenticated users can view public profile cards"
ON public.public_profiles
FOR SELECT
TO authenticated
USING (is_public = true);

-- Seed current public profiles into the safe table
INSERT INTO public.public_profiles (
  id, username, avatar_url, bio, country, grade, stream, points, streak_days, created_at, is_public
)
SELECT
  id, username, avatar_url, bio, country, grade, stream, points, streak_days, created_at, COALESCE(is_public, false)
FROM public.profiles
WHERE COALESCE(is_public, false) = true
ON CONFLICT (id) DO UPDATE SET
  username = EXCLUDED.username,
  avatar_url = EXCLUDED.avatar_url,
  bio = EXCLUDED.bio,
  country = EXCLUDED.country,
  grade = EXCLUDED.grade,
  stream = EXCLUDED.stream,
  points = EXCLUDED.points,
  streak_days = EXCLUDED.streak_days,
  created_at = EXCLUDED.created_at,
  is_public = EXCLUDED.is_public;

-- Keep public-safe profile data synchronized without exposing private columns
CREATE OR REPLACE FUNCTION public.sync_public_profile_card()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'DELETE' THEN
    DELETE FROM public.public_profiles WHERE id = OLD.id;
    RETURN OLD;
  END IF;

  IF COALESCE(NEW.is_public, false) = true THEN
    INSERT INTO public.public_profiles (
      id, username, avatar_url, bio, country, grade, stream, points, streak_days, created_at, is_public
    )
    VALUES (
      NEW.id, NEW.username, NEW.avatar_url, NEW.bio, NEW.country, NEW.grade, NEW.stream,
      NEW.points, NEW.streak_days, NEW.created_at, true
    )
    ON CONFLICT (id) DO UPDATE SET
      username = EXCLUDED.username,
      avatar_url = EXCLUDED.avatar_url,
      bio = EXCLUDED.bio,
      country = EXCLUDED.country,
      grade = EXCLUDED.grade,
      stream = EXCLUDED.stream,
      points = EXCLUDED.points,
      streak_days = EXCLUDED.streak_days,
      created_at = EXCLUDED.created_at,
      is_public = true;
  ELSE
    DELETE FROM public.public_profiles WHERE id = NEW.id;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS sync_public_profile_card_trigger ON public.profiles;
CREATE TRIGGER sync_public_profile_card_trigger
AFTER INSERT OR UPDATE OF username, avatar_url, bio, country, grade, stream, points, streak_days, is_public OR DELETE
ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.sync_public_profile_card();

GRANT SELECT ON public.public_profiles TO authenticated;