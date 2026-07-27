-- ============================================================
-- Module 8 — Onboarding quiz mở rộng: mục đích sử dụng
-- Chạy trong Supabase SQL Editor sau schema.sql chính.
-- An toàn để chạy lại nhiều lần.
-- ============================================================

alter table public.profiles add column if not exists usage_goal text;

do $$ begin
  alter table public.profiles add constraint profiles_usage_goal_check
    check (usage_goal is null or usage_goal in ('track', 'conceive', 'avoid'));
exception
  when duplicate_object then null;
  when duplicate_table then null;
end $$;

-- usage_goal:
--   'track'    = theo dõi chu kỳ thông thường
--   'conceive' = đang mong có thai
--   'avoid'    = đang tránh thai
