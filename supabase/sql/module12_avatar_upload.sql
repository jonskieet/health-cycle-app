-- ============================================================
-- Module 12 — Upload ảnh đại diện thật (thay/ bổ sung cho preset icon)
-- Chạy trong Supabase SQL Editor sau schema.sql chính.
-- An toàn để chạy lại nhiều lần.
-- ============================================================

-- 1) Cột lưu URL ảnh đại diện do user upload. avatar_key (preset) vẫn giữ
--    lại làm fallback khi user chưa upload ảnh thật.
alter table public.profiles add column if not exists avatar_url text;

-- 2) Bucket lưu ảnh đại diện — public để đọc trực tiếp qua URL (ảnh không
--    phải dữ liệu nhạy cảm), nhưng chỉ chủ tài khoản mới được ghi/xoá.
insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do nothing;

-- 3) Policies: mỗi user chỉ được insert/update/delete file nằm trong thư
--    mục con trùng với user id của chính họ (đường dẫn dạng
--    "<user_id>/avatar.jpg"), nhưng ai cũng đọc được (bucket public).
drop policy if exists "Avatar images are publicly readable" on storage.objects;
create policy "Avatar images are publicly readable"
  on storage.objects for select
  using (bucket_id = 'avatars');

drop policy if exists "Users can upload their own avatar" on storage.objects;
create policy "Users can upload their own avatar"
  on storage.objects for insert
  with check (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "Users can update their own avatar" on storage.objects;
create policy "Users can update their own avatar"
  on storage.objects for update
  using (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "Users can delete their own avatar" on storage.objects;
create policy "Users can delete their own avatar"
  on storage.objects for delete
  using (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
