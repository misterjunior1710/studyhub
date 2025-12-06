-- Create support_requests table to store all support tickets
CREATE TABLE public.support_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  category TEXT NOT NULL,
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.support_requests ENABLE ROW LEVEL SECURITY;

-- Allow anyone to create support requests (no auth required for support)
CREATE POLICY "Anyone can create support requests"
ON public.support_requests
FOR INSERT
WITH CHECK (true);

-- Only admins can view all support requests
CREATE POLICY "Admins can view all support requests"
ON public.support_requests
FOR SELECT
USING (is_admin());

-- Only admins can update support requests
CREATE POLICY "Admins can update support requests"
ON public.support_requests
FOR UPDATE
USING (is_admin());

-- Only admins can delete support requests
CREATE POLICY "Admins can delete support requests"
ON public.support_requests
FOR DELETE
USING (is_admin());

-- Trigger for updated_at
CREATE TRIGGER update_support_requests_updated_at
BEFORE UPDATE ON public.support_requests
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();