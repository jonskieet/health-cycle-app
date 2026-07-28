# Patch: Module A1 (Toast toàn cục) + A2 (phản hồi khi bấm nút)

## Cách áp dụng
Giải nén đè thư mục `2707/` lên thư mục dự án gốc (ghi đè file trùng tên).
Không cần chạy SQL nào trên Supabase cho patch này (không đổi schema).

## File thay đổi
- MỚI: `src/components/ui/Toast.tsx` — hệ thống thông báo (toast) dùng chung toàn app.
- SỬA: `src/app/providers.tsx` — gắn `ToastProvider` + `MutationCache.onError`
  toàn cục, mọi mutation lỗi (kể cả chỗ không tự bắt lỗi) đều tự hiện toast.
- SỬA: `src/app/globals.css` — thêm animation toast + class `.press-feedback`.
- SỬA: `src/components/log/MetricLogForm.tsx`, `CycleLogForm.tsx`,
  `src/components/appointments/AppointmentForm.tsx` — dùng toast thay banner lỗi
  riêng lẻ/im lặng; phát hiện & vá thêm 2 bug ẩn (xoá kỳ kinh / xoá-thêm-sửa lịch
  hẹn trước đây không có try/catch, lỗi bị nuốt hoàn toàn im lặng).

## Đã kiểm tra
`tsc --noEmit` toàn bộ `src/`: không lỗi. `eslint src/`: 3 vấn đề còn sót lại
CÓ SẴN TỪ TRƯỚC (không phải do patch này) — đã ghi rõ trong
`QUALITY_UX_ROADMAP.md` mục B2 để xử lý sau, không lẫn vào module này.

## Đọc thêm
Toàn bộ chi tiết quyết định thiết kế + việc còn dang dở nằm trong
`QUALITY_UX_ROADMAP.md` (mục "Nhật ký triển khai", entry ngày 2026-07-28).
