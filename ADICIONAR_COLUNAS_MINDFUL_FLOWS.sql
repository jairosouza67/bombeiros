-- ============================================================
-- INSTRUÇÕES:
-- 1. Acesse o Supabase Dashboard: https://supabase.com/dashboard
-- 2. Vá para seu projeto "bombeiros"
-- 3. No menu lateral, clique em "SQL Editor"
-- 4. Cole este código completo
-- 5. Clique em "RUN" para executar
-- ============================================================

-- Add pdf_url and image_url columns to mindful_flows table if they don't exist
ALTER TABLE public.mindful_flows
ADD COLUMN IF NOT EXISTS pdf_url TEXT,
ADD COLUMN IF NOT EXISTS image_url TEXT;

-- ============================================================
-- VERIFICAÇÃO:
-- Após executar, verifique:
-- 1. No menu "Table Editor": Tabela "mindful_flows" deve ter as colunas pdf_url e image_url
-- 2. Teste criar/editar um Mindful Flow com imagem ou PDF
-- ============================================================
