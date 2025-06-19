-- Criar tabela para agendamentos de fluxo
CREATE TABLE IF NOT EXISTS flow_schedules (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  flow_id UUID NOT NULL REFERENCES flows(id) ON DELETE CASCADE,
  patient_id TEXT NOT NULL,
  scheduled_for TIMESTAMP WITH TIME ZONE NOT NULL,
  delay_amount INTEGER NOT NULL,
  delay_unit TEXT NOT NULL CHECK (delay_unit IN ('minutes', 'hours', 'days', 'weeks')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'executed', 'cancelled')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar tabela para execuções de fluxo
CREATE TABLE IF NOT EXISTS flow_executions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  flow_id UUID NOT NULL REFERENCES flows(id) ON DELETE CASCADE,
  patient_id TEXT NOT NULL,
  current_node_id TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'paused', 'completed', 'cancelled')),
  started_at TIMESTAMP WITH TIME ZONE NOT NULL,
  completed_at TIMESTAMP WITH TIME ZONE,
  execution_data JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_flow_schedules_status ON flow_schedules(status);
CREATE INDEX IF NOT EXISTS idx_flow_schedules_scheduled_for ON flow_schedules(scheduled_for);
CREATE INDEX IF NOT EXISTS idx_flow_schedules_flow_id ON flow_schedules(flow_id);
CREATE INDEX IF NOT EXISTS idx_flow_schedules_patient_id ON flow_schedules(patient_id);

CREATE INDEX IF NOT EXISTS idx_flow_executions_status ON flow_executions(status);
CREATE INDEX IF NOT EXISTS idx_flow_executions_flow_id ON flow_executions(flow_id);
CREATE INDEX IF NOT EXISTS idx_flow_executions_patient_id ON flow_executions(patient_id);

-- Habilitar realtime para as novas tabelas
ALTER PUBLICATION supabase_realtime ADD TABLE flow_schedules;
ALTER PUBLICATION supabase_realtime ADD TABLE flow_executions;

-- Criar políticas RLS para flow_schedules
ALTER TABLE flow_schedules ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own flow schedules" ON flow_schedules;
CREATE POLICY "Users can view their own flow schedules"
ON flow_schedules FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM flows f 
    WHERE f.id = flow_schedules.flow_id 
    AND f.created_by = auth.uid()
  )
);

DROP POLICY IF EXISTS "Users can create flow schedules for their flows" ON flow_schedules;
CREATE POLICY "Users can create flow schedules for their flows"
ON flow_schedules FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM flows f 
    WHERE f.id = flow_schedules.flow_id 
    AND f.created_by = auth.uid()
  )
);

DROP POLICY IF EXISTS "Users can update their own flow schedules" ON flow_schedules;
CREATE POLICY "Users can update their own flow schedules"
ON flow_schedules FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM flows f 
    WHERE f.id = flow_schedules.flow_id 
    AND f.created_by = auth.uid()
  )
);

DROP POLICY IF EXISTS "Users can delete their own flow schedules" ON flow_schedules;
CREATE POLICY "Users can delete their own flow schedules"
ON flow_schedules FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM flows f 
    WHERE f.id = flow_schedules.flow_id 
    AND f.created_by = auth.uid()
  )
);

-- Criar políticas RLS para flow_executions
ALTER TABLE flow_executions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own flow executions" ON flow_executions;
CREATE POLICY "Users can view their own flow executions"
ON flow_executions FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM flows f 
    WHERE f.id = flow_executions.flow_id 
    AND f.created_by = auth.uid()
  )
);

DROP POLICY IF EXISTS "Users can create flow executions for their flows" ON flow_executions;
CREATE POLICY "Users can create flow executions for their flows"
ON flow_executions FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM flows f 
    WHERE f.id = flow_executions.flow_id 
    AND f.created_by = auth.uid()
  )
);

DROP POLICY IF EXISTS "Users can update their own flow executions" ON flow_executions;
CREATE POLICY "Users can update their own flow executions"
ON flow_executions FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM flows f 
    WHERE f.id = flow_executions.flow_id 
    AND f.created_by = auth.uid()
  )
);

DROP POLICY IF EXISTS "Users can delete their own flow executions" ON flow_executions;
CREATE POLICY "Users can delete their own flow executions"
ON flow_executions FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM flows f 
    WHERE f.id = flow_executions.flow_id 
    AND f.created_by = auth.uid()
  )
);
