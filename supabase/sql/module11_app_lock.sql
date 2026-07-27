-- ============================================================
-- Module 11 — App Lock (PIN)
-- Chạy trong Supabase SQL Editor sau schema.sql chính.
-- An toàn để chạy lại nhiều lần.
-- ============================================================

-- Lưu HASH của mã PIN (SHA-256, hex, tính ở phía client bằng Web Crypto API
-- trước khi gửi lên) — không bao giờ lưu PIN dạng plaintext.
alter table public.profiles add column if not exists app_lock_pin_hash text;
alter table public.profiles add column if not exists app_lock_enabled boolean not null default false;

-- Ghi chú bảo mật: đây là khoá "chặn xem lướt qua" (deterrent lock) phù hợp mức độ
-- một web app cá nhân, KHÔNG tương đương bảo mật biometric/keychain thật của app
-- native. Hash được so khớp lại ngay trên client sau khi đọc `app_lock_pin_hash`
-- qua RLS (chỉ owner đọc được hàng của chính mình — xem policy `profiles` có sẵn
-- trong schema.sql), không có endpoint verify phía server riêng.
