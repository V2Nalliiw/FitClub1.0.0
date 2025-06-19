-- Fix RLS policies to allow proper registration

-- Temporarily disable RLS for user_profiles to allow registration
ALTER TABLE public.user_profiles DISABLE ROW LEVEL SECURITY;

-- Re-enable RLS
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view their own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Super admins can view all profiles" ON public.user_profiles;
DROP POLICY IF EXISTS "Clinic staff can view profiles in their clinic" ON public.user_profiles;
DROP POLICY IF EXISTS "Allow profile creation during registration" ON public.user_profiles;
DROP POLICY IF EXISTS "Super admins can do everything" ON public.user_profiles;

-- Create new comprehensive policies
CREATE POLICY "Allow user profile creation"
ON public.user_profiles FOR INSERT
WITH CHECK (true);

CREATE POLICY "Users can view their own profile"
ON public.user_profiles FOR SELECT
USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
ON public.user_profiles FOR UPDATE
USING (auth.uid() = id);

CREATE POLICY "Super admins can view all profiles"
ON public.user_profiles FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.user_profiles up
    WHERE up.id = auth.uid()
    AND up.role = 'super_admin'
  )
);

CREATE POLICY "Super admins can manage all profiles"
ON public.user_profiles FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.user_profiles up
    WHERE up.id = auth.uid()
    AND up.role = 'super_admin'
  )
);

CREATE POLICY "Clinic staff can view profiles in their clinic"
ON public.user_profiles FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.user_profiles up
    WHERE up.id = auth.uid()
    AND up.clinic_id = user_profiles.clinic_id
    AND up.role IN ('clinic_admin', 'chief_specialist', 'specialist')
  )
);

-- Fix specialists table policies
DROP POLICY IF EXISTS "Allow specialist creation during registration" ON public.specialists;
CREATE POLICY "Allow specialist creation during registration"
ON public.specialists FOR INSERT
WITH CHECK (true);

-- Fix patients table policies
DROP POLICY IF EXISTS "Allow patient creation during registration" ON public.patients;
CREATE POLICY "Allow patient creation during registration"
ON public.patients FOR INSERT
WITH CHECK (true);

-- Update the trigger function to be more robust
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Insert user profile with data from metadata
  INSERT INTO public.user_profiles (id, email, name, role, clinic_id, phone)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', 'New User'),
    COALESCE((NEW.raw_user_meta_data->>'role')::user_role, 'patient'),
    CASE 
      WHEN NEW.raw_user_meta_data->>'clinic_id' IS NOT NULL 
      THEN (NEW.raw_user_meta_data->>'clinic_id')::UUID 
      ELSE NULL 
    END,
    NEW.raw_user_meta_data->>'phone'
  )
  ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    role = EXCLUDED.role,
    clinic_id = EXCLUDED.clinic_id,
    phone = EXCLUDED.phone;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
