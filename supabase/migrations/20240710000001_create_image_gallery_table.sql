CREATE TABLE IF NOT EXISTS image_gallery (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  url TEXT NOT NULL,
  bucket_id TEXT NOT NULL,
  file_size BIGINT NOT NULL,
  mime_type TEXT NOT NULL,
  uploaded_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_image_gallery_bucket_id ON image_gallery(bucket_id);
CREATE INDEX IF NOT EXISTS idx_image_gallery_uploaded_by ON image_gallery(uploaded_by);
CREATE INDEX IF NOT EXISTS idx_image_gallery_created_at ON image_gallery(created_at);

DROP POLICY IF EXISTS "Allow users to view their own images" ON image_gallery;
CREATE POLICY "Allow users to view their own images"
ON image_gallery FOR SELECT
USING (auth.uid() = uploaded_by OR EXISTS (
  SELECT 1 FROM user_profiles 
  WHERE id = auth.uid() 
  AND role IN ('super_admin')
));

DROP POLICY IF EXISTS "Allow users to upload their own images" ON image_gallery;
CREATE POLICY "Allow users to upload their own images"
ON image_gallery FOR INSERT
WITH CHECK (auth.uid() = uploaded_by);

DROP POLICY IF EXISTS "Allow users to delete their own images" ON image_gallery;
CREATE POLICY "Allow users to delete their own images"
ON image_gallery FOR DELETE
USING (auth.uid() = uploaded_by OR EXISTS (
  SELECT 1 FROM user_profiles 
  WHERE id = auth.uid() 
  AND role IN ('super_admin', 'chief_specialist')
));

ALTER TABLE image_gallery ENABLE ROW LEVEL SECURITY;

DO $
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' 
        AND tablename = 'image_gallery'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE image_gallery;
    END IF;
END $;
