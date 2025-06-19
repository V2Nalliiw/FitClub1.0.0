-- Fix RLS policies for flows and related tables

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own flows" ON flows;
DROP POLICY IF EXISTS "Users can create their own flows" ON flows;
DROP POLICY IF EXISTS "Users can update their own flows" ON flows;
DROP POLICY IF EXISTS "Users can delete their own flows" ON flows;

DROP POLICY IF EXISTS "Users can view their own flow assignments" ON flow_assignments;
DROP POLICY IF EXISTS "Users can create flow assignments" ON flow_assignments;
DROP POLICY IF EXISTS "Users can update their own flow assignments" ON flow_assignments;

-- Enable RLS on flows table
ALTER TABLE flows ENABLE ROW LEVEL SECURITY;

-- Create comprehensive RLS policies for flows table
CREATE POLICY "Users can view their own flows"
  ON flows FOR SELECT
  USING (auth.uid() = created_by);

CREATE POLICY "Users can create their own flows"
  ON flows FOR INSERT
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update their own flows"
  ON flows FOR UPDATE
  USING (auth.uid() = created_by)
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can delete their own flows"
  ON flows FOR DELETE
  USING (auth.uid() = created_by);

-- Enable RLS on flow_assignments table
ALTER TABLE flow_assignments ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for flow_assignments table
CREATE POLICY "Users can view their own flow assignments"
  ON flow_assignments FOR SELECT
  USING (auth.uid() = assigned_by);

CREATE POLICY "Users can create flow assignments"
  ON flow_assignments FOR INSERT
  WITH CHECK (auth.uid() = assigned_by);

CREATE POLICY "Users can update their own flow assignments"
  ON flow_assignments FOR UPDATE
  USING (auth.uid() = assigned_by)
  WITH CHECK (auth.uid() = assigned_by);

CREATE POLICY "Users can delete their own flow assignments"
  ON flow_assignments FOR DELETE
  USING (auth.uid() = assigned_by);

-- Add realtime for flows table
alter publication supabase_realtime add table flows;
alter publication supabase_realtime add table flow_assignments;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_flows_created_by ON flows(created_by);
CREATE INDEX IF NOT EXISTS idx_flows_is_active ON flows(is_active);
CREATE INDEX IF NOT EXISTS idx_flows_created_by_active ON flows(created_by, is_active);
CREATE INDEX IF NOT EXISTS idx_flow_assignments_assigned_by ON flow_assignments(assigned_by);
CREATE INDEX IF NOT EXISTS idx_flow_assignments_status ON flow_assignments(status);

-- Grant necessary permissions
GRANT ALL ON flows TO authenticated;
GRANT ALL ON flow_assignments TO authenticated;

-- Ensure the flows table has proper structure
ALTER TABLE flows ALTER COLUMN flow_data SET DEFAULT '{}'::jsonb;
ALTER TABLE flows ALTER COLUMN is_active SET DEFAULT true;
ALTER TABLE flows ALTER COLUMN is_template SET DEFAULT false;

-- Add helpful comments
COMMENT ON TABLE flows IS 'Stores user-created flows with proper RLS policies';
COMMENT ON TABLE flow_assignments IS 'Stores flow assignments to patients with proper RLS policies';
