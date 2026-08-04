
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

- **2026-07-31 — J3 (một phần: lịch dải liền mạch)**: Đã xem
  `ref-02-calendar-stacked-months.png` và cắt riêng màn 2 của
  `ref-06-radial-dial-mascot-mockup.webp` để phóng to trước khi code. Đọc lại
  `CycleCalendar.tsx` — xác nhận đúng như brief: mỗi ngày đang tô 1 hình tròn
  rời rạc (`h-8 w-8 rounded-full`), lưới `grid-cols-7` với `gap-y-2` (không
  có gap ngang nên các cột vốn đã sát nhau, thuận lợi để dựng dải liền mạch
  không hở).
  - Đổi cấu trúc render từ 1 lưới 7 cột phẳng sang render THEO HÀNG
    (`buildRows()`) — mỗi hàng tính lại `isRunStart`/`isRunEnd` cho từng ô
    dựa vào ô liền trước/sau CÙNG HÀNG (so `type`, không so qua hàng khác).
    Dải nền là 1 `div` tuyệt đối phủ hết chiều rộng ô, bo góc CHỈ ở
    `borderTopLeftRadius`/`borderBottomLeftRadius` (nếu là đầu dải) hoặc
    `borderTopRightRadius`/`borderBottomRightRadius` (nếu là cuối dải) —
    dùng style trực tiếp thay vì class Tailwind `rounded-l-full` vì cần bật
    tắt độc lập 4 góc theo từng ô, không có sẵn utility class ứng với đúng
    tổ hợp này.
  - Số ngày vẫn hiện trong 1 vòng nhỏ `h-6 w-6` không nền, đè lên dải (`z-10`)
    — giữ được cách đánh dấu "hôm nay" cũ (outline quanh số) mà không xung
    đột thị giác với màu dải bên dưới.
  - CHƯA làm phần "cuộn dọc nhiều tháng" — brief cho phép tách riêng vì rủi
    ro UX cao hơn hẳn phần tô màu, giữ nguyên điều hướng "1 tháng + nút </>".
  - `tsc --noEmit` + `eslint` sạch trên file đã sửa.
  - Patch: `patch_J3_seamless_calendar_band.zip`.

- **2026-07-31 — Fix lệch thanh nav sau J8 + thiết kế lại vòng tròn chu kỳ
  (theo ảnh Moontide chủ dự án gửi)**: Chủ dự án phản hồi 2 việc: (1) thanh
  nav bị lệch sau khi đưa "Ghi nhận" lên FAB (do trước 4 mục giờ còn 3); (2)
  muốn vòng tròn chu kỳ đổi sang kiểu ảnh Moontide (vòng số ngày đầy đủ +
  khối tròn tối giữa) thay vì kiểu J2 cũ. Đã crop phóng to vùng nav và vùng
  vòng tròn trong ảnh Moontide để soi kỹ trước khi code, không đoán qua mô
  tả chữ.
  - Nguyên nhân lệch nav: 3 mục phẳng còn lại chia 2 trái/1 phải — dù mỗi ô
    `flex-1` bằng nhau về độ rộng, tổng ô 2 bên lệch (2 vs 1) khiến điểm
    giữa thật của thanh (FAB neo `left-1/2`) rơi lệch khỏi ô đệm giữa. Ảnh
    Moontide xác nhận bố cục đúng là 2+2. Sửa: thêm "Thư viện" (dùng lại
    `app/library/page.tsx` có sẵn, trước chỉ vào qua menu trang Cá nhân) làm
    mục thứ 4, khôi phục đúng 2+2.
  - `CycleRadialDial.tsx`: viết lại — vòng SỐ NGÀY đầy đủ (không chỉ mỗi 5
    ngày), số tô đậm màu theo pha (hành kinh/cửa sổ thụ thai) thay cho 2
    cung màu gradient tô nền cũ; ngày hiện tại có badge nền tròn. Khối giữa
    đổi từ thẻ trắng sang khối tròn tối màu (tự pha từ `--c-period`/
    `--c-fertile`, không dùng xanh navy như ảnh mẫu) + hoạ tiết sóng mờ
    NGUYÊN BẢN (không sao chép hình vẽ trăng lưỡi liềm cụ thể — tuân thủ
    ràng buộc bản quyền mục 3). Bỏ 2 chip nhãn nổi ngoài viền (đã trùng
    thông tin với 2 thẻ bên dưới vòng).
  - `app/cycle/page.tsx`: đổi màu chữ bên trong vòng (`children` truyền vào
    `CycleRadialDial`) từ tông tối `--ink` sang trắng/trắng-mờ cho khớp nền
    tối mới của khối giữa.
  - Đã dựng thử vòng số bằng script Python độc lập để kiểm tra khoảng cách
    trước khi đóng gói — không tràn/chồng chữ ở 28 ngày (giá trị mặc định).
  - `tsc --noEmit` + `eslint` sạch trên 3 file đã sửa.
  - Patch: `patch_fix_nav_and_dial_redesign.zip`.

