-- ============================================================
-- Aura — schema + RLS
-- Chạy trong Supabase SQL Editor (project của bạn).
-- An toàn để chạy lại nhiều lần (dùng IF NOT EXISTS / DROP POLICY IF EXISTS).
-- ============================================================

-- ---------- profiles ----------
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text,
  birth_date date,
  avg_cycle_length int not null default 28,
  avg_period_length int not null default 5,
  onboarded boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------- cycle_logs ----------
create table if not exists public.cycle_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  start_date date not null,
  end_date date,
  symptoms text[] not null default '{}',
  flow text check (flow in ('light', 'medium', 'heavy')),
  note text,
  created_at timestamptz not null default now()
);

create index if not exists cycle_logs_user_start_idx
  on public.cycle_logs (user_id, start_date desc);

-- ---------- health_metrics ----------
-- metric_type: 'stress' | 'heart_rate' | 'sleep' | 'hydration' | 'mood'
create table if not exists public.health_metrics (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  metric_type text not null check (
    metric_type in ('stress', 'heart_rate', 'sleep', 'hydration', 'mood')
  ),
  value numeric not null,
  logged_at date not null default current_date,
  note text,
  created_at timestamptz not null default now(),
  unique (user_id, metric_type, logged_at)
);

create index if not exists health_metrics_user_type_date_idx
  on public.health_metrics (user_id, metric_type, logged_at desc);

-- ---------- appointments ----------
create table if not exists public.appointments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  title text not null,
  doctor_name text,
  appointment_at timestamptz not null,
  note text,
  created_at timestamptz not null default now()
);

create index if not exists appointments_user_time_idx
  on public.appointments (user_id, appointment_at);

-- ---------- updated_at trigger cho profiles ----------
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

-- ---------- auto-tạo profile khi có user mới đăng ký ----------
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id) values (new.id)
  on conflict (id) do nothing;
  return new;
end;
$$ language plpgsql security definer set search_path = public;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ============================================================
-- RLS — mỗi user chỉ thấy/sửa được dữ liệu của chính mình
-- ============================================================

alter table public.profiles enable row level security;
alter table public.cycle_logs enable row level security;
alter table public.health_metrics enable row level security;
alter table public.appointments enable row level security;

drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own" on public.profiles
  for select using (auth.uid() = id);

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own" on public.profiles
  for update using (auth.uid() = id);

drop policy if exists "profiles_insert_own" on public.profiles;
create policy "profiles_insert_own" on public.profiles
  for insert with check (auth.uid() = id);

drop policy if exists "cycle_logs_all_own" on public.cycle_logs;
create policy "cycle_logs_all_own" on public.cycle_logs
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "health_metrics_all_own" on public.health_metrics;
create policy "health_metrics_all_own" on public.health_metrics
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "appointments_all_own" on public.appointments;
create policy "appointments_all_own" on public.appointments
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
