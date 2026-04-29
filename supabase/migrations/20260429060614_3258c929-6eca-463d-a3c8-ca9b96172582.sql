-- The sync helper is trigger-only and must not be directly callable from the client API
REVOKE ALL ON FUNCTION public.sync_public_profile_card() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.sync_public_profile_card() FROM anon;
REVOKE ALL ON FUNCTION public.sync_public_profile_card() FROM authenticated;