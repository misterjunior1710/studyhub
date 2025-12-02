-- Fix: Allow group creators to view their groups (needed for INSERT...RETURNING)
DROP POLICY IF EXISTS "Users can view groups they are members of" ON public.group_chats;

CREATE POLICY "Users can view groups they are members of or created" ON public.group_chats
FOR SELECT USING (
  public.is_group_member(id, auth.uid()) 
  OR created_by = auth.uid()
);