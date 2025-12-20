-- Add notify_feature_updates column to profiles (default OFF as per requirements)
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS notify_feature_updates boolean DEFAULT false;