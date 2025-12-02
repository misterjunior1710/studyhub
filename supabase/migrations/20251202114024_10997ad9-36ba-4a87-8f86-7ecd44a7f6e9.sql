-- Create ban_appeals table for users to appeal their bans
CREATE TABLE public.ban_appeals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  reason TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  admin_response TEXT,
  reviewed_by UUID,
  reviewed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.ban_appeals ENABLE ROW LEVEL SECURITY;

-- Users can view their own appeals
CREATE POLICY "Users can view their own appeals"
ON public.ban_appeals
FOR SELECT
USING (auth.uid() = user_id OR is_admin());

-- Users can create appeals
CREATE POLICY "Users can create appeals"
ON public.ban_appeals
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Admins can update appeals
CREATE POLICY "Admins can update appeals"
ON public.ban_appeals
FOR UPDATE
USING (is_admin());

-- Admins can delete appeals
CREATE POLICY "Admins can delete appeals"
ON public.ban_appeals
FOR DELETE
USING (is_admin());

-- Add trigger for updated_at
CREATE TRIGGER update_ban_appeals_updated_at
BEFORE UPDATE ON public.ban_appeals
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();