-- Migration: Add unique constraint to user_diet_plans on user_id and trimester

ALTER TABLE public.user_diet_plans
ADD CONSTRAINT unique_user_trimester UNIQUE (user_id, trimester);
