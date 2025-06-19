-- Fix RLS policies for flows and related tables to allow chief_specialists access

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Chief specialists can view flows" ON flows;
DROP POLICY IF EXISTS "Chief specialists can create flows" ON flows;
DROP POLICY IF EXISTS "Chief specialists can update flows" ON flows;
DROP POLICY IF EXISTS "Chief specialists can delete flows" ON flows;

DROP POLICY IF EXISTS "Chief specialists can view flow assignments" ON flow_assignments;
DROP POLICY IF EXISTS "Chief specialists can create flow assignments" ON flow_assignments;
DROP POLICY IF EXISTS "Chief specialists can update flow assignments" ON flow_assignments;
DROP POLICY IF EXISTS "Chief specialists can delete flow assignments" ON flow_assignments;

-- Create comprehensive RLS policies for flows table for chief_specialists
CREATE POLICY "Chief specialists can view flows"
  ON flows FOR SELECT
  USING (
    auth.uid() IN (
      SELECT id FROM user_profiles WHERE role = 'chief_specialist'
    )
  );

CREATE POLICY "Chief specialists can create flows"
  ON flows FOR INSERT
  WITH CHECK (
    auth.uid() IN (
      SELECT id FROM user_profiles WHERE role = 'chief_specialist'
    )
  );

CREATE POLICY "Chief specialists can update flows"
  ON flows FOR UPDATE
  USING (
    auth.uid() IN (
      SELECT id FROM user_profiles WHERE role = 'chief_specialist'
    )
  );

CREATE POLICY "Chief specialists can delete flows"
  ON flows FOR DELETE
  USING (
    auth.uid() IN (
      SELECT id FROM user_profiles WHERE role = 'chief_specialist'
    )
  );

-- Create RLS policies for flow_assignments table for chief_specialists
CREATE POLICY "Chief specialists can view flow assignments"
  ON flow_assignments FOR SELECT
  USING (
    auth.uid() IN (
      SELECT id FROM user_profiles WHERE role = 'chief_specialist'
    )
  );

CREATE POLICY "Chief specialists can create flow assignments"
  ON flow_assignments FOR INSERT
  WITH CHECK (
    auth.uid() IN (
      SELECT id FROM user_profiles WHERE role = 'chief_specialist'
    )
  );

CREATE POLICY "Chief specialists can update flow assignments"
  ON flow_assignments FOR UPDATE
  USING (
    auth.uid() IN (
      SELECT id FROM user_profiles WHERE role = 'chief_specialist'
    )
  );

CREATE POLICY "Chief specialists can delete flow assignments"
  ON flow_assignments FOR DELETE
  USING (
    auth.uid() IN (
      SELECT id FROM user_profiles WHERE role = 'chief_specialist'
    )
  );

-- Create indexes for better performance if they don't exist
CREATE INDEX IF NOT EXISTS idx_user_profiles_role ON user_profiles(role);
CREATE INDEX IF NOT EXISTS idx_user_profiles_id_role ON user_profiles(id, role);

-- Add flows table to realtime publication if it exists
DO $
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE flows;
    ALTER PUBLICATION supabase_realtime ADD TABLE flow_assignments;
  END IF;
END
$;

-- Grant necessary permissions
GRANT ALL ON flows TO authenticated;
GRANT ALL ON flow_assignments TO authenticated;