-- Fix the app_settings table by removing the updated_by column reference to auth.users
ALTER TABLE public.app_settings DROP COLUMN IF EXISTS updated_by;

-- Add the updated_by column as TEXT instead of UUID with foreign key reference
ALTER TABLE public.app_settings ADD COLUMN updated_by TEXT;
