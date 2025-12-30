-- Add is_public column to group_chats for open/closed groups
ALTER TABLE public.group_chats ADD COLUMN IF NOT EXISTS is_public boolean DEFAULT true;

-- Create group_join_requests table
CREATE TABLE IF NOT EXISTS public.group_join_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id uuid NOT NULL REFERENCES public.group_chats(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  message text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(group_id, user_id)
);

-- Enable RLS
ALTER TABLE public.group_join_requests ENABLE ROW LEVEL SECURITY;

-- Policies for group_join_requests
CREATE POLICY "Users can create join requests"
  ON public.group_join_requests FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own requests"
  ON public.group_join_requests FOR SELECT
  USING (auth.uid() = user_id OR is_group_admin(group_id, auth.uid()));

CREATE POLICY "Group admins can update requests"
  ON public.group_join_requests FOR UPDATE
  USING (is_group_admin(group_id, auth.uid()));

CREATE POLICY "Group admins can delete requests"
  ON public.group_join_requests FOR DELETE
  USING (is_group_admin(group_id, auth.uid()) OR auth.uid() = user_id);

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_group_join_requests_group ON public.group_join_requests(group_id);
CREATE INDEX IF NOT EXISTS idx_group_join_requests_status ON public.group_join_requests(status);
CREATE INDEX IF NOT EXISTS idx_group_chats_public ON public.group_chats(is_public);

-- Update SELECT policy for group_chats to allow viewing public groups
DROP POLICY IF EXISTS "Users can view groups they are members of or created" ON public.group_chats;
CREATE POLICY "Users can view their groups or public groups"
  ON public.group_chats FOR SELECT
  USING (is_group_member(id, auth.uid()) OR created_by = auth.uid() OR is_public = true);