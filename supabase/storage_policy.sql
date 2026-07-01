-- 1. Create the product-images bucket if it doesn't exist (and set it to public)
INSERT INTO storage.buckets (id, name, public) 
VALUES ('product-images', 'product-images', true)
ON CONFLICT (id) DO NOTHING;

-- 2. Allow public to read the images (required for displaying them)
CREATE POLICY "Public Access" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'product-images');

-- 3. Allow authenticated admins to upload images
CREATE POLICY "Admin Upload Access" 
ON storage.objects FOR INSERT 
TO authenticated 
WITH CHECK (
  bucket_id = 'product-images' AND 
  (SELECT is_admin FROM public.profiles WHERE id = auth.uid()) = true
);

-- 4. Allow authenticated admins to update/delete their images
CREATE POLICY "Admin Update Access" 
ON storage.objects FOR UPDATE 
TO authenticated 
USING (
  bucket_id = 'product-images' AND 
  (SELECT is_admin FROM public.profiles WHERE id = auth.uid()) = true
);

CREATE POLICY "Admin Delete Access" 
ON storage.objects FOR DELETE 
TO authenticated 
USING (
  bucket_id = 'product-images' AND 
  (SELECT is_admin FROM public.profiles WHERE id = auth.uid()) = true
);
