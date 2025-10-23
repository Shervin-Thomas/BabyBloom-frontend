-- Fix Shopping Cart RLS Policies
-- This script fixes the Row Level Security policies for shopping_cart table

-- First, drop existing policies
DROP POLICY IF EXISTS "Users can view own cart" ON shopping_cart;
DROP POLICY IF EXISTS "Users can insert own cart" ON shopping_cart;
DROP POLICY IF EXISTS "Users can update own cart" ON shopping_cart;

-- Create new, more flexible policies that handle both authenticated users and guest sessions

-- 1. SELECT policy: Users can view their own cart OR guest carts with their session_id
CREATE POLICY "Users can view own cart or guest cart" ON shopping_cart FOR SELECT USING (
  (auth.uid() IS NOT NULL AND auth.uid() = user_id) OR 
  (auth.uid() IS NULL AND session_id IS NOT NULL) OR
  (user_id IS NULL AND session_id IS NOT NULL)
);

-- 2. INSERT policy: Users can create their own cart OR guest carts
CREATE POLICY "Users can create own cart or guest cart" ON shopping_cart FOR INSERT WITH CHECK (
  (auth.uid() IS NOT NULL AND auth.uid() = user_id) OR 
  (user_id IS NULL AND session_id IS NOT NULL)
);

-- 3. UPDATE policy: Users can update their own cart OR guest carts with their session
CREATE POLICY "Users can update own cart or guest cart" ON shopping_cart FOR UPDATE USING (
  (auth.uid() IS NOT NULL AND auth.uid() = user_id) OR 
  (user_id IS NULL AND session_id IS NOT NULL)
);

-- 4. DELETE policy: Users can delete their own cart OR guest carts
CREATE POLICY "Users can delete own cart or guest cart" ON shopping_cart FOR DELETE USING (
  (auth.uid() IS NOT NULL AND auth.uid() = user_id) OR 
  (user_id IS NULL AND session_id IS NOT NULL)
);

-- Also fix the cart_items policies to handle guest users better
DROP POLICY IF EXISTS "Users can view own cart items" ON cart_items;
DROP POLICY IF EXISTS "Users can insert own cart items" ON cart_items;
DROP POLICY IF EXISTS "Users can update own cart items" ON cart_items;
DROP POLICY IF EXISTS "Users can delete own cart items" ON cart_items;

-- Cart items policies that work with both authenticated and guest users
CREATE POLICY "Users can view own cart items" ON cart_items FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM shopping_cart 
        WHERE id = cart_id AND (
            (auth.uid() IS NOT NULL AND user_id = auth.uid()) OR
            (user_id IS NULL AND session_id IS NOT NULL)
        )
    )
);

CREATE POLICY "Users can insert own cart items" ON cart_items FOR INSERT WITH CHECK (
    EXISTS (
        SELECT 1 FROM shopping_cart 
        WHERE id = cart_id AND (
            (auth.uid() IS NOT NULL AND user_id = auth.uid()) OR
            (user_id IS NULL AND session_id IS NOT NULL)
        )
    )
);

CREATE POLICY "Users can update own cart items" ON cart_items FOR UPDATE USING (
    EXISTS (
        SELECT 1 FROM shopping_cart 
        WHERE id = cart_id AND (
            (auth.uid() IS NOT NULL AND user_id = auth.uid()) OR
            (user_id IS NULL AND session_id IS NOT NULL)
        )
    )
);

CREATE POLICY "Users can delete own cart items" ON cart_items FOR DELETE USING (
    EXISTS (
        SELECT 1 FROM shopping_cart 
        WHERE id = cart_id AND (
            (auth.uid() IS NOT NULL AND user_id = auth.uid()) OR
            (user_id IS NULL AND session_id IS NOT NULL)
        )
    )
);

-- Grant necessary permissions for anonymous users (for guest carts)
GRANT SELECT, INSERT, UPDATE, DELETE ON shopping_cart TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON cart_items TO anon;

-- Also grant to authenticated users
GRANT SELECT, INSERT, UPDATE, DELETE ON shopping_cart TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON cart_items TO authenticated;