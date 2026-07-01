-- 1. Add is_active column for soft deletes
ALTER TABLE products
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE;

-- 2. Add policy for Admins to INSERT products
CREATE POLICY "Admins can insert products" 
    ON products FOR INSERT WITH CHECK ( public.is_admin() );

-- 3. Add policy for Admins to DELETE products (just in case they need to hard delete)
CREATE POLICY "Admins can delete products" 
    ON products FOR DELETE USING ( public.is_admin() );
