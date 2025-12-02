
-- Drop the problematic policy
DROP POLICY IF EXISTS "Service role can manage daily_stats" ON public.daily_stats;

-- Create proper policies for authenticated users to upsert daily stats
CREATE POLICY "Authenticated users can insert daily_stats" ON public.daily_stats
  FOR INSERT TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update daily_stats" ON public.daily_stats
  FOR UPDATE TO authenticated
  USING (true);

CREATE POLICY "Anyone can read daily_stats" ON public.daily_stats
  FOR SELECT
  USING (true);
