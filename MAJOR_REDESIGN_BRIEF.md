
- **2026-07-30 — J1 (biểu đồ lịch sử chu kỳ dạng cột)**: Đã xem kỹ
  `ref-01-cycle-bar-history.png` và `ref-04-reports-bar-history.png` trước
  khi code. Đọc lại `app/cycle/page.tsx` (khối "Lịch sử gần đây" là danh sách
  chữ phẳng, đúng như brief mô tả) và `app/profile/report/page.tsx` (khối
  "Lịch sử chu kỳ gần đây" là 1 BẢNG số liệu, chưa có bar-chart concept như
  brief phỏng đoán — đã kiểm tra code trước khi kết luận).
  - Tạo mới `components/cycle/CycleBarHistory.tsx` — cột theo kỳ kinh gần
    đây (tối đa 6, mới nhất bên phải), chiều cao theo `periodLength` (tái
    dùng `buildCycleHistory()` có sẵn, không thêm API/tính toán mới). Cột
    hiện tại tô đặc màu accent + nhãn bubble nổi phía trên ("Nd"); cột cũ
    dùng hoạ tiết chấm bi mờ (radial-gradient lặp lại — SVG `<pattern>`
    không áp dụng được cho `background` CSS của `div` nên đổi cách dựng hoạ
    tiết, không phải chỉ giảm opacity). Nhận `accentColor` qua prop để đổi
    theo màu chủ đề (hiện dùng `var(--c-period)` ở cả 2 nơi dùng — trang
    Báo cáo chưa có màn hình riêng cho Fertility nên chưa cần đổi tông cam).
  - Gắn vào `app/cycle/page.tsx`: thêm section biểu đồ MỚI phía trên danh
    sách chi tiết cũ (giữ nguyên danh sách để vẫn bấm sửa từng kỳ được — chỉ
    BỔ SUNG trực quan, không xoá chức năng).
  - Gắn vào `app/profile/report/page.tsx`: chèn biểu đồ vào đầu card "Lịch
    sử chu kỳ gần đây", trước bảng số liệu chi tiết (giữ bảng cho mục đích
    in/PDF cần số liệu chính xác).
  - `tsc --noEmit`: sạch cho toàn bộ thay đổi (3 lỗi còn lại thuộc
    `components/ui/BlobIcon.tsx` thiếu file — có sẵn từ trước, không liên
    quan patch này). `eslint` sạch trên 3 file đã sửa.
  - Patch: `patch_J1_bar_history.zip`.
