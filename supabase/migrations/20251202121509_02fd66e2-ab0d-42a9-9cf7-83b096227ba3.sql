
-- Admin settings table for alerts toggle
CREATE TABLE public.admin_settings (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  key text NOT NULL UNIQUE,
  value jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.admin_settings ENABLE ROW LEVEL SECURITY;

-- Only admins can view/modify settings
CREATE POLICY "Admins can view settings" ON public.admin_settings
  FOR SELECT USING (is_admin());

CREATE POLICY "Admins can update settings" ON public.admin_settings
  FOR UPDATE USING (is_admin());

CREATE POLICY "Admins can insert settings" ON public.admin_settings
  FOR INSERT WITH CHECK (is_admin());

-- Insert default alerts_enabled setting
INSERT INTO public.admin_settings (key, value) VALUES ('alerts_enabled', 'true'::jsonb);

-- Daily stats table
CREATE TABLE public.daily_stats (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  date date NOT NULL UNIQUE DEFAULT CURRENT_DATE,
  total_users integer NOT NULL DEFAULT 0,
  total_posts integer NOT NULL DEFAULT 0,
  total_flagged integer NOT NULL DEFAULT 0,
  total_errors integer NOT NULL DEFAULT 0,
  total_payments integer NOT NULL DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.daily_stats ENABLE ROW LEVEL SECURITY;

-- Only admins can view/modify stats
CREATE POLICY "Admins can view daily_stats" ON public.daily_stats
  FOR SELECT USING (is_admin());

CREATE POLICY "Service role can manage daily_stats" ON public.daily_stats
  FOR ALL USING (true);

-- Create trigger for updated_at
CREATE TRIGGER update_admin_settings_updated_at
  BEFORE UPDATE ON public.admin_settings
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_daily_stats_updated_at
  BEFORE UPDATE ON public.daily_stats
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();
