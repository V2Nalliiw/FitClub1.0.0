-- Enable RLS on all tables
ALTER TABLE public.clinics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.specialists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.flows ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.flow_assignments ENABLE ROW LEVEL SECURITY;

-- Policies for clinics table
DROP POLICY IF EXISTS "Clinics are viewable by authenticated users" ON public.clinics;
CREATE POLICY "Clinics are viewable by authenticated users"
ON public.clinics FOR SELECT
USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Super admins can manage all clinics" ON public.clinics;
CREATE POLICY "Super admins can manage all clinics"
ON public.clinics FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.user_profiles
    WHERE user_profiles.id = auth.uid()
    AND user_profiles.role = 'super_admin'
  )
);

DROP POLICY IF EXISTS "Clinic admins and chief specialists can update their clinic" ON public.clinics;
CREATE POLICY "Clinic admins and chief specialists can update their clinic"
ON public.clinics FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.user_profiles
    WHERE user_profiles.id = auth.uid()
    AND user_profiles.clinic_id = clinics.id
    AND user_profiles.role IN ('clinic_admin', 'chief_specialist')
  )
);

-- Policies for user_profiles table
DROP POLICY IF EXISTS "Users can view their own profile" ON public.user_profiles;
CREATE POLICY "Users can view their own profile"
ON public.user_profiles FOR SELECT
USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update their own profile" ON public.user_profiles;
CREATE POLICY "Users can update their own profile"
ON public.user_profiles FOR UPDATE
USING (auth.uid() = id);

DROP POLICY IF EXISTS "Super admins can view all profiles" ON public.user_profiles;
CREATE POLICY "Super admins can view all profiles"
ON public.user_profiles FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.user_profiles up
    WHERE up.id = auth.uid()
    AND up.role = 'super_admin'
  )
);

DROP POLICY IF EXISTS "Clinic staff can view profiles in their clinic" ON public.user_profiles;
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

DROP POLICY IF EXISTS "Allow profile creation during registration" ON public.user_profiles;
CREATE POLICY "Allow profile creation during registration"
ON public.user_profiles FOR INSERT
WITH CHECK (auth.uid() = id);

-- Policies for specialists table
DROP POLICY IF EXISTS "Specialists can view their own data" ON public.specialists;
CREATE POLICY "Specialists can view their own data"
ON public.specialists FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.user_profiles
    WHERE user_profiles.id = auth.uid()
    AND user_profiles.id = specialists.user_id
  )
);

DROP POLICY IF EXISTS "Clinic staff can view specialists in their clinic" ON public.specialists;
CREATE POLICY "Clinic staff can view specialists in their clinic"
ON public.specialists FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.user_profiles
    WHERE user_profiles.id = auth.uid()
    AND user_profiles.clinic_id = specialists.clinic_id
    AND user_profiles.role IN ('clinic_admin', 'chief_specialist', 'specialist')
  )
);

DROP POLICY IF EXISTS "Specialists can update their own data" ON public.specialists;
CREATE POLICY "Specialists can update their own data"
ON public.specialists FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.user_profiles
    WHERE user_profiles.id = auth.uid()
    AND user_profiles.id = specialists.user_id
  )
);

DROP POLICY IF EXISTS "Allow specialist creation during registration" ON public.specialists;
CREATE POLICY "Allow specialist creation during registration"
ON public.specialists FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.user_profiles
    WHERE user_profiles.id = auth.uid()
    AND user_profiles.id = specialists.user_id
  )
);

-- Policies for patients table
DROP POLICY IF EXISTS "Patients can view their own data" ON public.patients;
CREATE POLICY "Patients can view their own data"
ON public.patients FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.user_profiles
    WHERE user_profiles.id = auth.uid()
    AND user_profiles.id = patients.user_id
  )
);

DROP POLICY IF EXISTS "Clinic staff can view patients in their clinic" ON public.patients;
CREATE POLICY "Clinic staff can view patients in their clinic"
ON public.patients FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.user_profiles
    WHERE user_profiles.id = auth.uid()
    AND user_profiles.clinic_id = patients.clinic_id
    AND user_profiles.role IN ('clinic_admin', 'chief_specialist', 'specialist')
  )
);

DROP POLICY IF EXISTS "Patients can update their own data" ON public.patients;
CREATE POLICY "Patients can update their own data"
ON public.patients FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.user_profiles
    WHERE user_profiles.id = auth.uid()
    AND user_profiles.id = patients.user_id
  )
);

DROP POLICY IF EXISTS "Allow patient creation during registration" ON public.patients;
CREATE POLICY "Allow patient creation during registration"
ON public.patients FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.user_profiles
    WHERE user_profiles.id = auth.uid()
    AND user_profiles.id = patients.user_id
  )
);

-- Policies for flows table
DROP POLICY IF EXISTS "Users can view flows in their clinic" ON public.flows;
CREATE POLICY "Users can view flows in their clinic"
ON public.flows FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.user_profiles
    WHERE user_profiles.id = auth.uid()
    AND user_profiles.clinic_id = flows.clinic_id
  )
);

DROP POLICY IF EXISTS "Specialists can manage flows" ON public.flows;
CREATE POLICY "Specialists can manage flows"
ON public.flows FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.user_profiles
    WHERE user_profiles.id = auth.uid()
    AND user_profiles.clinic_id = flows.clinic_id
    AND user_profiles.role IN ('chief_specialist', 'specialist')
  )
);

-- Policies for flow_assignments table
DROP POLICY IF EXISTS "Users can view their flow assignments" ON public.flow_assignments;
CREATE POLICY "Users can view their flow assignments"
ON public.flow_assignments FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.patients p
    JOIN public.user_profiles up ON p.user_id = up.id
    WHERE up.id = auth.uid()
    AND p.id = flow_assignments.patient_id
  )
  OR
  EXISTS (
    SELECT 1 FROM public.user_profiles
    WHERE user_profiles.id = auth.uid()
    AND user_profiles.role IN ('chief_specialist', 'specialist')
  )
);

DROP POLICY IF EXISTS "Specialists can manage flow assignments" ON public.flow_assignments;
CREATE POLICY "Specialists can manage flow assignments"
ON public.flow_assignments FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.user_profiles
    WHERE user_profiles.id = auth.uid()
    AND user_profiles.role IN ('chief_specialist', 'specialist')
  )
);