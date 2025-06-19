-- Rename tables to follow flowbuilder naming convention
-- This migration renames all tables to use consistent naming

-- First, disable RLS temporarily to avoid conflicts during renaming
ALTER TABLE public.user_profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.clinics DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.specialists DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.patients DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.flows DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.flow_assignments DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.tips DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.tip_assignments DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.image_gallery DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.app_settings DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.config DISABLE ROW LEVEL SECURITY;

-- Remove tables from realtime publication before renaming
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'user_profiles') THEN
        ALTER PUBLICATION supabase_realtime DROP TABLE public.user_profiles;
    END IF;
    IF EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'clinics') THEN
        ALTER PUBLICATION supabase_realtime DROP TABLE public.clinics;
    END IF;
    IF EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'specialists') THEN
        ALTER PUBLICATION supabase_realtime DROP TABLE public.specialists;
    END IF;
    IF EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'patients') THEN
        ALTER PUBLICATION supabase_realtime DROP TABLE public.patients;
    END IF;
    IF EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'flows') THEN
        ALTER PUBLICATION supabase_realtime DROP TABLE public.flows;
    END IF;
    IF EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'flow_assignments') THEN
        ALTER PUBLICATION supabase_realtime DROP TABLE public.flow_assignments;
    END IF;
    IF EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'appointments') THEN
        ALTER PUBLICATION supabase_realtime DROP TABLE public.appointments;
    END IF;
    IF EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'tips') THEN
        ALTER PUBLICATION supabase_realtime DROP TABLE public.tips;
    END IF;
    IF EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'tip_assignments') THEN
        ALTER PUBLICATION supabase_realtime DROP TABLE public.tip_assignments;
    END IF;
    IF EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'image_gallery') THEN
        ALTER PUBLICATION supabase_realtime DROP TABLE public.image_gallery;
    END IF;
    IF EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'app_settings') THEN
        ALTER PUBLICATION supabase_realtime DROP TABLE public.app_settings;
    END IF;
    IF EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'config') THEN
        ALTER PUBLICATION supabase_realtime DROP TABLE public.config;
    END IF;
END $$;

-- Rename tables to follow flowbuilder convention
ALTER TABLE public.user_profiles RENAME TO users;
ALTER TABLE public.clinics RENAME TO organizations;
ALTER TABLE public.specialists RENAME TO practitioners;
ALTER TABLE public.patients RENAME TO clients;
ALTER TABLE public.flows RENAME TO flowbuilder;
ALTER TABLE public.flow_assignments RENAME TO flow_instances;
ALTER TABLE public.appointments RENAME TO sessions;
ALTER TABLE public.tips RENAME TO resources;
ALTER TABLE public.tip_assignments RENAME TO resource_assignments;
ALTER TABLE public.image_gallery RENAME TO media_library;
ALTER TABLE public.app_settings RENAME TO app_config;
ALTER TABLE public.config RENAME TO system_config;

-- Update foreign key column names to match new table names
ALTER TABLE public.users RENAME COLUMN clinic_id TO organization_id;
ALTER TABLE public.practitioners RENAME COLUMN clinic_id TO organization_id;
ALTER TABLE public.clients RENAME COLUMN clinic_id TO organization_id;
ALTER TABLE public.flowbuilder RENAME COLUMN clinic_id TO organization_id;
ALTER TABLE public.sessions RENAME COLUMN clinic_id TO organization_id;
ALTER TABLE public.sessions RENAME COLUMN patient_id TO client_id;
ALTER TABLE public.sessions RENAME COLUMN specialist_id TO practitioner_id;
ALTER TABLE public.resources RENAME COLUMN clinic_id TO organization_id;
ALTER TABLE public.resource_assignments RENAME COLUMN patient_id TO client_id;
ALTER TABLE public.flow_instances RENAME COLUMN patient_id TO client_id;
ALTER TABLE public.flow_instances RENAME COLUMN flow_id TO flowbuilder_id;

-- Update foreign key constraints
ALTER TABLE public.users DROP CONSTRAINT IF EXISTS user_profiles_clinic_id_fkey;
ALTER TABLE public.users ADD CONSTRAINT users_organization_id_fkey FOREIGN KEY (organization_id) REFERENCES public.organizations(id) ON DELETE SET NULL;

ALTER TABLE public.practitioners DROP CONSTRAINT IF EXISTS specialists_clinic_id_fkey;
ALTER TABLE public.practitioners ADD CONSTRAINT practitioners_organization_id_fkey FOREIGN KEY (organization_id) REFERENCES public.organizations(id) ON DELETE CASCADE;

