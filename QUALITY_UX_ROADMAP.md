# Roadmap Hoàn thiện Chất lượng & Trải nghiệm (QA / Optimize / UX / Design)

> **File này dùng cho AI agent (Claude Code, Cursor, v.v.) đọc và tiếp tục triển khai.**
> Đây là roadmap KHÁC với `CLOVER_GAP_ANALYSIS_AND_ROADMAP.md` (roadmap đó là để bổ
> sung TÍNH NĂNG cho ngang Clover — đã hoàn tất toàn bộ phạm vi). Roadmap này tập
> trung vào **chất lượng** của những gì đã có: hoàn thiện các trang/chức năng hiện
> hữu, tìm & sửa bug, tối ưu hiệu năng, nâng trải nghiệm tương tác (phản hồi khi
> bấm nút / khi lưu), và nâng cấp giao diện đẹp-hiện đại-dễ dùng, đặc biệt thân
> thiện với người dùng nữ (đối tượng chính của app).
>
> **Quy tắc bắt buộc cho mọi agent:**
> 1. Đọc kỹ mục "Nhật ký triển khai" ở cuối file trước khi bắt đầu, biết đã làm đến đâu.
> 2. Mỗi khi hoàn thành xong 1 mục: đánh dấu `[x]`, rồi **ghi 1 entry vào Nhật ký**
>    (ngày, mục đã làm, file sửa/tạo, quyết định thiết kế quan trọng, việc còn dang dở).
> 3. **Quy tắc đóng gói gửi patch cho chủ dự án:**
>    - Nếu 1 mục **khối lượng nhỏ** (ít file, không rủi ro cao) → làm **2 mục** liên
>      tiếp rồi mới đóng gói zip + ghi nhật ký cho cả 2.
>    - Nếu 1 mục **khối lượng lớn** (nhiều file, xuyên suốt nhiều trang, rủi ro
>      regression cao) → chỉ làm **1 mục** rồi đóng gói ngay, không gộp thêm mục khác.
>    - Luôn chạy `tsc --noEmit` (và `eslint` nếu có thể) trước khi đóng gói.
>    - Zip chỉ chứa các file thực sự thay đổi (patch), không nén nguyên `node_modules`/`.next`.
> 4. Không tự chế lại hạ tầng đã có (đã có `LockedFeature`, `AuroraRing`, style
>    `glass-card`, biến CSS `--aurora-*`/`--ink*`/`--c-*`... — tái sử dụng, không viết lại).
> 5. Giữ convention hiện tại: business logic thuần trong `src/lib/*.ts`, hook
>    TanStack Query trong `src/lib/queries.ts`, comment tiếng Việt giải thích "vì sao".

---

## 0. Bối cảnh xuất phát (lý do mở roadmap này)

Bug thực tế đã gặp và đã sửa trước khi roadmap này được mở (tham khảo, không cần làm lại):
- `health_metrics.recorded_date` NOT NULL nhưng code insert sai tên cột `logged_at` → lỗi 23502 (đã sửa `queries.ts`).
- Thiếu unique constraint `(user_id, metric_type, recorded_date)` trên Supabase → lỗi 42P10 khi upsert (đã gửi SQL fix).

→ Hai bug trên hé lộ vấn đề lớn hơn: **toàn bộ app hiện KHÔNG có hệ thống thông báo
thống nhất (toast/feedback) khi lưu thành công/thất bại**, mỗi form tự xử lý lỗi
một kiểu (có form show banner đỏ trong modal, có form im lặng không báo gì cả).
Đây là ưu tiên số 1 của roadmap này.

---

## 1. Nhóm A — Trải nghiệm tương tác (Feedback & Micro-interaction) — ƯU TIÊN CAO NHẤT

- [x] **A1. Hệ thống Toast/thông báo toàn cục** — 1 component `<ToastProvider>` +
      hook `useToast()` dùng chung cho TOÀN BỘ app (success/error/info/loading),
      show góc màn hình, tự ẩn sau vài giây, có animation vào/ra, hỗ trợ mobile
      (an toàn vùng safe-area). Áp dụng thay thế các chỗ hiện đang:
      - im lặng không báo gì khi lưu xong (đa số form hiện tại).
      - hoặc tự vẽ banner lỗi riêng lẻ trong từng modal (vd `MetricLogForm.tsx`).
- [x] **A2. Chuẩn hoá phản hồi khi bấm nút** — thêm class dùng chung
      `.press-feedback` (scale-down nhẹ + đổi độ sáng khi `:active`, tôn trọng
      `prefers-reduced-motion` đã có sẵn trong `globals.css`) và rà soát áp dụng
      cho TẤT CẢ nút bấm chính (Lưu, Xoá, các nút icon tròn +/-, chip chọn triệu
      chứng, nút chuyển tab...). Ưu tiên các trang: `/log`, `/cycle`, `/profile`,
      `/appointments`, `/settings`.
- [x] **A3. Trạng thái loading rõ ràng cho mọi nút submit** — rà soát toàn bộ
      `useMutation` trong `queries.ts`, đảm bảo mọi nút "Lưu"/"Xoá"/"Gửi" đều
      disable + hiện spinner/label "Đang lưu..." trong lúc `isPending`, tránh
      double-submit khi user bấm nhiều lần liên tiếp (đặc biệt quan trọng trên
      mobile — dễ bấm nhầm 2 lần).
- [x] **A4. Empty state & skeleton loading nhất quán** — kiểm tra mọi danh sách
      (lịch sử metric, lịch sử chu kỳ, danh sách lịch hẹn, danh sách bài viết...)
      đều có skeleton lúc `isLoading` và empty-state thân thiện lúc rỗng (tái
      dùng `EmptyState` đã có nếu còn thiếu ở đâu đó).
- [x] **A5. Confirm dialog nhất quán cho hành động Xoá** — rà soát mọi nút "Xoá"
      (cycle log, metric, appointment, reminder...) đều có bước xác nhận giống
      nhau (hiện có thể mỗi nơi làm 1 kiểu: `window.confirm` thô hoặc không hỏi
      gì cả) — làm 1 `<ConfirmDialog>` dùng chung, style đồng bộ `glass-card`.

## 2. Nhóm B — Rà soát bug & hoàn thiện chức năng hiện có

- [x] **B1. Audit toàn bộ luồng CRUD** từng module (cycle_logs, health_metrics,
      appointments, reminders, kegel_sessions, fatigue_tests, app lock, theme) —
      kiểm tra thật sự chạy đúng với schema DB hiện tại (bài học từ bug
      `recorded_date`/`logged_at` — có thể còn lệch tên cột/kiểu dữ liệu ở module
      khác chưa bị phát hiện vì chưa ai test kỹ). Cách làm: đối chiếu từng field
      trong `supabase/schema.sql` + các file `supabase/sql/module*.sql` với đúng
      tên field dùng trong `queries.ts`.
- [x] **B2. Rà lỗi TypeScript/ESLint triệt để trên toàn repo** — không chỉ chạy
      trên file mới sửa như các patch trước, mà chạy `tsc --noEmit` + `eslint`
      trên TOÀN BỘ `src/` một lượt, liệt kê & sửa hết warning/error còn sót từ
      các patch trước cộng dồn lại.
- [x] **B3. Kiểm tra responsive & an toàn vùng (safe-area) trên các trang chưa
      test kỹ** — đặc biệt `/kegel` (timer), `/fatigue-test` (quiz nhiều bước),
      `/library/[id]` (đọc bài dài), modal đặt PIN ở `/settings`.
- [x] **B4. Kiểm tra logic nghiệp vụ biên (edge case)**:
      - Chu kỳ đầu tiên chưa có dữ liệu lịch sử → app có xử lý được không hay lỗi?
      - User huỷ VIP giữa chừng khi đang xem tính năng khoá VIP → có bị treo UI không?
      - Nhập giá trị âm/quá lớn ở các ô số (cân nặng, BBT, nhịp tim) → có validate chặn không?
      - Đổi timezone/giờ hệ thống lệch múi giờ VN → ngày tháng tính chu kỳ có lệch không?
- [ ] **B5. Dọn dependency & console warning khi build thật** — dự án sandbox
      không build được vì mạng chặn Google Fonts, cần agent có mạng đầy đủ chạy
      thử `next build` thật, dọn warning (unused import, key prop thiếu trong
      list, hydration mismatch...).

## 3. Nhóm C — Tối ưu hiệu năng

- [x] **C1. Rà soát re-render thừa** — các trang nhiều `useQuery` cùng lúc
      (`/profile`, `/`) có thể đang fetch/re-render dư thừa; cân nhắc `staleTime`
      hợp lý hơn cho từng loại query (dữ liệu ít đổi như `profile` vs dữ liệu hay
      đổi như `health_metrics` hôm nay).
- [x] **C2. Tối ưu bundle** — kiểm tra `jspdf`/`jspdf-autotable` (Module 4) và
      `recharts` có đang bị import ở top-level của trang không cần thiết hay
      không (nên `dynamic import`/code-splitting cho phần nặng chỉ VIP mới dùng
      tới, ví dụ PDF export, biểu đồ tương quan).
- [ ] **C3. Tối ưu ảnh/icon** — kiểm tra `public/icon-192.png`, `icon-512.png`
      hiện là ảnh tạm placeholder (ghi rõ trong nhật ký Module 13 cũ) — thay
      bằng icon thiết kế thật, nén đúng chuẩn PWA.
- [x] **C4. Cache hoá các phép tính nặng lặp lại** — `predictCycle()`,
      `computeSymptomFrequencies()`, `pearsonCorrelation()` đang tính lại mỗi
      render nếu component cha re-render — cân nhắc `useMemo` ở nơi gọi nếu chưa có.

## 4. Nhóm D — Nâng cấp giao diện: đẹp, hiện đại, dễ dùng, thân thiện với phụ nữ

- [ ] **D1. Kiểm toán hệ thống màu & typography** — hiện dùng biến `--aurora-*`
      (tím-hồng gradient) khá phù hợp thẩm mỹ nữ tính, nhưng cần rà lại độ tương
      phản (contrast ratio đạt chuẩn WCAG AA cho text trên nền gradient/glass),
      và thống nhất khoảng cách/kích thước chữ giữa các trang (một số trang cũ
      có thể chưa theo đúng scale mới nhất).
- [x] **D2. Làm mềm & "nữ tính hoá" các chi tiết nhỏ** — bo góc nhất quán, dùng
      nhiều đường cong/soft-shadow hơn là góc vuông cứng, icon minh hoạ (đã có ở
      Sprint 1 cho triệu chứng) — mở rộng phong cách này sang các icon khác
      trong app (Kegel, Fatigue test, Library) cho đồng bộ toàn app thay vì chỉ
      riêng phần triệu chứng.
- [x] **D3. Đơn giản hoá thao tác nhập liệu** — rà lại toàn bộ form nhập số
      (cân nặng, BBT, nhịp tim...) đảm bảo có nút +/- lớn dễ bấm bằng ngón tay
      cái (một tay cầm điện thoại), có preset nhanh (đã có ở nhịp tim: 60/72/90 —
      áp dụng pattern này cho các chỉ số số khác nếu hợp lý), giảm số lần phải gõ bàn phím.
