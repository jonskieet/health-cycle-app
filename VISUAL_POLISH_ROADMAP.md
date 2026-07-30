# KVCycle — Roadmap nâng cấp thị giác (Visual Craft & Professional Polish)

> Tài liệu này là **prompt/roadmap** cho agent tiếp theo (Claude Code hoặc
> chính Claude trong chat) triển khai — không phải bản triển khai. Viết theo
> đúng format/tinh thần của `QUALITY_UX_ROADMAP.md` (nhóm A-D đã xong phần
> lớn) để có thể giao thẳng cho 1 phiên làm việc mới, từng module 1, đóng gói
> patch zip nhỏ, cập nhật Nhật ký, y hệt quy trình cũ.

## 0. Bối cảnh xuất phát

Sau khi hoàn thành Nhóm A-D (chức năng, hiệu năng, UX cơ bản), chủ dự án gửi
**7 ảnh chụp màn hình thật** từ thiết bị (Tổng quan, Cá nhân, Ghi nhận, Chu kỳ,
Insight "Hôm nay bạn có thể mong đợi", Kiểm tra sức khoẻ, Lịch sử) và yêu cầu
1 roadmap riêng để nâng UI/UX "đẹp hơn, chuyên nghiệp hơn" — tức là bước tiếp
theo SAU khi đã đúng/đủ chức năng: từ "ổn, dùng được" lên "trông như sản phẩm
được 1 studio thiết kế chăm chút", đúng tinh thần bộ kỹ năng
`frontend-design`: có 1 điểm nhấn thị giác riêng (signature), hệ thống
type/color nhất quán có chủ đích, tránh cảm giác "template AI sinh ra" (card
bo góc + icon tròn pastel + shadow mờ đều là combo rất phổ biến, cần ít nhất
1-2 điểm khác biệt thật sự).

**Quan trọng**: nhóm D (đặc biệt D1, D2) đã làm 1 phần việc liên quan (contrast
màu, blob icon cho Kegel/Fatigue). Roadmap này KHÔNG lặp lại mà mở rộng ra
toàn app dựa trên ảnh thật, và có thêm 1 vài phát hiện là **bug thị giác thật**
(không chỉ "làm đẹp hơn") cần ưu tiên sửa trước.

## 1. Nhóm E — Bug thị giác cần sửa trước (ưu tiên cao nhất, có bằng chứng ảnh)

- [x] ~~E1. Bottom nav che nội dung ở trang Chu kỳ (`/cycle`)~~ — **Đã xác
  minh qua code, KHÔNG phải bug** (xem Nhật ký 2026-07-28): nav dùng kính mờ
  (`backdrop-filter`) có chủ đích, nội dung trượt qua dưới khi cuộn là đúng
  thiết kế; `pb-32` đủ dư so với chiều cao nav thật. Ảnh gốc chỉ là 1 khung
  hình giữa lúc đang cuộn, không phải trạng thái đứng yên bị lỗi. Giữ nguyên
  code, không sửa.
- [x] ~~E2. Vùng đầu trang Chu kỳ bị cắt/lấn~~ — **Cùng kết luận như E1**, cùng
  nguyên nhân (ảnh chụp giữa lúc cuộn khiến phần trên bị cuộn khuất lên trên,
  không phải lỗi safe-area). Không sửa.
- [x] **E3. Card lịch sử (`Lịch sử gần đây`) — thêm đường phân cách dòng** —
  **đính chính**: khối này vốn ĐÃ nằm trong `glass-card` (nhận định ban đầu
  "lệch hệ thống thiết kế" là chưa kiểm tra code kỹ, không đúng — xem Nhật ký).
  Vấn đề thật, đã sửa: các dòng trong danh sách không có gì phân tách (chỉ
  cách nhau `gap-1`), dễ dính liền khó đọc khi có nhiều mục — đã thêm
  `divide-y` mảnh (tông đen mờ, cùng họ với màu hover đã dùng sẵn) + tăng nhẹ
  padding dọc mỗi dòng.

## 2. Nhóm F — Hệ thống icon: thống nhất 1 ngôn ngữ hình khối duy nhất

