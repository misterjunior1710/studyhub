-- Tighten support request creation to explicitly require an authenticated user
DROP POLICY IF EXISTS "Users can create their own support requests" ON public.support_requests;

CREATE POLICY "Authenticated users can create their own support requests"
ON public.support_requests
FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() IS NOT NULL
  AND auth.uid() = user_id
);

-- Keep support request reads scoped to owner/admin with explicit authenticated role
DROP POLICY IF EXISTS "Users can view their own support requests" ON public.support_requests;

CREATE POLICY "Authenticated users can view their own support requests"
ON public.support_requests
FOR SELECT
TO authenticated
USING (
  auth.uid() IS NOT NULL
  AND auth.uid() = user_id
);

-- Tighten admin support policies to authenticated users only
DROP POLICY IF EXISTS "Admins can update support requests" ON public.support_requests;
DROP POLICY IF EXISTS "Admins can delete support requests" ON public.support_requests;

CREATE POLICY "Authenticated admins can update support requests"
ON public.support_requests
FOR UPDATE
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

CREATE POLICY "Authenticated admins can delete support requests"
ON public.support_requests
FOR DELETE
TO authenticated
USING (public.is_admin());

-- Explicitly deny direct client-side wallet writes while preserving trusted backend function updates
DROP POLICY IF EXISTS "Users can insert own wallet" ON public.user_wallet;
DROP POLICY IF EXISTS "Users can update own wallet" ON public.user_wallet;
DROP POLICY IF EXISTS "Users can delete own wallet" ON public.user_wallet;
DROP POLICY IF EXISTS "No direct wallet inserts" ON public.user_wallet;
DROP POLICY IF EXISTS "No direct wallet updates" ON public.user_wallet;
DROP POLICY IF EXISTS "No direct wallet deletes" ON public.user_wallet;

CREATE POLICY "No direct wallet inserts"
ON public.user_wallet
FOR INSERT
TO authenticated
WITH CHECK (false);

CREATE POLICY "No direct wallet updates"
ON public.user_wallet
FOR UPDATE
TO authenticated
USING (false)
WITH CHECK (false);

CREATE POLICY "No direct wallet deletes"
ON public.user_wallet
FOR DELETE
TO authenticated
USING (false);