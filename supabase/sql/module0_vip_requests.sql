-- ============================================================
-- Module 0 — Luồng nâng cấp VIP (yêu cầu chuyển khoản + admin duyệt)
-- Chạy trong Supabase SQL Editor sau schema.sql chính.
-- An toàn để chạy lại nhiều lần.
-- ============================================================

create table if not exists public.vip_requests (
  id uuid primary key default gen_random_uuid()
);

alter table public.vip_requests add column if not exists user_id uuid references auth.users (id) on delete cascade;
alter table public.vip_requests add column if not exists status text not null default 'pending';
alter table public.vip_requests add column if not exists note text;
alter table public.vip_requests add column if not exists transfer_code text;
alter table public.vip_requests add column if not exists created_at timestamptz not null default now();
alter table public.vip_requests add column if not exists reviewed_at timestamptz;

do $$ begin
  alter table public.vip_requests add constraint vip_requests_status_check
    check (status in ('pending', 'approved', 'rejected'));
exception
  when duplicate_object then null;
  when duplicate_table then null;
end $$;

alter table public.vip_requests alter column user_id set not null;

create index if not exists vip_requests_user_idx on public.vip_requests (user_id, created_at desc);
create index if not exists vip_requests_status_idx on public.vip_requests (status, created_at desc);

-- Chặn user tự đổi status của chính mình sau khi tạo request (chỉ service_role được đổi).
create or replace function public.protect_vip_request_status()
returns trigger as $$
begin
  if auth.role() <> 'service_role' then
    new.status := old.status;
    new.reviewed_at := old.reviewed_at;
  end if;
  return new;
end;
$$ language plpgsql security definer set search_path = public;

drop trigger if exists vip_requests_protect_status on public.vip_requests;
create trigger vip_requests_protect_status
  before update on public.vip_requests
  for each row execute function public.protect_vip_request_status();

alter table public.vip_requests enable row level security;

drop policy if exists "vip_requests_select_own" on public.vip_requests;
create policy "vip_requests_select_own" on public.vip_requests
  for select using (auth.uid() = user_id);

drop policy if exists "vip_requests_insert_own" on public.vip_requests;
create policy "vip_requests_insert_own" on public.vip_requests
  for insert with check (auth.uid() = user_id);

-- Không cho user update trực tiếp qua RLS (kể cả note) sau khi đã tạo —
-- giữ đơn giản: muốn gửi lại thì tạo request mới. Không tạo policy update cho user.

-- ============================================================
-- Duyệt một yêu cầu VIP (chạy thủ công bằng service_role trong SQL Editor)
-- Thay '<request_id>' bằng id thực tế lấy từ bảng vip_requests.
-- ============================================================
-- update public.vip_requests set status = 'approved', reviewed_at = now()
--   where id = '<request_id>';
-- update public.profiles set is_vip = true, vip_activated_at = now()
--   where id = (select user_id from public.vip_requests where id = '<request_id>');
