# Patch: Module A3 (một phần) — toast thành công cho các luồng lưu còn thiếu

## Yêu cầu trước khi áp dụng
Patch này CẦN patch trước đó (`module_A1_A2_toast_feedback.zip`) đã được áp dụng
— dùng `useToast()` từ `src/components/ui/Toast.tsx` đã tạo ở patch đó.

## Cách áp dụng
Giải nén đè thư mục `2707/` lên thư mục dự án gốc. Không cần chạy SQL nào.

## File thay đổi
- `src/components/profile/EditProfileModal.tsx`, `src/app/profile/page.tsx`,
  `src/app/upgrade/page.tsx`, `src/app/onboarding/page.tsx`: thêm toast thành
  công cho các luồng lưu trước đây thiếu.
- `src/app/settings/page.tsx`: thêm toast + **vá 1 bug ẩn** — bấm "Xác nhận" khi
  đặt mã PIN mà lưu lỗi thì nút bị kẹt spinner vĩnh viễn (thiếu try/finally).
  Đổi phần "Xuất dữ liệu" từ text lỗi cục bộ sang toast.

## Đã kiểm tra
`tsc --noEmit` + `eslint` trên các file đã sửa: không lỗi.

Chi tiết quyết định thiết kế (vd vì sao KHÔNG thêm toast cho switch/toggle) xem
`QUALITY_UX_ROADMAP.md`, nhật ký ngày 2026-07-28 (entry thứ 2).