- [x] **F1. Kiểm kê toàn bộ kiểu icon-badge đang tồn tại song song** — qua ảnh
  đếm được ít nhất **3 kiểu khác nhau** cùng lúc trong app: (1) hình tròn phẳng
  pastel (Stress, Nhịp tim, Giấc ngủ, Hydration, Tâm trạng ở Tổng quan; Chu kỳ/
  triệu chứng, Nhịp tim, Giấc ngủ... ở màn Ghi nhận); (2) "blob" bo góc bất đối
  xứng (đã áp dụng cho Kegel/Fatigue ở module D2); (3) hình vuông bo góc màu
  đặc (tím, xanh lá) cho 2 thẻ "Mức độ mệt mỏi"/"Chu kỳ không đều?" ở màn Kiểm
  tra sức khoẻ, VÀ cũng hình vuông bo góc nhưng NHẠT màu hơn cho "Trắc nghiệm
  năng lượng"/"Thư viện kiến thức"/"Lịch hẹn" ở màn Cá nhân. 3-4 kiểu cùng tồn
  tại khiến app trông rời rạc, thiếu bàn tay thiết kế thống nhất.
  - Việc cần làm: chọn ĐÚNG 1 kiểu hình khối làm chuẩn (khuyến nghị: mở rộng
    `BlobIcon` đã có sẵn từ D2 ra toàn app, vì nó là hình khối "riêng" nhất,
    tránh giống mọi app khác) và thay thế toàn bộ các icon-badge hình
    tròn/vuông còn lại. Đây là việc sửa nhiều file nhưng mỗi chỗ đổi rất nhỏ
    (đổi `<span className="rounded-full">...</span>` → `<BlobIcon />`) — có
    thể làm tuần tự theo từng trang, đóng gói patch riêng từng trang để dễ
    review, không cần gộp 1 patch khổng lồ.
- [ ] **F2. Thẻ "Vận động"/"Năng suất" (insight cards) đang dùng ngôn ngữ hoàn
  toàn khác phần còn lại của app** — nền gradient đặc (xanh ngọc→lam, và đen
  than), chữ trắng, nhãn viết hoa toàn bộ trong khung bo tròn nhỏ — trong khi
  99% phần còn lại của app là card nền trắng/kính mờ, chữ tối màu `--ink`. Về
  nguyên tắc đây CÓ THỂ là điểm nhấn thị giác có chủ đích (signature element,
  đúng tinh thần frontend-design: "spend your boldness in one place") — nhưng
  hiện chưa nhất quán về mặt hệ thống màu (2 card cạnh nhau dùng 2 gradient
  hoàn toàn không liên quan nhau: 1 xanh ngọc, 1 đen). Cần: (a) quyết định đây
  có phải "signature" muốn giữ không; (b) nếu giữ, xây 1 bộ 3-4 gradient trong
  cùng 1 họ màu (biến thể của `--aurora-*`/tím-hồng đã có) thay vì 2 màu bất kỳ
  không ăn nhập; (c) áp dụng nhất quán cho MỌI insight card tương lai, không
  chỉ 2 cái hiện có.

## 3. Nhóm G — Chiều sâu & phân lớp thị giác (elevation, không phẳng)

- [ ] **G1. Card hiện tại gần như không có độ sâu** — `glass-card` dùng bóng đổ
  rất mờ/nhạt (`box-shadow` nhẹ), khiến toàn bộ giao diện phẳng, các card khó
  phân biệt với nền (đặc biệt rõ ở màn Ghi nhận: 8 card trắng trên nền hồng
  nhạt gần như hoà vào nhau, không có cảm giác "nổi lên"). Xây lại thang độ
  sâu có chủ đích: card thường (elevation thấp), card nhấn mạnh/nổi bật như
  Health Score (elevation cao hơn, đã có `glass-card-strong` — kiểm tra xem có
  đang dùng đúng chỗ và có tạo được khác biệt rõ so với card thường không).
- [ ] **G2. Biểu đồ mini (sparkline) trong metric card gần như không đọc được**
  — ảnh cho thấy các cột/đường mini-chart bên phải mỗi card (Stress, Nhịp
  tim...) rất nhỏ và mờ nhạt, khó nhận ra là biểu đồ nếu không nhìn kỹ — hiện
  chủ yếu mang tính trang trí hơn là truyền tải thông tin thật (xu hướng 7
  ngày). Cân nhắc: tăng độ tương phản màu cột/đường so với nền, hoặc bỏ hẳn
  nếu không có ý định làm nó thực sự hữu ích (tốt hơn là bỏ trang trí vô nghĩa
  còn hơn giữ thứ nhìn không rõ).

## 4. Nhóm H — Tìm 1 "signature" thật cho app (đang thiếu)

