-- Fix duplicate policy error by properly dropping existing policy first

-- Drop the existing policy if it exists
DROP POLICY IF EXISTS "Allow user profile creation" ON public.user_profiles;

-- Create the policy
CREATE POLICY "Allow user profile creation"
ON public.user_profiles FOR INSERT
WITH CHECK (true);
