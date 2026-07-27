# Patch Sprint 2 — AppDatePicker (thay lịch hệ thống)

## Cách áp dụng
Giải nén đè thư mục `2707/` này lên thư mục dự án gốc (ghi đè file trùng tên).

## File thay đổi
- MỚI: `src/components/ui/AppDatePicker.tsx` — bottom-sheet chọn ngày tự vẽ, hỗ trợ chọn 1 ngày và chọn khoảng ngày, nhận/trả `YYYY-MM-DD` (tương thích 100% với `queries.ts`).
- SỬA: `src/components/log/CycleLogForm.tsx` — thay 2 `<input type="date">` bằng `<AppDatePicker mode="range" .../>`.

## Chưa đổi (giữ nguyên để không phá gì)
- `CycleCalendar.tsx` ở trang chủ chưa đổi — sẽ tái sử dụng phần lõi lịch của `AppDatePicker` ở Sprint tiếp theo khi làm trang `cycle/page.tsx`.
- Không đổi schema DB, không đổi `queries.ts`.

## Việc tiếp theo (Sprint 1)
Mở rộng `symptoms.ts` lên ~90 mục + bộ SVG minh họa riêng.
