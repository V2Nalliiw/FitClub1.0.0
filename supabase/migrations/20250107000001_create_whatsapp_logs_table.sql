-- Create table for WhatsApp notification logs
CREATE TABLE IF NOT EXISTS whatsapp_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id UUID REFERENCES patients(id),
  message TEXT NOT NULL,
  media_urls TEXT[] DEFAULT '{}',
  status TEXT NOT NULL,
  error TEXT,
  twilio_message_sid TEXT,
  sent_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add RLS policies for the whatsapp_logs table
ALTER TABLE whatsapp_logs ENABLE ROW LEVEL SECURITY;

-- Allow specialists and chief specialists to view logs for their patients
DROP POLICY IF EXISTS "Specialists can view logs for their patients" ON whatsapp_logs;
CREATE POLICY "Specialists can view logs for their patients"
  ON whatsapp_logs FOR SELECT
  USING (
    auth.uid() IN (
      SELECT assigned_specialist 
      FROM patients 
      WHERE patients.id = whatsapp_logs.patient_id
    )
  );

-- Allow chief specialists to view all logs for their clinic
DROP POLICY IF EXISTS "Chief specialists can view all logs for their clinic" ON whatsapp_logs;
CREATE POLICY "Chief specialists can view all logs for their clinic"
  ON whatsapp_logs FOR SELECT
  USING (
    auth.uid() IN (
      SELECT user_profiles.id 
      FROM user_profiles 
      WHERE user_profiles.role = 'chief_specialist'
    ) AND 
    EXISTS (
      SELECT 1 
      FROM patients 
      JOIN user_profiles ON user_profiles.clinic_id = patients.clinic_id 
      WHERE patients.id = whatsapp_logs.patient_id AND user_profiles.id = auth.uid()
    )
  );

-- Allow super admins to view all logs
DROP POLICY IF EXISTS "Super admins can view all logs" ON whatsapp_logs;
CREATE POLICY "Super admins can view all logs"
  ON whatsapp_logs FOR SELECT
  USING (
    auth.uid() IN (
      SELECT id 
      FROM user_profiles 
      WHERE role = 'super_admin'
    )
  );

-- Add the table to realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE whatsapp_logs;
