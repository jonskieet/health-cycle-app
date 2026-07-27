# Patch: Module 6 — Symptom Analysis chuyên sâu (VIP)

## Cách áp dụng
1. Giải nén đè vào gốc dự án.
2. File MỚI: `src/lib/symptom-analysis.ts`, `src/components/profile/SymptomAnalysis.tsx`
3. File THAY: `src/app/profile/page.tsx`
4. Không có thay đổi schema Supabase, không cần dependency mới.

## Tính năng
- Trang `/profile` có thêm mục **"Phân tích triệu chứng"** — thanh tần suất
  top 8 triệu chứng xuất hiện nhiều nhất qua các kỳ kinh đã ghi, kèm % và số
  kỳ, có tab lọc theo nhóm (Thể chất/Tâm trạng/Dịch tiết/Hoạt động tình
  dục/Da & tóc), và badge xu hướng (tăng/giảm/mới xuất hiện gần đây).
- Khoá VIP bằng `LockedFeature`/`isVipProfile()` có sẵn.

## Phạm vi đã cân nhắc và loại bỏ (quan trọng, đọc trước khi mở rộng)
Roadmap gốc mô tả phân tích "theo PHA chu kỳ" (nang trứng/rụng trứng/hoàng
thể/hành kinh). Nhưng schema hiện tại chỉ gắn `symptoms` vào MỘT dòng
`cycle_logs` đại diện cho một kỳ kinh đã ghi — tức triệu chứng luôn thuộc
pha "hành kinh", không có dữ liệu triệu chứng rời rạc ở các pha khác. Vì vậy
module này phân tích **tần suất & xu hướng theo thời gian qua nhiều kỳ**
thay vì theo pha — đây là quyết định phạm vi có chủ đích, không phải thiếu
sót. Muốn phân tích thật sự theo pha cần thêm bảng log triệu chứng hàng ngày
độc lập với period log (đổi model dữ liệu, để lại cho module riêng nếu cần).

## Việc còn thiếu
- Ngưỡng xác định xu hướng tăng/giảm (chênh lệch >15 điểm % giữa nửa gần đây
  và nửa trước đó) là ước lượng hợp lý, chưa kiểm chứng bởi chuyên gia y tế.
- Danh sách chỉ hiển thị tối đa 8 triệu chứng đầu, chưa có nút "xem thêm".
