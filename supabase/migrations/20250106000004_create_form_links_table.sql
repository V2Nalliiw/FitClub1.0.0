-- Create form_links table for managing form links in flows
CREATE TABLE IF NOT EXISTS form_links (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  flow_id uuid NOT NULL,
  patient_id uuid NOT NULL,
  node_id text NOT NULL,
  token text NOT NULL UNIQUE,
  expires_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT now()
);

-- Add foreign key constraints
ALTER TABLE form_links
ADD CONSTRAINT form_links_flow_id_fkey 
FOREIGN KEY (flow_id) REFERENCES flows(id) ON DELETE CASCADE;

ALTER TABLE form_links
ADD CONSTRAINT form_links_patient_id_fkey 
FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS form_links_flow_id_idx ON form_links(flow_id);
CREATE INDEX IF NOT EXISTS form_links_patient_id_idx ON form_links(patient_id);
CREATE INDEX IF NOT EXISTS form_links_token_idx ON form_links(token);
CREATE INDEX IF NOT EXISTS form_links_expires_at_idx ON form_links(expires_at);

-- Enable Row Level Security
ALTER TABLE form_links ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Super admins can do everything
CREATE POLICY "Super admins can manage all form_links"
ON form_links FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM user_profiles
    WHERE user_profiles.id = auth.uid()
    AND user_profiles.role = 'super_admin'
  )
);

-- Chief specialists and specialists can manage form_links for their clinic
CREATE POLICY "Specialists can manage form_links for their clinic"
ON form_links FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM user_profiles up
    JOIN flows f ON f.id = form_links.flow_id
    WHERE up.id = auth.uid()
    AND up.role IN ('chief_specialist', 'specialist')
    AND up.clinic_id = f.clinic_id
  )
);

-- Patients can view their own form_links
CREATE POLICY "Patients can view their own form_links"
ON form_links FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM patients p
    WHERE p.id = form_links.patient_id
    AND p.user_id = auth.uid()
  )
);

-- Public access for form submission (using token)
CREATE POLICY "Public access via token"
ON form_links FOR SELECT
USING (true); -- This allows public access for form submission via token

-- Add table to realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE form_links;

-- Add comments for documentation
COMMENT ON TABLE form_links IS 'Stores form links generated for flow steps that require patient input';
COMMENT ON COLUMN form_links.id IS 'Unique identifier for the form link';
COMMENT ON COLUMN form_links.flow_id IS 'Reference to the flow this link belongs to';
COMMENT ON COLUMN form_links.patient_id IS 'Reference to the patient this link is for';
COMMENT ON COLUMN form_links.node_id IS 'Identifier of the specific node/step in the flow';
COMMENT ON COLUMN form_links.token IS 'Unique token used to access the form without authentication';
COMMENT ON COLUMN form_links.expires_at IS 'Optional expiration timestamp for the form link';
COMMENT ON COLUMN form_links.created_at IS 'Timestamp when the form link was created';
