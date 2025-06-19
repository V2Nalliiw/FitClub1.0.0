-- Create a trigger to automatically handle super_admin registrations
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Get user metadata from auth.users
  DECLARE
    user_role TEXT;
    user_name TEXT;
  BEGIN
    SELECT raw_user_meta_data->>'role', raw_user_meta_data->>'name'
    INTO user_role, user_name
    FROM auth.users
    WHERE id = NEW.id;

    -- If the user is a super_admin, ensure they have a profile
    IF user_role = 'super_admin' THEN
      INSERT INTO public.user_profiles (id, email, name, role, created_at)
      VALUES (
        NEW.id,
        NEW.email,
        user_name,
        user_role,
        NOW()
      )
      ON CONFLICT (id) DO NOTHING;
    END IF;
  END;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop the trigger if it exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create the trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Ensure super_admin role has appropriate permissions
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Super admins can do everything" ON public.user_profiles;
CREATE POLICY "Super admins can do everything"
ON public.user_profiles
USING (auth.uid() IN (SELECT id FROM public.user_profiles WHERE role = 'super_admin'))
WITH CHECK (auth.uid() IN (SELECT id FROM public.user_profiles WHERE role = 'super_admin'));

-- Allow super_admin to manage clinics
DROP POLICY IF EXISTS "Super admins can manage clinics" ON public.clinics;
CREATE POLICY "Super admins can manage clinics"
ON public.clinics
USING (auth.uid() IN (SELECT id FROM public.user_profiles WHERE role = 'super_admin'))
WITH CHECK (auth.uid() IN (SELECT id FROM public.user_profiles WHERE role = 'super_admin'));