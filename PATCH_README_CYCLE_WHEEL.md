# Patch: Cycle Wheel — xây lại từ đầu, phong cách hiện đại hơn

## Cách áp dụng
Giải nén đè file bên dưới lên gốc dự án (ghi đè, chỉ 1 file):
- `src/components/cycle/CycleRadialDial.tsx`

Không cần sửa nơi gọi (`src/app/cycle/page.tsx`) — props giữ nguyên
(`size`, `avgCycleLength`, `avgPeriodLength`, `currentDay`, `periodColor`,
`fertileColor`, `children`).

## Đây là bản viết lại hoàn toàn (không phải vá tiếp bản cũ)
Sau 2 lần vá vẫn còn lỗi thị giác, lần này bỏ hẳn cách tiếp cận cũ (nhiều
lớp SVG chồng nhau + chữ cong trên path) và dựng lại theo hướng khác hẳn:

- **Bỏ hoàn toàn chữ cong (`<textPath>`)** — nguồn gốc lỗi "chữ văng chéo
  ra khỏi cung" ở 2 lần vá trước. Nhãn "Kỳ kinh" / "Cửa sổ thụ thai" giờ
  là **chip HTML phẳng** đặt ngay cạnh mép cung, luôn đứng thẳng, tự đổi
  hướng neo (trái/phải/giữa) theo vị trí quanh vòng tròn — không thể bị
  méo hay tràn ra ngoài trên bất kỳ trình duyệt nào.
- **Bỏ hoạ tiết gạch chéo (hatch pattern)** kiểu cũ, trông hơi cũ kỹ —
  thay bằng 1 quầng sáng mờ (blurred aura) phía sau + vòng nền phẳng đơn
  sắc, tạo chiều sâu kiểu "soft glow" đang phổ biến ở các app sức khoẻ
  hiện đại (Oura, Whoop, Apple Health...).
- **Cung màu dùng gradient** (đậm → nhạt) thay vì màu phẳng đơn, kèm 1 lớp
  glow cùng màu mờ phía dưới — nhìn nổi khối, cao cấp hơn hẳn dải màu
  phẳng cũ.
- **Chấm "Hôm nay"** đổi từ huy hiệu tròn + icon check sang 1 **chấm tròn
  tối giản có vòng sáng lan toả (pulse animation)** quanh nó — vẫn di
  chuyển đúng theo `currentDay` như yêu cầu spec ban đầu, nhưng nhìn nhẹ
  nhàng, hiện đại hơn, không còn chi tiết thừa (mũi tên/dấu check).
- **Vòng tick ngày**: vẫn giữ đúng nguyên tắc "1 vạch = 1 ngày" nhưng làm
  siêu mảnh + siêu mờ (opacity 12%, chỉ vạch mỗi 5 ngày đậm hơn 1 chút) —
  tránh cảm giác "vòng răng cưa rối mắt" của các bản trước.
- **Vùng nội dung giữa**: bỏ hoạ tiết gạch chéo, chỉ còn 1 thẻ tròn nền
  `var(--surface)` với đổ bóng mềm rất nhẹ (soft shadow) — sạch, hiện đại,
  không cạnh tranh thị giác với số ngày/nút CTA bên trong.

## Vẫn giữ nguyên các nguyên tắc gốc từ spec
- 2 cung màu (Kỳ kinh/Cửa sổ thụ thai) vẫn là **vị trí cố định theo ngày
  chu kỳ**, không phải % hoàn thành — không animate như thanh tiến độ.
- Chỉ có chấm "Hôm nay" là phần tử di chuyển quanh vòng.
- Màu cung vẫn nhận qua props `periodColor`/`fertileColor` (đang truyền
  `var(--c-period)`/`var(--c-fertile)` từ trang gọi) để giữ nhất quán với
  theme sáng/tối có sẵn.

## Lưu ý kỹ thuật
- Dùng `color-mix(in srgb, ...)` cho gradient/glow — cùng cú pháp app đã
  dùng sẵn ở nơi khác trong `cycle/page.tsx`, không phải kỹ thuật mới.
- Animation pulse dùng CSS `@keyframes` nhúng trực tiếp trong component
  qua thẻ `<style>` — không cần thêm dependency nào.
- Chưa chạy được `npm run build` trong môi trường patch (không có
  `node_modules`) — nên chạy `npm run build`/`tsc --noEmit` sau khi áp.
