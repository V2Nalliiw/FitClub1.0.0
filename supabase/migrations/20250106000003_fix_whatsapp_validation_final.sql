-- This migration fixes the WhatsApp number validation in the patients table
-- It ensures the column exists, adds an index, adds a unique constraint,
-- and creates appropriate RLS policies

-- Check if whatsapp_number column exists, if not add it
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                WHERE table_name = 'patients' AND column_name = 'whatsapp_number') THEN
    ALTER TABLE patients ADD COLUMN whatsapp_number TEXT;
  END IF;
END $$;

-- Create index on whatsapp_number if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_indexes 
                WHERE tablename = 'patients' AND indexname = 'patients_whatsapp_number_idx') THEN
    CREATE INDEX patients_whatsapp_number_idx ON patients(whatsapp_number);
  END IF;
END $$;

-- Add unique constraint if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints 
                WHERE table_name = 'patients' AND constraint_name = 'patients_whatsapp_number_key' 
                AND constraint_type = 'UNIQUE') THEN
    ALTER TABLE patients ADD CONSTRAINT patients_whatsapp_number_key UNIQUE (whatsapp_number);
  END IF;
END $$;

-- Create RLS policy for patients table if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'patients' AND policyname = 'Enable read access for authenticated users') THEN
    DROP POLICY IF EXISTS "Enable read access for authenticated users" ON patients;
    CREATE POLICY "Enable read access for authenticated users" ON patients FOR SELECT USING (auth.role() = 'authenticated');
  END IF;
END $$;

-- Enable RLS on patients table
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;

-- Skip adding to realtime publication since it's already a member
-- This was causing the error: "relation "patients" is already member of publication "supabase_realtime""