- [ ] **H1. Hiện tại app dùng đúng công thức phổ biến của app sức khoẻ AI-gen**
  — nền gradient pastel nhạt, card trắng bo góc lớn, icon tròn pastel, số to
  đậm + nhãn nhỏ xám — đây là "câu trả lời mặc định" (đúng như cảnh báo trong
  bộ kỹ năng `frontend-design`), không sai nhưng cũng không có gì khiến người
  dùng nhớ/nhận ra ngay đây là KVCycle chứ không phải 1 trong hàng chục app
  theo dõi chu kỳ khác trên store. Đề xuất chọn ĐÚNG 1 điểm để đầu tư đậm (giữ
  mọi thứ khác im lặng, kỷ luật xung quanh nó — nguyên tắc "spend your
  boldness in one place"), ví dụ 1 trong các hướng:
  - **AuroraRing** (Health Score ring) làm điểm nhấn — hiện đã có gradient
    tím-hồng riêng biệt, khá gần với "signature" rồi — có thể đầu tư thêm
    animation khi số thay đổi, hoặc hoạ tiết/glow đặc trưng quanh ring để nó
    thực sự là "the one memorable thing" thay vì 1 progress ring thông thường.
  - Hoặc 1 hoạ tiết/minh hoạ (không phải icon lucide-react đơn thuần) xuất
    hiện xuyên suốt gắn với từng giai đoạn chu kỳ (nang trứng/rụng trứng/hoàng
    thể/hành kinh) — hiện các giai đoạn chỉ phân biệt bằng 1 chữ màu khác nhau
    ("Giai đoạn nang trứng" màu xanh lá) — có thể mỗi giai đoạn có 1 dải màu +
    hoạ tiết nền riêng dễ nhận diện hơn.
  - Việc này cần bàn với chủ dự án trước khi code (chọn hướng, xem ảnh mẫu) —
    không nên tự quyết rồi build ngay vì đây là quyết định thẩm hoàn toàn chủ
    quan, khác các module kỹ thuật khác trong roadmap cũ.

## 5. Nhóm I — Chi tiết còn lại (làm sau cùng, sau khi E-H ổn)

- [ ] **I1. Đồng bộ khoảng cách (spacing) giữa card cùng cấp** — rà lại
  khoảng cách dọc giữa các card trên từng trang có nhất quán 1 giá trị (hiện
  có vẻ ổn nhưng cần đo bằng công cụ, không đoán bằng mắt).
  Nối tiếp phần scale chữ còn dang dở của **D1** (roadmap cũ) — cả 2 việc đều
  cần 1 bộ token spacing/type scale rõ ràng, nên gộp làm cùng lúc để đỡ phải
  quay lại 2 lần.
- [ ] **I2. Trạng thái "hover/pressed" nút gợi ý câu hỏi AI** — chip "Đây có
  phải thời điểm tốt để tập luyện cường độ cao?" bị cắt cụt ở rìa phải màn
  hình không rõ có phải khối cuộn ngang hay không — nếu là scroll ngang, cần
  1 dấu hiệu thị giác nhỏ (fade cạnh, hoặc hé lộ 1 phần chip tiếp theo) để
  người dùng biết còn thêm câu hỏi gợi ý bên phải, tránh tưởng nhầm là hết.

## 6. Thứ tự triển khai đề xuất

1. **E1-E3** (bug thị giác, ảnh hưởng dùng thật) — làm trước tiên, không cần
   hỏi ý kiến, đúng-sai rõ ràng như các module kỹ thuật ở roadmap cũ.
2. **F1-F2** (thống nhất icon) — khối lượng vừa, rõ ràng, có thể tự quyết
   (khuyến nghị dùng `BlobIcon` sẵn có) rồi làm, không cần chờ xác nhận.
3. **G1-G2** — vừa phải, có thể tự quyết dựa trên nguyên tắc elevation chuẩn.
4. **H1** — BẮT BUỘC bàn với chủ dự án trước, đây là quyết định định hướng
   thương hiệu, không phải lỗi kỹ thuật để agent tự sửa.
5. **I1-I2** — làm sau cùng, ít ảnh hưởng nhất.

## Nhật ký triển khai

*(Agent thực hiện module nào thì bổ sung 1 mục vào đây theo đúng format đã
dùng ở `QUALITY_UX_ROADMAP.md` — ngày thực hiện, module nào, làm gì, vì sao,
đã kiểm tra `tsc`/`eslint` chưa, tên file zip patch gửi cho chủ dự án.)*

- **2026-07-28** — **Bug thị giác phát sinh thêm (chủ dự án gửi ảnh, chưa nằm
  trong danh sách E1-E3 gốc)**: biểu đồ cột mini (sparkline) trong metric card
  ở màn Tổng quan bị tràn ra ngoài card, đè lên nền phía sau — xảy ra ở lưới
  2 cột trên điện thoại (card hẹp).
  - **Nguyên nhân**: `MiniBars.tsx` dùng bề rộng cột CỐ ĐỊNH bằng px
    (`w-1.5` = 6px x 7 cột + `gap-1.5` = 6px x 6 khoảng cách ≈ 78px tối
    thiểu, không co giãn được); đồng thời `MetricCard.tsx` xếp value+status và
    MiniBars CHUNG 1 hàng `justify-between`, tranh chỗ nhau — với card ~118px
    bề ngang khả dụng (2 cột trên khung máy trong ảnh), tổng 2 khối vượt quá
    → tràn.
  - **Đã sửa**: (1) `MiniBars.tsx` — bỏ hoàn toàn bề rộng cố định, mỗi cột
    dùng `flex-1` + `w-full max-w-[6px]`, tổng bề rộng LUÔN khớp đúng
    container cha bất kể hẹp cỡ nào; (2) `MetricCard.tsx` — tách MiniBars
    xuống hàng riêng, full-width, thay vì chen cạnh value/status — loại bỏ
    hoàn toàn việc tranh chỗ giữa 2 khối, không chỉ vá triệu chứng mà sửa tận
    gốc nguyên nhân (layout cạnh tranh không gian).
  - Đã chạy `tsc --noEmit` + `eslint src/` toàn repo — sạch.
  - Người thực hiện: Claude. File package gửi cho user:
    `module_E_sparkline_overflow.zip` (2 file: `components/ui/MiniBars.tsx`,
    `components/ui/MetricCard.tsx`).
- **2026-07-28** — **Đính chính E1/E2 gốc + fix nhỏ tiếp theo do chủ dự án
  phát hiện qua ảnh**.
  - **Đính chính quan trọng**: sau khi đọc lại code (không chỉ nhìn ảnh tĩnh),
    xác nhận **E1 (nav che nội dung trang Chu kỳ)** và **E2 (header bị cắt ở
    đầu trang)** trong bản roadmap gốc ở mục 1 phía trên là **CHẨN ĐOÁN SAI**
    — không phải bug. Nav dưới dùng `.glass-card-strong`
    (`backdrop-filter: blur(24px)` + nền bán trong suốt) — kính mờ có chủ đích
    kiểu iOS, nội dung trượt qua dưới nav khi cuộn là ĐÚNG thiết kế. `pb-32`
    (128px) đủ dư so với chiều cao thật của nav (~72px kể cả safe-area) nên
    không có tình trạng bị kẹt vĩnh viễn. Ảnh gốc chỉ là 1 khung hình giữa lúc
    đang cuộn (xác nhận qua ảnh 5-7 cuộn xa hơn, mọi nội dung hiển thị đủ,
    không bị che). **Không sửa gì cho E1/E2 — giữ nguyên code hiện tại.** Agent
    sau đọc thấy E1/E2 còn `[ ]` trong mục 1 thì hiểu là đã xác minh KHÔNG cần
    làm, không phải bỏ sót.
  - **Fix nhỏ theo ảnh mới của chủ dự án** (không thuộc E-I gốc, phát sinh khi
    QA lại fix sparkline overflow trước đó): header mỗi `MetricCard` ở Tổng
    quan có nhãn "Hôm nay" bị LẶP LẠI 2 lần — 1 lần ở góc phải header (dính
    sát tên hoạt động vì hàng header quá hẹp, đặc biệt tên dài như "Nhịp tim"
    bị xuống dòng ngay chỗ đó), 1 lần ở dưới cạnh giá trị (biến `status`,
    "Hôm nay" hoặc "Chưa ghi nhận"). Đã xoá nhãn thừa ở header, giữ lại đúng
    1 chỗ hiển thị (dưới value) — vừa hết dính chữ vừa hết trùng lặp thông tin.
  - Đã chạy `tsc --noEmit` + `eslint src/` toàn repo — sạch.
  - Người thực hiện: Claude. File package gửi cho user:
    `module_E_metriccard_header.zip` (2 file: `components/ui/MetricCard.tsx`,
    `VISUAL_POLISH_ROADMAP.md`).
- **2026-07-28** — **Hoàn thành E3 (kèm đính chính nhận định ban đầu)**.
  - Đọc lại code `app/cycle/page.tsx` phần "Lịch sử gần đây": khối này ĐÃ nằm
    trong `glass-card rounded-[24px] p-5` từ trước — nhận định ban đầu trong
    roadmap ("lệch hệ thống thiết kế, giống bảng dữ liệu web") là **sai**, viết
    dựa trên cảm nhận nhìn ảnh mà chưa đọc code (giống trường hợp E1/E2). Vấn
    đề thật: các `<li>` trong `<ul>` chỉ cách nhau `gap-1` (4px), KHÔNG có
    đường phân cách nào — khi danh sách nhiều mục các dòng dính liền, khó tách
    bằng mắt dù nội dung khác nhau.
  - **Đã sửa**: `<ul>` đổi `flex flex-col gap-1` → `flex flex-col divide-y
    divide-black/[0.06]` (đường kẻ rất mảnh, cùng tông đen mờ đã dùng cho
    trạng thái hover `hover:bg-black/[0.03]` — nhất quán, không lạc tông với
    phần còn lại của card); tăng padding dọc mỗi dòng từ `py-2.5` lên `py-3`
    cho thoáng hơn khi có đường kẻ ngăn.
  - Đã chạy `tsc --noEmit` + `eslint src/` toàn repo — sạch.
  - **Rút kinh nghiệm cho các module E-I còn lại**: từ nay trước khi ghi nhận
    1 mục là "bug"/"lệch hệ thống", LUÔN đọc code thật trước (không chỉ dựa
    ảnh chụp) — đã xảy ra 2 lần sai (E1, E2) trong cùng roadmap này vì bỏ qua
    bước đó.
  - Người thực hiện: Claude. File package gửi cho user:
    `module_E3_history_dividers.zip` (2 file: `app/cycle/page.tsx`,
    `VISUAL_POLISH_ROADMAP.md`).
- **2026-07-28** — **Hoàn thành F1 (thống nhất icon-badge tròn phẳng →
  `BlobIcon`)**, phạm vi được thu hẹp có chủ đích (xem lý do bên dưới).
  - **Đã đổi sang `BlobIcon`** (4 file, mỗi icon-badge tròn phẳng 1 màu):
    - `app/log/page.tsx`: 8 ô chọn chỉ số ở màn "Ghi nhận hôm nay".
    - `components/ui/MetricCard.tsx`: icon header mọi metric card ở Tổng quan
      (Stress, Nhịp tim, Giấc ngủ, Hydration, Tâm trạng...).
    - `app/profile/page.tsx`: 5 hàng menu (Báo cáo sức khoẻ, Bài tập Kegel,
      Trắc nghiệm năng lượng, Thư viện kiến thức, Lịch hẹn) — badge "Kegel"
      trước đó dùng gradient 2 màu (period→sleep) riêng, đã đơn giản về 1 màu
      accent (period) để khớp hệ thống `BlobIcon` (mỗi badge giờ chỉ cần khai
      báo 1 màu, không cần định nghĩa gradient riêng từng chỗ nữa).
  - **CHỦ ĐỘNG KHÔNG đổi** 2 nhóm còn lại đã liệt kê trong roadmap gốc F1,
    tách rõ lý do:
    - **Card vuông đặc trong `HealthCheckIns.tsx`** ("Mức độ mệt mỏi", "Chu kỳ
      không đều?") — các badge này dùng `q.gradient`, lấy từ CÙNG 1 mảng dữ
      liệu (`CHECK_IN_QUIZZES`/`lib/cycle-insights.ts`) với 2 card "Vận
      động"/"Năng suất" mà **F2 (mục kế tiếp trong roadmap)** đang nhắm tới xử
      lý — 10 gradient 2-màu rời rạc không cùng 1 họ màu. Đổi HÌNH KHỐI ở đây
      mà chưa xử lý xong MÀU SẮC ở F2 sẽ phải sửa lại 2 lần cùng 1 chỗ — nên
      để nguyên hình vuông, gộp chung xử lý với F2.
    - **Icon action/chrome khác** (nút đóng modal `X`, nút back mũi tên, avatar
      tròn, khung skeleton loading...) — đây KHÔNG phải icon minh hoạ nội
      dung (không có cặp icon+tiêu đề+mô tả đi kèm), đổi sang blob sẽ sai bản
      chất (nút hành động cần hình dạng trung tính, không nên trông như 1 khối
      minh hoạ).
  - Đã chạy `tsc --noEmit` + `eslint src/` toàn repo — sạch.
  - Người thực hiện: Claude. File package gửi cho user: `module_F1_blob_icons.zip`
    (4 file: `app/log/page.tsx`, `components/ui/MetricCard.tsx`,
    `app/profile/page.tsx`, `VISUAL_POLISH_ROADMAP.md`).
