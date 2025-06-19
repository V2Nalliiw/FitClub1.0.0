-- Fix RLS policies for chief_specialist role on flows and flow_assignments tables

-- Drop existing policies for flows table
DROP POLICY IF EXISTS "Chief specialists can manage flows" ON flows;
DROP POLICY IF EXISTS "Specialists can view flows" ON flows;
DROP POLICY IF EXISTS "Super admins can manage all flows" ON flows;

-- Create new policies for flows table
CREATE POLICY "Chief specialists can manage flows"
ON flows
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM user_profiles
    WHERE user_profiles.id = auth.uid() 
    AND (user_profiles.role = 'chief_specialist' OR user_profiles.role = 'super_admin')
  )
);

CREATE POLICY "Specialists can view flows"
ON flows
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM user_profiles
    WHERE user_profiles.id = auth.uid() 
    AND user_profiles.role = 'specialist'
  )
);

-- Drop existing policies for flow_assignments table
DROP POLICY IF EXISTS "Chief specialists can manage flow assignments" ON flow_assignments;
DROP POLICY IF EXISTS "Specialists can view flow assignments" ON flow_assignments;
DROP POLICY IF EXISTS "Super admins can manage all flow assignments" ON flow_assignments;

-- Create new policies for flow_assignments table
CREATE POLICY "Chief specialists can manage flow assignments"
ON flow_assignments
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM user_profiles
    WHERE user_profiles.id = auth.uid() 
    AND (user_profiles.role = 'chief_specialist' OR user_profiles.role = 'super_admin')
  )
);

CREATE POLICY "Specialists can view flow assignments"
ON flow_assignments
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM user_profiles
    WHERE user_profiles.id = auth.uid() 
    AND user_profiles.role = 'specialist'
  )
);

-- Enable RLS on tables if not already enabled
ALTER TABLE flows ENABLE ROW LEVEL SECURITY;
ALTER TABLE flow_assignments ENABLE ROW LEVEL SECURITY;

-- Add tables to realtime publication if they're not already members
DO $
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
$;
