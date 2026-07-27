-- ============================================================
-- Module 9 — Fatigue Test / Trắc nghiệm năng lượng nhanh (P5, VIP)
-- Chạy trong Supabase SQL Editor sau schema.sql chính.
-- An toàn để chạy lại nhiều lần.
--
-- Khác với `health_metrics` (log 1 giá trị/loại/ngày), bài test này là
-- một trắc nghiệm nhiều câu hỏi chấm điểm ra 1 kết quả tổng — nên lưu
-- riêng thay vì ép vào MetricType, tránh phải đổi 4 lớp như đã ghi ở
-- phát hiện N8 trong roadmap cho mỗi loại chỉ số mới.
-- ============================================================

create table if not exists public.fatigue_tests (
  id uuid primary key default gen_random_uuid()
);

alter table public.fatigue_tests add column if not exists user_id uuid references auth.users (id) on delete cascade;
alter table public.fatigue_tests add column if not exists score integer not null default 0;
alter table public.fatigue_tests add column if not exists level text;
alter table public.fatigue_tests add column if not exists answers jsonb not null default '[]'::jsonb;
alter table public.fatigue_tests add column if not exists created_at timestamptz not null default now();

do $$ begin
  alter table public.fatigue_tests add constraint fatigue_tests_score_check
    check (score >= 0 and score <= 100);
exception
  when duplicate_object then null;
  when duplicate_table then null;
end $$;

do $$ begin
  alter table public.fatigue_tests add constraint fatigue_tests_level_check
    check (level in ('low', 'moderate', 'high'));
exception
  when duplicate_object then null;
  when duplicate_table then null;
end $$;

alter table public.fatigue_tests alter column user_id set not null;
alter table public.fatigue_tests alter column level set not null;

create index if not exists fatigue_tests_user_idx on public.fatigue_tests (user_id, created_at desc);

alter table public.fatigue_tests enable row level security;

drop policy if exists "fatigue_tests_select_own" on public.fatigue_tests;
create policy "fatigue_tests_select_own" on public.fatigue_tests
  for select using (auth.uid() = user_id);

drop policy if exists "fatigue_tests_insert_own" on public.fatigue_tests;
create policy "fatigue_tests_insert_own" on public.fatigue_tests
  for insert with check (auth.uid() = user_id);
