
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

- **2026-07-30 — Fix build: khôi phục `components/ui/BlobIcon.tsx`**: Build
  trên Render fail vì "Module not found: Can't resolve './BlobIcon'" /
  '@/components/ui/BlobIcon' — file này được `MetricCard.tsx`,
  `app/log/page.tsx`, `app/profile/page.tsx` import (module F1,
  `VISUAL_POLISH_ROADMAP.md`) nhưng chưa từng nằm trong patch nào đã gửi
  trước đó, không liên quan tới patch J1. Đã dựng lại đúng API các nơi đang
  gọi (`icon`, `bg`, `fg`, `size`, `active` — badge dạng blob hữu cơ SVG
  thay khối tròn phẳng). `tsc --noEmit` + `eslint` sạch; `next build` chạy
  qua bước resolve module (lỗi còn lại trong sandbox chỉ do không tải được
  Google Fonts — không phải lỗi code, sẽ ổn trên Render có mạng thật).
  Patch: `patch_fix_blobicon.zip`.

- **2026-07-30 — J2 (vòng tròn chu kỳ dạng "đồng hồ có nhãn cung")**: Đã xem
  kỹ màn 1 của `ref-06-radial-dial-mascot-mockup.webp` (phóng to riêng màn
  1) trước khi code — chi tiết phức tạp nhất trong brief, mô tả chữ không đủ
  nên không đoán qua bản tóm tắt. Đọc `AuroraRing.tsx` và mọi nơi đang dùng
  nó (`KegelTimer.tsx`, `app/page.tsx`, `app/cycle/page.tsx`) trước khi sửa
  — xác nhận chỉ khối chính trang Chu kỳ cần đổi, 2 nơi còn lại là progress
  đơn giản (thời gian tập, điểm sức khoẻ) không có khái niệm "giai đoạn theo
  cung" nên GIỮ NGUYÊN `AuroraRing` ở đó, không đổi hàng loạt.
  - Tạo mới `components/cycle/CycleRadialDial.tsx`: vòng vạch chia nhỏ kiểu
    mặt đồng hồ (60 vạch, vạch lớn mỗi 5 vạch) quanh viền ngoài; 2 cung màu
    vẽ chồng lên viền (Hành kinh: ngày 1→`avgPeriodLength`; Cửa sổ thụ thai:
    suy từ `ovulationDay = avgCycleLength - 14`, giống công thức đã có sẵn
    trong `predictCycle()` — không thêm logic tính toán mới, chỉ tái dùng
    công thức cũ để suy ra góc); mỗi cung có nhãn chữ CONG theo cung bằng
    SVG `<textPath>` (`HÀNH KINH` / `CỬA SỔ THỤ THAI`). Vòng progress trơn
    (ngày hiện tại/tổng chu kỳ) giữ lại phía trong, thu nhỏ để nhường chỗ
    cho vòng vạch chia + cung màu bên ngoài — không mất thông tin cũ, chỉ
    thêm lớp trực quan mới bên ngoài.
  - Gắn thay `AuroraRing` trong khối chính `app/cycle/page.tsx`; xoá biến
    `ringPercent` không còn dùng.
  - `tsc --noEmit` sạch hoàn toàn (không còn cả lỗi BlobIcon cũ). `eslint`
    sạch trên 2 file sửa.
  - Lưu ý: chưa dùng `PhaseMotif.tsx` làm hoạ tiết nền phía sau vòng như
    brief gợi ý tận dụng — `PhaseMotif` đã có sẵn ở section này từ module H1
    (`VISUAL_POLISH_ROADMAP.md`, đặt `-right-8 -top-10` phía sau nội dung),
    2 việc bổ trợ nhau nên GIỮ NGUYÊN, không cần sửa thêm.
  - Patch: `patch_J2_radial_dial.zip`.

- **2026-07-30 — Fix J2 (vòng tròn đồng hồ hiển thị sai trên máy thật)**:
  Chủ dự án gửi ảnh chụp thực tế cho thấy 2 lỗi rõ so với ảnh tham khảo:
  (1) vạch chia chỉ hiện 2 cụm nhỏ sát 2 cung màu, phần còn lại của vòng
  trống trơn thay vì đủ 360°; (2) nhãn chữ cong "HÀNH KINH"/"CỬA SỔ THỤ
  THAI" không hiện ra chút nào. Đã so ảnh chụp thực tế (phóng to) với ảnh
  tham khảo gốc để xác định đúng 2 lỗi trước khi sửa, không đoán.
  - Nguyên nhân (1): `strokeOpacity` vạch chia đặt quá thấp (0.07/0.14) —
    trên nền card gần trắng gần như vô hình, chỉ "ăn theo" độ tương phản từ
    2 cung màu đậm gần đó tạo ảo giác chỉ có 2 cụm. Tăng lên 0.2/0.4 (major
    dày + đậm hơn) để luôn thấy rõ toàn vòng, không phụ thuộc vị trí.
  - Nguyên nhân (2): `<textPath href="#id">` — nhiều WebView di động chỉ
    nhận `xlink:href`. Thêm `xlinkHref` song song `href`.
  - Nhân tiện: tách riêng path dùng để TÔ MÀU cung (giữ nguyên hướng cũ) và
    path dùng cho TEXTPATH (tự đảo hướng nếu trung điểm cung rơi vào nửa
    dưới vòng tròn, tránh chữ đọc lộn ngược khi cửa sổ thụ thai rơi vào nửa
    sau của chu kỳ dài). Đổi id cung từ hằng số cố định sang `useId()` để an
    toàn nếu sau này có nơi khác render nhiều dial cùng lúc.
  - `tsc --noEmit` + `eslint` sạch.
  - Patch: `patch_J2_fix_dial_rendering.zip`.

- **2026-07-31 — J7 + J8 (lời chào cá nhân hoá + FAB "Ghi nhận")**: Đã xem
  góc trên `ref-01-cycle-bar-history.png` (lời chào) và thanh nav dưới của
  ảnh 01 + màn 2 của `ref-06-radial-dial-mascot-mockup.webp` (FAB) trước khi
  code. Đọc `app/page.tsx` (chưa có lời chào nào, vào thẳng card chu kỳ) và
  `BottomNav.tsx` (4 mục ngang hàng, "Ghi nhận" dùng `PlusCircle` không nổi
  bật hơn các mục khác) — đúng như brief mô tả.
  - `app/page.tsx`: thêm dòng chào theo giờ trong ngày (sáng/trưa/chiều/tối)
    + `profile.display_name` (đã có sẵn qua `useProfile()`, không thêm gì
    mới) ở đầu trang, trước card "Chu kỳ hôm nay". Ẩn nếu chưa có tên.
  - `BottomNav.tsx`: tách `items` thành `leftItems` (Tổng quan, Chu kỳ) +
    `rightItems` (Cá nhân), "Ghi nhận" tách riêng thành 1 `Link` tuyệt đối
    `absolute left-1/2 -top-5`, khối tròn 56px màu `--c-period` viền 3px
    `--surface` đè lên mép trên thanh nav — không còn là 1 trong 4 mục ngang
    hàng như cũ.
  - `tsc --noEmit` + `eslint` sạch trên 2 file đã sửa.
  - Patch: `patch_J7_J8_greeting_fab.zip`.
