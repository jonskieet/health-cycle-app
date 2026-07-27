-- ============================================================
-- Module 2 — Hệ thống nhắc nhở (Reminders)
-- Chạy trong Supabase SQL Editor sau schema.sql chính.
-- An toàn để chạy lại nhiều lần.
--
-- Quyết định kênh gửi (ghi rõ theo yêu cầu ở roadmap mục "Module 2"):
-- App hiện tại là Next.js web app, chưa có hạ tầng push notification
-- (không có service worker/web-push, không có cron/edge function gửi email).
-- Thêm push/email thật cần thêm hạ tầng ngoài phạm vi 1 module (VAPID keys,
-- background sync, hoặc Supabase Edge Function + cron để quét reminders mỗi
-- ngày). Vì vậy Module 2 này triển khai kênh đơn giản nhất có thể làm ngay:
-- **in-app banner**, hiển thị khi user mở app và điều kiện nhắc nhở đúng
-- (vd: còn <= lead_days ngày nữa tới kỳ kinh dự kiến, hoặc chưa log hôm nay).
-- Bảng `reminders` vẫn được thiết kế đầy đủ field (type/enabled/lead_days/
-- time_of_day) để một agent sau này có thể nối thêm web-push/email mà
-- không cần đổi schema.
-- ============================================================

create table if not exists public.reminders (
  id uuid primary key default gen_random_uuid()
);

alter table public.reminders add column if not exists user_id uuid references auth.users (id) on delete cascade;
alter table public.reminders add column if not exists type text;
alter table public.reminders add column if not exists enabled boolean not null default true;
alter table public.reminders add column if not exists lead_days integer not null default 2;
alter table public.reminders add column if not exists time_of_day time not null default '20:00';
alter table public.reminders add column if not exists created_at timestamptz not null default now();

do $$ begin
  alter table public.reminders add constraint reminders_type_check
    check (type in ('period_upcoming', 'log_daily', 'medication', 'custom'));
exception
  when duplicate_object then null;
  when duplicate_table then null;
end $$;

alter table public.reminders alter column user_id set not null;
alter table public.reminders alter column type set not null;

-- Mỗi user chỉ có 1 reminder cho mỗi loại (đơn giản hoá cho bản đầu tiên;
-- 'custom' có thể trùng nhiều lần nên không đưa vào unique constraint).
do $$ begin
  alter table public.reminders
    add constraint reminders_user_type_key unique (user_id, type);
exception
  when duplicate_object then null;
  when duplicate_table then null;
end $$;

create index if not exists reminders_user_idx on public.reminders (user_id);

alter table public.reminders enable row level security;

drop policy if exists "reminders_all_own" on public.reminders;
create policy "reminders_all_own" on public.reminders
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
