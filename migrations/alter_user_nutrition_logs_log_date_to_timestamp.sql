-- Migration: Alter user_nutrition_logs table to include time in log_date

ALTER TABLE public.user_nutrition_logs
ALTER COLUMN log_date TYPE TIMESTAMP WITH TIME ZONE,
ALTER COLUMN log_date SET DEFAULT NOW();

-- Optional: Update existing rows to include a default time if they only have a date
-- UPDATE public.user_nutrition_logs
-- SET log_date = log_date::timestamp + '08:00:00'::interval
-- WHERE log_date::time IS NULL;
