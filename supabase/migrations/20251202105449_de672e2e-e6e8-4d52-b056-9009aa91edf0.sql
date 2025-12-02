-- Add new columns to profiles for study goals and theme preferences
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS daily_reminder_time TIME DEFAULT '09:00',
ADD COLUMN IF NOT EXISTS weekly_study_goal INTEGER DEFAULT 10,
ADD COLUMN IF NOT EXISTS daily_hours_target DECIMAL(3,1) DEFAULT 2.0,
ADD COLUMN IF NOT EXISTS auto_start_focus_timer BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS theme_color TEXT DEFAULT 'purple';

-- Create friends table
CREATE TABLE public.friends (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  friend_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'blocked')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, friend_id)
);

-- Enable RLS on friends table
ALTER TABLE public.friends ENABLE ROW LEVEL SECURITY;

-- RLS policies for friends
CREATE POLICY "Users can view their own friend relationships"
ON public.friends
FOR SELECT
USING (auth.uid() = user_id OR auth.uid() = friend_id);

CREATE POLICY "Users can send friend requests"
ON public.friends
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their friend relationships"
ON public.friends
FOR UPDATE
USING (auth.uid() = user_id OR auth.uid() = friend_id);

CREATE POLICY "Users can delete their friend relationships"
ON public.friends
FOR DELETE
USING (auth.uid() = user_id OR auth.uid() = friend_id);