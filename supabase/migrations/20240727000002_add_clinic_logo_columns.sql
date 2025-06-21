-- Adiciona colunas para armazenar as URLs dos logos da clínica na tabela 'clinics'.
-- Utiliza 'IF NOT EXISTS' para garantir que a migração não falhe caso as colunas já tenham sido criadas manualmente.

ALTER TABLE public.clinics
ADD COLUMN IF NOT EXISTS logo_web_url TEXT,
ADD COLUMN IF NOT EXISTS logo_mobile_url TEXT;

COMMENT ON COLUMN public.clinics.logo_web_url IS 'URL para a logo da clínica usada em telas maiores (desktop).';
COMMENT ON COLUMN public.clinics.logo_mobile_url IS 'URL para a logo da clínica otimizada para telas de dispositivos móveis.';
