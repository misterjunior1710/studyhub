DROP POLICY IF EXISTS "Anyone can create support requests" ON public.support_requests;

CREATE POLICY "Authenticated users can create support requests"
ON public.support_requests
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() IS NOT NULL);