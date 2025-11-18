-- Increase file size limit for storage buckets to allow larger PDF uploads

UPDATE storage.buckets 
SET file_size_limit = 104857600 -- 100MB
WHERE id IN ('content', 'lesson_content');