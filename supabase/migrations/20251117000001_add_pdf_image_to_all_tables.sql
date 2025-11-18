-- Add pdf_url and image_url columns to mindful_music table
ALTER TABLE public.mindful_music
ADD COLUMN IF NOT EXISTS pdf_url TEXT,
ADD COLUMN IF NOT EXISTS image_url TEXT;

-- Add pdf_url and image_url columns to lessons table (Daily Contact)
ALTER TABLE public.lessons
ADD COLUMN IF NOT EXISTS pdf_url TEXT,
ADD COLUMN IF NOT EXISTS image_url TEXT;
