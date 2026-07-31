# Patch: Cycle Wheel — phát triển thêm theo 2 mẫu tham khảo

## Cách áp dụng
Giải nén đè file bên dưới lên gốc dự án (ghi đè, chỉ 1 file):
- `src/components/cycle/CycleRadialDial.tsx`

Không cần sửa nơi gọi (`src/app/cycle/page.tsx`) — props giữ nguyên.

## Đã tham khảo gì từ 2 ảnh mẫu
- **Ảnh 1** (kiểu Flo): vòng số ngày cong quanh viền (18, 19, 20...), mỗi
  số tự xoay theo hướng kinh tuyến tại vị trí của nó.
- **Ảnh 2** (gradient tím-hồng): cảm giác "liền mạch" của cả vòng tròn,
  chấm đánh dấu viền trắng dày + lõi màu đặc bên trong, minh hoạ trang trí
  mờ ở giữa.

## Những gì thêm/đổi so với bản trước (J10)
1. **Số ngày quanh viền** (mới): cứ mỗi 5 ngày hiện 1 số (1, 5, 10, 15...),
   tự xoay theo bán kính tại vị trí — không dùng chữ cong trên path (vì đây
   chỉ là số 1–2 ký tự nên không gặp lỗi "văng chữ" từng có với chuỗi dài).
   Các ngày còn lại chỉ còn 1 vạch rất mảnh, rất mờ (opacity 14%) thay vì
   vạch dày như trước — đỡ rối mắt hơn khi đã có số.
2. **Vòng nền đổi màu**: từ xám trung tính sang màu pha trộn (`color-mix`)
   giữa `periodColor` và `fertileColor`, mờ 10% — cả vòng tròn nhìn liền
   mạch, cùng "họ màu" với 2 cung chính, giống tinh thần ảnh 2, thay vì
   nhìn như 2 đoạn màu rời rạc trên nền xám không ăn nhập.
3. **Chấm "Hôm nay" đổi kiểu**: viền trắng dày (4px) + lõi màu đặc bên
   trong (dùng màu tím `fertileColor` làm màu nhận diện cố định, không đổi
   theo pha) — giống hệt phong cách chấm tròn viền trắng ở ảnh 2, thay vì
   chấm đặc một màu như bản trước. Vẫn giữ vòng sáng lan toả (pulse) và vẫn
   là phần tử duy nhất di chuyển theo `currentDay`.
4. **Thêm hoạ tiết hoa/cánh hoa trang trí rất mờ (opacity 14%)** phía sau
   nội dung giữa — lấy cảm hứng từ minh hoạ tử cung ở ảnh 2, nhưng đơn
   giản hoá thành hình học trừu tượng (không vẽ icon giải phẫu chi tiết)
   để giữ phong cách gọn, trung tính, không phụ thuộc 1 bộ icon cụ thể.

## Vẫn giữ nguyên (đã ổn định, không sửa lại)
- Nhãn pha ("Kỳ kinh"/"Cửa sổ thụ thai") vẫn là chip HTML phẳng đặt cạnh
  cung — kỹ thuật này đã ổn định từ bản J10, không quay lại chữ cong SVG.
- 2 cung màu vẫn là vị trí CỐ ĐỊNH theo ngày chu kỳ, không phải % hoàn
  thành; chỉ chấm "Hôm nay" di chuyển.
- Màu cung vẫn nhận qua props `periodColor`/`fertileColor` để giữ nhất
  quán theme sáng/tối có sẵn.

## Lưu ý
Chưa chạy được `npm run build` trong môi trường patch (không có
`node_modules`) — nên chạy `npm run build`/`tsc --noEmit` sau khi áp,
đặc biệt để soát lại phần số ngày mới thêm.