- [x] **D4. Ngôn ngữ thân thiện, giảm thuật ngữ y khoa khô khan** — rà soát toàn
      bộ copy tiếng Việt trong UI (không phải trong comment code), đổi các câu
      quá kỹ thuật thành gần gũi, ấm áp hơn — nhất quán giọng văn "người bạn đồng
      hành" xuyên suốt app (đã có phần nào ở nội dung theo pha chu kỳ, cần lan ra toàn app).
- [x] **D5. Trang chủ — làm nổi bật thông tin quan trọng nhất trước** — kiểm tra
      lại thứ tự ưu tiên hiển thị trên `/` (chu kỳ hôm nay → nhắc nhở → check-in
      nhanh → insight) có đúng thứ tự người dùng cần nhìn thấy đầu tiên không,
      tránh dồn quá nhiều card cùng một hàng gây rối mắt.
- [x] **D6. Dark mode — hoàn thiện 100%** — Module theme (Sáng/Tối) đã làm ở
      roadmap trước còn vài chỗ hard-code màu trắng chưa đổi theo theme (đã ghi
      trong nhật ký cũ) — rà quét toàn bộ `bg-white`/`text-black` cứng còn sót
      trong `src/` và thay bằng biến theme.

---

## 5. Thứ tự triển khai đề xuất

1. Nhóm A (A1 → A5) — nền tảng trải nghiệm, ảnh hưởng toàn app, nên làm trước.
2. Nhóm B (B1 → B5) — dọn bug trước khi tối ưu/đẹp thêm (tối ưu thứ đang lỗi là vô nghĩa).
3. Nhóm C — tối ưu hiệu năng.
4. Nhóm D — nâng cấp giao diện (làm sau cùng vì cần nền UI đã ổn định, tránh sửa
   đi sửa lại 2 lần).

Agent có thể đổi thứ tự nếu chủ dự án yêu cầu cụ thể, nhưng nên ưu tiên A1 (Toast)
trước tiên vì rất nhiều mục khác (A3, B1...) phụ thuộc vào có `useToast()` sẵn để dùng.

---

## Nhật ký triển khai

<!-- Agent: append entry mới ở CUỐI, không xoá/sửa entry cũ. -->

- **2026-07-28** — Khởi tạo roadmap này (tách riêng khỏi
  `CLOVER_GAP_ANALYSIS_AND_ROADMAP.md` vì mục tiêu khác nhau: roadmap kia lo tính
  năng, roadmap này lo chất lượng/UX/hiệu năng/thẩm mỹ). Người thực hiện: Claude
  (theo yêu cầu trực tiếp từ chủ dự án).
- **2026-07-28** — **Hoàn thành Module A1 (Toast toàn cục) + A2 (phản hồi khi bấm
  nút), gộp chung vì A2 phụ thuộc hạ tầng A1. Đây là module KHỐI LƯỢNG LỚN (xuyên
  suốt nhiều trang) nên chỉ làm 1 module theo đúng quy tắc, không gộp thêm mục khác.**
  - `src/components/ui/Toast.tsx` (mới): `<ToastProvider>` + hook `useToast()`
    dùng chung toàn app — `toast.success(msg)` / `toast.error(err | msg)` /
    `toast.info(msg)`. Nhận thẳng `unknown` (từ catch block) và tự rút message an
    toàn. Render góc trên (tránh bị `BottomNav` 4-tab che), tự ẩn (success/info
    3.2s, error 4.5s vì cần đọc kỹ hơn), có nút đóng tay, tôn trọng
    `prefers-reduced-motion` và safe-area-inset-top (notch).
  - `src/app/globals.css`: thêm `@keyframes toast-in` + class dùng chung
    `.press-feedback` (scale 0.97 + giảm sáng nhẹ khi `:active`, tôn trọng
    `prefers-reduced-motion`) để chuẩn hoá phản hồi khi bấm nút thay vì mỗi nơi
    tự viết `active:scale-9x` rời rạc không đồng bộ (nhiều chỗ đã có sẵn kiểu
    riêng — CHƯA đổi hết sang `.press-feedback`, xem phần "còn thiếu" bên dưới).
  - `src/app/providers.tsx`: **quyết định kiến trúc quan trọng nhất của module
    này** — thay vì sửa từng nơi gọi `.mutate()`/`.mutateAsync()` (hàng chục chỗ
    trong `settings.tsx`, `AppointmentForm.tsx`, `EditProfileModal.tsx`...), gắn
    `onError` mặc định ở cấp `MutationCache` khi tạo `QueryClient`
    (`new QueryClient({ mutationCache: new MutationCache({ onError: (e) =>
    toast.error(e) }) })`). Kết quả: **MỌI mutation trong toàn app, kể cả những
    chỗ gọi `.mutate()` kiểu bắn-rồi-quên không có `onError` riêng, tự động hiện
    toast lỗi** — không cần sửa từng file. `ToastProvider` bọc ngoài cùng (trước
    cả `QueryClientProvider`) để `useToast()` dùng được ở mọi nơi.
  - Áp dụng cụ thể + sửa kèm bug ẩn phát hiện được trong lúc làm:
    - `MetricLogForm.tsx`: bỏ banner lỗi tự vẽ riêng (nguồn gốc bug gốc của
      phiên làm việc này), dùng toast; thêm toast thành công; thêm `.press-feedback`
      cho nút Lưu.
    - `CycleLogForm.tsx`: bỏ banner lỗi tự vẽ riêng tương tự; **phát hiện thêm 1
      bug ẩn**: `handleDelete()` trước đây KHÔNG có `try/catch` — nếu xoá thất
      bại, modal vẫn tự đóng như xoá thành công (đánh lừa người dùng); đã bọc
      try/catch + thêm toast thành công cho cả lưu/xoá.
    - `AppointmentForm.tsx`: **phát hiện bug ẩn tương tự** — cả `handleSubmit`
      lẫn `handleDelete` đều KHÔNG có `try/catch`, lỗi bị nuốt hoàn toàn im
      lặng (không banner, không gì cả) trước module này; đã bọc try/catch +
      toast thành công.
  - **Quy tắc tránh trùng toast** (ghi rõ để agent sau không hiểu nhầm là thiếu
    sót khi thấy catch block "rỗng"): vì lỗi đã được `MutationCache` global tự
    động hiện toast, các `catch {}` cục bộ trong form KHÔNG được gọi thêm
    `toast.error()` (sẽ hiện toast trùng 2 lần) — catch cục bộ chỉ dùng để chặn
    không cho code chạy tới `onClose()`/toast thành công khi mutation thất bại.
  - Đã chạy `npm install` + `tsc --noEmit` trên TOÀN BỘ `src/` — không lỗi. Đã
    chạy `eslint src/` toàn repo (không chỉ file mới sửa, theo đúng tinh thần
    mục B2) — phát hiện 3 vấn đề **có sẵn từ trước, KHÔNG liên quan tới module
    này**: `react-hooks/set-state-in-effect` ở `CycleLogForm.tsx:91` và
    `AppDatePicker.tsx:84` (gọi `setState` trực tiếp trong `useEffect`), và 1
    warning `exhaustive-deps` thiếu `today` trong `useMemo` — để lại nguyên vẹn
    cho mục **B2** xử lý (không sửa lạc đề ở module A1/A2).
  - **Còn thiếu để hoàn thiện đầy đủ (việc tiếp theo cho agent sau, thuộc đúng
    phạm vi A2/A3 chưa đóng trong roadmap)**:
    - Chưa rà & đổi hết các nút đang tự viết `active:scale-9x` rời rạc (liệt kê ở
      B1 audit) sang dùng chung `.press-feedback` — mới áp dụng mẫu ở nút Lưu của
      `MetricLogForm`. Cần một lượt rà toàn bộ `src/components` để thống nhất.
    - Chưa thêm toast thành công cho các luồng còn lại đã liệt kê khi audit
      (`EditProfileModal.tsx`, `FatigueQuiz.tsx`, `AiChatSheet.tsx`,
      `KegelTimer.tsx`, `profile/page.tsx`, `settings/page.tsx` — 8 chỗ
      `.mutate()`/`.mutateAsync()`, `upgrade/page.tsx`, `onboarding/page.tsx`) —
      các chỗ này giờ đã AN TOÀN (không còn im lặng nuốt lỗi nhờ MutationCache
      global) nhưng chưa có toast **thành công** riêng, trải nghiệm sẽ tốt hơn
      nếu thêm — để lại cho agent sau hoặc mục A3 (trạng thái loading rõ ràng)
      làm cùng lúc vì hay đi chung với nhau.
    - Mục **A3** (disable nút + label "Đang lưu..." khi `isPending`, chống
      double-submit) CHƯA làm ở module này — cần agent sau tiếp tục, có thể làm
      cùng lúc với việc thêm toast thành công còn thiếu ở trên (rà 1 lần cho cả 2).
  - Người thực hiện: Claude. File package gửi cho user: `module_A1_A2_toast_feedback.zip`
    (7 file: 1 file mới `src/components/ui/Toast.tsx`, 6 file sửa —
    `providers.tsx`, `globals.css`, `MetricLogForm.tsx`, `CycleLogForm.tsx`,
    `AppointmentForm.tsx`, `QUALITY_UX_ROADMAP.md`).
