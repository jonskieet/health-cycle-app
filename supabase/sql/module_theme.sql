-- ============================================================
-- Module — Chủ đề giao diện (Theme, P9)
-- Chạy trong Supabase SQL Editor sau schema.sql chính.
-- An toàn để chạy lại nhiều lần.
-- ============================================================

alter table public.profiles add column if not exists theme text not null default 'light';

alter table public.profiles drop constraint if exists profiles_theme_check;
alter table public.profiles add constraint profiles_theme_check check (theme in ('light', 'dark'));
