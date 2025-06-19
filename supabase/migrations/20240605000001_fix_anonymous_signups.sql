-- Enable email signups in Supabase Auth settings
BEGIN;

-- Update auth.config to enable email signups
UPDATE auth.config
SET enable_signup = true;

COMMIT;