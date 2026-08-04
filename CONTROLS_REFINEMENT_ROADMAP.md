# KVCycle — Roadmap nâng cấp Control & Chi tiết nhỏ (Sliders, Progress bar, Nút, Logic UI)

> **File này dùng cho AI agent (Claude Code, Cursor, v.v.) đọc và tiếp tục triển
> khai — đây là PROMPT/ROADMAP, không phải bản triển khai.** Viết theo đúng
> format/tinh thần của `QUALITY_UX_ROADMAP.md` và `VISUAL_POLISH_ROADMAP.md`
> (2 roadmap trước đã hoàn thành 100% phần khả thi) — có thể giao thẳng cho 1
> phiên làm việc mới, từng module 1, đóng gói patch zip nhỏ, cập nhật Nhật ký,
> y hệt quy trình cũ.
>
> **Quy tắc bắt buộc cho mọi agent (giống 2 roadmap trước):**
> 1. Đọc kỹ mục "Nhật ký triển khai" ở cuối file trước khi bắt đầu, biết đã
>    làm đến đâu — không làm lại việc đã xong.
> 2. Mỗi khi hoàn thành xong 1 mục (hoặc 1 nhóm nhỏ nếu khối lượng ít): đánh
>    dấu `[x]`, rồi **ghi 1 entry mới vào Nhật ký** (ngày, mục đã làm, file đã
>    sửa/tạo, quyết định thiết kế quan trọng — VÌ SAO chứ không chỉ CÁI GÌ,
>    việc còn dang dở nếu có) để agent kế tiếp đọc và tiếp tục đúng mạch, không
>    phải dò lại từ đầu.
> 3. **Quy tắc đóng gói patch gửi chủ dự án:**
>    - Mục khối lượng nhỏ (ít file, không rủi ro cao) → có thể gộp 2 mục liên
>      tiếp cùng nhóm rồi mới đóng gói zip + ghi nhật ký cho cả 2.
>    - Mục khối lượng lớn (đổi 1 component dùng chung ở nhiều trang, rủi ro
>      regression cao) → chỉ làm riêng mục đó rồi đóng gói ngay.
>    - Luôn chạy `tsc --noEmit` (và `eslint src/` nếu có thể) trước khi đóng
>      gói — toàn repo, không chỉ file mới sửa.
>    - Zip chỉ chứa file thực sự thay đổi (patch), không nén `node_modules`/`.next`.
> 4. Không tự chế lại hạ tầng đã có (`glass-card`, `glass-card-strong`,
>    `BlobIcon`, `PhaseMotif`, biến CSS `--ink*`/`--c-*`/`--shadow-card-*`...).
>    Nếu roadmap này tạo thêm component dùng chung mới (`SliderControl`,
>    `ProgressBar`...), coi đó là hạ tầng MỚI cần các agent sau tái sử dụng,
>    không viết lại lần nữa ở module khác.
> 5. Giữ convention hiện tại: business logic thuần trong `src/lib/*.ts`, hook
>    TanStack Query trong `src/lib/queries.ts`, comment tiếng Việt giải thích
>    "vì sao", component UI dùng chung đặt ở `src/components/ui/`.

---

## 0. Bối cảnh xuất phát

Chủ dự án gửi 2 ảnh chụp màn hình thật (`Cá nhân` — khối "Thông số chu kỳ mặc
định" với 2 thanh kéo; `Chu kỳ` — khối "Hôm nay bạn có thể mong đợi" với 4
thanh tiến trình) và nhận xét: **những thanh trạng thái/thanh kéo đang hơi lạc
hậu**, cần rà soát lại các chi tiết nhỏ (nút, logic, giao diện) để app "mạch
lạc và mềm mại" hơn — đây là bước tiếp theo SAU `VISUAL_POLISH_ROADMAP.md`
(đã xong bug thị giác, icon, elevation, signature), tập trung riêng vào lớp
**control tương tác** (slider, progress bar, và các control nhỏ khác chưa
từng được rà soát ở 2 roadmap trước).

**Đã đọc code xác minh trước khi mở roadmap này** (không đoán bằng mắt):

