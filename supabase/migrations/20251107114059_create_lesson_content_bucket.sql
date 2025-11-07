-- Create storage bucket for Daily Contact lesson content uploads
INSERT INTO storage.buckets (id, name, public)
VALUES ('lesson_content', 'lesson_content', true)
ON CONFLICT (id) DO NOTHING;

-- Set up RLS policies for the lesson_content bucket
CREATE POLICY "Public Access for lesson content" ON storage.objects FOR SELECT USING (bucket_id = 'lesson_content');
CREATE POLICY "Authenticated users can upload lesson content" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'lesson_content' AND auth.role() = 'authenticated');
CREATE POLICY "Users can update their lesson content uploads" ON storage.objects FOR UPDATE USING (bucket_id = 'lesson_content' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Users can delete their lesson content uploads" ON storage.objects FOR DELETE USING (bucket_id = 'lesson_content' AND auth.uid()::text = (storage.foldername(name))[1]);