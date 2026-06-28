-- Products Table (Your Catalog)
CREATE TABLE products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    description TEXT,
    price NUMERIC NOT NULL,
    category TEXT,
    stock_quantity INTEGER DEFAULT 0,
    image_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Profiles Table (Your Customers)
-- Links directly to Supabase's auth.users table
CREATE TABLE profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT,
    phone TEXT,
    shipping_address TEXT,
    is_admin BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Orders Table (The Cart / Checkout)
CREATE TABLE orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    total_amount NUMERIC NOT NULL,
    status TEXT DEFAULT 'Pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Order Items Table (The Order Breakdown)
CREATE TABLE order_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id) ON DELETE SET NULL,
    quantity INTEGER NOT NULL,
    price_at_purchase NUMERIC NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==========================================
-- RLS (Row Level Security) Policies
-- ==========================================

ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

-- Products Policies
-- Anyone can view the catalog (publicly readable)
CREATE POLICY "Allow public read access on products" 
    ON products FOR SELECT USING (true);

-- Admins can update products (inventory, price)
CREATE POLICY "Admins can update products" 
    ON products FOR UPDATE USING (
        EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.is_admin = true)
    );

-- Profiles Policies
-- Users can only view, insert, and update their own profile
CREATE POLICY "Users can view own profile" 
    ON profiles FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" 
    ON profiles FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" 
    ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Admins can view all profiles
CREATE POLICY "Admins can view all profiles" 
    ON profiles FOR SELECT USING (
        EXISTS (SELECT 1 FROM profiles AS p WHERE p.id = auth.uid() AND p.is_admin = true)
    );

-- Orders Policies
-- Users can only view and create their own orders
CREATE POLICY "Users can view own orders" 
    ON orders FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own orders" 
    ON orders FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Admins can view all orders
CREATE POLICY "Admins can view all orders" 
    ON orders FOR SELECT USING (
        EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.is_admin = true)
    );

-- Admins can update orders (e.g. status)
CREATE POLICY "Admins can update orders" 
    ON orders FOR UPDATE USING (
        EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.is_admin = true)
    );

-- Order Items Policies
-- Users can view their own order items (checked via the orders table)
CREATE POLICY "Users can view own order items" 
    ON order_items FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM orders WHERE orders.id = order_items.order_id AND orders.user_id = auth.uid()
        )
    );

-- Users can create order items for their own orders
CREATE POLICY "Users can create own order items" 
    ON order_items FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM orders WHERE orders.id = order_items.order_id AND orders.user_id = auth.uid()
        )
    );

-- Admins can view all order items
CREATE POLICY "Admins can view all order items" 
    ON order_items FOR SELECT USING (
        EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.is_admin = true)
    );

-- Guest Checkout Policies
CREATE POLICY "Anyone can create guest orders" 
    ON orders FOR INSERT WITH CHECK (user_id IS NULL);

CREATE POLICY "Anyone can create guest order items" 
    ON order_items FOR INSERT WITH CHECK (
        EXISTS (SELECT 1 FROM orders WHERE orders.id = order_items.order_id AND orders.user_id IS NULL)
    );

-- ==========================================
-- Database Triggers
-- ==========================================

-- Function to decrement stock quantity
CREATE OR REPLACE FUNCTION decrement_stock_quantity()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE products
    SET stock_quantity = stock_quantity - NEW.quantity
    WHERE id = NEW.product_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger on order_items insert
DROP TRIGGER IF EXISTS on_order_item_inserted ON order_items;
CREATE TRIGGER on_order_item_inserted
AFTER INSERT ON order_items
FOR EACH ROW
EXECUTE FUNCTION decrement_stock_quantity();

-- Function to handle new user signups and automatically create a profile
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, is_admin)
  VALUES (new.id, new.raw_user_meta_data->>'full_name', false);
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to call the handle_new_user function when a new user is created in auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
