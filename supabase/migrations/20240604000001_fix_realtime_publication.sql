-- Fix realtime publication errors by checking if tables are already added

-- Remove tables from realtime publication if they exist, then add them back
DO $$
BEGIN
    -- Remove user_profiles if it exists
    BEGIN
        ALTER PUBLICATION supabase_realtime DROP TABLE user_profiles;
    EXCEPTION
        WHEN OTHERS THEN NULL;
    END;
    
    -- Remove specialists if it exists
    BEGIN
        ALTER PUBLICATION supabase_realtime DROP TABLE specialists;
    EXCEPTION
        WHEN OTHERS THEN NULL;
    END;
    
    -- Remove patients if it exists
    BEGIN
        ALTER PUBLICATION supabase_realtime DROP TABLE patients;
    EXCEPTION
        WHEN OTHERS THEN NULL;
    END;
    
    -- Remove clinics if it exists
    BEGIN
        ALTER PUBLICATION supabase_realtime DROP TABLE clinics;
    EXCEPTION
        WHEN OTHERS THEN NULL;
    END;
END $$;

-- Now add all tables to realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE user_profiles;
ALTER PUBLICATION supabase_realtime ADD TABLE specialists;
ALTER PUBLICATION supabase_realtime ADD TABLE patients;
ALTER PUBLICATION supabase_realtime ADD TABLE clinics;
