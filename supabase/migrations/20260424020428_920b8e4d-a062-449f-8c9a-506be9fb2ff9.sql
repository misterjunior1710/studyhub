-- Drop any existing permissive SELECT policies on user_xp_totals
DO $$
DECLARE pol record;
BEGIN
  FOR pol IN
    SELECT polname FROM pg_policy
    WHERE polrelid = 'public.user_xp_totals'::regclass
      AND polcmd = 'r'  -- SELECT
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.user_xp_totals', pol.polname);
  END LOOP;
END $$;

-- Ensure RLS is enabled
ALTER TABLE public.user_xp_totals ENABLE ROW LEVEL SECURITY;

-- Authenticated-only SELECT policy (leaderboards still work for logged-in users)
CREATE POLICY "Authenticated users can view XP totals"
ON public.user_xp_totals
FOR SELECT
TO authenticated
USING (auth.uid() IS NOT NULL);