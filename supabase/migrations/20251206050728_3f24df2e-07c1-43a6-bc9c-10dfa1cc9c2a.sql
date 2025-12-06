-- Revoke access from anonymous and public roles
REVOKE ALL ON public.public_profiles FROM anon;
REVOKE ALL ON public.public_profiles FROM public;

-- Ensure only authenticated users can access
GRANT SELECT ON public.public_profiles TO authenticated;