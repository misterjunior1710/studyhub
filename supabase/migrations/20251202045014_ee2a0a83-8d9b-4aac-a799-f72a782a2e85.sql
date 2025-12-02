-- Create security definer function to check if user is group admin
CREATE OR REPLACE FUNCTION public.is_group_admin(_group_id uuid, _user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.group_members
    WHERE group_id = _group_id
      AND user_id = _user_id
      AND role = 'admin'
  )
$$;

-- Create function to check if user is group member
CREATE OR REPLACE FUNCTION public.is_group_member(_group_id uuid, _user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.group_members
    WHERE group_id = _group_id
      AND user_id = _user_id
  )
$$;

-- Drop existing problematic policies on group_members
DROP POLICY IF EXISTS "Group admins can add members" ON public.group_members;
DROP POLICY IF EXISTS "Group admins can remove members" ON public.group_members;
DROP POLICY IF EXISTS "Users can view members of their groups" ON public.group_members;

-- Recreate policies using security definer functions
CREATE POLICY "Group admins can add members" ON public.group_members
FOR INSERT WITH CHECK (
  public.is_group_admin(group_id, auth.uid()) 
  OR (SELECT created_by FROM public.group_chats WHERE id = group_id) = auth.uid()
);

CREATE POLICY "Group admins can remove members" ON public.group_members
FOR DELETE USING (
  public.is_group_admin(group_id, auth.uid()) 
  OR user_id = auth.uid()
);

CREATE POLICY "Users can view members of their groups" ON public.group_members
FOR SELECT USING (
  public.is_group_member(group_id, auth.uid())
);

-- Also fix group_chats policies to use security definer functions
DROP POLICY IF EXISTS "Users can view groups they are members of" ON public.group_chats;
DROP POLICY IF EXISTS "Group admins can update groups" ON public.group_chats;
DROP POLICY IF EXISTS "Group admins can delete groups" ON public.group_chats;

CREATE POLICY "Users can view groups they are members of" ON public.group_chats
FOR SELECT USING (
  public.is_group_member(id, auth.uid())
);

CREATE POLICY "Group admins can update groups" ON public.group_chats
FOR UPDATE USING (
  public.is_group_admin(id, auth.uid())
);

CREATE POLICY "Group admins can delete groups" ON public.group_chats
FOR DELETE USING (
  public.is_group_admin(id, auth.uid())
);

-- Fix group_messages policies
DROP POLICY IF EXISTS "Group members can view messages" ON public.group_messages;
DROP POLICY IF EXISTS "Group members can send messages" ON public.group_messages;

CREATE POLICY "Group members can view messages" ON public.group_messages
FOR SELECT USING (
  public.is_group_member(group_id, auth.uid())
);

CREATE POLICY "Group members can send messages" ON public.group_messages
FOR INSERT WITH CHECK (
  auth.uid() = user_id 
  AND public.is_group_member(group_id, auth.uid())
);