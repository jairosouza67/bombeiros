-- ============================================================
-- INSTRUÇÕES:
-- 1. Acesse o Supabase Dashboard: https://supabase.com/dashboard
-- 2. Vá para seu projeto "bombeiros"
-- 3. No menu lateral, clique em "SQL Editor"
-- 4. Cole este código completo
-- 5. Clique em "RUN" para executar
-- ============================================================

-- Add pdf_url and image_url columns to ALL tables that need them

-- 1. Mindful Music (Músicas)
ALTER TABLE public.mindful_music
ADD COLUMN IF NOT EXISTS pdf_url TEXT,
ADD COLUMN IF NOT EXISTS image_url TEXT;

-- 2. Lessons (Daily Contact)
ALTER TABLE public.lessons
ADD COLUMN IF NOT EXISTS pdf_url TEXT,
ADD COLUMN IF NOT EXISTS image_url TEXT;

-- 3. Mindful Flows (já foi adicionado, mas reforçando)
ALTER TABLE public.mindful_flows
ADD COLUMN IF NOT EXISTS pdf_url TEXT,
ADD COLUMN IF NOT EXISTS image_url TEXT;

-- ============================================================
-- VERIFICAÇÃO:
-- Após executar, verifique:
-- 1. No menu "Table Editor":
--    - Tabela "mindful_music" deve ter pdf_url e image_url
--    - Tabela "lessons" deve ter pdf_url e image_url
--    - Tabela "mindful_flows" deve ter pdf_url e image_url
-- 2. Teste criar/editar conteúdo em cada seção:
--    - Aulas: ✅
--    - Daily Contact: ✅
--    - Mindful Flow: ✅
--    - Músicas: ✅
-- ============================================================
