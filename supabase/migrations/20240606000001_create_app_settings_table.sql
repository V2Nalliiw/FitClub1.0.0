-- Create app_settings table for global app configuration
CREATE TABLE IF NOT EXISTS public.app_settings (
  id TEXT PRIMARY KEY,
  main_logo_url TEXT,
  mobile_logo_url TEXT,
  pwa_logo_url TEXT,
  login_logo_url TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable row level security
ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;

-- Create policies
DROP POLICY IF EXISTS "Allow super_admin to read app_settings" ON public.app_settings;
CREATE POLICY "Allow super_admin to read app_settings"
  ON public.app_settings FOR SELECT
  USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Allow super_admin to update app_settings" ON public.app_settings;
CREATE POLICY "Allow super_admin to update app_settings"
  ON public.app_settings FOR UPDATE
  USING (auth.role() = 'authenticated' AND EXISTS (
    SELECT 1 FROM user_profiles
    WHERE user_profiles.id = auth.uid() AND user_profiles.role = 'super_admin'
  ));

DROP POLICY IF EXISTS "Allow super_admin to insert app_settings" ON public.app_settings;
CREATE POLICY "Allow super_admin to insert app_settings"
  ON public.app_settings FOR INSERT
  WITH CHECK (auth.role() = 'authenticated' AND EXISTS (
    SELECT 1 FROM user_profiles
    WHERE user_profiles.id = auth.uid() AND user_profiles.role = 'super_admin'
  ));

-- Table is already part of realtime publication
