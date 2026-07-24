-- ============================================================
-- Mở khoá VIP thủ công cho một tài khoản cụ thể.
-- Chạy trong Supabase SQL Editor (chạy bằng service_role nên vượt qua
-- được trigger protect_vip_columns trong schema.sql).
-- An toàn để chạy lại nhiều lần.
-- ============================================================

update public.profiles p
set is_vip = true,
    vip_activated_at = coalesce(p.vip_activated_at, now())
from auth.users u
where p.id = u.id
  and lower(u.email) = lower('tempmail.orc@gmail.com');

-- Kiểm tra lại kết quả:
select u.email, p.is_vip, p.vip_activated_at
from public.profiles p
join auth.users u on u.id = p.id
where lower(u.email) = lower('tempmail.orc@gmail.com');
