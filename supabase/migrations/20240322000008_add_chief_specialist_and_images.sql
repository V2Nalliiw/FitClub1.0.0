-- Add chief specialist and image fields to clinics table
ALTER TABLE public.clinics 
ADD COLUMN IF NOT EXISTS chief_specialist_id UUID REFERENCES public.user_profiles(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS logo_file_name VARCHAR(255),
ADD COLUMN IF NOT EXISTS mobile_logo_file_name VARCHAR(255);

-- Create index for chief specialist lookup
CREATE INDEX IF NOT EXISTS idx_clinics_chief_specialist_id ON public.clinics(chief_specialist_id);

-- Update the clinics table to enable realtime if not already enabled
DO $
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' 
        AND tablename = 'clinics' 
        AND schemaname = 'public'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.clinics;
    END IF;
END $;

-- Create function to automatically assign chief specialist to clinic
CREATE OR REPLACE FUNCTION public.assign_chief_specialist_to_clinic()
RETURNS TRIGGER AS $$
BEGIN
  -- If a user profile is being created with chief_specialist role and has a clinic_id
  IF NEW.role = 'chief_specialist' AND NEW.clinic_id IS NOT NULL THEN
    -- Update the clinic to set this user as the chief specialist
    UPDATE public.clinics 
    SET chief_specialist_id = NEW.id 
    WHERE id = NEW.clinic_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for automatic chief specialist assignment
DROP TRIGGER IF EXISTS on_chief_specialist_created ON public.user_profiles;
CREATE TRIGGER on_chief_specialist_created
  AFTER INSERT OR UPDATE ON public.user_profiles
  FOR EACH ROW EXECUTE FUNCTION public.assign_chief_specialist_to_clinic();

-- Create storage bucket for clinic images if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('clinic-images', 'clinic-images', true)
ON CONFLICT (id) DO NOTHING;

-- Create policy for clinic images bucket
CREATE POLICY "Public Access" ON storage.objects FOR SELECT USING (bucket_id = 'clinic-images');
CREATE POLICY "Authenticated users can upload clinic images" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'clinic-images' AND auth.role() = 'authenticated');
CREATE POLICY "Users can update their clinic images" ON storage.objects FOR UPDATE USING (bucket_id = 'clinic-images' AND auth.role() = 'authenticated');
CREATE POLICY "Users can delete their clinic images" ON storage.objects FOR DELETE USING (bucket_id = 'clinic-images' AND auth.role() = 'authenticated');
