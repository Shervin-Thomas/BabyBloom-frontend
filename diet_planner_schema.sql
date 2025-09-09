-- Create Table for User Diet Plans
CREATE TABLE public.user_diet_plans (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    trimester INTEGER NOT NULL,
    preferences JSONB,
    allergies JSONB,
    diet_plan_content JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security (RLS) on the table
ALTER TABLE public.user_diet_plans ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_diet_plans

-- Allow authenticated users to view their own diet plans
CREATE POLICY "Users can view their own diet plans" ON public.user_diet_plans
    FOR SELECT USING (auth.uid() = user_id);

-- Allow authenticated users to insert their own diet plans
CREATE POLICY "Users can insert their own diet plans" ON public.user_diet_plans
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Allow authenticated users to update their own diet plans
CREATE POLICY "Users can update their own diet plans" ON public.user_diet_plans
    FOR UPDATE USING (auth.uid() = user_id);

-- Allow authenticated users to delete their own diet plans
CREATE POLICY "Users can delete their own diet plans" ON public.user_diet_plans
    FOR DELETE USING (auth.uid() = user_id);

-- Index for faster lookup by user_id and trimester
CREATE INDEX idx_user_diet_plans_user_id_trimester ON public.user_diet_plans(user_id, trimester);

-- Grant permissions
GRANT ALL ON public.user_diet_plans TO authenticated;
GRANT SELECT ON public.user_diet_plans TO anon;
