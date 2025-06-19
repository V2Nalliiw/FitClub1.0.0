DO $
BEGIN
  INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
  VALUES (
    'clinic-images',
    'clinic-images',
    true,
    5242880,
    ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
  ) ON CONFLICT (id) DO NOTHING;
EXCEPTION
  WHEN others THEN
    RAISE NOTICE 'Bucket creation failed or already exists: %', SQLERRM;
END $;

DO $
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'storage' 
    AND tablename = 'objects' 
    AND policyname = 'Public read access for clinic images'
  ) THEN
    CREATE POLICY "Public read access for clinic images" ON storage.objects
    FOR SELECT USING (bucket_id = 'clinic-images');
  END IF;
EXCEPTION
  WHEN others THEN
    RAISE NOTICE 'Policy creation failed: %', SQLERRM;
END $;

DO $
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'storage' 
    AND tablename = 'objects' 
    AND policyname = 'Authenticated upload access for clinic images'
  ) THEN
    CREATE POLICY "Authenticated upload access for clinic images" ON storage.objects
    FOR INSERT WITH CHECK (
      bucket_id = 'clinic-images' AND
      auth.role() = 'authenticated'
    );
  END IF;
EXCEPTION
  WHEN others THEN
    RAISE NOTICE 'Policy creation failed: %', SQLERRM;
END $;

DO $
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'storage' 
    AND tablename = 'objects' 
    AND policyname = 'Authenticated update access for clinic images'
  ) THEN
    CREATE POLICY "Authenticated update access for clinic images" ON storage.objects
    FOR UPDATE USING (
      bucket_id = 'clinic-images' AND
      auth.role() = 'authenticated'
    ) WITH CHECK (
      bucket_id = 'clinic-images' AND
      auth.role() = 'authenticated'
    );
  END IF;
EXCEPTION
  WHEN others THEN
    RAISE NOTICE 'Policy creation failed: %', SQLERRM;
END $;

DO $
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'storage' 
    AND tablename = 'objects' 
    AND policyname = 'Authenticated delete access for clinic images'
  ) THEN
    CREATE POLICY "Authenticated delete access for clinic images" ON storage.objects
    FOR DELETE USING (
      bucket_id = 'clinic-images' AND
      auth.role() = 'authenticated'
    );
  END IF;
EXCEPTION
  WHEN others THEN
    RAISE NOTICE 'Policy creation failed: %', SQLERRM;
END $;
