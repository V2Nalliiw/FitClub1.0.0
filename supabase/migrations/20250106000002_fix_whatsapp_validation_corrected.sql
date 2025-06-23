-- Add whatsapp_number column if it doesn't exist
ALTER TABLE patients ADD COLUMN IF NOT EXISTS whatsapp_number TEXT;

-- Create index for better performance on whatsapp_number searches
CREATE INDEX IF NOT EXISTS idx_patients_whatsapp_number ON patients(whatsapp_number);

-- Add unique constraint to prevent duplicate WhatsApp numbers (only if it doesn't exist)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'unique_whatsapp_number' 
        AND conrelid = 'patients'::regclass
    ) THEN
        ALTER TABLE patients ADD CONSTRAINT unique_whatsapp_number UNIQUE (whatsapp_number);
    END IF;
END $$;

-- Drop existing policy if it exists
DROP POLICY IF EXISTS "Allow select on patients for authenticated" ON patients;

-- Create RLS policy to allow SELECT on patients table for authenticated users
CREATE POLICY "Allow select on patients for authenticated" 
ON patients 
FOR SELECT 
USING (auth.role() = 'authenticated');

-- Ensure RLS is enabled on patients table
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;

-- Enable realtime for patients table (only if not already added)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' 
        AND tablename = 'patients'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE patients;
    END IF;
END $$;