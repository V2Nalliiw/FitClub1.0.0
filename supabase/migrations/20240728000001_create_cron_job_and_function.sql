-- Enable pg_cron extension if not already enabled
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Create flow_assignments table if it doesn't exist
CREATE TABLE IF NOT EXISTS flow_assignments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    patient_id UUID NOT NULL,
    flow_id UUID NOT NULL,
    is_daily BOOLEAN DEFAULT false,
    status TEXT DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create patient_tasks table if it doesn't exist
CREATE TABLE IF NOT EXISTS patient_tasks (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    patient_id UUID NOT NULL,
    flow_id UUID NOT NULL,
    status TEXT DEFAULT 'pendente',
    due_date DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_flow_assignments_daily ON flow_assignments(is_daily, status) WHERE is_daily = true AND status = 'active';
CREATE INDEX IF NOT EXISTS idx_patient_tasks_due_date ON patient_tasks(due_date, status);
CREATE INDEX IF NOT EXISTS idx_patient_tasks_patient_flow ON patient_tasks(patient_id, flow_id, due_date);

-- Create the function to schedule daily patient flows
CREATE OR REPLACE FUNCTION schedule_daily_patient_flows()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Insert new daily tasks for all active daily flow assignments
    -- Only create tasks if they don't already exist for today
    INSERT INTO patient_tasks (patient_id, flow_id, status, due_date)
    SELECT 
        fa.patient_id,
        fa.flow_id,
        'pendente' as status,
        CURRENT_DATE as due_date
    FROM flow_assignments fa
    WHERE fa.is_daily = true 
      AND fa.status = 'active'
      AND NOT EXISTS (
          SELECT 1 
          FROM patient_tasks pt 
          WHERE pt.patient_id = fa.patient_id 
            AND pt.flow_id = fa.flow_id 
            AND pt.due_date = CURRENT_DATE
      );
    
    -- Log the number of tasks created
    RAISE NOTICE 'Daily flow scheduling completed. Tasks created: %', 
        (SELECT COUNT(*) 
         FROM patient_tasks 
         WHERE due_date = CURRENT_DATE 
           AND created_at >= CURRENT_DATE);
END;
$$;

-- Grant necessary permissions
GRANT EXECUTE ON FUNCTION schedule_daily_patient_flows() TO postgres;
GRANT EXECUTE ON FUNCTION schedule_daily_patient_flows() TO service_role;

-- Create the cron job to run daily at midnight (00:00)
SELECT cron.schedule(
    'daily_flow_trigger',
    '0 0 * * *',
    'SELECT schedule_daily_patient_flows();'
);

-- Enable RLS on the new tables
ALTER TABLE flow_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE patient_tasks ENABLE ROW LEVEL SECURITY;

-- Create basic RLS policies (adjust based on your auth requirements)
CREATE POLICY "Users can view their own flow assignments" ON flow_assignments
    FOR SELECT USING (auth.uid() = patient_id);

CREATE POLICY "Users can view their own tasks" ON patient_tasks
    FOR SELECT USING (auth.uid() = patient_id);

CREATE POLICY "Service role can manage flow assignments" ON flow_assignments
    FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role can manage patient tasks" ON patient_tasks
    FOR ALL USING (auth.role() = 'service_role');

-- Add comments for documentation
COMMENT ON TABLE flow_assignments IS 'Stores assignments of flows to patients, including daily recurring flows';
COMMENT ON TABLE patient_tasks IS 'Stores individual tasks created for patients from flow assignments';
COMMENT ON FUNCTION schedule_daily_patient_flows() IS 'Function called by cron job to create daily tasks for patients with active daily flow assignments';
