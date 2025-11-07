-- Add PDF and image URL fields to aulas table
ALTER TABLE public.aulas
ADD COLUMN pdf_url TEXT,
ADD COLUMN image_url TEXT;