ALTER TABLE public.practitioners DROP CONSTRAINT IF EXISTS specialists_user_id_fkey;
ALTER TABLE public.practitioners ADD CONSTRAINT practitioners_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;

ALTER TABLE public.practitioners DROP CONSTRAINT IF EXISTS specialists_approved_by_fkey;
ALTER TABLE public.practitioners ADD CONSTRAINT practitioners_approved_by_fkey FOREIGN KEY (approved_by) REFERENCES public.users(id);

ALTER TABLE public.clients DROP CONSTRAINT IF EXISTS patients_clinic_id_fkey;
ALTER TABLE public.clients ADD CONSTRAINT clients_organization_id_fkey FOREIGN KEY (organization_id) REFERENCES public.organizations(id) ON DELETE CASCADE;

ALTER TABLE public.clients DROP CONSTRAINT IF EXISTS patients_user_id_fkey;
ALTER TABLE public.clients ADD CONSTRAINT clients_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;

ALTER TABLE public.clients DROP CONSTRAINT IF EXISTS patients_assigned_specialist_fkey;
ALTER TABLE public.clients ADD CONSTRAINT clients_assigned_practitioner_fkey FOREIGN KEY (assigned_specialist) REFERENCES public.practitioners(id);

ALTER TABLE public.flowbuilder DROP CONSTRAINT IF EXISTS flows_clinic_id_fkey;
ALTER TABLE public.flowbuilder ADD CONSTRAINT flowbuilder_organization_id_fkey FOREIGN KEY (organization_id) REFERENCES public.organizations(id) ON DELETE CASCADE;

ALTER TABLE public.flowbuilder DROP CONSTRAINT IF EXISTS flows_created_by_fkey;
ALTER TABLE public.flowbuilder ADD CONSTRAINT flowbuilder_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id) ON DELETE SET NULL;

-- Drop old constraint using original column name before renaming
ALTER TABLE public.flow_assignments DROP CONSTRAINT IF EXISTS flow_assignments_flow_id_fkey;
ALTER TABLE public.flow_assignments DROP CONSTRAINT IF EXISTS flow_assignments_patient_id_fkey;
ALTER TABLE public.flow_assignments DROP CONSTRAINT IF EXISTS flow_assignments_assigned_by_fkey;

-- After renaming table and columns, add new constraints
ALTER TABLE public.flow_instances ADD CONSTRAINT flow_instances_flowbuilder_id_fkey FOREIGN KEY (flowbuilder_id) REFERENCES public.flowbuilder(id) ON DELETE CASCADE;
ALTER TABLE public.flow_instances ADD CONSTRAINT flow_instances_client_id_fkey FOREIGN KEY (client_id) REFERENCES public.clients(id) ON DELETE CASCADE;
ALTER TABLE public.flow_instances ADD CONSTRAINT flow_instances_assigned_by_fkey FOREIGN KEY (assigned_by) REFERENCES public.users(id) ON DELETE CASCADE;



ALTER TABLE public.sessions DROP CONSTRAINT IF EXISTS appointments_clinic_id_fkey;
ALTER TABLE public.sessions ADD CONSTRAINT sessions_organization_id_fkey FOREIGN KEY (organization_id) REFERENCES public.organizations(id) ON DELETE CASCADE;

ALTER TABLE public.sessions DROP CONSTRAINT IF EXISTS appointments_patient_id_fkey;
ALTER TABLE public.sessions ADD CONSTRAINT sessions_client_id_fkey FOREIGN KEY (client_id) REFERENCES public.clients(id) ON DELETE CASCADE;

ALTER TABLE public.sessions DROP CONSTRAINT IF EXISTS appointments_specialist_id_fkey;
ALTER TABLE public.sessions ADD CONSTRAINT sessions_practitioner_id_fkey FOREIGN KEY (practitioner_id) REFERENCES public.practitioners(id) ON DELETE CASCADE;

ALTER TABLE public.sessions DROP CONSTRAINT IF EXISTS appointments_created_by_fkey;
ALTER TABLE public.sessions ADD CONSTRAINT sessions_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id);

ALTER TABLE public.resources DROP CONSTRAINT IF EXISTS tips_clinic_id_fkey;
ALTER TABLE public.resources ADD CONSTRAINT resources_organization_id_fkey FOREIGN KEY (organization_id) REFERENCES public.organizations(id) ON DELETE CASCADE;

ALTER TABLE public.resources DROP CONSTRAINT IF EXISTS tips_created_by_fkey;
ALTER TABLE public.resources ADD CONSTRAINT resources_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id) ON DELETE CASCADE;

