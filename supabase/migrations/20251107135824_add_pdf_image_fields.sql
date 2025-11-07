-- Add pdf_url and image_url fields to mindful_flows table
ALTER TABLE public.mindful_flows
ADD COLUMN pdf_url TEXT,
ADD COLUMN image_url TEXT;

-- Add pdf_url and image_url fields to mindful_music table
ALTER TABLE public.mindful_music
ADD COLUMN pdf_url TEXT,
ADD COLUMN image_url TEXT;