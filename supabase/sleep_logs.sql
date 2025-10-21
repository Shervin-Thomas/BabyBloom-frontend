-- BabyBloom: Sleep Logs (PostgreSQL / Supabase)
-- Safe to re-run. Creates table, indexes, RLS, and policies.

-- 0) UUID helper (use pgcrypto if uuid-ossp not available)
create extension if not exists "uuid-ossp";
create extension if not exists pgcrypto;

-- 1) Table
create table if not exists public.sleep_logs (
  id uuid primary key default coalesce(uuid_generate_v4(), gen_random_uuid()),
  user_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  log_date date not null,
  sleep_time time not null,
  wake_time time not null,
  duration_hours numeric not null check (duration_hours > 0),
  notes text
);

-- 2) Indexes
create index if not exists idx_sleep_logs_user_id_log_date
  on public.sleep_logs (user_id, log_date desc);

-- 3) Row Level Security
alter table public.sleep_logs enable row level security;

-- 4) Policies (CRUD only own rows)
drop policy if exists "Allow insert own sleep logs" on public.sleep_logs;
create policy "Allow insert own sleep logs"
on public.sleep_logs
for insert to authenticated
with check (auth.uid() = user_id);

drop policy if exists "Allow select own sleep logs" on public.sleep_logs;
create policy "Allow select own sleep logs"
on public.sleep_logs
for select to authenticated
using (auth.uid() = user_id);

drop policy if exists "Allow update own sleep logs" on public.sleep_logs;
create policy "Allow update own sleep logs"
on public.sleep_logs
for update to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "Allow delete own sleep logs" on public.sleep_logs;
create policy "Allow delete own sleep logs"
on public.sleep_logs
for delete to authenticated
using (auth.uid() = user_id);

-- End of file