-- Make phone number optional since OAuth providers (like Google) don't always provide it
ALTER TABLE public.users ALTER COLUMN phone_number DROP NOT NULL;

-- Update the handle_new_user trigger to handle Google OAuth fields gracefully
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, full_name, phone_number)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', NEW.email, 'Unknown User'),
    NEW.raw_user_meta_data->>'phone_number'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Backfill any missing users that failed to insert previously due to the NOT NULL constraint
INSERT INTO public.users (id, full_name, phone_number, occupation_type, created_at, updated_at)
SELECT 
  id, 
  COALESCE(raw_user_meta_data->>'full_name', raw_user_meta_data->>'name', email, 'Unknown User'), 
  raw_user_meta_data->>'phone_number', 
  raw_user_meta_data->>'occupation_type',
  created_at,
  updated_at
FROM auth.users
WHERE id NOT IN (SELECT id FROM public.users);
