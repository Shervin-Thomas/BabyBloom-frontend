-- Create Table for User Nutrition Logs
CREATE TABLE public.user_nutrition_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    log_date DATE NOT NULL DEFAULT CURRENT_DATE,
    symptoms JSONB,
    custom_symptom TEXT,
    meal_input TEXT,
    symptom_results JSONB,
    diet_results JSONB,
    daily_nutrient_intake JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security (RLS) on the table
ALTER TABLE public.user_nutrition_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_nutrition_logs

-- Allow authenticated users to view their own nutrition logs
CREATE POLICY "Users can view their own nutrition logs" ON public.user_nutrition_logs
    FOR SELECT USING (auth.uid() = user_id);

-- Allow authenticated users to insert their own nutrition logs
CREATE POLICY "Users can insert their own nutrition logs" ON public.user_nutrition_logs
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Allow authenticated users to update their own nutrition logs
CREATE POLICY "Users can update their own nutrition logs" ON public.user_nutrition_logs
    FOR UPDATE USING (auth.uid() = user_id);

-- Allow authenticated users to delete their own nutrition logs
CREATE POLICY "Users can delete their own nutrition logs" ON public.user_nutrition_logs
    FOR DELETE USING (auth.uid() = user_id);

-- Index for faster lookup by user_id and date
CREATE INDEX idx_user_nutrition_logs_user_id_date ON public.user_nutrition_logs(user_id, log_date DESC);

-- Grant permissions
GRANT ALL ON public.user_nutrition_logs TO authenticated;
GRANT SELECT ON public.user_nutrition_logs TO anon;
