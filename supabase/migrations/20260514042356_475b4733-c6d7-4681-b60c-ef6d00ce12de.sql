GRANT EXECUTE ON FUNCTION public.is_group_member(uuid, uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_group_admin(uuid, uuid) TO authenticated;

GRANT EXECUTE ON FUNCTION public.is_group_member(uuid, uuid) TO anon;
GRANT EXECUTE ON FUNCTION public.is_group_admin(uuid, uuid) TO anon;