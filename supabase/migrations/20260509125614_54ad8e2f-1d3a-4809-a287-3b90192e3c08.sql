INSERT INTO public.app_config (key, value)
VALUES ('service_role_key', 'defea4a9630564e3655b1c9e5eeca64cf1e7a598077181b8f886c15be86b4921')
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = now();