ALTER TABLE public.resource_assignments DROP CONSTRAINT IF EXISTS tip_assignments_tip_id_fkey;
ALTER TABLE public.resource_assignments ADD CONSTRAINT resource_assignments_tip_id_fkey FOREIGN KEY (tip_id) REFERENCES public.resources(id) ON DELETE CASCADE;

ALTER TABLE public.resource_assignments DROP CONSTRAINT IF EXISTS tip_assignments_patient_id_fkey;
ALTER TABLE public.resource_assignments ADD CONSTRAINT resource_assignments_client_id_fkey FOREIGN KEY (client_id) REFERENCES public.clients(id) ON DELETE CASCADE;

ALTER TABLE public.resource_assignments DROP CONSTRAINT IF EXISTS tip_assignments_assigned_by_fkey;
ALTER TABLE public.resource_assignments ADD CONSTRAINT resource_assignments_assigned_by_fkey FOREIGN KEY (assigned_by) REFERENCES public.users(id) ON DELETE CASCADE;

-- Update indexes to match new table and column names
DROP INDEX IF EXISTS idx_user_profiles_email;
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);

DROP INDEX IF EXISTS idx_user_profiles_role;
CREATE INDEX IF NOT EXISTS idx_users_role ON public.users(role);

DROP INDEX IF EXISTS idx_user_profiles_clinic_id;
CREATE INDEX IF NOT EXISTS idx_users_organization_id ON public.users(organization_id);

DROP INDEX IF EXISTS idx_specialists_clinic_id;
CREATE INDEX IF NOT EXISTS idx_practitioners_organization_id ON public.practitioners(organization_id);

DROP INDEX IF EXISTS idx_patients_clinic_id;
CREATE INDEX IF NOT EXISTS idx_clients_organization_id ON public.clients(organization_id);

DROP INDEX IF EXISTS idx_flows_clinic_id;
CREATE INDEX IF NOT EXISTS idx_flowbuilder_organization_id ON public.flowbuilder(organization_id);

DROP INDEX IF EXISTS idx_flows_created_by;
CREATE INDEX IF NOT EXISTS idx_flowbuilder_created_by ON public.flowbuilder(created_by);

DROP INDEX IF EXISTS idx_appointments_patient_id;
CREATE INDEX IF NOT EXISTS idx_sessions_client_id ON public.sessions(client_id);

DROP INDEX IF EXISTS idx_appointments_specialist_id;
CREATE INDEX IF NOT EXISTS idx_sessions_practitioner_id ON public.sessions(practitioner_id);

DROP INDEX IF EXISTS idx_appointments_clinic_id;
CREATE INDEX IF NOT EXISTS idx_sessions_organization_id ON public.sessions(organization_id);

DROP INDEX IF EXISTS idx_tips_clinic_id;
CREATE INDEX IF NOT EXISTS idx_resources_organization_id ON public.resources(organization_id);

DROP INDEX IF EXISTS idx_tip_assignments_patient_id;
CREATE INDEX IF NOT EXISTS idx_resource_assignments_client_id ON public.resource_assignments(client_id);

DROP INDEX IF EXISTS idx_flow_assignments_patient_id;
CREATE INDEX IF NOT EXISTS idx_flow_instances_client_id ON public.flow_instances(client_id);

DROP INDEX IF EXISTS idx_flow_assignments_flow_id;
CREATE INDEX IF NOT EXISTS idx_flow_instances_flowbuilder_id ON public.flow_instances(flowbuilder_id);

-- Re-enable RLS on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.practitioners ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.flowbuilder ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.flow_instances ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resource_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.media_library ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.app_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_config ENABLE ROW LEVEL SECURITY;

-- Add tables back to realtime publication with new names
ALTER PUBLICATION supabase_realtime ADD TABLE public.users;
ALTER PUBLICATION supabase_realtime ADD TABLE public.organizations;
ALTER PUBLICATION supabase_realtime ADD TABLE public.practitioners;
ALTER PUBLICATION supabase_realtime ADD TABLE public.clients;
ALTER PUBLICATION supabase_realtime ADD TABLE public.flowbuilder;
ALTER PUBLICATION supabase_realtime ADD TABLE public.flow_instances;
ALTER PUBLICATION supabase_realtime ADD TABLE public.sessions;
ALTER PUBLICATION supabase_realtime ADD TABLE public.resources;
ALTER PUBLICATION supabase_realtime ADD TABLE public.resource_assignments;
ALTER PUBLICATION supabase_realtime ADD TABLE public.media_library;
ALTER PUBLICATION supabase_realtime ADD TABLE public.app_config;
ALTER PUBLICATION supabase_realtime ADD TABLE public.system_config;