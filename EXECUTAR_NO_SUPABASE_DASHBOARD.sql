-- ============================================================
-- INSTRUÇÕES:
-- 1. Acesse o Supabase Dashboard: https://supabase.com/dashboard
-- 2. Vá para seu projeto "bombeiros"
-- 3. No menu lateral, clique em "SQL Editor"
-- 4. Cole este código completo
-- 5. Clique em "RUN" para executar
-- ============================================================

-- ====================
-- PARTE 1: CRIAR TABELAS AULAS
-- ====================

-- Create aulas table (independent from lessons)
CREATE TABLE IF NOT EXISTS public.aulas (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  module TEXT NOT NULL,
  description TEXT,
  video_url TEXT NOT NULL,
  mindful_video_url TEXT NOT NULL,
  duration INTEGER,
  release_time TIME WITHOUT TIME ZONE NOT NULL,
  release_timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
  pdf_url TEXT,
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Add pdf_url and image_url if table already exists without them
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'aulas' AND column_name = 'pdf_url') THEN
    ALTER TABLE public.aulas ADD COLUMN pdf_url TEXT;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'aulas' AND column_name = 'image_url') THEN
    ALTER TABLE public.aulas ADD COLUMN image_url TEXT;
  END IF;
END $$;

-- Create aulas_progress table (independent from progress)
CREATE TABLE IF NOT EXISTS public.aulas_progress (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  aula_id UUID NOT NULL,
  is_completed BOOLEAN DEFAULT false,
  mindful_completed BOOLEAN DEFAULT false,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, aula_id)
);

-- Enable RLS
ALTER TABLE public.aulas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.aulas_progress ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Anyone can view aulas" ON public.aulas;
DROP POLICY IF EXISTS "Authenticated users can insert aulas" ON public.aulas;
DROP POLICY IF EXISTS "Authenticated users can update aulas" ON public.aulas;
DROP POLICY IF EXISTS "Authenticated users can delete aulas" ON public.aulas;
DROP POLICY IF EXISTS "Users can view own aulas progress" ON public.aulas_progress;
DROP POLICY IF EXISTS "Users can insert own aulas progress" ON public.aulas_progress;
DROP POLICY IF EXISTS "Users can update own aulas progress" ON public.aulas_progress;

-- RLS Policies for aulas
CREATE POLICY "Anyone can view aulas"
  ON public.aulas FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can insert aulas"
  ON public.aulas FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update aulas"
  ON public.aulas FOR UPDATE
  USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete aulas"
  ON public.aulas FOR DELETE
  USING (auth.role() = 'authenticated');

-- RLS Policies for aulas_progress
CREATE POLICY "Users can view own aulas progress"
  ON public.aulas_progress FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own aulas progress"
  ON public.aulas_progress FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own aulas progress"
  ON public.aulas_progress FOR UPDATE
  USING (auth.uid() = user_id);

-- ====================
-- PARTE 2: CRIAR BUCKETS DE STORAGE
-- ====================

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

-- Drop ALL existing policies on storage.objects to avoid conflicts
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own uploads" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own uploads" ON storage.objects;
DROP POLICY IF EXISTS "Public Access for lesson content" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload lesson content" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their lesson content uploads" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their lesson content uploads" ON storage.objects;
DROP POLICY IF EXISTS "Public can view content files" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload to content" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update content" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete content" ON storage.objects;
DROP POLICY IF EXISTS "Public can view lesson content files" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload to lesson_content" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update lesson_content" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete lesson_content" ON storage.objects;

-- Create unified policies for content bucket
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'storage' 
    AND tablename = 'objects' 
    AND policyname = 'Public can view content files'
  ) THEN
    CREATE POLICY "Public can view content files"
      ON storage.objects FOR SELECT
      USING (bucket_id = 'content');
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'storage' 
    AND tablename = 'objects' 
    AND policyname = 'Authenticated users can upload to content'
  ) THEN
    CREATE POLICY "Authenticated users can upload to content"
      ON storage.objects FOR INSERT
      WITH CHECK (
        bucket_id = 'content' 
        AND auth.role() = 'authenticated'
      );
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'storage' 
    AND tablename = 'objects' 
    AND policyname = 'Authenticated users can update content'
  ) THEN
    CREATE POLICY "Authenticated users can update content"
      ON storage.objects FOR UPDATE
      USING (
        bucket_id = 'content' 
        AND auth.role() = 'authenticated'
      );
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'storage' 
    AND tablename = 'objects' 
    AND policyname = 'Authenticated users can delete content'
  ) THEN
    CREATE POLICY "Authenticated users can delete content"
      ON storage.objects FOR DELETE
      USING (
        bucket_id = 'content' 
        AND auth.role() = 'authenticated'
      );
  END IF;

  -- Create unified policies for lesson_content bucket
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'storage' 
    AND tablename = 'objects' 
    AND policyname = 'Public can view lesson content files'
  ) THEN
    CREATE POLICY "Public can view lesson content files"
      ON storage.objects FOR SELECT
      USING (bucket_id = 'lesson_content');
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'storage' 
    AND tablename = 'objects' 
    AND policyname = 'Authenticated users can upload to lesson_content'
  ) THEN
    CREATE POLICY "Authenticated users can upload to lesson_content"
      ON storage.objects FOR INSERT
      WITH CHECK (
        bucket_id = 'lesson_content' 
        AND auth.role() = 'authenticated'
      );
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'storage' 
    AND tablename = 'objects' 
    AND policyname = 'Authenticated users can update lesson_content'
  ) THEN
    CREATE POLICY "Authenticated users can update lesson_content"
      ON storage.objects FOR UPDATE
      USING (
        bucket_id = 'lesson_content' 
        AND auth.role() = 'authenticated'
      );
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'storage' 
    AND tablename = 'objects' 
    AND policyname = 'Authenticated users can delete lesson_content'
  ) THEN
    CREATE POLICY "Authenticated users can delete lesson_content"
      ON storage.objects FOR DELETE
      USING (
        bucket_id = 'lesson_content' 
        AND auth.role() = 'authenticated'
      );
  END IF;
END $$;

-- ============================================================
-- VERIFICAÇÃO:
-- Após executar, verifique:
-- 1. No menu "Table Editor": Tabelas "aulas" e "aulas_progress" devem existir
-- 2. No menu "Storage": Buckets "content" e "lesson_content" devem existir
-- 3. Teste criar uma nova Aula no sistema
-- ============================================================