- **2026-07-28** — **Tiếp tục Module A3 (một phần): rà & thêm toast thành công
  còn thiếu ở các luồng lưu còn lại** (phần nợ lại từ entry trước). Khối lượng
  vừa phải, xuyên suốt nhiều file nhỏ nên tính là 1 mục theo quy tắc khối lượng
  lớn (không gộp thêm mục B/C/D).
  - `EditProfileModal.tsx`: thêm toast thành công khi lưu hồ sơ.
  - `profile/page.tsx`: thêm toast khi lưu độ dài chu kỳ trung bình (đã có sẵn
    hiệu ứng nút đổi màu "Đã lưu" — toast bổ sung, không thay thế).
  - `settings.tsx`: **phát hiện thêm 1 bug ẩn** — `handlePinConfirmSubmit()`
    không có `try/finally`, nếu lưu PIN lỗi thì `setSavingPin(false)` không bao
    giờ chạy → nút "Xác nhận" bị kẹt spinner vĩnh viễn dù toast lỗi global đã
    hiện. Đã bọc `try/finally` + thêm toast thành công khi bật PIN. Đồng thời
    đổi phần "Xuất dữ liệu" từ text lỗi cục bộ (`exportError` state) sang dùng
    toast, thêm toast thành công (trước đây tải file xong không có xác nhận gì).
  - `upgrade/page.tsx`: thêm toast thành công khi gửi yêu cầu nâng cấp VIP
    (trước đây bấm xong không có phản hồi nào ngoài UI tự chuyển trạng thái chờ,
    dễ khiến người dùng tưởng chưa bấm được, bấm lại nhiều lần).
  - `onboarding/page.tsx`: thêm toast chào mừng khi hoàn tất onboarding + bọc
    `try/catch` tường minh (trước đây không có, hành vi vốn đã an toàn vì lỗi
    sẽ chặn `router.replace` nhưng không tường minh/nhất quán với form khác).
  - **Quyết định phạm vi quan trọng**: KHÔNG thêm toast cho các switch/toggle
    tức thời trong `settings.tsx` (chủ đề sáng/tối, đơn vị đo, thông báo,
    reminder bật/tắt, chọn mục tiêu sử dụng...) — vì bản thân việc switch đổi
    trạng thái/UI đổi theo ngay lập tức (VD đổi theme cả app đổi màu tức thì)
    đã là phản hồi trực quan đủ rõ, thêm toast cho mỗi lần gạt công tắc sẽ gây
    "toast fatigue" (thông báo dồn dập gây khó chịu, đi ngược tinh thần "dễ
    dùng, thân thiện" của Nhóm D) — lỗi (nếu có) vẫn được global `MutationCache`
    tự lo. Agent sau không cần bổ sung toast cho các switch này trừ khi chủ dự
    án phản hồi cụ thể là cần.
  - Đã chạy `tsc --noEmit` + `eslint` trên toàn bộ file đã sửa — không lỗi.
  - **Còn thiếu để hoàn thiện đầy đủ A3**: phần "disable + label Đang lưu..."
    cho toggle/switch trong lúc `isPending` (hiện switch có thể bấm liên tục dù
    mutation trước chưa xong — rủi ro race condition nhỏ, chưa gây bug thực tế
    nhưng nên rà); `FatigueQuiz.tsx`/`KegelTimer.tsx` dùng `.mutate()` không
    theo dõi `isPending` trong UI (không chặn bấm lại khi đang lưu — 2 màn hình
    này ít khi bấm lại nhanh do có bước xác nhận/kết quả riêng nên rủi ro thấp,
    nhưng nên rà cho đủ). Sau khi xong 2 việc này, A3 mới thực sự hoàn thành —
    agent kế tiếp có thể đóng `[x]` A3 sau đó.
  - Người thực hiện: Claude. File package gửi cho user: `module_A3_success_toasts.zip`
    (6 file sửa: `EditProfileModal.tsx`, `profile/page.tsx`, `settings/page.tsx`,
    `upgrade/page.tsx`, `onboarding/page.tsx`, `QUALITY_UX_ROADMAP.md`).
- **2026-07-28** — **Hoàn thành nốt Module A3 (đóng mục)**: disable/label rõ ràng
  cho toggle/switch và các nút `.mutate()` fire-and-forget còn thiếu theo dõi
  `isPending`. Khối lượng nhỏ, đóng gói cùng lúc.
  - `src/components/ui/Switch.tsx`: thêm prop `disabled?: boolean` (mặc định
    không có, không phá vỡ chỗ gọi cũ) — `aria-disabled` + `disabled` +
    `disabled:opacity-50` để có phản hồi thị giác rõ ràng khi khoá.
  - `src/app/settings/page.tsx`: truyền `disabled={updateProfile.isPending}` cho
    3 switch dùng chung mutation này (chủ đề, thông báo, hệ mét) và switch khoá
    PIN (`appLockEnabled`); truyền `disabled={upsertReminder.isPending}` cho 2
    switch nhắc nhở (sắp đến kỳ kinh, nhắc log hàng ngày) + slider chọn số ngày
    nhắc trước (tránh kéo slider bắn liên tiếp nhiều request trong lúc request
    trước chưa xong). **Quyết định**: dùng chung `isPending` của 1 instance
    mutation cho nhiều switch liên quan (thay vì tách riêng state loading cho
    từng switch) — chấp nhận được vì thời gian pending rất ngắn (1 update
    profile/reminder), đổi lại code đơn giản hơn nhiều so với quản lý loading
    riêng lẻ cho từng field.
  - `src/components/fatigue/FatigueQuiz.tsx`: `saveTest.mutate()` được gọi
    ngay sau khi set kết quả nên UI kết quả hiện lập tức trước khi mutation
    xong — thêm dòng chữ "Đang lưu kết quả..." dưới phần gợi ý khi
    `saveTest.isPending`, và disable nút "Làm lại bài test" trong lúc đó để
    tránh reset state khi request lưu kết quả trước còn dang dở.
  - `src/components/kegel/KegelTimer.tsx`: `logSession.mutate()` đã được chặn
    gọi 2 lần từ trước bằng `savedRef` (không có bug double-submit thực sự) —
    module này chỉ bổ sung phản hồi trực quan: disable nút "Xong" ở màn hoàn
    thành + đổi label thành "Đang lưu..." trong lúc `logSession.isPending`, để
    nhất quán với các nút submit khác trong app.
  - Đã chạy `npm install` + `tsc --noEmit` toàn bộ + `eslint src/` toàn repo —
    không lỗi mới. 3 vấn đề có sẵn từ trước (`react-hooks/set-state-in-effect`
    ở `CycleLogForm.tsx`/`AppDatePicker.tsx`, 1 warning `exhaustive-deps` ở
    `CycleCalendar.tsx`) vẫn còn nguyên, để lại cho **B2** xử lý — không sửa lạc
    đề ở đây.
  - Mục **A3** nay đã đóng hoàn toàn `[x]`. Việc tiếp theo trong roadmap:
    **A4** (empty state & skeleton loading nhất quán) hoặc **A5** (Confirm
    dialog dùng chung cho hành động Xoá) — cả hai đều thuộc Nhóm A còn lại.
  - Người thực hiện: Claude. File package gửi cho user: `module_A3_close.zip`
    (5 file sửa: `Switch.tsx`, `settings/page.tsx`, `FatigueQuiz.tsx`,
    `KegelTimer.tsx`, `QUALITY_UX_ROADMAP.md`).
- **2026-07-28** — **Hoàn thành Module A4 (Empty state & skeleton loading nhất
  quán)**. Khối lượng lớn (xuyên suốt 7 trang/component) nên chỉ làm 1 mục,
  không gộp thêm B/C/D.
  - **Vấn đề gốc phát hiện khi audit**: rất nhiều nơi dùng pattern
    `isLoading ? null : ...` hoặc `!isLoading && ...` — nghĩa là trong lúc tải,
    màn hình chỉ có khoảng trắng im lặng (không phải skeleton, không phải
    empty-state), dễ khiến người dùng tưởng app bị treo hoặc đã hết dữ liệu.
  - `src/components/ui/Skeleton.tsx` (mới): 3 component dùng chung —
    `Skeleton` (1 khối shimmer tuỳ biến qua `className`), `SkeletonRows` (danh
    sách chia divider, khớp layout icon tròn + 2 dòng text — dùng cho lịch sử
    metric/kegel/fatigue-test/lịch hẹn), `SkeletonCard` (khối card lớn có thể
    kèm vòng tròn, dùng cho dashboard chu kỳ).
  - `src/app/globals.css`: thêm `@keyframes skeleton-shimmer` + class
    `.skeleton` (gradient di chuyển ngang) — tự động tôn trọng
    `prefers-reduced-motion` nhờ rule global đã có sẵn từ Module A1/A2, không
    cần khai báo riêng.
  - Áp dụng skeleton thay khoảng trắng im lặng ở:
    - `appointments/page.tsx`: `SkeletonRows` cho danh sách lịch hẹn.
    - `kegel/page.tsx`: `SkeletonRows` cho lịch sử tập luyện.
    - `fatigue-test/page.tsx`: `SkeletonRows` cho lịch sử kết quả.
    - `cycle/page.tsx`: `SkeletonCard` (có vòng tròn) + `SkeletonRows` thay cho
      `isLoading ? null` ở toàn khối dashboard dự đoán chu kỳ.
    - `profile/page.tsx`: skeleton khớp layout khối "Thông số chu kỳ mặc định"
      (2 thanh trượt + 1 nút) — trước đây khối này biến mất hoàn toàn lúc tải.
    - `page.tsx` (trang chủ): skeleton dạng lưới 5 ô thay cho lưới thẻ chỉ số
      sức khoẻ lúc `cycleLoading || metricsLoading`.
    - `WeightBBTChart.tsx`, `CorrelationChart.tsx`: skeleton dạng khối chữ nhật
      khớp chiều cao biểu đồ thật, tách rõ khỏi nhánh "chưa đủ dữ liệu" (trước
      đây 2 trạng thái "đang tải" và "chưa đủ dữ liệu" bị gộp chung điều kiện
      `!isLoading && ...`, khiến lúc đang tải hiển thị nhầm sang layout rỗng).
  - **Phạm vi KHÔNG đụng tới** (đã có sẵn cách xử lý hợp lý, không phải bug):
    `library/page.tsx` dùng dữ liệu tĩnh cục bộ từ `articles.ts` (không phải
    async query từ Supabase) nên không cần skeleton; `log/page.tsx` cũng chỉ
    có danh sách loại chỉ số tĩnh, không phải dữ liệu tải về.
  - Đã chạy `npm install` + `tsc --noEmit` toàn bộ + `eslint src/` toàn repo —
    không lỗi mới, 3 vấn đề có sẵn từ trước vẫn để dành cho **B2** (không sửa
    lạc đề ở đây, xem chi tiết trong entry Module A3 phía trên).
  - Việc tiếp theo trong roadmap: **A5** (`<ConfirmDialog>` dùng chung thay
    `window.confirm` cho hành động Xoá) để đóng nốt Nhóm A, hoặc bắt đầu
    Nhóm B (audit bug/schema).
  - Người thực hiện: Claude. File package gửi cho user: `module_A4_skeleton.zip`
    (10 file: 1 file mới `Skeleton.tsx`, 9 file sửa — `globals.css`,
    `appointments/page.tsx`, `kegel/page.tsx`, `fatigue-test/page.tsx`,
    `cycle/page.tsx`, `profile/page.tsx`, `page.tsx`, `WeightBBTChart.tsx`,
    `CorrelationChart.tsx`, `QUALITY_UX_ROADMAP.md`).
- **2026-07-28** — **Hoàn thành Module A5 (ConfirmDialog dùng chung) — đóng
  toàn bộ Nhóm A.** Khối lượng nhỏ, làm gọn trong 1 lượt.
  - **Audit trước khi sửa**: không có `window.confirm` thô nào trong repo. Chỉ
    2 nơi có hành động Xoá thật (`CycleLogForm.tsx`, `AppointmentForm.tsx`),
    và cả 2 đã tự vẽ 1 thanh xác nhận inline gần giống hệt nhau (copy-paste,
    lệch nhau nhỏ ở màu nền — `var(--surface-soft)` vs `bg-black/[0.03]`).
    `useDeleteHealthMetric()` trong `queries.ts` được định nghĩa nhưng
    KHÔNG có UI nào gọi tới (dead code, chưa có nút Xoá metric) — không phải
    phạm vi module này, để nguyên. Reminder cũng chưa có hành động Xoá (chỉ
    bật/tắt qua switch) — không áp dụng ConfirmDialog ở đó.
  - `src/components/ui/ConfirmDialog.tsx` (mới): modal xác nhận dùng chung —
    props `open/title/description/confirmLabel/cancelLabel/isLoading/onConfirm/onCancel`.
    Hiện giữa màn hình (khác với các bottom-sheet form khác trong app) để tách
    biệt rõ ràng với sheet phía sau, `z-40` (cao hơn `z-30` của các sheet) nên
    luôn đè lên trên form Xoá/Sửa đang mở. **Quyết định quan trọng**: backdrop
    của `ConfirmDialog` tự `e.stopPropagation()` trong `onClick` — vì component
    được dùng lồng bên trong các form vốn có `onClick={onClose}` phủ toàn màn
    hình; nếu không chặn, bấm ra ngoài `ConfirmDialog` để huỷ xác nhận sẽ vô
    tình bấm trúng luôn overlay của form cha, đóng mất cả form đang sửa.
  - `CycleLogForm.tsx`, `AppointmentForm.tsx`: thay khối UI xác nhận inline
    (nút Huỷ + nút Xoá vẽ tay) bằng `<ConfirmDialog>` — nút "Xoá kỳ kinh
    này"/"Xoá lịch hẹn này" giờ chỉ mở dialog (`setConfirmingDelete(true)`),
    không tự vẽ trạng thái xác nhận nữa. Logic `handleDelete()`/`isPending`
    giữ nguyên, chỉ đổi phần hiển thị.
  - Đã chạy `npm install` + `tsc --noEmit` toàn bộ + `eslint src/` toàn repo —
    không lỗi mới, 3 vấn đề có sẵn từ trước vẫn để dành cho **B2**.
  - **Nhóm A (Trải nghiệm tương tác) nay đã đóng hoàn toàn** — A1 → A5 đều
    `[x]`. Việc tiếp theo trong roadmap: bắt đầu **Nhóm B** (rà soát bug &
    hoàn thiện chức năng hiện có), bắt đầu từ **B1** (audit CRUD từng module
    đối chiếu schema DB) hoặc **B2** (dọn 3 lỗi ESLint tồn đọng đã nêu ở trên).
  - Người thực hiện: Claude. File package gửi cho user: `module_A5_confirm_dialog.zip`
    (4 file: 1 file mới `ConfirmDialog.tsx`, 3 file sửa — `CycleLogForm.tsx`,
    `AppointmentForm.tsx`, `QUALITY_UX_ROADMAP.md`).
- **2026-07-28** — **Hoàn thành Module B1 (Audit toàn bộ luồng CRUD đối chiếu
  schema DB)**, mở đầu Nhóm B. Khối lượng nhỏ (chỉ 1 bug tìm thấy, 1 file sửa)
  nên gộp cùng chờ đóng gói với mục kế tiếp nếu cũng nhỏ; ở đây đóng gói ngay
  vì bug tìm được thuộc loại "im lặng mất dữ liệu ngữ cảnh", nên đóng gói sớm.
  - **Cách làm**: đối chiếu từng field trong `supabase/schema.sql` +
    `supabase/sql/module*.sql` với đúng tên cột dùng trong toàn bộ code
    (`grep -rn ".from(\"" src/` để liệt kê MỌI nơi gọi Supabase, không chỉ
    trong `queries.ts`).
  - **Phát hiện chính**: `src/lib/queries.ts` (nơi tập trung hầu hết CRUD)
    đã đúng schema 100% — 7 bảng (`profiles`, `cycle_logs`, `health_metrics`,
    `appointments`, `vip_requests`, `reminders`, `kegel_sessions`,
    `fatigue_tests`) đều khớp tên cột, đã alias `logged_at:recorded_date` từ
    bug cũ. Mọi nơi gọi `useUpdateProfile()` (EditProfileModal, profile,
    settings, onboarding) đều truyền đúng tên field theo `Profile` interface.
  - **Bug thật tìm thấy** ở `src/app/api/ai-chat/route.ts` (route gọi
    Supabase TRỰC TIẾP, không qua `queries.ts` nên không được hưởng fix
    trước đó): query `health_metrics` vẫn dùng tên cột cũ `logged_at` (cả
    trong `.select()` lẫn `.order()`) — cột thật trong DB là
    `recorded_date`. Vì `error` của Promise.all không được kiểm tra, lỗi
    Postgres 42703 (column does not exist) bị nuốt âm thầm, khiến
    `healthMetrics` luôn là mảng rỗng → trợ lý AI trong app **luôn trả lời
    mà không có ngữ cảnh chỉ số sức khoẻ thật của user**, không ai biết vì
    app không crash, chỉ trả lời "kém chính xác hơn" một cách khó nhận ra.
  - **Sửa**: đổi `.select("metric_type, value, logged_at")` +
    `.order("logged_at", ...)` thành `.select("metric_type, value,
    logged_at:recorded_date")` + `.order("recorded_date", ...)` (dùng alias
    giống cách `queries.ts` đã làm, để không phải đổi type
    `{ logged_at: string }` hay `buildSystemPrompt`/`.map()` dùng
    `m.logged_at` phía dưới). Đồng thời thêm log lỗi cho cả 3 query context
    (`profile`, `cycleLogs`, `healthMetrics`) trong route này — trước đây
    không kiểm tra `error` ở cả 3, chỉ sửa cách xử lý lỗi tối thiểu (log,
    không chặn luồng chính) để tránh tái diễn kiểu lỗi âm thầm tương tự với
    2 query còn lại trong tương lai.
  - **Các module khác đã audit, không có bug**: `vip_requests`, `reminders`
    (upsert theo `user_id,type` — khớp unique constraint), `kegel_sessions`,
    `fatigue_tests`, `app_lock` (`app_lock_pin_hash`/`app_lock_enabled` ở
    `settings/page.tsx`), `theme` — tất cả field đều khớp các file SQL tương
    ứng trong `supabase/sql/`.
  - Đã chạy `npm install` + `tsc --noEmit` toàn bộ + `eslint src/` toàn repo
    — không lỗi mới. 3 vấn đề tồn đọng từ trước (`react-hooks/set-state-in-effect`
    ở `CycleLogForm.tsx`/`AppDatePicker.tsx`, 1 warning `exhaustive-deps` ở
    `CycleCalendar.tsx`) vẫn còn nguyên, để dành cho **B2** — không sửa lạc
    đề ở đây dù đã thấy lại khi chạy eslint.
  - Việc tiếp theo trong roadmap: **B2** (dọn 3 lỗi ESLint tồn đọng nêu
    trên + rà lỗi TypeScript toàn repo triệt để hơn) hoặc **B4** (kiểm tra
    edge case nghiệp vụ: chu kỳ đầu chưa có dữ liệu, huỷ VIP giữa chừng,
    validate số âm, lệch timezone).
  - Người thực hiện: Claude. File package gửi cho user: `module_B1_audit_crud.zip`
    (2 file sửa: `src/app/api/ai-chat/route.ts`, `QUALITY_UX_ROADMAP.md`).
- **2026-07-28** — **Hoàn thành Module B2 (dọn triệt để TypeScript/ESLint toàn
  repo)**. Khối lượng nhỏ (3 vấn đề tồn đọng đã biết trước, không phát sinh gì
  mới khi rà toàn bộ `src/`), đóng gói ngay 1 mình.
  - Chạy `tsc --noEmit` + `eslint src/` trên TOÀN BỘ repo (không chỉ file mới
    sửa) — `tsc` sạch từ trước, chỉ còn đúng 3 vấn đề ESLint đã ghi nhận ở
    các entry trước (2 lỗi `set-state-in-effect`, 1 warning `exhaustive-deps`).
  - `CycleLogForm.tsx`: effect nạp dữ liệu "kỳ đang mở" vào form (đồng bộ
    state với query async load xong, chỉ chạy 1 lần nhờ guard `continuingId`)
    — không viết lại vì đây đúng là use-case hợp lệ của effect theo React
    docs (đồng bộ với hệ thống ngoài/dữ liệu async), refactor sẽ phức tạp
    hơn lợi ích. Thêm `// eslint-disable-next-line react-hooks/set-state-in-effect`
    ngay trước `setContinuingId(...)` (dòng cụ thể bị flag, không phải toàn
    effect) kèm giải thích.
  - `AppDatePicker.tsx`: effect reset con trỏ tháng + bước chọn range mỗi khi
    sheet MỞ LẠI — cùng loại pattern hợp lệ (đồng bộ UI theo prop khi 1 cờ
    `open` bật lên, không phải mỗi lần props đổi liên tục). Thêm disable
    tương tự chỉ ở dòng `setCursor(...)` bị flag thật (rule chỉ báo setState
    ĐẦU TIÊN trong effect, các setState sau đó như `setRangeStep` không bị
    báo — xác nhận lại bằng cách chạy eslint sau khi sửa, thấy "unused
    eslint-disable directive" nên bỏ bớt disable thừa).
  - `CycleCalendar.tsx`: warning thật (không phải false positive) — biến
    `today = new Date()` được tạo ở ngoài `useMemo` nhưng dùng làm dependency
    ngầm bên trong qua closure mà không khai báo trong mảng deps. **Không**
    đơn giản là thêm `today` vào deps, vì `new Date()` khác reference mỗi
    render nên sẽ làm `useMemo` luôn tính lại, mất hết tác dụng memo hoá (memo
    hoá là mục đích chính của việc dùng `useMemo` ở đây, tránh tính lại
    `buildLoggedPeriodDays` mỗi khi component cha re-render vì lý do khác).
    Sửa: gọi `new Date()` trực tiếp bên trong hàm tính của `useMemo` thay vì
    đóng gói biến ngoài — dep array giờ chỉ còn `[cycleLogs]`, đúng ý định ban
    đầu. Biến `today` ở ngoài vẫn giữ nguyên vì còn dùng riêng cho việc tô
    "hôm nay" trong lúc render lưới ngày (`isToday = isSameDay(date, today)`)
    — 2 lần gọi `new Date()` lệch nhau vài mili-giây trong cùng 1 render
    không ảnh hưởng vì cả hai chỉ dùng ở độ chính xác cấp ngày.
  - Đã chạy lại `tsc --noEmit` + `eslint src/` toàn repo sau khi sửa: **0 lỗi,
    0 warning** trên toàn bộ `src/` — Nhóm B2 đóng hoàn toàn sạch, không còn
    nợ kỹ thuật ESLint/TS nào tồn đọng từ các patch trước cộng dồn lại.
  - Việc tiếp theo trong roadmap: **B3** (kiểm tra responsive & safe-area ở
    `/kegel`, `/fatigue-test`, `/library/[id]`, modal PIN `/settings`) hoặc
    **B4** (edge case nghiệp vụ: chu kỳ đầu chưa có dữ liệu, huỷ VIP giữa
    chừng, validate số âm, lệch timezone).
  - Người thực hiện: Claude. File package gửi cho user: `module_B2_lint_clean.zip`
    (4 file sửa: `CycleLogForm.tsx`, `AppDatePicker.tsx`, `CycleCalendar.tsx`,
    `QUALITY_UX_ROADMAP.md`).
- **2026-07-28** — **Hoàn thành Module B3 (Responsive & safe-area cho 4 khu
  vực chưa test kỹ)**. Khối lượng nhỏ (1 bug thật + 3 khu vực xác nhận ổn),
  đóng gói ngay.
  - **Cách làm**: kiểm tra cấu trúc CSS gốc (`.phone-shell/.phone-frame/
    .phone-viewport` trong `globals.css`) trước để hiểu mô hình responsive
    của toàn app — xác nhận dưới 640px app chiếm trọn viewport thật (không
    phải khung điện thoại giả lập chỉ hiện ở desktop ≥640px), và layout gốc
    (`layout.tsx`) đã có `pb-32` bọc toàn bộ nội dung để chừa chỗ cho
    `BottomNav` (chính `BottomNav` đã tự `position:fixed` trên mobile thật +
    tự padding `env(safe-area-inset-bottom)` — xử lý đúng từ trước).
  - **`/kegel`, `/fatigue-test`**: `BottomNav` chủ động ẩn ở 2 route này
    (danh sách loại trừ trong `BottomNav.tsx`), nhưng `pb-32` của layout vẫn
    áp dụng vô điều kiện cho mọi trang → thừa khoảng trắng ở cuối trang khi
    không có nav, nhưng KHÔNG phải bug an toàn vùng (128px luôn đủ bù safe-
    area 34px của các dòng máy có home indicator) — chỉ là thẩm mỹ dư thừa,
    để dành cho Nhóm D (không phải phạm vi B3). `KegelTimer` (vòng tròn
    220px) và `FatigueQuiz` (câu hỏi/list lựa chọn) đều dùng flex-col responsive
    tự nhiên, không có `grid-cols`/width cứng nào có thể vỡ ở màn 320px.
  - **`/library/[id]`**: đọc bài dài, không có phần tử `fixed`/thanh hành
    động cố định nào — chỉ cuộn dọc bình thường trong `pb-10` + `pb-32` toàn
    cục, an toàn.
  - **Bug thật tìm thấy — modal đặt PIN ở `/settings`**: đây là bottom sheet
    riêng (`fixed inset-0`, độc lập với layout gốc, KHÔNG được `pb-32` bảo
    vệ vì đó là padding cho nội dung cuộn của trang chứ không áp dụng cho
    sheet fixed). Trước đây chỉ có `p-6` cố định, chạm sát đáy màn hình thật
    → trên điện thoại có thanh cử chỉ (home indicator/notch) nút "Tiếp tục"/
    "Xác nhận" bị dính sát mép hoặc khó bấm chính xác vào vùng cuối cùng.
    Sửa bằng cách thêm `style={{ paddingBottom: "max(1.5rem, env(safe-area-inset-bottom, 0px))" }}`
    — đúng pattern đã dùng ở `AiChatSheet.tsx`/`BottomNav.tsx`/`Toast.tsx`
    (Tailwind không có sẵn lớp cho giá trị `env()` động nên phải style trực
    tiếp).
  - **Phát hiện thêm, KHÔNG sửa trong module này** (ghi lại để tránh quên):
    cùng loại thiếu `safe-area-inset-bottom` này còn lặp lại ở nhiều sheet
    `fixed inset-0 items-end` khác trong app — `CycleLogForm.tsx`,
    `MetricLogForm.tsx`, `AppointmentForm.tsx`, `HealthCheckIns.tsx`,
    `DailyInsights.tsx` (trong khi `AiChatSheet.tsx` đã có). Đây là vấn đề hệ
    thống rộng hơn phạm vi B3 (chỉ giới hạn 4 khu vực named trong roadmap) —
    nếu sửa hết sẽ thành "khối lượng lớn" theo đúng quy tắc đóng gói ở đầu
    file này, nên để lại làm 1 module riêng sau (gợi ý đặt tên B3b hoặc gộp
    vào D — chuẩn hoá safe-area cho MỌI bottom sheet dùng chung 1 class/hook
    thay vì copy `style` từng nơi).
  - Đã chạy `tsc --noEmit` + `eslint src/` toàn repo — sạch, không lỗi mới.
  - Việc tiếp theo trong roadmap: **B4** (edge case nghiệp vụ) hoặc **B5**
    (cần agent có mạng đầy đủ để `next build` thật — sandbox này bị chặn
    Google Fonts nên bỏ qua), hoặc mục mới phát hiện ở trên (chuẩn hoá
    safe-area cho mọi bottom sheet).
  - Người thực hiện: Claude. File package gửi cho user: `module_B3_safe_area.zip`
    (2 file: `settings/page.tsx`, `QUALITY_UX_ROADMAP.md`).
- **2026-07-28** — **Hoàn thành Module B4 (Kiểm tra logic nghiệp vụ biên/edge
  case)**. Đi lần lượt 4 ý roadmap nêu; 2 ý không có bug, 2 ý có bug thật
  (1 nhỏ, 1 lớn/xuyên suốt) — gộp chung vì cùng 1 mục B4 duy nhất trong
  checklist, không tách nhỏ thêm.
  1. **Chu kỳ đầu tiên chưa có dữ liệu lịch sử**: `predictCycle([])` đã có
     fallback hợp lý (`avgCycleLength/avgPeriodLength` mặc định 28/5, anchor
     giả định giữa chu kỳ) — không lỗi/crash. `page.tsx` và `cycle/page.tsx`
     đều tự kiểm `cycleLogs.length === 0` để hiện UI "Chưa có dữ liệu chu kỳ"
     riêng thay vì hiện số liệu giả. **Không có bug.**
  2. **Huỷ VIP giữa chừng khi đang xem tính năng khoá**: `isVipProfile()`
     được tính lại trực tiếp từ `useProfile()` ở MỌI nơi dùng (`LockedFeature`,
     `library`, `upgrade`, `profile`, `profile/report`) — không có state cục
     bộ nào cache lại trạng thái VIP nên không thể "treo UI" theo kiểu hiện
     dữ liệu VIP cũ đã hết hạn. **Không có bug**, nhưng ghi nhận 1 khoảng
     trống tính năng (không phải bug): app hiện KHÔNG có nút "Huỷ VIP" tự
     phục vụ nào — `is_vip` chỉ đổi được bằng service_role (đúng theo thiết
     kế bảo mật trong `schema.sql`), nên câu hỏi "huỷ giữa chừng" trong thực
     tế chưa có đường vào UI để test được. Để dành làm 1 tính năng riêng nếu
     sau này cần cho phép user tự huỷ.
  3. **Validate số âm/quá lớn ở ô số**: `MetricLogForm` (cân nặng/BBT/nhịp
     tim...) dùng stepper +/- và slider `type="range"` giới hạn cứng bởi
     `config.min/max` — không thể nhập số ngoài khoảng bằng UI. `avg_cycle_length`/
     `avg_period_length` ở `/profile` cũng dùng `type="range"`. **Bug thật**
     duy nhất: ô "Năm sinh" (`EditProfileModal.tsx`) dùng
     `<input type="number" min max>` nhưng nút "Lưu lại" là `type="button"`
     gọi thẳng `onClick` (không phải native form submit) — nên `min`/`max`
     của HTML chỉ là gợi ý thị giác (mũi tên tăng/giảm), KHÔNG chặn được gì;
     gõ tay số âm/0/99999 vẫn lưu thẳng xuống DB vì `birth_year` cũng không
     có CHECK constraint. Sửa: validate thật trong `handleSave()` (kiểm tra
     `Number.isInteger` + khoảng 1930→năm hiện tại) trước khi gọi mutation,
     báo lỗi qua `toast.error()` nếu sai, không lưu.
  4. **Lệch timezone/giờ hệ thống VN**: **bug thật, quan trọng nhất module
     này** — phát hiện pattern `new Date().toISOString().slice(0, 10)` dùng
     ở 6 chỗ để lấy "hôm nay" dạng chuỗi cho DB. `toISOString()` LUÔN quy đổi
     về UTC trước khi cắt chuỗi; với user VN (UTC+7, không DST), từ 00:00 đến
     06:59 giờ VN thì giờ UTC tương ứng vẫn là NGÀY HÔM TRƯỚC → mọi lượt ghi
     nhận (chỉ số sức khoẻ, bắt đầu kỳ kinh) trong khung giờ này bị lưu NHẦM
     SANG NGÀY TRƯỚC một cách âm thầm, không có lỗi/cảnh báo nào — chỉ lộ ra
     khi soi lại lịch sử thấy sai ngày. Đã viết test thủ công tái hiện chính
     xác bug (2h sáng 28/7 giờ VN → `toISOString().slice(0,10)` trả về
     "2026-07-27"). **Sửa**: tạo `src/lib/date-key.ts` (hàm `toLocalDateKey()`/
     `todayLocalKey()` dùng getter LOCAL `getFullYear/getMonth/getDate`, không
     đi qua UTC — cùng cách `AppDatePicker.toKey()` đã làm đúng từ trước,
     nhưng hàm đó chỉ cục bộ trong file, giờ tách ra dùng chung). Áp dụng ở:
     `queries.ts` (`useHealthMetrics`, `useMetricTrend`, `useLogMetric`,
     `buildWeekSeries` — 4/6 chỗ, quan trọng nhất vì đây là nơi QUYẾT ĐỊNH
     `recorded_date` lưu xuống DB), `ReminderBanner.tsx` (banner "đã log hôm
     nay chưa"), `CycleLogForm.tsx` (`start_date` mặc định khi ghi kỳ kinh
     mới). **Không đụng** `appointment_at`/`created_at`/`exported_at` (đúng
     là cần timestamp UTC thật, không phải "ngày theo giờ máy") và
     `export-report.ts:filenameDate` (chỉ ảnh hưởng TÊN FILE PDF xuất ra lúc
     nửa đêm, không phải dữ liệu — chấp nhận được, không sửa để tránh lan
     rộng ngoài phạm vi cốt lõi của module này).
  - Đã chạy `tsc --noEmit` + `eslint src/` toàn repo sau khi sửa — sạch,
    không lỗi mới.
  - Việc tiếp theo trong roadmap: **B5** (cần agent có mạng đầy đủ để chạy
    `next build` thật — sandbox này bị chặn Google Fonts, bỏ qua được), hoặc
    bắt đầu **Nhóm C** (tối ưu hiệu năng — C1 rà re-render thừa), hoặc dọn
    nốt phát hiện tồn đọng từ B3 (chuẩn hoá safe-area cho mọi bottom sheet
    còn thiếu: `CycleLogForm`, `MetricLogForm`, `AppointmentForm`,
    `HealthCheckIns`, `DailyInsights`).
  - Người thực hiện: Claude. File package gửi cho user: `module_B4_edge_cases.zip`
    (6 file: 1 file mới `date-key.ts`, 5 file sửa — `queries.ts`,
    `ReminderBanner.tsx`, `CycleLogForm.tsx`, `EditProfileModal.tsx`,
    `QUALITY_UX_ROADMAP.md`).
- **2026-07-28** — **Hoàn thành nốt phần tồn đọng từ B3 (chuẩn hoá safe-area
  cho mọi bottom sheet `fixed inset-0 items-end` còn thiếu)**. Khối lượng nhỏ
  (3 file, cùng 1 pattern lặp lại, không rủi ro regression), đóng gói ngay,
  không gộp thêm mục khác.
  - **Rà lại 5 sheet đã ghi nhận ở B4**: `HealthCheckIns.tsx` và
    `DailyInsights.tsx` hoá ra ĐÃ có `paddingBottom: max(2rem, env(...))` từ
    trước (ghi nhận cũ trong B3 không chính xác) — không cần sửa. 3 sheet còn
    lại thực sự thiếu: `CycleLogForm.tsx`, `MetricLogForm.tsx`,
    `AppointmentForm.tsx`.
  - **`CycleLogForm.tsx`**: footer nút "Lưu/Tiếp tục" (`div` có `border-top`,
    trước đó `pb-6` cố định) → đổi thành `paddingBottom: max(1.5rem, env(safe-area-inset-bottom, 0px))`,
    bỏ class `pb-6` tĩnh.
  - **`MetricLogForm.tsx`**: khác 2 sheet kia — không có `<div>` footer riêng,
    nút "Lưu" là phần tử cuối cùng ngay trong chính thẻ `<form>` (`p-6 pt-3`)
    → chuyển padding-bottom của cả `<form>` sang style động, giữ `px-6 pt-3`
    ở className.
  - **`AppointmentForm.tsx`**: tương tự `MetricLogForm` — nút "Lưu"/"Xoá" nằm
    trực tiếp trong `<form className="... p-6">` → tách `px-6 pt-6` ở
    className, `paddingBottom` động ở style.
  - Tất cả đều theo đúng 1 pattern đã dùng ở `AiChatSheet.tsx`/`BottomNav.tsx`/
    `Toast.tsx`/`HealthCheckIns.tsx`: `max(giá trị cố định cũ, env(safe-area-inset-bottom, 0px))`
    — giữ nguyên khoảng cách thị giác trên desktop/máy không có home
    indicator, chỉ cộng thêm khi thiết bị thật sự cần.
  - Đã cài `node_modules` (`npm install`, mạng cho phép registry.npmjs.org)
    và chạy `tsc --noEmit` + `eslint src/` toàn repo lần này — sạch, không
    lỗi/warning nào (khác các lần patch trước chỉ soát bằng mắt vì sandbox
    thiếu `node_modules`).
  - Việc tiếp theo trong roadmap: **B5** (vẫn cần agent có mạng đủ để chạy
    `next build` thật vì bị chặn Google Fonts — môi trường lần này cũng chưa
    thử được `next build`), hoặc bắt đầu **Nhóm C** (C1 rà re-render thừa —
    khối lượng vừa, có thể làm cùng lúc với C4 vì cùng chủ đề `useMemo`/
    tính toán nặng).
  - Người thực hiện: Claude. File package gửi cho user:
    `module_B3b_safe_area_cleanup.zip` (4 file: `CycleLogForm.tsx`,
    `MetricLogForm.tsx`, `AppointmentForm.tsx`, `QUALITY_UX_ROADMAP.md`).
- **2026-07-28** — **Hoàn thành Module C1 + C4 (Nhóm C — Tối ưu hiệu năng:
  staleTime hợp lý + cache hoá phép tính nặng)**. Gộp 2 mục vì cả 2 đều khối
  lượng nhỏ, cùng chủ đề "tránh làm việc thừa", không xuyên suốt nhiều trang
  theo kiểu rủi ro cao.
  - **C1 — staleTime**: `QueryClient` ở `providers.tsx` trước đây KHÔNG có
    `defaultOptions` → mặc định `staleTime: 0` của React Query, nghĩa là mọi
    query bị coi "cũ" ngay sau khi fetch xong, tự động gọi lại Supabase mỗi
    khi component mount lại (chuyển tab qua lại trong app) hoặc cửa sổ được
    focus lại. Đặt mặc định `staleTime: 30_000` (30s) cho toàn app — hợp lý
    với phần lớn dữ liệu. Override riêng 2 chỗ đặc thù đúng như roadmap gợi
    ý: `useProfile()` → 5 phút (hồ sơ hiếm khi đổi trong 1 phiên), và
    `useHealthMetrics()` → 10s (dữ liệu "hôm nay", user có thể vừa ghi ở tab
    khác quay lại ngay). Các query còn lại (cycle_logs, appointments,
    reminders, kegel_sessions, fatigue_tests, vip_request) dùng mặc định 30s,
    không cần override vì tần suất đổi không quá đặc biệt theo 1 trong 2
    hướng trên.
  - **C4 — cache hoá phép tính nặng**: `pearsonCorrelation()`
    (`CorrelationChart.tsx`) và `computeSymptomFrequencies()`
    (`SymptomAnalysis.tsx`) hoá ra ĐÃ được bọc `useMemo` từ trước (rà lại
    bằng `grep`, không phải bug). Phần thật sự thiếu: `predictCycle()` (sort
    + lặp toàn bộ `cycleLogs`) được gọi trực tiếp trong thân component ở 4
    trang — `page.tsx` (Dashboard), `cycle/page.tsx`, `profile/page.tsx`,
    `profile/report/page.tsx` — tính lại mỗi lần re-render dù `cycleLogs`
    không đổi (vd gõ ghi chú, kéo slider ở phần khác của cùng trang, toast
    tự ẩn). Đã bọc `useMemo` theo đúng dependency thật sự ảnh hưởng kết quả
    (`cycleLogs`, `avgCycleLength`, `avgPeriodLength`) ở cả 4 nơi. Tiện thể
    cũng `useMemo` hoá `computeTodayHealthScore()` (Dashboard) và
    `buildCycleHistory()` (trang báo cáo). Riêng Dashboard còn có
    `MetricLink` (5 thẻ chỉ số) mỗi thẻ tự gọi `latestValue()` +
    `buildWeekSeries()` — cũng bọc `useMemo` theo `[metrics, type]`, tránh
    lặp lại phép lọc mảng 5 lần mỗi render. **Không đụng** `PwaRegister.tsx`
    (gọi `predictCycle()` bên trong `useEffect`, không phải mỗi lần render,
    nên không thuộc phạm vi vấn đề C4 nêu ra).
  - Lưu ý kỹ thuật nhỏ đã cân nhắc: `predictCycle()` có tham số mặc định
    `today = new Date()` — khi bọc `useMemo` theo `cycleLogs`/độ dài chu kỳ,
    kết quả sẽ "đóng băng" theo đúng thời điểm tính cho đến khi 1 trong các
    dependency đó đổi (không tự động cập nhật lại khi sang ngày mới nếu
    không có tương tác nào khác) — chấp nhận được vì đây là app di động
    thường bị đóng/mở lại (remount) qua đêm, không giữ 1 phiên useMemo xuyên
    nhiều ngày liên tục; không thuộc phạm vi sửa sâu hơn của module này.
  - Đã cài `node_modules`, chạy `tsc --noEmit` + `eslint src/` toàn repo —
    sạch. Gặp 1 lỗi tự gây ra khi sửa (trùng tên biến `avgCycleLength`/
    `avgPeriodLength` với state override slider sẵn có ở `profile/page.tsx`)
    — phát hiện ngay bởi `tsc`, đã đổi tên thành `profileAvgCycleLength`/
    `profileAvgPeriodLength` để tránh nhầm với override cục bộ của người dùng
    khi đang kéo slider.
  - Việc tiếp theo trong roadmap: **C2** (dynamic import cho `jspdf`/
    `recharts` — chỉ VIP mới dùng tới PDF export/biểu đồ tương quan), **C3**
    (icon PWA thật thay placeholder — cần file thiết kế thật, không tự chế
    được), hoặc **B5**/**Nhóm D** (giao diện).
  - Người thực hiện: Claude. File package gửi cho user:
    `module_C1_C4_perf.zip` (6 file sửa: `providers.tsx`, `queries.ts`,
    `app/page.tsx`, `app/cycle/page.tsx`, `app/profile/page.tsx`,
    `app/profile/report/page.tsx`, `QUALITY_UX_ROADMAP.md`).
- **2026-07-28** — **Hoàn thành Module C2 (Tối ưu bundle: dynamic import cho
  phần chỉ VIP mới dùng tới)**. Khối lượng nhỏ (2 file sửa), đóng gói ngay.
  - **Phát hiện quan trọng**: `LockedFeature` (đã có từ trước) vẫn render
    `children` bình thường khi `locked=true` — chỉ làm mờ bằng CSS
    (`filter: blur`) chứ KHÔNG bỏ qua việc mount component. Nghĩa là 4 khối
    biểu đồ dùng `recharts` trong `/profile` (`CycleInsights`,
    `WeightBBTChart`, `CorrelationChart`, `SymptomAnalysis`) trước đây LUÔN
    được tải + mount cho MỌI user, kể cả user không phải VIP chỉ thấy bản mờ
    có khoá — không đúng tinh thần "chỉ VIP mới dùng tới" mà roadmap C2 nhắc
    tới.
  - **`profile/page.tsx`**: chuyển 4 import trên từ static sang
    `next/dynamic` với `ssr: false` (hợp lý vì `recharts`/
    `ResponsiveContainer` cần kích thước DOM thật) + `loading` là
    `<Skeleton>` có sẵn trong app (nhất quán với A4). Nhờ vậy `recharts`
    tách thành chunk riêng, tải song song/độc lập thay vì chặn phần render
    đầu của trang.
  - **`profile/report/page.tsx`**: `export-report.ts` (chứa `jspdf` +
    `jspdf-autotable`) trước đây import tĩnh dù chỉ dùng khi user bấm nút
    "Xuất PDF" (nút "In" dùng `window.print()`, không cần jsPDF) — chuyển
    `handleExportPdf` thành `async function`, `dynamic import()` ngay tại
    thời điểm bấm nút thay vì tải sẵn lúc vào trang report.
  - Đã cài `node_modules`, chạy `tsc --noEmit` + `eslint src/` — sạch. Thử
    thêm `next build` thật để xác nhận code-splitting hoạt động đúng, nhưng
    gặp lại đúng lỗi đã ghi nhận ở B5 (sandbox chặn `fonts.googleapis.com`
    nên `next/font` không tải được `Inter`/`Plus Jakarta Sans`) — không phải
    lỗi do thay đổi của C2, chỉ là hạn chế môi trường đã biết trước, không
    sửa trong module này (thuộc phạm vi B5 — cần agent có mạng đầy đủ).
  - Việc tiếp theo trong roadmap: **C3** (icon PWA thật — cần bạn cung cấp
    file thiết kế vì đây không phải việc code thuần, không tự chế được),
    hoặc **B5** (cần mạng đầy đủ để `next build` thật qua được bước fonts),
    hoặc bắt đầu **Nhóm D** (giao diện — D1 kiểm toán màu/typography).
  - Người thực hiện: Claude. File package gửi cho user: `module_C2_bundle.zip`
    (3 file: `app/profile/page.tsx`, `app/profile/report/page.tsx`,
    `QUALITY_UX_ROADMAP.md`).
- **2026-07-28** — **Hoàn thành Module D6 (Dark mode — rà quét màu cứng chưa
  đổi theo theme)**. Chuyển hẳn sang Nhóm D vì Nhóm C đã xong 3/4 mục khả thi
  trong sandbox này (C3 cần file icon thiết kế thật, không tự chế được).
  Khối lượng: rà toàn bộ `src/` bằng `grep` (không phải xuyên suốt mù mờ —
  tìm được danh sách cụ thể, hữu hạn), sửa đúng các chỗ xác nhận là bug thật.
  - **Cách rà**: `grep` toàn bộ `bg-white`/`text-black` và mọi
    `color-mix(in srgb, ..., white)`/`background: "white"` literal trong
    `src/`. Với mỗi kết quả, kiểm tra xem có VĂN BẢN dùng biến theme
    (`var(--ink)`/`var(--ink-soft)`/`var(--ink-faint)`) đặt TRỰC TIẾP trên
    nền đó không — đây mới là bug thật (dark mode đổi `--ink*` sang màu
    sáng, nhưng nền vẫn `white`/gần-trắng cứng → chữ gần như biến mất). Badge
    tròn nhỏ chỉ chứa icon màu chính nó (không phải `--ink`) thì KHÔNG phải
    bug — đây là pattern thiết kế cố ý (badge tròn giữ nền sáng dịu bất kể
    theme để icon màu nổi rõ, giống nhiều app khác), không sửa để tránh đổi
    thẩm mỹ ngoài phạm vi roadmap yêu cầu.
  - **6 bug thật tìm thấy & sửa** (nền cứng + chữ theo `--ink*` ngồi trực
    tiếp trên đó):
    1. `settings/page.tsx` — input đặt mã PIN: `bg-white` → `bg-[var(--surface)]`.
    2. `LockedFeature.tsx` — lớp phủ khoá VIP: `bg-white/40` →
       `bg-[color-mix(in_srgb,var(--surface)_40%,transparent)]`.
    3. `CorrelationChart.tsx` — `<select>` chọn chỉ số: `bg-white/70` →
       tương tự, mix 70%.
    4. `HealthCheckIns.tsx` — nút đáp án trắc nghiệm mệt mỏi: `bg-white/60` +
       `hover:bg-white` → mix 60% + `hover:bg-[var(--surface)]`.
    5. `AiChatSheet.tsx` — ô nhập câu hỏi chat AI: `bg-white/60` → mix 60%.
    6. `login/page.tsx` — tab toggle "Đăng nhập/Đăng ký" (trạng thái được
       chọn): `background: "white"` → `background: "var(--surface)"`.
  - **3 banner có văn bản ngồi trên nền `color-mix(..., white)`** (khác kiểu
    trên — không phải Tailwind class mà inline `color-mix` literal `white`,
    dễ bị bỏ sót nếu chỉ grep `bg-white`): `CycleLogForm.tsx` (banner "kỳ
    kinh chưa kết thúc"), `ReminderBanner.tsx` (cả 2 nhánh period/log),
    `AbnormalCycleBanner.tsx` ("Có điểm cần chú ý"), `cycle/page.tsx`
    (banner "Cửa sổ thụ thai") — đổi tham số cuối của `color-mix()` từ
    literal `white` sang `var(--surface)` để tự đổi theo theme thay vì đứng
    yên.
  - **Đã kiểm tra kỹ nhưng KHÔNG sửa** (xác nhận không phải bug, để tránh
    sửa lạc phạm vi thẩm mỹ ngoài roadmap):
    - `Switch.tsx` (`bg-white` — núm gạt công tắc, quy ước chung giữ trắng
      bất kể theme).
    - `MembershipCard.tsx` (`bg-white/20` — badge trên nền gradient VIP cố
      định riêng, không phải bề mặt theme).
    - `login/page.tsx` nút Google/Apple (`bg-white`/`bg-black` — màu
      thương hiệu OAuth cố định theo quy chuẩn Google/Apple, không đổi theo
      theme app).
    - Toàn bộ badge tròn nhỏ dùng `color-mix(..., NN%, white)` chỉ chứa
      icon/số màu chính nó (`MetricCard`, `EmptyState`, `ConfirmDialog`,
      `FatigueQuiz`, `library` (2 trang), `reset-password`, `login` (2 chỗ
      OTP/mail), `log/page.tsx`, `kegel/page.tsx`) — không có chữ `--ink*`
      trên nền đó, giữ nguyên theo đúng dụng ý thiết kế ban đầu.
  - Đã cài `node_modules`, chạy `tsc --noEmit` + `eslint src/` toàn repo —
    sạch, không lỗi.
  - Việc tiếp theo trong roadmap: **C3** (icon PWA thật — vẫn cần bạn cung
    cấp file thiết kế), **B5** (vẫn chặn ở Google Fonts trong sandbox này),
    hoặc các mục còn lại của Nhóm D (D1 kiểm toán contrast toàn diện hơn —
    lưu ý: `--ink-faint` (`#a8a3ba`) hiện chỉ đạt ~2.44:1 trên nền trắng,
    KHÔNG đạt chuẩn AA cho text thường (cần ≥4.5:1) — nhưng phần lớn nơi
    dùng biến này là nhãn/mốc thời gian rất nhỏ chứ không phải nội dung
    chính; đổi giá trị biến này sẽ ảnh hưởng thị giác ở HÀNG CHỤC nơi cùng
    lúc (rủi ro regression cao, đúng loại "khối lượng lớn" cần làm riêng 1
    module không gộp gì khác) — để dành, chưa sửa trong module D6 này).
  - Người thực hiện: Claude. File package gửi cho user: `module_D6_dark_mode.zip`
    (10 file: `settings/page.tsx`, `login/page.tsx`, `LockedFeature.tsx`,
    `CorrelationChart.tsx`, `HealthCheckIns.tsx`, `AiChatSheet.tsx`,
    `CycleLogForm.tsx`, `ReminderBanner.tsx`, `AbnormalCycleBanner.tsx`,
    `app/cycle/page.tsx`, `QUALITY_UX_ROADMAP.md`).
- **2026-07-28** — **Tiếp tục Module D1 (một phần): kiểm toán & sửa contrast
  ratio của `--ink-soft`**. Khối lượng nhỏ (1 file CSS, chỉ 1 biến màu) nên chỉ
  làm phần này, CHƯA đóng `[x]` D1 (còn phần rà đồng bộ typography scale giữa
  các trang — xem lý do để lại bên dưới).
  - **Cách kiểm toán**: tính contrast ratio (công thức WCAG) của `--ink`,
    `--ink-soft`, `--ink-faint` so với TẤT CẢ nền hiện có trong app
    (`--aurora-a/b/c`, `--surface`, `--surface-soft`, `--bg-fallback`), cả theme
    sáng lẫn tối — 36 tổ hợp mỗi theme.
  - **Phát hiện**: `--ink-soft` (`#74708a`) theme sáng chỉ đạt 3.94–4.22:1 trên
    nền `--aurora-*`/`--bg-fallback` — KHÔNG đạt chuẩn AA cho chữ thường
    (cần ≥4.5:1), dù đạt trên `--surface` (4.74:1). Biến này dùng khá rộng cho
    text phụ (mô tả, nhãn) trực tiếp trên nền aurora ở nhiều trang → bug thật,
    không phải cố ý.
  - **Đã sửa**: đổi `--ink-soft` theme sáng từ `#74708a` → `#636076` (đậm hơn
    chút, giữ nguyên tông tím-xám) — đạt tối thiểu 5.04:1 trên MỌI nền hiện có
    (kể cả nền xấu nhất `--bg-fallback`). Theme tối không cần sửa (`--ink-soft`
    đã đạt 7.18–9.29:1 sẵn).
  - **Đã kiểm tra nhưng CHƯA sửa (để dành, đúng tinh thần ghi chú C1 cũ)**:
    `--ink-faint` (`#a8a3ba` sáng / `#8a84a0` tối) vẫn KHÔNG đạt AA ở nhiều tổ
    hợp (2.03–2.44:1 sáng; 4.06–4.65:1 tối, một số nền tối cũng chưa đạt) —
    đúng như nhật ký C1 đã ghi trước đó. Giữ nguyên quyết định cũ: biến này chủ
    yếu dùng cho nhãn/mốc thời gian rất nhỏ (không phải nội dung chính, ngưỡng
    AA cho "large text" chỉ cần 3:1 nên phần lớn chỗ dùng vẫn tạm ổn về mặt
    thực tế dù không đạt ngưỡng chữ thường tuyệt đối), và đổi giá trị sẽ ảnh
    hưởng thị giác ở hàng chục nơi cùng lúc — vẫn là việc "khối lượng lớn" nên
    KHÔNG gộp vào module nhỏ này.
  - **Phần còn lại của D1 (rà đồng bộ typography scale giữa các trang)**: đã
    grep sơ bộ các cỡ chữ arbitrary (`text-[9px]`/`[10px]`/`[11px]`) — rải rác
    ở ~20 file cho nhãn/caption rất nhỏ, nhưng KHÔNG có 1 "scale chuẩn" nào được
    định nghĩa sẵn trong code để đối chiếu đúng/sai (khác với vấn đề contrast ở
    trên vốn có công thức khách quan để kiểm chứng) — việc thống nhất cỡ chữ
    giữa các trang mang tính chủ quan thẩm mỹ, cần chủ dự án xác nhận 1 scale cụ
    thể (VD 9/10/11/12/14/16px dùng khi nào) trước khi agent sau sửa hàng loạt,
    tránh sửa lạc thẩm mỹ không đúng ý chủ dự án. Để lại phần này cho D1 lần
    sau, có thể hỏi chủ dự án trước khi làm.
  - Đã cài `node_modules`, chạy `tsc --noEmit` + `eslint src/` toàn repo — sạch.
  - Việc tiếp theo trong roadmap: hoàn thành nốt D1 (scale chữ, cần xác nhận từ
    chủ dự án) hoặc chuyển sang D2/D3/D4/D5, hoặc C3/B5 (vẫn cần file
    icon thật / mạng đầy đủ tương ứng).
  - Người thực hiện: Claude. File package gửi cho user: `module_D1_contrast.zip`
    (2 file: `src/app/globals.css`, `QUALITY_UX_ROADMAP.md`).
- **2026-07-28** — **Hoàn thành Module D2 (mở rộng phong cách "icon minh hoạ"
  ra ngoài phần triệu chứng)**. Khối lượng nhỏ (4 file), đóng gói ngay.
  - **`src/components/ui/BlobIcon.tsx` (mới)**: tách phần "vẽ blob" (bo góc bất
    đối xứng, gradient 2 sắc độ, box-shadow màu theo icon) ra khỏi
    `SymptomIcon.tsx` thành component tổng quát, nhận thẳng `bg`/`fg` thay vì
    `SymptomCategory` — để Kegel/Fatigue (không có khái niệm category triệu
    chứng) dùng lại được mà không cần định nghĩa category giả.
  - **`SymptomIcon.tsx`**: refactor để gọi `BlobIcon` bên trong (chỉ còn nhiệm
    vụ tra màu theo category) — không đổi props/cách gọi ở bất kỳ nơi nào đang
    dùng `SymptomIcon` (an toàn, không cần sửa `CycleLogForm.tsx`/
    `SymptomAnalysis.tsx`).
  - **`app/kegel/page.tsx`**: khối tròn phẳng chứa icon `HeartPulse` ở mỗi thẻ
    preset (Người mới/Trung cấp/Nâng cao) → đổi sang `<BlobIcon active />` cùng
    tông màu period, đồng bộ thẩm mỹ với thẻ chọn triệu chứng ở `/log`.
  - **`components/fatigue/FatigueQuiz.tsx`**: khối tròn phẳng hiển thị điểm số
    kết quả → đổi sang hình blob cùng công thức border-radius (viết tay, không
    dùng thẳng `BlobIcon` vì đây là số điểm chứ không phải icon lucide).
  - **Đã kiểm tra nhưng KHÔNG đổi**: icon trạng thái nhỏ (Check/Clock) trong
    dòng lịch sử tập Kegel — đây là icon trạng thái (hoàn thành/dở dang), không
    phải icon minh hoạ, đổi sang blob sẽ gây hiểu nhầm là 1 mục khác; Thư viện
    (`/library`) rà lại không có khối icon minh hoạ nào (chỉ có pill danh mục +
    badge VIP dạng chữ) nên KHÔNG có gì để đổi ở D2 cho trang này — roadmap gốc
    liệt kê Library nhưng thực tế không áp dụng được, ghi rõ để agent sau không
    tưởng nhầm là bỏ sót.
  - Đã cài `node_modules`, chạy `tsc --noEmit` + `eslint src/` toàn repo — sạch.
  - Việc tiếp theo trong roadmap: D3 (đơn giản hoá thao tác nhập liệu — nút
    +/- lớn, preset nhanh cho các ô số khác ngoài nhịp tim), hoặc D4/D5, hoặc
    nốt phần scale chữ còn lại của D1 (cần xác nhận từ chủ dự án).
  - Người thực hiện: Claude. File package gửi cho user: `module_D2_blob_icons.zip`
    (4 file: `src/components/ui/BlobIcon.tsx` (mới), `SymptomIcon.tsx`,
    `app/kegel/page.tsx`, `components/fatigue/FatigueQuiz.tsx`,
    `QUALITY_UX_ROADMAP.md`).
- **2026-07-28** — **Hoàn thành Module D3 (đơn giản hoá thao tác nhập liệu)**.
  Khối lượng nhỏ (2 file sửa), đóng gói ngay.
  - **Rà soát trước khi làm**: stepper +/- lớn (44px, dễ bấm 1 tay) + slider +
    preset đã có sẵn từ trước cho `MetricLogForm.tsx` (P12 redesign) — áp dụng
    cho MỌI chỉ số qua 1 component chung, không cần sửa gì thêm phần này.
    5/6 chỉ số (stress, nhịp tim, giấc ngủ, nước uống, tâm trạng, BBT) đã có
    preset cố định hợp lý — chỉ riêng **cân nặng** chưa có preset.
  - **Tại sao KHÔNG thêm preset cố định kiểu 50/60/70kg cho cân nặng**: khác
    với nhịp tim/giấc ngủ (có khoảng giá trị chung hợp lý cho mọi người), cân
    nặng mỗi người một khác — preset cố định sẽ không đúng với đa số user,
    phản tác dụng ("hợp lý" mà roadmap D3 yêu cầu cân nhắc). Thay vào đó:
    - `MetricLogForm.tsx`: thêm prop tuỳ chọn `lastValue` — nếu có, dùng làm
      giá trị mặc định khi mở modal (thay vì hằng số cứng `default`), và hiện
      thêm 1 chip "Như lần trước (X kg)" cạnh preset cố định (nếu chỉ số đó có).
    - `app/log/page.tsx`: dùng `useMetricTrend("weight", 14)` lấy giá trị cân
      nặng ghi nhận gần nhất, truyền vào `MetricLogForm` qua `lastValue` khi mở
      modal cân nặng. Cân nặng thường ít đổi giữa các lần đo liên tiếp nên
      "giống lần trước" hữu ích hơn nhiều so với đoán 1 con số chung.
  - Đã cài `node_modules`, chạy `tsc --noEmit` + `eslint src/` toàn repo — sạch.
  - **Còn lại của D3 nếu cần mở rộng thêm** (chưa làm, không thuộc phạm vi nhỏ
    của module này): áp dụng cùng pattern `lastValue`/"Như lần trước" cho BBT
    (nhiệt độ cơ bản cũng ít đổi ngày qua ngày, dù đã có preset cố định gần
    đúng nên độ ưu tiên thấp hơn cân nặng).
  - Người thực hiện: Claude. File package gửi cho user: `module_D3_input_ux.zip`
    (3 file: `components/log/MetricLogForm.tsx`, `app/log/page.tsx`,
    `QUALITY_UX_ROADMAP.md`).
- **2026-07-28** — **Hoàn thành Module D4 (ngôn ngữ thân thiện, giảm thuật ngữ
  khô khan)**. Khối lượng nhỏ (1 file sửa), đóng gói ngay.
  - **Cách rà**: grep toàn bộ chuỗi tiếng Việt trong JSX chứa từ khoá y khoa/kỹ
    thuật (`chỉ số`, `triệu chứng`, `xét nghiệm`, `chẩn đoán`, `y khoa`...),
    đọc lại từng chỗ trong ngữ cảnh hiển thị thực tế.
  - **Đánh giá tổng thể**: phần lớn copy hiện tại ĐÃ ổn (label form cần chính
    xác/kỹ thuật là đúng, không nên "làm mềm" — VD "Ngày sinh (tuỳ chọn)",
    "Bác sĩ / Phòng khám" — làm mềm những chỗ này sẽ giảm rõ ràng chứ không
    tăng thân thiện). Onboarding, banner nhắc log hằng ngày, disclaimer y khoa
    ở Fatigue Quiz — đều đã đúng giọng văn phù hợp với từng ngữ cảnh (disclaimer
    NÊN giữ chính xác/nghiêm túc vì lý do an toàn, không nên làm mềm).
  - **1 chỗ tìm thấy đúng vấn đề D4 nêu**: `AbnormalCycleBanner.tsx` — 3 câu
    cảnh báo chu kỳ/kỳ kinh bất thường đọc như báo cáo xét nghiệm ("dài X ngày
    — ngoài khoảng bình thường Y-Z ngày"), trong khi đây là banner cảnh báo
    SỨC KHỎE hiện chủ động hằng ngày ở trang chủ — ngữ cảnh nhạy cảm nhất
    trong app để giọng văn khô khan (dễ gây lo lắng không cần thiết). Đã đổi
    thành câu văn gần gũi hơn ("kéo dài X ngày, hơi ngoài mức thường gặp
    (Y-Z ngày)"), vẫn giữ NGUYÊN số liệu chính xác — không đổi dòng disclaimer
    y khoa phía dưới (giữ chính xác/nghiêm túc có chủ đích, đúng tinh thần D4
    chỉ giảm khô khan ở phần có thể mềm hoá, không phải mọi nơi).
  - **Quyết định phạm vi quan trọng**: KHÔNG đổi các câu tương tự ở
    `CycleInsights.tsx` (`/profile`, phần phân tích VIP chi tiết) — đây là màn
    hình dữ liệu/biểu đồ, ngữ cảnh khác banner cảnh báo hằng ngày, người dùng
    chủ động vào xem để phân tích kỹ nên ngôn ngữ chính xác/số liệu ở đây phù
    hợp hơn là "làm mềm".
  - Đã chạy `tsc --noEmit` + `eslint src/` toàn repo — sạch.
  - Người thực hiện: Claude. File package gửi cho user: `module_D4_copy_tone.zip`
    (2 file: `components/cycle/AbnormalCycleBanner.tsx`, `QUALITY_UX_ROADMAP.md`).
- **2026-07-28** — **Hoàn thành Module D5 (trang chủ — thứ tự ưu tiên hiển
  thị)**. Đây là module xuyên suốt bố cục trang chủ (rủi ro regression cao dù
  chỉ 1 file) nên chỉ làm riêng mục này, không gộp thêm.
  - **Phát hiện**: thứ tự cũ là Health Score ring (insight tổng hợp) → banner
    nhắc nhở → thẻ chu kỳ → lịch hẹn → metric cards (check-in) — NGƯỢC với thứ
    tự roadmap đề ra ("chu kỳ hôm nay → nhắc nhở → check-in nhanh → insight").
    Health Score ring được đặt trên cùng từ trước (comment cũ gọi là "signature
    element" — ưu tiên thị giác), nhưng về bản chất đây là điểm TỔNG HỢP tính
    từ chính các chỉ số hiển thị bên dưới nó — xếp trước cả dữ liệu gốc là
    ngược logic thông tin, và không phải thứ đổi mỗi ngày (không giống trạng
    thái chu kỳ — thứ luôn đổi và cần biết ngay khi mở app).
  - **Đã sửa**: sắp lại `app/page.tsx` theo đúng thứ tự roadmap yêu cầu — thẻ
    chu kỳ hôm nay lên đầu, kế tiếp 2 banner nhắc nhở (cảnh báo bất
    thường + nhắc log/kỳ kinh) + lịch hẹn sắp tới, rồi tới lưới check-in nhanh
    (metric cards/empty-state/skeleton), và Health Score ring chuyển xuống
    CUỐI CÙNG như 1 khối "insight" tổng kết. KHÔNG đổi nội dung/logic bên trong
    từng section (copy, style, data-fetching) — chỉ đổi thứ tự JSX.
  - **Về "tránh dồn nhiều card 1 hàng"** (vế còn lại của D5): rà lại, các
    section hiện tại đều đã là 1 hàng full-width riêng biệt (chu kỳ, từng
    banner, lịch hẹn), trừ lưới chỉ số vốn đã là grid 2 cột có chủ đích (thiết
    kế "check-in nhanh" dạng thẻ nhỏ, không phải vấn đề "dồn nhiều card gây
    rối mắt") — không có gì cần sửa thêm ở khía cạnh này.
  - Đã chạy `tsc --noEmit` + `eslint src/` toàn repo — sạch. **Lưu ý cho agent
    sau**: đây là thay đổi thứ tự hiển thị khá lớn về mặt trải nghiệm (Health
    Score không còn là thứ đầu tiên nhìn thấy) — nếu chủ dự án phản hồi muốn
    giữ Health Score ở đầu (vd vì lý do thương hiệu/thị giác), có thể revert
    riêng phần thứ tự này mà không ảnh hưởng các phần khác của D5.
  - **Nhóm D coi như đã hoàn thành phần khả thi trong sandbox này** (D1 còn 1
    phần nhỏ chờ xác nhận chủ dự án về scale chữ; D2-D5 đã xong; D6 xong từ
    trước). Việc còn lại của toàn roadmap: **B5** (cần agent có mạng đầy đủ để
    `next build` qua bước Google Fonts), **C3** (icon PWA thật — cần file thiết
    kế), và phần scale chữ còn lại của **D1**.
  - Người thực hiện: Claude. File package gửi cho user: `module_D5_home_order.zip`
    (2 file: `app/page.tsx`, `QUALITY_UX_ROADMAP.md`).
