-- Create flows table to store flow definitions
CREATE TABLE IF NOT EXISTS flows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  flow_data JSONB NOT NULL DEFAULT '{}',
  clinic_id UUID REFERENCES clinics(id) ON DELETE CASCADE,
  created_by UUID REFERENCES user_profiles(id) ON DELETE SET NULL,
  is_active BOOLEAN DEFAULT true,
  is_template BOOLEAN DEFAULT false,
  tags TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create flow_assignments table to assign flows to patients
CREATE TABLE IF NOT EXISTS flow_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  flow_id UUID REFERENCES flows(id) ON DELETE CASCADE,
  patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
  assigned_by UUID REFERENCES user_profiles(id) ON DELETE SET NULL,
  start_date DATE NOT NULL,
  end_date DATE,
  frequency VARCHAR(50) DEFAULT 'once',
  repetitions INTEGER DEFAULT 1,
  status VARCHAR(50) DEFAULT 'active',
  progress JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create flow_responses table to store patient responses
CREATE TABLE IF NOT EXISTS flow_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  assignment_id UUID REFERENCES flow_assignments(id) ON DELETE CASCADE,
  patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
  flow_id UUID REFERENCES flows(id) ON DELETE CASCADE,
  step_id VARCHAR(255) NOT NULL,
  response_data JSONB NOT NULL DEFAULT '{}',
  completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_flows_clinic_id ON flows(clinic_id);
CREATE INDEX IF NOT EXISTS idx_flows_created_by ON flows(created_by);
CREATE INDEX IF NOT EXISTS idx_flows_is_active ON flows(is_active);
CREATE INDEX IF NOT EXISTS idx_flow_assignments_flow_id ON flow_assignments(flow_id);
CREATE INDEX IF NOT EXISTS idx_flow_assignments_patient_id ON flow_assignments(patient_id);
CREATE INDEX IF NOT EXISTS idx_flow_assignments_status ON flow_assignments(status);
CREATE INDEX IF NOT EXISTS idx_flow_responses_assignment_id ON flow_responses(assignment_id);
CREATE INDEX IF NOT EXISTS idx_flow_responses_patient_id ON flow_responses(patient_id);
CREATE INDEX IF NOT EXISTS idx_flow_responses_flow_id ON flow_responses(flow_id);

-- Enable realtime for all tables conditionally
DO $
BEGIN
  -- Check if flows table is already in the publication
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'flows'
  ) THEN
    EXECUTE 'ALTER PUBLICATION supabase_realtime ADD TABLE flows';
  END IF;
  
  -- Check if flow_assignments table is already in the publication
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'flow_assignments'
  ) THEN
    EXECUTE 'ALTER PUBLICATION supabase_realtime ADD TABLE flow_assignments';
  END IF;
  
  -- Check if flow_responses table is already in the publication
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'flow_responses'
  ) THEN
    EXECUTE 'ALTER PUBLICATION supabase_realtime ADD TABLE flow_responses';
  END IF;
END;
$;

-- Add updated_at trigger for flows table
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_flows_updated_at BEFORE UPDATE ON flows
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_flow_assignments_updated_at BEFORE UPDATE ON flow_assignments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Add comments for documentation
COMMENT ON TABLE flows IS 'Stores flow definitions created by specialists';
COMMENT ON TABLE flow_assignments IS 'Assigns flows to specific patients with scheduling information';
COMMENT ON TABLE flow_responses IS 'Stores patient responses to flow steps';

COMMENT ON COLUMN flows.flow_data IS 'JSON data containing the complete flow structure (nodes, edges, etc.)';
COMMENT ON COLUMN flow_assignments.frequency IS 'How often the flow should be repeated: once, daily, weekly, monthly';
COMMENT ON COLUMN flow_assignments.progress IS 'JSON object tracking completion progress';
COMMENT ON COLUMN flow_responses.response_data IS 'JSON object containing the patient response data for a specific step';