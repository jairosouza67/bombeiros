-- Add pdf_url and image_url columns to mindful_flows table
ALTER TABLE public.mindful_flows
ADD COLUMN IF NOT EXISTS pdf_url TEXT,
ADD COLUMN IF NOT EXISTS image_url TEXT;