- **2026-08-04 — J3 (phần còn lại: cuộn dọc nhiều tháng)**: Hoàn thiện nốt
  phần đã tách riêng ở module J3 trước (dải liền mạch xong, phần cuộn nhiều
  tháng để sau vì rủi ro UX cao hơn — nay làm, sau khi chủ dự án xác nhận
  tiếp tục dù không còn ảnh `ref-02-calendar-stacked-months.png` gốc trong
  lần làm việc này, nên tự thiết kế theo mô tả đã ghi lại ở log J3 cũ: danh
  sách nhiều tháng xếp chồng dọc, có thể cuộn).
  - Viết lại `CycleCalendar.tsx`: đổi từ "1 tháng hiện tại + nút `</>` chuyển
    tháng" sang danh sách nhiều khối tháng (`MonthBlock`, tách bằng
    `forwardRef` để bắt `ref` tới khối tháng hiện tại) XẾP CHỒNG DỌC trong 1
    khung cuộn RIÊNG (`max-h-[420px] overflow-y-auto`) — cố tình KHÔNG cuộn
    cả trang, để lịch dài nhiều tháng không đẩy tuột thanh nav dưới/nội dung
    khác của trang Chu kỳ ra khỏi tầm nhìn.
  - Mặc định nạp 3 tháng (trước — hiện tại — sau), có nút "Xem tháng trước"/
    "Xem tháng sau" ở 2 đầu danh sách để nạp thêm theo cụm 3 tháng. Cân nhắc
    dùng `IntersectionObserver` để tự cuộn vô hạn nhưng CHỌN nút bấm thay vì
    tự động — giữ ổn định vị trí cuộn khi thêm tháng CŨ hơn vào ĐẦU danh sách
    (nếu tự động nạp lúc cuộn lên đầu, phải tự bù `scrollTop` để tránh giật
    hình, rủi ro bug cao hơn nhiều so với lợi ích UX ở bản đầu tiên).
  - Thêm nút "Hôm nay" ở góc phải header, dùng `scrollIntoView` trên ref của
    khối tháng hiện tại (offset 0) để nhảy nhanh về giữa danh sách dài — bù
    lại việc bỏ nút mũi tên chuyển tháng đơn lẻ cũ.
  - `loggedPeriodDays` (phụ thuộc `cycleLogs`) hoist lên component cha, tính
    1 lần dùng chung cho mọi khối tháng — mỗi `MonthBlock` chỉ tự tính
    `days`/`rows` của riêng tháng đó qua `useMemo` theo `cursor`, tránh tính
    lại toàn bộ danh sách tháng mỗi khi 1 tháng đổi.
  - Giữ nguyên 100% logic tô màu dải liền mạch (`buildRows`, bo góc đầu/cuối
    dải) đã làm ở phần J3 trước — không đổi lại, chỉ đổi cấu trúc bố cục
    nhiều tháng bên ngoài.
  - `tsc --noEmit` + `eslint` sạch trên file đã sửa.
  - Lưu ý cho agent sau: không có `ref-02-calendar-stacked-months.png` trong
    lần làm này để đối chiếu pixel-perfect — bố cục dựng theo mô tả text đã
    ghi ở log J3 cũ (dòng 105-127 phía trên). Nếu chủ dự án gửi lại ảnh và
    thấy lệch, ưu tiên sửa theo ảnh.
  - Patch: `patch_J3_stacked_months_scroll.zip`.
