-- Create reports table for user-submitted reports
CREATE TABLE public.reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id uuid REFERENCES public.posts(id) ON DELETE CASCADE NOT NULL,
  reporter_id uuid NOT NULL,
  reason text NOT NULL,
  details text,
  status text DEFAULT 'pending' NOT NULL,
  reviewed_by uuid,
  reviewed_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT now() NOT NULL
);

-- Create user_warnings table for strike system
CREATE TABLE public.user_warnings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  warning_type text NOT NULL, -- 'spam', 'inappropriate', 'harassment', 'other'
  reason text NOT NULL,
  post_id uuid REFERENCES public.posts(id) ON DELETE SET NULL,
  issued_by uuid,
  is_active boolean DEFAULT true,
  expires_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT now() NOT NULL
);

-- Add strike count to profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS strike_count integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS is_banned boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS banned_until timestamp with time zone;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_reports_status ON public.reports(status);
CREATE INDEX IF NOT EXISTS idx_reports_post ON public.reports(post_id);
CREATE INDEX IF NOT EXISTS idx_user_warnings_user ON public.user_warnings(user_id);
CREATE INDEX IF NOT EXISTS idx_profiles_banned ON public.profiles(is_banned);

-- Enable RLS
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_warnings ENABLE ROW LEVEL SECURITY;

-- Reports RLS policies
CREATE POLICY "Users can create reports"
ON public.reports
FOR INSERT
WITH CHECK (auth.uid() = reporter_id);

CREATE POLICY "Users can view their own reports"
ON public.reports
FOR SELECT
USING (auth.uid() = reporter_id OR is_admin());

CREATE POLICY "Admins can update reports"
ON public.reports
FOR UPDATE
USING (is_admin());

CREATE POLICY "Admins can delete reports"
ON public.reports
FOR DELETE
USING (is_admin());

-- User warnings RLS policies
CREATE POLICY "Users can view their own warnings"
ON public.user_warnings
FOR SELECT
USING (auth.uid() = user_id OR is_admin());

CREATE POLICY "Admins can manage warnings"
ON public.user_warnings
FOR ALL
USING (is_admin());