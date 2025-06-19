-- Add login_logo_url column to app_settings table if it doesn't exist
ALTER TABLE public.app_settings ADD COLUMN IF NOT EXISTS login_logo_url TEXT;

-- Enable realtime for the table
alter publication supabase_realtime add table app_settings;
