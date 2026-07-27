# Patch: Module 2 (Nhắc nhở) + Module 3 (Cân nặng & BBT)

## Cách áp dụng
1. Giải nén file zip này ĐÈ vào thư mục gốc dự án (giải nén sao cho thư mục
   `src/` và `supabase/` trong zip đè lên `src/` và `supabase/` của dự án).
2. Các file bị THAY (ghi đè hoàn toàn):
   - `supabase/schema.sql`
   - `src/lib/queries.ts`
   - `src/app/log/page.tsx`
   - `src/app/profile/page.tsx`
   - `src/app/profile/report/page.tsx`
   - `src/app/settings/page.tsx`
   - `src/app/page.tsx`
3. Các file MỚI:
   - `supabase/sql/module2_reminders.sql`
   - `src/components/profile/WeightBBTChart.tsx`
   - `src/components/cycle/ReminderBanner.tsx`

## Việc cần làm thủ công sau khi giải nén (bắt buộc)
1. Mở Supabase SQL Editor của project THẬT, chạy lại toàn bộ `supabase/schema.sql`
   (an toàn để chạy lại nhiều lần — dùng `add column if not exists` / `do $$ ... exception`).
   Thay đổi quan trọng: constraint `health_metrics_type_check` giờ cho phép thêm
   `'weight'` và `'bbt'`.
2. Chạy tiếp `supabase/sql/module2_reminders.sql` để tạo bảng `reminders` (bảng mới,
   có RLS, chỉ user thấy được reminder của chính mình).
3. Chạy `npm install` nếu cần (không có thêm dependency mới, `recharts` đã có sẵn
   trong `package.json`).
4. `npx tsc --noEmit` đã chạy sạch trên máy tạo patch — nên chạy lại sau khi áp
   dụng để chắc chắn không có xung đột với các thay đổi khác bạn đã làm thêm.

## Tóm tắt tính năng
- **Module 3**: trang `/log` có thêm 2 ô "Cân nặng" và "Nhiệt độ cơ bản (BBT)".
  Trang `/profile` có thêm biểu đồ xu hướng 90 ngày (tab chuyển đổi giữa 2 loại).
- **Module 2**: trang `/settings` có mục "Nhắc nhở" — bật/tắt nhắc sắp đến kỳ
  kinh (chỉnh số ngày báo trước) và nhắc ghi log hàng ngày. Trang chủ hiển thị
  banner nhắc nhở tương ứng khi điều kiện đúng. Kênh gửi hiện tại là **in-app
  banner** (chưa có push notification thật — lý do & hướng mở rộng đã ghi rõ
  trong `module2_reminders.sql`).

Chi tiết đầy đủ đã được cập nhật vào "Nhật ký triển khai" ở cuối file
CLOVER_GAP_ANALYSIS_AND_ROADMAP.md (bản cập nhật gửi kèm/hoặc bạn có thể yêu
cầu tôi gửi lại file roadmap đã cập nhật).
