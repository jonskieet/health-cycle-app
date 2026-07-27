-- ============================================================
-- Module 7 — Kegel Trainer (P4, VIP)
-- Chạy trong Supabase SQL Editor sau schema.sql chính.
-- An toàn để chạy lại nhiều lần.
--
-- Lưu lịch sử các buổi tập Kegel đã hoàn thành (không lưu progress dở
-- dang — timer chạy hoàn toàn ở client, chỉ ghi lại khi user tập xong
-- hoặc dừng giữa chừng với số rep đã hoàn thành).
-- ============================================================

create table if not exists public.kegel_sessions (
  id uuid primary key default gen_random_uuid()
);

alter table public.kegel_sessions add column if not exists user_id uuid references auth.users (id) on delete cascade;
alter table public.kegel_sessions add column if not exists preset_id text;
alter table public.kegel_sessions add column if not exists reps_completed integer not null default 0;
alter table public.kegel_sessions add column if not exists total_reps integer not null default 0;
alter table public.kegel_sessions add column if not exists duration_seconds integer not null default 0;
alter table public.kegel_sessions add column if not exists completed boolean not null default false;
alter table public.kegel_sessions add column if not exists created_at timestamptz not null default now();

do $$ begin
  alter table public.kegel_sessions add constraint kegel_sessions_preset_check
    check (preset_id in ('beginner', 'intermediate', 'advanced'));
exception
  when duplicate_object then null;
  when duplicate_table then null;
end $$;

alter table public.kegel_sessions alter column user_id set not null;
alter table public.kegel_sessions alter column preset_id set not null;

create index if not exists kegel_sessions_user_idx on public.kegel_sessions (user_id, created_at desc);

alter table public.kegel_sessions enable row level security;

drop policy if exists "kegel_sessions_select_own" on public.kegel_sessions;
create policy "kegel_sessions_select_own" on public.kegel_sessions
  for select using (auth.uid() = user_id);

drop policy if exists "kegel_sessions_insert_own" on public.kegel_sessions;
create policy "kegel_sessions_insert_own" on public.kegel_sessions
  for insert with check (auth.uid() = user_id);

drop policy if exists "kegel_sessions_delete_own" on public.kegel_sessions;
create policy "kegel_sessions_delete_own" on public.kegel_sessions
  for delete using (auth.uid() = user_id);
