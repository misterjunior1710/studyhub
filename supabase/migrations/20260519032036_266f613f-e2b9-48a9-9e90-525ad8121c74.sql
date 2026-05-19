GRANT EXECUTE ON FUNCTION public.can_view_whiteboard(uuid, uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.can_edit_whiteboard(uuid, uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.can_view_whiteboard(uuid, uuid) TO service_role;
GRANT EXECUTE ON FUNCTION public.can_edit_whiteboard(uuid, uuid) TO service_role;