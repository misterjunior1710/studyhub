-- Ensure the public profile view runs with the caller's permissions and not elevated owner permissions
ALTER VIEW public.public_profiles SET (security_invoker = true);