DELETE FROM public.posts 
WHERE user_id IN (
  '58b639b5-f291-46f6-b31e-1ed7b1aec0e9',
  'bf443ba5-09e3-43ff-a54e-31a01e3fe1b2',
  '1bfe35db-842b-4620-80b9-bf892123a113',
  'e71c293a-135a-45ac-a854-1d97dddd9351',
  '0e287d8b-0702-4f1b-aa74-7c2ad9cc9393'
) AND created_at > NOW() - INTERVAL '7 days';