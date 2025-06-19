-- Enable realtime for tables needed for registration

-- Add tables to supabase_realtime publication if they don't exist
DO $$
BEGIN
    -- Check if user_profiles is in the publication
    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' 
        AND schemaname = 'public' 
        AND tablename = 'user_profiles'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.user_profiles;
    END IF;
    
    -- Check if specialists is in the publication
    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' 
        AND schemaname = 'public' 
        AND tablename = 'specialists'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.specialists;
    END IF;
    
    -- Check if patients is in the publication
    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' 
        AND schemaname = 'public' 
        AND tablename = 'patients'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.patients;
    END IF;
    
    -- Check if clinics is in the publication
    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' 
        AND schemaname = 'public' 
        AND tablename = 'clinics'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.clinics;
    END IF;
END;
$$ LANGUAGE plpgsql;