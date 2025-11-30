-- Add country, grade, and stream fields to profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS country text,
ADD COLUMN IF NOT EXISTS grade text,
ADD COLUMN IF NOT EXISTS stream text;

-- Update the handle_new_user function to include new fields
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
begin
  insert into public.profiles (id, username, country, grade, stream)
  values (
    new.id, 
    new.raw_user_meta_data->>'username',
    new.raw_user_meta_data->>'country',
    new.raw_user_meta_data->>'grade',
    new.raw_user_meta_data->>'stream'
  );
  return new;
end;
$$;