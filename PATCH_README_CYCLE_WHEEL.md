# Patch: Cycle Wheel redesign theo Cycle_Wheel_Design_Specification.md

## Cách áp dụng
Giải nén đè file bên dưới lên gốc dự án (ghi đè, chỉ 1 file):
- `src/components/cycle/CycleRadialDial.tsx`

Không cần sửa nơi gọi component (`src/app/cycle/page.tsx`) — props giữ
nguyên (`size`, `avgCycleLength`, `avgPeriodLength`, `currentDay`,
`periodColor`, `fertileColor`, `children`), không cần đổi DB/schema.

## Những gì đổi so với bản cũ
Viết lại toàn bộ component theo đúng 6 lớp trong spec:
- **Layer 1 (Outer Tick Ring)**: mỗi vạch = 1 ngày, dày 1.5px, màu
  `#2F2F2F` mờ 35%, vạch mỗi 5 ngày dài hơn — bỏ style "vạch hôm nay to
  bất thường" của bản cũ (spec: tick chỉ là tham chiếu thời gian, không
  chỉ báo tiến độ).
- **Layer 2 (Decorative Background Ring)**: đổi hoạ tiết gạch chéo từ màu
  tím (`--c-fertile`) sang xám trung tính `#F5F5F7`, mờ 3–5%, đúng vai
  trò "ngăn cách timeline khỏi tâm" thay vì mang màu theo pha.
- **Layer 3 (Phase Timeline Ring)**: giữ 2 cung Kỳ kinh/Cửa sổ thụ thai
  cong theo đúng vị trí ngày cố định + nhãn chữ uốn cong theo cung — bỏ
  hẳn hiệu ứng "huy hiệu tròn + đường nối trắng đứt nét" ở 2 đầu nối cung
  (không có trong spec, dễ hiểu lầm là mốc tiến độ).
- **Layer 4 (Current Position Marker)** — thay đổi lớn nhất: bản cũ có 2
  "huy hiệu" cố định tại điểm nối 2 cung màu (trông giống điểm hoàn
  thành). Bản mới chỉ có **1 chấm "Hôm nay" duy nhất**, tự di chuyển theo
  `currentDay` quanh vòng — đúng vòng ngoài trắng 36px + shadow nổi, vòng
  trong tối `#202020` 28px, dấu check ở giữa, nằm đè nhẹ lên mép cung màu
  (không lọt hẳn vào trong nét vẽ).
- **Layer 5 (Center Circle)**: bản cũ không có vòng nền riêng ở giữa —
  giờ thêm 1 vòng tròn `#F5F5F7` cùng hoạ tiết gạch chéo với Layer 2,
  không viền, đường kính ≈72% wheel, đúng vai trò "bề mặt sạch" cho nội
  dung giữa.
- **Layer 6 (Center Content)**: không đổi — vẫn nhận qua `children` như
  cũ (Pha hiện tại → Số ngày → Nhãn phụ → CTA), nơi gọi
  (`src/app/cycle/page.tsx`) không cần sửa gì.
- Các pha còn lại (không phải Kỳ kinh/Cửa sổ thụ thai) vẫn hoà mờ vào nền
  bằng 1 vòng viền mảnh, mờ nhạt — không được vẽ ngang hàng 2 cung chính,
  đúng nguyên tắc "không cho mọi pha trọng số hình ảnh bằng nhau".

## Có chủ đích giữ nguyên
- Màu cung Kỳ kinh/Cửa sổ thụ thai vẫn nhận qua props `periodColor`/
  `fertileColor` (đang truyền `var(--c-period)`/`var(--c-fertile)` từ
  trang gọi) thay vì hard-code hex `#FF67B4`/`#7A6BFF` như spec — để giữ
  nhất quán với hệ theme sáng/tối đã có sẵn trong app, đổi theme không
  cần sửa lại component này.
- Nút "Xem thêm" xoay dọc bên trái wheel: đã nằm ở `src/app/cycle/page.tsx`
  từ trước (ngoài `CycleRadialDial`), đúng đúng vị trí spec mô tả (không
  gắn liền wheel) — không cần đổi.

## Đề xuất kiểm tra sau khi áp patch
Chưa chạy được `npm run build` trong môi trường patch (không có
`node_modules`) — nên chạy `npm run build`/`tsc --noEmit` sau khi áp,
chủ yếu để soát lại cân bằng dấu ngoặc/type ở file SVG khá dài này.
