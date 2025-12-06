-- Drop the overly permissive policies
DROP POLICY IF EXISTS "Authenticated users can insert daily_stats" ON public.daily_stats;
DROP POLICY IF EXISTS "Authenticated users can update daily_stats" ON public.daily_stats;
DROP POLICY IF EXISTS "Anyone can read daily_stats" ON public.daily_stats;

-- Create admin-only policies for INSERT and UPDATE
CREATE POLICY "Admins can insert daily_stats"
ON public.daily_stats
FOR INSERT
WITH CHECK (is_admin());

CREATE POLICY "Admins can update daily_stats"
ON public.daily_stats
FOR UPDATE
USING (is_admin());