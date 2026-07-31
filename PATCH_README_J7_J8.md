# Patch: Module J7 + J8 (MAJOR_REDESIGN_BRIEF.md) — lời chào cá nhân hoá + FAB "Ghi nhận"

## Cách áp dụng
Giải nén đè thư mục `3107/` lên thư mục dự án gốc. Không cần chạy SQL nào,
không cần cài thêm package.

## File thay đổi

### J7 — `src/app/page.tsx`
Thêm dòng chào theo giờ trong ngày + tên người dùng ở đầu trang chủ, theo
`ref-01-cycle-bar-history.png` ("Hi, Good Morning Victoria"). Dùng
`profile.display_name` đã có sẵn qua `useProfile()` — không thêm gì mới. Chỉ
hiện khi đã có tên (tránh chào trống tên lúc chưa hoàn tất onboarding).

### J8 — `src/components/layout/BottomNav.tsx`
Đổi "Ghi nhận" từ 1 mục ngang hàng trong thanh nav sang 1 nút tròn NỔI (FAB),
lớn hơn (56px), đè lên mép trên thanh nav — giống thanh nav dưới trong
`ref-01-cycle-bar-history.png` và màn 2 của
`ref-06-radial-dial-mascot-mockup.webp`. 2 mục còn lại chia đều 2 bên (Tổng
quan/Chu kỳ bên trái, Cá nhân bên phải), nhường khoảng trống giữa cho FAB.
Icon đổi từ `PlusCircle` sang `Plus` trơn bên trong khối tròn màu `--c-period`
viền `--surface` (tạo cảm giác nổi lên khỏi nền kính).

## Đã kiểm tra
`tsc --noEmit` + `eslint` trên 2 file đã sửa: sạch, không lỗi.
