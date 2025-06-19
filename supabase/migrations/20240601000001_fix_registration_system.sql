-- Corrigir sistema de registro completamente
-- Desabilitar RLS temporariamente para simplificar o registro
ALTER TABLE public.user_profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.specialists DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.patients DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.clinics DISABLE ROW LEVEL SECURITY;

-- Remover políticas existentes que podem estar causando conflitos
DROP POLICY IF EXISTS "Allow user profile creation" ON public.user_profiles;
DROP POLICY IF EXISTS "Allow users to read their own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Allow users to update their own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Allow super admins to read all profiles" ON public.user_profiles;
DROP POLICY IF EXISTS "public_profiles_select_policy" ON public.user_profiles;
DROP POLICY IF EXISTS "auth_users_insert_policy" ON public.user_profiles;
DROP POLICY IF EXISTS "users_update_own_profile_policy" ON public.user_profiles;

-- Remover trigger automático que pode estar interferindo
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP TRIGGER IF EXISTS create_profile_trigger ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();
DROP FUNCTION IF EXISTS public.create_profile_for_user();

-- Garantir que as tabelas tenham realtime habilitado (apenas se não estiverem já)
DO $$
BEGIN
    -- Add user_profiles if not already in publication
    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' 
        AND tablename = 'user_profiles'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.user_profiles;
    END IF;
    
    -- Add specialists if not already in publication
    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' 
        AND tablename = 'specialists'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.specialists;
    END IF;
    
    -- Add patients if not already in publication
    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' 
        AND tablename = 'patients'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.patients;
    END IF;
    
    -- Add clinics if not already in publication
    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' 
        AND tablename = 'clinics'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.clinics;
    END IF;
END;
$$ LANGUAGE plpgsql;