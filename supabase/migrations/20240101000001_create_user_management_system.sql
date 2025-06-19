-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create enum for user roles
CREATE TYPE user_role AS ENUM (
  'super_admin',
  'clinic_admin', 
  'chief_specialist',
  'specialist',
  'patient'
);

-- Create clinics table
CREATE TABLE IF NOT EXISTS public.clinics (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  address TEXT,
  phone VARCHAR(50),
  email VARCHAR(255),
  website VARCHAR(255),
  logo_url TEXT,
  mobile_logo_url TEXT,
  primary_color VARCHAR(7) DEFAULT '#3B82F6',
  secondary_color VARCHAR(7) DEFAULT '#10B981',
  accent_color VARCHAR(7) DEFAULT '#F59E0B',
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user profiles table
CREATE TABLE IF NOT EXISTS public.user_profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  name VARCHAR(255) NOT NULL,
  role user_role NOT NULL,
  clinic_id UUID REFERENCES public.clinics(id) ON DELETE SET NULL,
  avatar_url TEXT,
  phone VARCHAR(50),
  specialization VARCHAR(255),
  license_number VARCHAR(100),
  bio TEXT,
  settings JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create specialists table for additional specialist info
CREATE TABLE IF NOT EXISTS public.specialists (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  clinic_id UUID REFERENCES public.clinics(id) ON DELETE CASCADE,
  specialization VARCHAR(255) NOT NULL,
  license_number VARCHAR(100),
  years_experience INTEGER,
  education TEXT,
  certifications TEXT[],
  languages VARCHAR(100)[],
  consultation_fee DECIMAL(10,2),
  availability JSONB DEFAULT '{}',
  is_approved BOOLEAN DEFAULT false,
  approved_by UUID REFERENCES public.user_profiles(id),
  approved_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create patients table for additional patient info
CREATE TABLE IF NOT EXISTS public.patients (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  clinic_id UUID REFERENCES public.clinics(id) ON DELETE CASCADE,
  date_of_birth DATE,
  gender VARCHAR(20),
  emergency_contact_name VARCHAR(255),
  emergency_contact_phone VARCHAR(50),
  medical_history TEXT,
  allergies TEXT,
  medications TEXT,
  insurance_info JSONB DEFAULT '{}',
  assigned_specialist UUID REFERENCES public.specialists(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create flows table
CREATE TABLE IF NOT EXISTS public.flows (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  created_by UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  clinic_id UUID REFERENCES public.clinics(id) ON DELETE CASCADE,
  flow_data JSONB NOT NULL DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  is_template BOOLEAN DEFAULT false,
  tags VARCHAR(100)[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create flow assignments table
CREATE TABLE IF NOT EXISTS public.flow_assignments (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  flow_id UUID REFERENCES public.flows(id) ON DELETE CASCADE,
  patient_id UUID REFERENCES public.patients(id) ON DELETE CASCADE,
  assigned_by UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  start_date DATE NOT NULL,
  end_date DATE,
  frequency VARCHAR(50) DEFAULT 'once',
  repetitions INTEGER DEFAULT 1,
  status VARCHAR(50) DEFAULT 'active',
  progress JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_profiles_email ON public.user_profiles(email);
CREATE INDEX IF NOT EXISTS idx_user_profiles_role ON public.user_profiles(role);
CREATE INDEX IF NOT EXISTS idx_user_profiles_clinic_id ON public.user_profiles(clinic_id);
CREATE INDEX IF NOT EXISTS idx_specialists_clinic_id ON public.specialists(clinic_id);
CREATE INDEX IF NOT EXISTS idx_patients_clinic_id ON public.patients(clinic_id);
CREATE INDEX IF NOT EXISTS idx_flows_clinic_id ON public.flows(clinic_id);
CREATE INDEX IF NOT EXISTS idx_flows_created_by ON public.flows(created_by);

-- Enable realtime for all tables
alter publication supabase_realtime add table public.clinics;
alter publication supabase_realtime add table public.user_profiles;
alter publication supabase_realtime add table public.specialists;
alter publication supabase_realtime add table public.patients;
alter publication supabase_realtime add table public.flows;
alter publication supabase_realtime add table public.flow_assignments;

-- Create function to handle user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (id, email, name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', 'New User'),
    COALESCE((NEW.raw_user_meta_data->>'role')::user_role, 'patient')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user registration
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_clinics_updated_at BEFORE UPDATE ON public.clinics FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON public.user_profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_specialists_updated_at BEFORE UPDATE ON public.specialists FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_patients_updated_at BEFORE UPDATE ON public.patients FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_flows_updated_at BEFORE UPDATE ON public.flows FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_flow_assignments_updated_at BEFORE UPDATE ON public.flow_assignments FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default clinic for testing
INSERT INTO public.clinics (name, description, email) 
VALUES (
  'Clínica Bem-Estar',
  'Especializada em saúde mental e bem-estar',
  'contato@clinicabemestar.com'
) ON CONFLICT DO NOTHING;