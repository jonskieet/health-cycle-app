-- ============================================================
-- Aura — schema + RLS
-- Chạy trong Supabase SQL Editor (project của bạn).
-- An toàn để chạy lại nhiều lần: dùng IF NOT EXISTS / DROP POLICY IF EXISTS,
-- và ALTER TABLE ... ADD COLUMN IF NOT EXISTS để "vá" các bảng có thể đã
-- được tạo trước đó với cấu trúc khác (vd nếu bạn từng chạy dở bản cũ).
-- ============================================================

-- ---------- profiles ----------
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade
);

alter table public.profiles add column if not exists display_name text;
alter table public.profiles add column if not exists birth_date date;
alter table public.profiles add column if not exists avg_cycle_length int not null default 28;
alter table public.profiles add column if not exists avg_period_length int not null default 5;
alter table public.profiles add column if not exists onboarded boolean not null default false;
alter table public.profiles add column if not exists created_at timestamptz not null default now();
alter table public.profiles add column if not exists updated_at timestamptz not null default now();

-- ---------- hồ sơ mở rộng: avatar preset + năm sinh ----------
alter table public.profiles add column if not exists avatar_key text;
alter table public.profiles add column if not exists birth_year int;

-- ---------- gói thành viên (VIP / Premium) ----------
alter table public.profiles add column if not exists is_vip boolean not null default false;
alter table public.profiles add column if not exists vip_activated_at timestamptz;

-- Chặn user tự set is_vip = true cho chính mình qua API/client.
-- Chỉ cho phép thay đổi is_vip / vip_activated_at khi thực hiện bằng service_role
-- (vd: SQL Editor, webhook thanh toán chạy bằng service key).
create or replace function public.protect_vip_columns()
returns trigger as $$
begin
  if auth.role() <> 'service_role' then
    new.is_vip := old.is_vip;
    new.vip_activated_at := old.vip_activated_at;
  end if;
  return new;
end;
$$ language plpgsql security definer set search_path = public;

drop trigger if exists profiles_protect_vip on public.profiles;
create trigger profiles_protect_vip
  before update on public.profiles
  for each row execute function public.protect_vip_columns();

-- ---------- cycle_logs ----------
create table if not exists public.cycle_logs (
  id uuid primary key default gen_random_uuid()
);

alter table public.cycle_logs add column if not exists user_id uuid references auth.users (id) on delete cascade;
alter table public.cycle_logs add column if not exists start_date date;
alter table public.cycle_logs add column if not exists end_date date;
alter table public.cycle_logs add column if not exists symptoms text[] not null default '{}';
alter table public.cycle_logs add column if not exists flow text;
alter table public.cycle_logs add column if not exists note text;
alter table public.cycle_logs add column if not exists created_at timestamptz not null default now();

do $$ begin
  alter table public.cycle_logs add constraint cycle_logs_flow_check
    check (flow in ('light', 'medium', 'heavy'));
exception
  when duplicate_object then null;
  when duplicate_table then null;
end $$;

alter table public.cycle_logs alter column start_date set not null;
alter table public.cycle_logs alter column user_id set not null;

create index if not exists cycle_logs_user_start_idx
  on public.cycle_logs (user_id, start_date desc);

-- ---------- health_metrics ----------
-- metric_type: 'stress' | 'heart_rate' | 'sleep' | 'hydration' | 'mood' | 'weight' | 'bbt'
-- (Module 3: thêm 'weight' - cân nặng kg, 'bbt' - nhiệt độ cơ bản °C đo buổi sáng)
create table if not exists public.health_metrics (
  id uuid primary key default gen_random_uuid()
);

alter table public.health_metrics add column if not exists user_id uuid references auth.users (id) on delete cascade;
alter table public.health_metrics add column if not exists metric_type text;
alter table public.health_metrics add column if not exists value numeric;
alter table public.health_metrics add column if not exists recorded_date date not null default current_date;
alter table public.health_metrics add column if not exists note text;
alter table public.health_metrics add column if not exists created_at timestamptz not null default now();

-- Module 3: mở rộng CHECK constraint để cho phép 'weight' và 'bbt'.
-- Phải drop constraint cũ trước vì Postgres không cho "alter constraint" trực tiếp.
alter table public.health_metrics drop constraint if exists health_metrics_type_check;
do $$ begin
  alter table public.health_metrics add constraint health_metrics_type_check
    check (metric_type in ('stress', 'heart_rate', 'sleep', 'hydration', 'mood', 'weight', 'bbt'));
exception
  when duplicate_object then null;
  when duplicate_table then null;
end $$;

alter table public.health_metrics alter column user_id set not null;
alter table public.health_metrics alter column metric_type set not null;
alter table public.health_metrics alter column value set not null;

do $$ begin
  alter table public.health_metrics
    add constraint health_metrics_user_type_date_key unique (user_id, metric_type, recorded_date);
exception
  when duplicate_object then null;
  when duplicate_table then null;
end $$;

create index if not exists health_metrics_user_type_date_idx
  on public.health_metrics (user_id, metric_type, recorded_date desc);

-- ---------- appointments ----------
create table if not exists public.appointments (
  id uuid primary key default gen_random_uuid()
);

alter table public.appointments add column if not exists user_id uuid references auth.users (id) on delete cascade;
alter table public.appointments add column if not exists title text;
alter table public.appointments add column if not exists doctor_name text;
alter table public.appointments add column if not exists appointment_at timestamptz;
alter table public.appointments add column if not exists note text;
alter table public.appointments add column if not exists created_at timestamptz not null default now();

alter table public.appointments alter column user_id set not null;
alter table public.appointments alter column title set not null;
alter table public.appointments alter column appointment_at set not null;

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
