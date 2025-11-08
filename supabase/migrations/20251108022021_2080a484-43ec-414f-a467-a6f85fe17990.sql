-- Create storage bucket for car images
INSERT INTO storage.buckets (id, name, public)
VALUES ('car-images', 'car-images', true);

-- RLS policies for car images bucket
CREATE POLICY "Anyone can view car images"
ON storage.objects FOR SELECT
USING (bucket_id = 'car-images');

CREATE POLICY "Car owners can upload car images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'car-images' 
  AND auth.uid() IS NOT NULL
);

CREATE POLICY "Car owners can update their car images"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'car-images' 
  AND auth.uid() IS NOT NULL
);

CREATE POLICY "Car owners can delete their car images"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'car-images' 
  AND auth.uid() IS NOT NULL
);