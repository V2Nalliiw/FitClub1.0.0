-- Fix RLS policies for flows and flow_assignments tables

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Chief specialists can create flows" ON flows;
DROP POLICY IF EXISTS "Specialists can view flows" ON flows;
DROP POLICY IF EXISTS "Users can view their own flows" ON flows;
DROP POLICY IF EXISTS "Chief specialists can update flows" ON flows;
DROP POLICY IF EXISTS "Chief specialists can delete flows" ON flows;

-- Create policies for flows table
CREATE POLICY "Chief specialists can create flows"
ON flows
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() IN (
  SELECT id FROM user_profiles WHERE role = 'chief_specialist' OR role = 'specialist'
));

CREATE POLICY "Specialists can view flows"
ON flows
FOR SELECT
TO authenticated
USING (
  (auth.uid() IN (SELECT id FROM user_profiles WHERE role = 'chief_specialist' OR role = 'specialist'))
  OR
  (auth.uid() IN (SELECT user_id FROM patients WHERE id IN (SELECT patient_id FROM flow_assignments WHERE flow_id = flows.id)))
);

CREATE POLICY "Users can view their own flows"
ON flows
FOR SELECT
TO authenticated
USING (created_by = auth.uid());

CREATE POLICY "Chief specialists can update flows"
ON flows
FOR UPDATE
TO authenticated
USING (created_by = auth.uid() OR auth.uid() IN (SELECT id FROM user_profiles WHERE role = 'chief_specialist'));

CREATE POLICY "Chief specialists can delete flows"
ON flows
FOR DELETE
TO authenticated
USING (created_by = auth.uid() OR auth.uid() IN (SELECT id FROM user_profiles WHERE role = 'chief_specialist'));

-- Drop existing policies for flow_assignments
DROP POLICY IF EXISTS "Specialists can create flow assignments" ON flow_assignments;
DROP POLICY IF EXISTS "Users can view their flow assignments" ON flow_assignments;
DROP POLICY IF EXISTS "Specialists can update flow assignments" ON flow_assignments;
DROP POLICY IF EXISTS "Specialists can delete flow assignments" ON flow_assignments;

-- Create policies for flow_assignments table
CREATE POLICY "Specialists can create flow assignments"
ON flow_assignments
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() IN (
  SELECT id FROM user_profiles WHERE role = 'chief_specialist' OR role = 'specialist'
));

CREATE POLICY "Users can view their flow assignments"
ON flow_assignments
FOR SELECT
TO authenticated
USING (
  auth.uid() IN (SELECT id FROM user_profiles WHERE role = 'chief_specialist' OR role = 'specialist')
  OR
  auth.uid() IN (SELECT user_id FROM patients WHERE id = flow_assignments.patient_id)
);

CREATE POLICY "Specialists can update flow assignments"
ON flow_assignments
FOR UPDATE
TO authenticated
USING (assigned_by = auth.uid() OR auth.uid() IN (SELECT id FROM user_profiles WHERE role = 'chief_specialist' OR role = 'specialist'));

CREATE POLICY "Specialists can delete flow assignments"
ON flow_assignments
FOR DELETE
TO authenticated
USING (assigned_by = auth.uid() OR auth.uid() IN (SELECT id FROM user_profiles WHERE role = 'chief_specialist' OR role = 'specialist'));

-- Make sure tables are in realtime publication (only if not already added)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' 
    AND schemaname = 'public' 
    AND tablename = 'flows'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE flows;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' 
    AND schemaname = 'public' 
    AND tablename = 'flow_assignments'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE flow_assignments;
  END IF;
END
$$;