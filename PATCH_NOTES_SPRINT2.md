# Patch Sprint 1 — Mở rộng bộ dữ liệu triệu chứng + icon minh họa theo category

## Cách áp dụng
Giải nén đè thư mục `2707/` lên thư mục dự án gốc (ghi đè file trùng tên; đây là patch
tiếp theo sau `patch_sprint2_datepicker.zip` — áp lần lượt, không xung đột file).

## File thay đổi
- SỬA: `src/lib/symptoms.ts` — từ 5 nhóm/28 mục lên **8 nhóm/~62 mục**:
  - 5 nhóm cũ (Thể chất, Tâm trạng, Dịch tiết, Tình dục, Da & tóc) được bổ sung thêm nhiều mục mới đối chiếu trực tiếp ảnh Clover bạn gửi (VD: Co thắt, Kéo bụng dưới, Đau rụng trứng trái/phải, Tiêu chảy, Táo bón, thang tâm trạng 17 mức, Đốm/Nhớt/Keo/Lòng trắng trứng cho dịch tiết...).
  - 3 nhóm hoàn toàn mới: **Tránh thai** (thuốc đã uống/hôm qua, nhắc uống), **Xét nghiệm** (que thử thai, que thử rụng trứng — mỗi loại 3 kết quả), **Đo lường** (đánh dấu đã đo BBT/cân nặng trong ngày).
  - Toàn bộ **id cũ giữ nguyên 100%** — dữ liệu người dùng đã ghi trước đó không bị ảnh hưởng.
- MỚI: `src/components/ui/SymptomIcon.tsx` — bọc icon `lucide-react` trong khối tròn nền màu theo từng category (7 tông màu khác nhau ứng với 8 nhóm), tạo cảm giác "icon minh hoạ" nhất quán thay vì icon line trần như trước, không cần vẽ tay 60+ file SVG (chi phí quá lớn cho 1 patch — xem ghi chú "Chưa làm" bên dưới).
- SỬA: `src/components/log/CycleLogForm.tsx` — chip chọn triệu chứng dùng `SymptomIcon` mới, có hiệu ứng `active:scale-95` khi bấm.

## Đã kiểm tra
- `SymptomCategory` là union type mở rộng nhưng không có `switch/case` cứng nào tham chiếu 5 giá trị cũ trong `symptom-analysis.ts` / `SymptomAnalysis.tsx` — 2 file này KHÔNG cần sửa, tự động nhận nhóm mới qua `SYMPTOM_CATEGORIES.map(...)`.
- Cân bằng dấu ngoặc `{}` đã soát lại thủ công cho cả 3 file (không có sẵn `node_modules` trong môi trường patch để chạy `tsc` đầy đủ — khuyến nghị bạn chạy `npm run build` sau khi áp patch để chắc chắn).

## Chưa làm (có chủ đích, để không trễ tiến độ)
- **Icon minh hoạ vẽ tay (SVG nhân vật riêng)**: bản này dùng icon `lucide-react` + badge màu — đẹp và nhất quán hơn hẳn bản cũ, nhưng chưa phải minh hoạ vẽ tay như Clover. Vẽ 60+ SVG riêng là khối lượng lớn, nên tách thành 1 patch nhỏ riêng (Sprint 1b) nếu bạn muốn đầu tư thêm — có thể thay dần từng icon mà không đổi cách gọi ở nơi dùng.
- **Cột DB riêng cho Xét nghiệm/Đo lường** (`ovulation_test`, `pregnancy_test`, `bbt`, `weight`...): hiện các mục nhóm "Xét nghiệm"/"Đo lường" tạm lưu chung trong mảng `symptoms` (text[]) để không phải đổi schema ngay. Việc tách thành cột riêng + form nhập giá trị số (nhiệt độ, cân nặng) sẽ làm ở Sprint 3 khi redesign form ghi nhận.

## Việc tiếp theo (Sprint 3)
Redesign `log/page.tsx` + `CycleLogForm.tsx` thành flow dạng card cuộn dọc theo từng nhóm dữ liệu (Que thử thai, Nhiệt độ cơ sở, Cân nặng, Ghi chú...), thêm sticky chip bar để nhảy nhanh giữa các nhóm — cần thiết vì số lượng mục đã tăng gấp đôi.
