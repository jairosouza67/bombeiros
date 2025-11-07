# 🔧 Correção do Erro "Bucket not found"

## 📋 Problema Identificado

O erro "Bucket not found" ocorria porque:

1. ✅ Os editores tentavam criar buckets dinamicamente (não funciona em produção)
2. ✅ As migrations SQL existiam mas podem não ter sido aplicadas no Supabase remoto
3. ✅ As policies de storage podem estar em conflito

## ✅ Soluções Implementadas

### 1. Código Simplificado
- ✅ Removida a lógica de criação dinâmica de buckets de `AulasEditor.tsx`
- ✅ Removida a lógica de criação dinâmica de buckets de `DailyContactEditor.tsx`
- ✅ Agora os editores apenas fazem upload direto, assumindo que os buckets existem

### 2. Migration SQL Criada
- ✅ Arquivo: `supabase/migrations/20251107150000_ensure_storage_buckets.sql`
- ✅ Garante que os buckets `content` e `lesson_content` existam
- ✅ Configura policies corretas para upload/download

### 3. Script Manual
- ✅ Arquivo: `EXECUTAR_NO_SUPABASE_DASHBOARD.sql`
- ✅ Script pronto para executar diretamente no Supabase Dashboard

## 🚀 Como Aplicar a Correção

### Opção 1: Via Supabase Dashboard (RECOMENDADO)

1. Acesse: https://supabase.com/dashboard
2. Selecione o projeto "bombeiros"
3. Vá em: **SQL Editor** (menu lateral)
4. Abra o arquivo: `EXECUTAR_NO_SUPABASE_DASHBOARD.sql`
5. Copie todo o conteúdo
6. Cole no SQL Editor
7. Clique em **RUN**
8. Verifique em **Storage** se os buckets aparecem

### Opção 2: Via CLI (se configurado)

```bash
# Se você tiver o Supabase CLI configurado:
npx supabase db push
```

## ✅ Verificação

Após executar o SQL:

1. Vá em **Storage** no Supabase Dashboard
2. Você deve ver 2 buckets:
   - ✅ `content` (para Aulas)
   - ✅ `lesson_content` (para Daily Contact)
3. Ambos devem estar marcados como **Public**

## 🔍 Buckets e suas Finalidades

### `content`
- 📚 **Usado por**: Aulas
- 📁 **Estrutura**: `aulas/pdf/` e `aulas/image/`
- 📝 **Tipos permitidos**: PDFs e Imagens
- 📏 **Tamanho máximo**: 10MB por arquivo

### `lesson_content`
- 📚 **Usado por**: Daily Contact
- 📁 **Estrutura**: `{lesson_id}/`
- 📝 **Tipos permitidos**: PDFs e Imagens
- 📏 **Tamanho máximo**: 10MB por arquivo

## 🎯 Próximos Passos

1. ✅ Execute o SQL no Supabase Dashboard
2. ✅ Teste fazer upload de um PDF ou imagem em Aulas
3. ✅ Teste fazer upload de um PDF ou imagem em Daily Contact
4. ✅ Verifique se não há mais erros de "Bucket not found"

## 📞 Se o Erro Persistir

1. Verifique se está logado no Supabase
2. Confirme que tem permissões de admin no projeto
3. Verifique se os buckets foram criados em **Storage**
4. Limpe o cache do navegador (Ctrl+Shift+R)
