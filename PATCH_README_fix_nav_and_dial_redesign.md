# Patch: Fix lệch thanh nav (sau J8) + Thiết kế lại vòng tròn chu kỳ (theo ảnh Moontide)

## Cách áp dụng
Giải nén đè thư mục `3107/` lên thư mục dự án gốc. Không cần chạy SQL nào.

## 1. Fix lệch thanh nav (`src/components/layout/BottomNav.tsx`)
Nguyên nhân thật: sau khi đưa "Ghi nhận" thành FAB (J8), thanh nav chỉ còn 3
mục phẳng (Tổng quan, Chu kỳ, Cá nhân), chia 2 mục trái/1 mục phải — dù mỗi
ô đều `flex-1` bằng nhau về độ rộng, tổng số ô 2 bên lệch nhau (2 vs 1) khiến
điểm giữa thật của thanh (nơi FAB neo `left-1/2`) rơi lệch khỏi ô đệm giữa.
Đã soi kỹ ảnh Moontide xác nhận: bố cục đúng là 2 mục trái + 2 mục phải + FAB
giữa (không phải 2+1). Sửa bằng cách thêm mục thứ 4 — "Thư viện" (dùng lại
`app/library/page.tsx` đã có sẵn từ trước, trước đó chỉ vào được qua menu
trang Cá nhân, không phải trang mới) — khôi phục đúng bố cục 2+2 đối xứng
thật, không chỉ đối xứng nhìn qua.

## 2. Thiết kế lại vòng tròn chu kỳ (`src/components/cycle/CycleRadialDial.tsx`)
Đổi từ kiểu "vòng vạch chia mặt đồng hồ + 2 cung màu gradient nổi trên viền"
(bản J2 trước) sang kiểu "vòng SỐ NGÀY đầy đủ quanh viền + khối tròn tối màu
ở giữa", theo đúng bố cục ảnh Moontide chủ dự án gửi:
- Vòng số hiện ĐỦ mọi ngày (1 → độ dài chu kỳ trung bình), không chỉ mỗi 5
  ngày như bản cũ — mỗi số tự xoay theo hướng kính tuyến tại vị trí của nó.
- Ngày hành kinh tô đậm màu `--c-period`, ngày cửa sổ thụ thai tô đậm màu
  `--c-fertile`, ngày thường tô nhạt màu xám — thay cho 2 cung màu tô nền
  trên viền (đúng cơ chế ảnh mẫu dùng: SỐ đậm/nhạt khác nhau, không phải
  cung tô nền).
- Ngày hiện tại có 1 badge nền tròn phía sau số, giống ô "20" nổi bật trong
  ảnh mẫu.
- Khối tròn giữa đổi từ thẻ trắng phẳng sang khối tròn TỐI MÀU (gradient tự
  pha từ `--c-period`/`--c-fertile`, không dùng xanh navy như ảnh mẫu) kèm
  hoạ tiết sóng mờ trừu tượng NGUYÊN BẢN (không sao chép hình vẽ trăng lưỡi
  liềm cụ thể của ảnh — tuân thủ ràng buộc bản quyền ở `MAJOR_REDESIGN_BRIEF.md`
  mục 3). Chữ bên trong (`app/cycle/page.tsx` — nội dung `children` truyền
  vào) đổi từ tông `--ink` (tối) sang trắng/trắng-mờ cho khớp nền tối mới.
- Bỏ 2 chip nhãn "Kỳ kinh"/"Cửa sổ thụ thai" nổi ngoài viền (bản J2 cũ) —
  thông tin này đã có sẵn ở 2 thẻ "Kỳ kinh tiếp theo"/"Ngày rụng trứng" ngay
  bên dưới vòng, giữ lại chip sẽ trùng lặp và làm rối bố cục mới.

## Đã kiểm tra
`tsc --noEmit` sạch hoàn toàn. `eslint` sạch trên cả 3 file đã sửa. Đã dựng
thử vòng số bằng script Python độc lập (không đưa vào patch) để kiểm tra
khoảng cách/không chồng chữ trước khi đóng gói — không phát hiện tràn/chồng
lấn ở `avgCycleLength` 28 ngày.
