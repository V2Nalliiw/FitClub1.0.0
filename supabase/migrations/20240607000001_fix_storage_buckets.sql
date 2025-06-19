-- Create storage buckets if they don't exist
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
  ('app-images', 'app-images', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml']),
  ('avatars', 'avatars', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif'])
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- Create RLS policies for storage buckets
CREATE POLICY IF NOT EXISTS "Public Access" ON storage.objects FOR SELECT USING (bucket_id IN ('app-images', 'avatars'));
CREATE POLICY IF NOT EXISTS "Authenticated users can upload" ON storage.objects FOR INSERT WITH CHECK (auth.role() = 'authenticated' AND bucket_id IN ('app-images', 'avatars'));
CREATE POLICY IF NOT EXISTS "Users can update their own files" ON storage.objects FOR UPDATE USING (auth.uid()::text = (storage.foldername(name))[1] OR auth.jwt() ->> 'role' = 'super_admin');
CREATE POLICY IF NOT EXISTS "Users can delete their own files" ON storage.objects FOR DELETE USING (auth.uid()::text = (storage.foldername(name))[1] OR auth.jwt() ->> 'role' = 'super_admin');

-- Enable realtime for app_settings table
alter publication supabase_realtime add table app_settings;