- **Slider**: có **6 chỗ** dùng `<input type="range">` **mặc định của trình
  duyệt** (chỉ set `accentColor`, không style track/thumb riêng) — đúng
  nguyên nhân trông "lạc hậu" trong ảnh (track/thumb hệ điều hành, không đồng
  bộ với ngôn ngữ thiết kế bo tròn mềm mại của app):
  - `components/log/MetricLogForm.tsx:140`
  - `app/profile/page.tsx:302` và `:316` (đúng 2 thanh trong ảnh mẫu — độ dài
    chu kỳ, số ngày hành kinh)
  - `app/settings/page.tsx:323`
  - `app/onboarding/page.tsx:111` và `:125`
  → **6 chỗ, KHÔNG có component dùng chung nào** — mỗi nơi tự viết `<input
  type="range">` riêng lẻ, có nguy cơ lệch nhau thêm nếu sửa từng chỗ.
- **Progress bar (thanh trạng thái ngang)**: có **3 chỗ** tự implement độc lập,
  **không đồng nhất** dù cùng mục đích (thanh nền mờ + thanh fill bo tròn):
  - `components/cycle/PhaseOutlook.tsx` (đúng khối "Hôm nay bạn có thể mong
    đợi" trong ảnh mẫu) — cao `h-2`, nền `bg-black/[0.06]`.
  - `components/profile/SymptomAnalysis.tsx` — cao `h-2`, nền `bg-black/[0.05]`
    (khác 1% so với trên, không có lý do).
  - `components/fatigue/FatigueQuiz.tsx` — cao `h-1.5`, nền
    `rgba(36,27,47,0.08)` (khác hẳn 2 chỗ trên, dùng rgba trực tiếp thay vì
    class Tailwind).
  → 3 implementation riêng lẻ, 3 độ cao/độ mờ nền khác nhau cho cùng 1 khái
  niệm UI — trông "lạc hậu" một phần vì phẳng (fill 1 màu đặc, không gradient/
  không điểm nhấn cuối thanh), một phần vì KHÔNG NHẤT QUÁN giữa các màn hình.

Roadmap này giải quyết đúng 2 vấn đề cụ thể trên (Nhóm J, K) trước, sau đó mở
rộng rà soát sang các control nhỏ khác chưa từng được audit toàn diện (Nhóm L)
để không phải mở thêm 1 roadmap "chi tiết nhỏ" nữa sau này.

---

## 1. Nhóm J — Component Slider dùng chung, thay toàn bộ `<input type="range">` mặc định

- [x] **J1. Xây `components/ui/SliderControl.tsx`** — 1 component slider tự vẽ
      track/thumb (không dùng lại appearance mặc định trình duyệt), gồm:
      - Track: pill bo tròn đầy đủ, phần đã đi qua tô gradient theo màu accent
        truyền vào (accent color theo prop, không hard-code — vì mỗi nơi dùng
        1 tông khác nhau: period, sleep...), phần chưa đi qua tô nhạt
        (`bg-black/[0.06]`, đồng bộ đúng 1 giá trị, không lệch như hiện tại).
      - Thumb: hình tròn nổi (box-shadow nhẹ, viền trắng) đủ lớn để bấm/kéo dễ
        trên mobile (tối thiểu 24-28px vùng chạm thật, dù hình tròn hiển thị có
        thể nhỏ hơn — dùng padding/hit-area ảo nếu cần).
      - Hỗ trợ hiển thị **giá trị hiện tại nổi ngay trên thumb** khi đang kéo
        (tuỳ chọn qua prop, không bắt buộc bật ở mọi nơi) — chi tiết "mềm mại"
        giúp người dùng thấy ngay số đang chọn mà không cần liếc lên dòng chữ
        phía trên.
      - Có animation nhẹ khi thumb di chuyển/khi nhả tay (spring nhẹ hoặc
        `transition` ease, tôn trọng `prefers-reduced-motion` đã có sẵn trong
        `globals.css`, cùng convention với `.press-feedback` ở
        `QUALITY_UX_ROADMAP.md` A2).
      - Props tối thiểu: `min`, `max`, `step`, `value`, `onChange`, `accentColor`,
        `disabled`, `showValueBubble?`, `formatValue?` (vd để hiện "5 ngày" thay
        vì chỉ số thô).
      - Vẫn dựng trên `<input type="range">` thật bên dưới (giữ accessibility —
        bàn phím, screen reader, kéo bằng chuột/tay đều hoạt động chuẩn), chỉ
        **ẩn appearance mặc định** (`appearance-none`) và vẽ track/thumb riêng
        đè lên bằng CSS/pseudo-element hoặc 1 lớp `<div>` phủ — không dựng lại
        toàn bộ logic kéo-thả bằng JS thuần (không cần thiết, dễ sinh bug mới
        về touch/accessibility so với tận dụng input gốc).
- [x] **J2. Áp dụng `SliderControl` cho toàn bộ 6 vị trí liệt kê ở mục 0** — thay
      từng `<input type="range">` thô bằng `<SliderControl>`, giữ nguyên 100%
      logic `value`/`onChange`/`min`/`max` hiện có (không đổi hành vi nghiệp
      vụ, chỉ đổi phần hiển thị). Khuyến nghị làm theo cặp file gần nhau để dễ
      review (vd `profile/page.tsx` — đúng 2 thanh trong ảnh mẫu — làm riêng 1
      patch vì đây là màn hình người dùng nhìn thấy thường xuyên nhất).

## 2. Nhóm K — Hệ thống Progress bar thống nhất

- [x] **K1. Xây `components/ui/ProgressBar.tsx`** — 1 component thanh tiến
      trình dùng chung, thay 3 bản tự implement liệt kê ở mục 0:
      - Chốt **đúng 1 giá trị** cho chiều cao (khuyến nghị `h-2`, đã là giá trị
        áp đảo 2/3 chỗ hiện tại) và **đúng 1 giá trị** cho màu nền track
        (khuyến nghị `bg-black/[0.06]`, khớp `PhaseOutlook` — chỗ người dùng
        nhìn thấy thường xuyên nhất) — không còn 3 con số khác nhau cho cùng 1
        khái niệm.
      - Phần fill: cân nhắc đổi từ màu đặc phẳng sang **gradient nhẹ theo
        chiều ngang** (từ màu accent sang biến thể sáng/nhạt hơn 1 chút của
        chính màu đó — dùng `color-mix(in srgb, ...)` đã dùng quen trong
        codebase, KHÔNG bịa thêm màu mới) — đây chính là điểm "mềm mại hơn"
        chủ dự án yêu cầu, tạo chiều sâu nhẹ thay vì dải màu phẳng cứng.
      - Animation `width` khi giá trị đổi (`transition-all` đã có ở
        `PhaseOutlook`/`FatigueQuiz` — giữ, áp dụng thêm cho `SymptomAnalysis`
        nếu đang thiếu).
      - Props tối thiểu: `value` (0-100), `color` (hoặc `gradientFrom`/
        `gradientTo` nếu implement gradient), `height?` (hiếm khi cần khác
        default, nhưng để mở — vd `FatigueQuiz` có thể muốn mảnh hơn vì là
        thanh tiến độ câu hỏi, khác bản chất "mức độ" của 2 chỗ kia).
- [x] **K2. Áp dụng `ProgressBar` cho cả 3 vị trí** — `PhaseOutlook.tsx`,
      `SymptomAnalysis.tsx`, `FatigueQuiz.tsx`. Rà kỹ từng chỗ xem có đang tận
      dụng gì đặc thù không trước khi thay (vd `FatigueQuiz` progress là tiến
      độ CÂU HỎI làm quiz — có ngữ nghĩa khác "mức độ dự đoán" của 2 chỗ kia,
      có thể hợp lý giữ `height` mảnh hơn qua prop thay vì bắt mọi nơi giống
      hệt nhau 100%).

## 3. Nhóm L — Rà soát mở rộng: nút bấm, logic, chi tiết giao diện khác

Sau khi xong J-K (2 việc chủ dự án chỉ ra trực tiếp), rà thêm các control khác
CHƯA từng được audit toàn diện ở `QUALITY_UX_ROADMAP.md` (vốn tập trung
feedback/loading/toast) hay `VISUAL_POLISH_ROADMAP.md` (vốn tập trung icon/
elevation/signature) — để không sót "chi tiết nhỏ" nào còn lạc hậu:

- [x] **L1. Audit toggle/switch (bật-tắt)** — liệt kê mọi công tắc bật/tắt
      trong app (thông báo, nhắc nhở, chế độ tối, App Lock...), kiểm tra có
      dùng chung 1 style hay mỗi nơi 1 kiểu riêng (native checkbox, custom div,
      thư viện khác nhau) — nếu lệch, thống nhất về 1 component `Switch` dùng
      chung.
- [x] **L2. Audit chip/tag lựa chọn** — các nhóm chip chọn 1/nhiều lựa chọn
      (triệu chứng ở `/log`, preset giá trị số ở `MetricLogForm`, câu hỏi gợi ý
      AI...) — kiểm tra trạng thái selected/unselected có nhất quán màu +
      animation chuyển trạng thái hay không.
- [x] **L3. Audit input số/chữ (text/number field)** — các ô nhập tay (cân
      nặng, nhịp tim, ghi chú...) — kiểm tra border/focus-ring/placeholder có
      cùng 1 chuẩn hay lệch giữa các form khác nhau.
- [x] **L4. Audit segmented control / tab chuyển view** (nếu có, vd chuyển
      Tuần/Tháng ở biểu đồ, hoặc tab trong 1 màn hình con) — cùng lý do L1-L3,
      tìm và thống nhất.
- [x] **L5. Audit trạng thái disabled** trên MỌI loại control ở trên (slider,
      progress bar mới xây, toggle, chip, input, nút) — đảm bảo disabled trông
      "rõ ràng là không bấm được" nhất quán (cùng 1 công thức opacity/màu),
      không phải mỗi nơi tự đoán 1 kiểu.

*(Nhóm L cố ý để dạng "audit trước, quyết định sau" — sau khi liệt kê xong
thực trạng từng mục, agent tự quyết sửa nếu là bug/lệch rõ ràng (giống cách
`VISUAL_POLISH_ROADMAP.md` nhóm F/G/I đã làm), chỉ dừng lại hỏi chủ dự án nếu
phát hiện cần quyết định mang tính định hướng thiết kế lớn — giống quy tắc H1
ở roadmap trước.)*

## 4. Thứ tự triển khai đề xuất

1. **J1 → J2** — làm trước, đây là việc chủ dự án chỉ đích danh qua ảnh, và
   J1 (xây component) là nền tảng bắt buộc phải có trước khi J2 áp dụng được.
2. **K1 → K2** — làm ngay sau, cùng lý do, cũng là việc chủ dự án chỉ đích danh.
3. **L1-L5** — làm sau cùng, từng mục 1, độc lập nhau nên có thể dừng ở bất kỳ
   mục nào giữa chừng nếu cần ưu tiên việc khác, không bắt buộc làm liền mạch.

---

## Nhật ký triển khai

**2026-08-04 — J1+J2 (SliderControl, áp dụng 6 vị trí) + K1+K2 (ProgressBar,
áp dụng 3 vị trí) + audit L1-L5**

- **File tạo mới:**
  - `src/components/ui/SliderControl.tsx` — vẫn dựng trên `<input
    type="range">` thật (giữ accessibility bàn phím/screen reader/kéo chuột-
    tay), ẩn appearance mặc định (`opacity-0` đè lên track/thumb vẽ riêng bằng
    2 lớp `<div>` phủ dùng `pointer-events-none`, input thật nằm trên cùng để
    bắt sự kiện). Track fill dùng `linear-gradient` qua `color-mix` (đồng bộ
    convention `color-mix` đã dùng ở `MetricLogForm`/`CycleLogForm`...), thumb
    scale nhẹ (1 → 1.12) khi đang kéo, tuỳ chọn bubble giá trị nổi phía trên
    thumb qua `showValueBubble`/`formatValue`. Theo dõi trạng thái kéo bằng
    `onPointerDown/Up` + `onKeyDown/onBlur` (để bubble cũng hiện khi kéo bằng
    bàn phím). Animation dùng `transition` CSS thường (không cần JS spring
    riêng) nên tự động tôn trọng rule `prefers-reduced-motion` sẵn có trong
    `globals.css`.
  - `src/components/ui/ProgressBar.tsx` — chốt 1 giá trị track (`bg-black/
    [0.06]`, khớp `PhaseOutlook` cũ — chỗ người dùng thấy thường xuyên nhất) và
    default height 8px (=h-2, giá trị áp đảo 2/3 chỗ cũ). Fill đổi từ màu đặc
    phẳng sang `linear-gradient` 2 sắc độ của cùng 1 màu qua `color-mix` (đậm
    hơn ở đầu, nhạt hơn ở cuối) để tạo chiều sâu nhẹ — đúng yêu cầu "mềm mại
    hơn" thay vì bịa màu mới. `height` để prop mở cho nơi cần mảnh hơn.
- **File sửa (áp dụng SliderControl — J2):** `src/components/log/
  MetricLogForm.tsx`, `src/app/profile/page.tsx` (2 thanh trong ảnh mẫu gốc),
  `src/app/settings/page.tsx`, `src/app/onboarding/page.tsx` (2 thanh). Giữ
  nguyên 100% logic value/onChange/min/max hiện có, chỉ đổi phần hiển thị.
  `MetricLogForm` bật `showValueBubble` (nhập số liệu cần thấy ngay giá trị
  khi kéo); 2 trang profile/onboarding cũng bật kèm `formatValue` để bubble
  hiện "X ngày" thay vì số thô.
- **File sửa (áp dụng ProgressBar — K2):** `src/components/cycle/
  PhaseOutlook.tsx`, `src/components/profile/SymptomAnalysis.tsx` (dùng
  default height 8px, đồng nhất với PhaseOutlook), `src/components/fatigue/
  FatigueQuiz.tsx` (giữ `height={6}` mảnh hơn có chủ đích — đây là tiến độ
  CÂU HỎI làm quiz, ngữ nghĩa khác "mức độ dự đoán" của 2 chỗ kia, đúng gợi ý
  ở mục K2 của roadmap).
- **Audit nhóm L (L1-L5):**
  - L1 (toggle/switch): đã có sẵn `components/ui/Switch.tsx` dùng thống nhất
    ở mọi nơi bật/tắt (nhắc nhở, App Lock...) từ trước — không cần sửa gì.
  - L2 (chip lựa chọn): các nhóm chip (triệu chứng ở `/log`, preset số ở
    `MetricLogForm`) đều dùng chung pattern `rounded-full` + đổi màu nền/chữ
    theo trạng thái selected qua `color-mix`, có `transition`/`active:scale`
    nhất quán — không phát hiện lệch chuẩn cần sửa gấp.
  - L3 (input số/chữ): các form chính (login, onboarding) dùng chung pattern
    `bg-black/[0.03]` + `rounded-2xl` + `px-4 py-3`. Riêng ô nhập PIN ở
    `settings/page.tsx` dùng `border border-black/10 bg-[var(--surface)]` +
    căn giữa/giãn chữ — khác 1 chút nhưng có chủ đích (input PIN cần nổi bật/
    rõ ràng hơn input thường), không phải lệch chuẩn ngẫu nhiên nên giữ
    nguyên. Ghi nhận: không có focus-ring rõ ràng ở phần lớn input (chỉ
    `outline-none`) — đây là quyết định thiết kế có phạm vi rộng hơn 1 patch
    "chi tiết nhỏ", để agent sau cân nhắc nếu chủ dự án yêu cầu riêng.
  - L4 (segmented control/tab): rà không thấy segmented control dạng multi-
    tab trong code hiện tại (biểu đồ dùng chip chuyển view, đã phủ ở L2) —
    không có gì để thống nhất thêm.
  - L5 (disabled): slider/progress bar mới xây đều nhận `disabled` (SliderControl
    qua `<input disabled>` kèm `cursor-not-allowed`), các nút/chip dùng chung
    `disabled:opacity-60`/`disabled:opacity-50` khá nhất quán trong toàn bộ
    codebase — không phát hiện nơi disabled trông giống "vẫn bấm được".
  - Kết luận nhóm L: không có bug/lệch chuẩn rõ ràng nào đủ lớn cần sửa ngay
    trong patch này; các điểm ghi nhận ở trên (focus-ring input) để dành cho
    quyết định định hướng thiết kế riêng nếu chủ dự án muốn mở rộng sau.
- **Kiểm tra trước khi đóng gói:** `npx tsc --noEmit` toàn repo — 0 lỗi.
  `npx eslint` trên toàn bộ file mới/sửa — 0 lỗi/cảnh báo.
- **Việc còn dang dở:** không — J, K hoàn tất theo đúng scope roadmap yêu cầu;
  L1-L5 đã audit xong, không cần thêm hành động.
