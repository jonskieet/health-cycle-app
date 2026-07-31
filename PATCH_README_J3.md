# Patch: Module J3 (một phần) — lịch dải liền mạch (bỏ chấm tròn rời rạc)

## Cách áp dụng
Giải nén đè thư mục `3107/` lên thư mục dự án gốc. Không cần chạy SQL nào.

## File thay đổi
- `src/components/cycle/CycleCalendar.tsx`: các ngày LIÊN TIẾP cùng loại
  (hành kinh/cửa sổ thụ thai/rụng trứng) trong CÙNG 1 HÀNG (tuần) giờ nối
  thành 1 dải nền liền mạch, bo góc CHỈ Ở 2 ĐẦU dải — thay cho mỗi ngày 1
  hình tròn rời rạc như trước. Không nối dải qua 2 hàng khác nhau (đúng với
  chính ảnh tham khảo — dải dài hơn 1 tuần cũng không nối tràn sang hàng
  dưới). Số ngày vẫn hiển thị trong 1 vòng nhỏ (không có nền) đè lên dải.
  Viền "hôm nay" giữ nguyên như cũ (outline quanh số).

## KHÔNG làm trong patch này
Phần "cân nhắc đổi từ 1 tháng + nút </> sang cuộn dọc nhiều tháng liên tiếp"
(gợi ý trong `MAJOR_REDESIGN_BRIEF.md`, mục J3) — brief đánh giá đây là thay
đổi UX rủi ro cao hơn, tách riêng thành module con không bắt buộc làm cùng.
Giữ nguyên điều hướng "1 tháng + nút </>" hiện có, chỉ đổi cách TÔ MÀU.

## Đã kiểm tra
`tsc --noEmit` + `eslint` trên file đã sửa: sạch, không lỗi.
