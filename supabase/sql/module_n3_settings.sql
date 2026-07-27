-- ============================================================
-- Module N3 — Lưu cài đặt ứng dụng thật (Thông báo, Hệ mét)
-- Chạy trong Supabase SQL Editor sau schema.sql chính.
-- An toàn để chạy lại nhiều lần.
-- ============================================================

alter table public.profiles add column if not exists notifications_enabled boolean not null default true;
alter table public.profiles add column if not exists metric_units boolean not null default true; -- true = hệ mét (cm, kg), false = inch, lb
