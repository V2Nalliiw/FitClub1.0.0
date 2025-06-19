-- Create a default clinic if none exists
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.clinics LIMIT 1) THEN
    INSERT INTO public.clinics (name, description, primary_color, secondary_color, accent_color)
    VALUES (
      'Clínica Padrão',
      'Clínica padrão do sistema',
      '#3B82F6',
      '#10B981',
      '#F59E0B'
    );
  END IF;
END
$$;