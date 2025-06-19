-- Create storage buckets for images
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
  ('app-images', 'app-images', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml']),
  ('profile-images', 'profile-images', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']),
  ('clinic-images', 'clinic-images', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml'])
ON CONFLICT (id) DO NOTHING;

-- Create policies for app-images bucket (private per user)
DROP POLICY IF EXISTS "Allow users to upload their own app images" ON storage.objects;
CREATE POLICY "Allow users to upload their own app images"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'app-images' AND auth.uid()::text = (storage.foldername(name))[1]);

DROP POLICY IF EXISTS "Allow users to read their own app images" ON storage.objects;
CREATE POLICY "Allow users to read their own app images"
ON storage.objects FOR SELECT
USING (bucket_id = 'app-images' AND (auth.uid()::text = (storage.foldername(name))[1] OR EXISTS (
  SELECT 1 FROM user_profiles 
  WHERE id = auth.uid() 
  AND role IN ('super_admin')
)));

DROP POLICY IF EXISTS "Allow users to update their own app images" ON storage.objects;
CREATE POLICY "Allow users to update their own app images"
ON storage.objects FOR UPDATE
USING (bucket_id = 'app-images' AND auth.uid()::text = (storage.foldername(name))[1]);

DROP POLICY IF EXISTS "Allow users to delete their own app images" ON storage.objects;
CREATE POLICY "Allow users to delete their own app images"
ON storage.objects FOR DELETE
USING (bucket_id = 'app-images' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Create policies for profile-images bucket
DROP POLICY IF EXISTS "Allow authenticated users to upload profile images" ON storage.objects;
CREATE POLICY "Allow authenticated users to upload profile images"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'profile-images' AND auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Allow public read access to profile images" ON storage.objects;
CREATE POLICY "Allow public read access to profile images"
ON storage.objects FOR SELECT
USING (bucket_id = 'profile-images');

DROP POLICY IF EXISTS "Allow users to update their own profile images" ON storage.objects;
CREATE POLICY "Allow users to update their own profile images"
ON storage.objects FOR UPDATE
USING (bucket_id = 'profile-images' AND auth.uid()::text = (storage.foldername(name))[1]);

DROP POLICY IF EXISTS "Allow users to delete their own profile images" ON storage.objects;
CREATE POLICY "Allow users to delete their own profile images"
ON storage.objects FOR DELETE
USING (bucket_id = 'profile-images' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Create policies for clinic-images bucket
DROP POLICY IF EXISTS "Allow authenticated users to upload clinic images" ON storage.objects;
CREATE POLICY "Allow authenticated users to upload clinic images"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'clinic-images' AND auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Allow public read access to clinic images" ON storage.objects;
CREATE POLICY "Allow public read access to clinic images"
ON storage.objects FOR SELECT
USING (bucket_id = 'clinic-images');

DROP POLICY IF EXISTS "Allow authenticated users to update clinic images" ON storage.objects;
CREATE POLICY "Allow authenticated users to update clinic images"
ON storage.objects FOR UPDATE
USING (bucket_id = 'clinic-images' AND auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Allow authenticated users to delete clinic images" ON storage.objects;
CREATE POLICY "Allow authenticated users to delete clinic images"
ON storage.objects FOR DELETE
USING (bucket_id = 'clinic-images' AND auth.role() = 'authenticated');

-- Create image_gallery table to track uploaded images
CREATE TABLE IF NOT EXISTS image_gallery (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  url TEXT NOT NULL,
  bucket_id TEXT NOT NULL,
  file_size INTEGER,
  mime_type TEXT,
  uploaded_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_image_gallery_bucket_id ON image_gallery(bucket_id);
CREATE INDEX IF NOT EXISTS idx_image_gallery_uploaded_by ON image_gallery(uploaded_by);
CREATE INDEX IF NOT EXISTS idx_image_gallery_created_at ON image_gallery(created_at DESC);

-- Enable realtime for image_gallery
alter publication supabase_realtime add table image_gallery;
