-- Admin System Schema Modifications
-- Add this to your existing database

-- Add user_role column to auth.users metadata if not exists
-- This will be handled via Supabase auth metadata

-- Create user profiles table to store additional user information including role
CREATE TABLE IF NOT EXISTS user_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name VARCHAR(255),
    phone VARCHAR(20),
    date_of_birth DATE,
    user_role VARCHAR(20) NOT NULL DEFAULT 'user' CHECK (user_role IN ('user', 'admin')),
    avatar_url TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Create admin_activities table to track admin actions
CREATE TABLE IF NOT EXISTS admin_activities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    admin_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    activity_type VARCHAR(50) NOT NULL, -- 'product_create', 'product_update', 'order_update', etc.
    activity_description TEXT NOT NULL,
    target_id UUID, -- ID of the affected entity (product, order, etc.)
    target_type VARCHAR(50), -- 'product', 'order', 'user', etc.
    metadata JSONB, -- Additional activity data
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Create admin_dashboard_stats table for caching dashboard statistics
CREATE TABLE IF NOT EXISTS admin_dashboard_stats (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    stat_type VARCHAR(50) NOT NULL UNIQUE, -- 'total_users', 'total_orders', 'revenue_today', etc.
    stat_value JSONB NOT NULL,
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_profiles_role ON user_profiles(user_role);
CREATE INDEX IF NOT EXISTS idx_user_profiles_active ON user_profiles(is_active);
CREATE INDEX IF NOT EXISTS idx_admin_activities_admin_id ON admin_activities(admin_id);
CREATE INDEX IF NOT EXISTS idx_admin_activities_type ON admin_activities(activity_type);
CREATE INDEX IF NOT EXISTS idx_admin_activities_created_at ON admin_activities(created_at);

-- Create trigger for updating user_profiles timestamp
CREATE TRIGGER update_user_profiles_updated_at 
    BEFORE UPDATE ON user_profiles 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- RLS policies for user_profiles
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Users can view their own profile
CREATE POLICY "Users can view own profile" ON user_profiles
    FOR SELECT USING (auth.uid() = id);

-- Users can update their own profile (but not the role)
CREATE POLICY "Users can update own profile" ON user_profiles
    FOR UPDATE USING (auth.uid() = id);

-- Admins can view all profiles
CREATE POLICY "Admins can view all profiles" ON user_profiles
    FOR SELECT TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE id = auth.uid() 
            AND user_role = 'admin'
        )
    );

-- Admins can update user roles and profiles
CREATE POLICY "Admins can update user profiles" ON user_profiles
    FOR UPDATE TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE id = auth.uid() 
            AND user_role = 'admin'
        )
    );

-- RLS policies for admin_activities
ALTER TABLE admin_activities ENABLE ROW LEVEL SECURITY;

-- Only admins can view admin activities
CREATE POLICY "Admins can view admin activities" ON admin_activities
    FOR SELECT TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE id = auth.uid() 
            AND user_role = 'admin'
        )
    );

-- Only admins can insert admin activities
CREATE POLICY "Admins can insert admin activities" ON admin_activities
    FOR INSERT TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE id = auth.uid() 
            AND user_role = 'admin'
        )
    );

-- RLS policies for admin_dashboard_stats
ALTER TABLE admin_dashboard_stats ENABLE ROW LEVEL SECURITY;

-- Only admins can access dashboard stats
CREATE POLICY "Admins can access dashboard stats" ON admin_dashboard_stats
    FOR ALL TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE id = auth.uid() 
            AND user_role = 'admin'
        )
    );

-- Function to automatically create user profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY definer SET search_path = public
AS $$
BEGIN
    INSERT INTO public.user_profiles (id, full_name, phone, date_of_birth, user_role)
    VALUES (
        NEW.id,
        NEW.raw_user_meta_data->>'full_name',
        NEW.raw_user_meta_data->>'phone',
        CASE 
            WHEN NEW.raw_user_meta_data->>'date_of_birth' IS NOT NULL 
            THEN (NEW.raw_user_meta_data->>'date_of_birth')::date 
            ELSE NULL 
        END,
        COALESCE(NEW.raw_user_meta_data->>'user_role', 'user')
    );
    RETURN NEW;
END;
$$;

-- Create trigger for new user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Insert initial admin dashboard stats
INSERT INTO admin_dashboard_stats (stat_type, stat_value) VALUES
('total_users', '{"count": 0, "growth": 0}'),
('total_orders', '{"count": 0, "growth": 0}'),
('total_revenue', '{"amount": 0, "growth": 0}'),
('products_count', '{"count": 0, "growth": 0}'),
('pending_orders', '{"count": 0}'),
('low_stock_products', '{"count": 0}')
ON CONFLICT (stat_type) DO NOTHING;