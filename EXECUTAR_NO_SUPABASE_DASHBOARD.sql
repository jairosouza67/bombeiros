-- ============================================================
-- INSTRUÇÕES:
-- 1. Acesse o Supabase Dashboard: https://supabase.com/dashboard
-- 2. Vá para seu projeto "bombeiros"
-- 3. No menu lateral, clique em "SQL Editor"
-- 4. Cole este código completo
-- 5. Clique em "RUN" para executar
-- ============================================================

-- Ensure all storage buckets exist with proper configurations

-- Content bucket for aulas (if not exists)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'content',
  'content',
  true,
  10485760, -- 10MB
  ARRAY['image/*', 'application/pdf']::text[]
)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 10485760,
  allowed_mime_types = ARRAY['image/*', 'application/pdf']::text[];

-- Lesson content bucket for daily contact (if not exists)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'lesson_content',
  'lesson_content',
  true,
  10485760, -- 10MB
  ARRAY['image/*', 'application/pdf']::text[]
)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 10485760,
  allowed_mime_types = ARRAY['image/*', 'application/pdf']::text[];

-- Drop existing policies if they exist to avoid conflicts
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own uploads" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own uploads" ON storage.objects;
DROP POLICY IF EXISTS "Public Access for lesson content" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload lesson content" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their lesson content uploads" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their lesson content uploads" ON storage.objects;

-- Create unified policies for content bucket
CREATE POLICY "Public can view content files"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'content');

CREATE POLICY "Authenticated users can upload to content"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'content' 
    AND auth.role() = 'authenticated'
  );

CREATE POLICY "Authenticated users can update content"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'content' 
    AND auth.role() = 'authenticated'
  );

CREATE POLICY "Authenticated users can delete content"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'content' 
    AND auth.role() = 'authenticated'
  );

-- Create unified policies for lesson_content bucket
CREATE POLICY "Public can view lesson content files"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'lesson_content');

CREATE POLICY "Authenticated users can upload to lesson_content"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'lesson_content' 
    AND auth.role() = 'authenticated'
  );

CREATE POLICY "Authenticated users can update lesson_content"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'lesson_content' 
    AND auth.role() = 'authenticated'
  );

CREATE POLICY "Authenticated users can delete lesson_content"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'lesson_content' 
    AND auth.role() = 'authenticated'
  );

-- ============================================================
-- VERIFICAÇÃO:
-- Após executar, verifique se os buckets foram criados:
-- 1. No menu lateral, clique em "Storage"
-- 2. Você deve ver os buckets "content" e "lesson_content"
-- ============================================================
