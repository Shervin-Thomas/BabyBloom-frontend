-- BabyBloom: Baby Growth Logs (PostgreSQL / Supabase)
-- Safe to re-run. Creates table, indexes, RLS, and policies.

-- 0) UUID helper (use pgcrypto if uuid-ossp not available)
create extension if not exists "uuid-ossp";
create extension if not exists pgcrypto;

-- 1) Table
create table if not exists public.baby_growth_logs (
  id uuid primary key default coalesce(uuid_generate_v4(), gen_random_uuid()),
  user_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  weight_kg numeric not null check (weight_kg > 0),
  height_cm numeric not null check (height_cm > 0),
  head_cm numeric not null check (head_cm > 0)
);

-- 2) Indexes
create index if not exists idx_baby_growth_logs_user_id_created_at
  on public.baby_growth_logs (user_id, created_at desc);

-- 3) Row Level Security
alter table public.baby_growth_logs enable row level security;

-- 4) Policies (CRUD only own rows)
drop policy if exists "Allow insert own growth logs" on public.baby_growth_logs;
create policy "Allow insert own growth logs"
on public.baby_growth_logs
for insert to authenticated
with check (auth.uid() = user_id);

drop policy if exists "Allow select own growth logs" on public.baby_growth_logs;
create policy "Allow select own growth logs"
on public.baby_growth_logs
for select to authenticated
using (auth.uid() = user_id);

drop policy if exists "Allow update own growth logs" on public.baby_growth_logs;
create policy "Allow update own growth logs"
on public.baby_growth_logs
for update to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "Allow delete own growth logs" on public.baby_growth_logs;
create policy "Allow delete own growth logs"
on public.baby_growth_logs
for delete to authenticated
using (auth.uid() = user_id);

-- End of file


