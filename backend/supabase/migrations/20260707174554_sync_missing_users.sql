INSERT INTO public.users (id, full_name, phone_number, occupation_type, created_at, updated_at)
SELECT 
  id, 
  COALESCE(raw_user_meta_data->>'full_name', 'Unknown User'), 
  COALESCE(raw_user_meta_data->>'phone_number', '0000000000'), 
  raw_user_meta_data->>'occupation_type',
  created_at,
  updated_at
FROM auth.users
WHERE id NOT IN (SELECT id FROM public.users);
