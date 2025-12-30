-- Add column to control group visibility in browse
ALTER TABLE public.group_chats 
ADD COLUMN show_in_browse boolean DEFAULT true;

-- Update RLS policy for viewing groups to include the new column check for browse
-- No changes to RLS needed since browse filtering is done in the application layer