-- Update triggers and functions for renamed tables

-- Drop existing triggers
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP TRIGGER IF EXISTS update_user_profiles_updated_at ON public.users;
DROP TRIGGER IF EXISTS update_clinics_updated_at ON public.organizations;
DROP TRIGGER IF EXISTS update_specialists_updated_at ON public.practitioners;
DROP TRIGGER IF EXISTS update_patients_updated_at ON public.clients;
DROP TRIGGER IF EXISTS update_flows_updated_at ON public.flowbuilder;
DROP TRIGGER IF EXISTS update_flow_assignments_updated_at ON public.flow_instances;
DROP TRIGGER IF EXISTS update_appointments_updated_at ON public.sessions;
DROP TRIGGER IF EXISTS update_tips_updated_at ON public.resources;
DROP TRIGGER IF EXISTS set_updated_at ON public.system_config;

-- Update the user registration trigger function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Insert user profile with data from metadata
  INSERT INTO public.users (id, email, name, role, organization_id, phone)
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
    organization_id = EXCLUDED.organization_id,
    phone = EXCLUDED.phone;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate the trigger for new user registration
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Update the updated_at trigger function (if it doesn't exist)
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Recreate updated_at triggers for all tables
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_organizations_updated_at BEFORE UPDATE ON public.organizations FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_practitioners_updated_at BEFORE UPDATE ON public.practitioners FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_clients_updated_at BEFORE UPDATE ON public.clients FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_flowbuilder_updated_at BEFORE UPDATE ON public.flowbuilder FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_flow_instances_updated_at BEFORE UPDATE ON public.flow_instances FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_sessions_updated_at BEFORE UPDATE ON public.sessions FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_resources_updated_at BEFORE UPDATE ON public.resources FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.system_config FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Update the chief specialist assignment function
CREATE OR REPLACE FUNCTION public.assign_chief_specialist_to_organization()
RETURNS TRIGGER AS $$
BEGIN
  -- If a user profile is being created with chief_specialist role and has an organization_id
  IF NEW.role = 'chief_specialist' AND NEW.organization_id IS NOT NULL THEN
    -- Update the organization to set this user as the chief specialist
    UPDATE public.organizations 
    SET chief_specialist_id = NEW.id 
    WHERE id = NEW.organization_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for automatic chief specialist assignment
DROP TRIGGER IF EXISTS on_chief_specialist_created ON public.users;
CREATE TRIGGER on_chief_specialist_created
  AFTER INSERT OR UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION public.assign_chief_specialist_to_organization();
