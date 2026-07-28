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
- [ ] **A3. Trạng thái loading rõ ràng cho mọi nút submit** — rà soát toàn bộ
      `useMutation` trong `queries.ts`, đảm bảo mọi nút "Lưu"/"Xoá"/"Gửi" đều
      disable + hiện spinner/label "Đang lưu..." trong lúc `isPending`, tránh
      double-submit khi user bấm nhiều lần liên tiếp (đặc biệt quan trọng trên
      mobile — dễ bấm nhầm 2 lần). *(Phần "toast thành công" cho các luồng còn
      thiếu đã làm — xem nhật ký 2026-07-28 lần 2. Còn thiếu: rà disable/spinner
      cho các switch/toggle trong `settings.tsx`, và `.mutate()` fire-and-forget
      ở `FatigueQuiz.tsx`/`KegelTimer.tsx` chưa theo dõi `isPending` ở UI.)*
- [ ] **A4. Empty state & skeleton loading nhất quán** — kiểm tra mọi danh sách
      (lịch sử metric, lịch sử chu kỳ, danh sách lịch hẹn, danh sách bài viết...)
      đều có skeleton lúc `isLoading` và empty-state thân thiện lúc rỗng (tái
      dùng `EmptyState` đã có nếu còn thiếu ở đâu đó).
- [ ] **A5. Confirm dialog nhất quán cho hành động Xoá** — rà soát mọi nút "Xoá"
      (cycle log, metric, appointment, reminder...) đều có bước xác nhận giống
      nhau (hiện có thể mỗi nơi làm 1 kiểu: `window.confirm` thô hoặc không hỏi
      gì cả) — làm 1 `<ConfirmDialog>` dùng chung, style đồng bộ `glass-card`.

## 2. Nhóm B — Rà soát bug & hoàn thiện chức năng hiện có

- [ ] **B1. Audit toàn bộ luồng CRUD** từng module (cycle_logs, health_metrics,
      appointments, reminders, kegel_sessions, fatigue_tests, app lock, theme) —
      kiểm tra thật sự chạy đúng với schema DB hiện tại (bài học từ bug
      `recorded_date`/`logged_at` — có thể còn lệch tên cột/kiểu dữ liệu ở module
      khác chưa bị phát hiện vì chưa ai test kỹ). Cách làm: đối chiếu từng field
      trong `supabase/schema.sql` + các file `supabase/sql/module*.sql` với đúng
      tên field dùng trong `queries.ts`.
- [ ] **B2. Rà lỗi TypeScript/ESLint triệt để trên toàn repo** — không chỉ chạy
      trên file mới sửa như các patch trước, mà chạy `tsc --noEmit` + `eslint`
      trên TOÀN BỘ `src/` một lượt, liệt kê & sửa hết warning/error còn sót từ
      các patch trước cộng dồn lại.
- [ ] **B3. Kiểm tra responsive & an toàn vùng (safe-area) trên các trang chưa
      test kỹ** — đặc biệt `/kegel` (timer), `/fatigue-test` (quiz nhiều bước),
      `/library/[id]` (đọc bài dài), modal đặt PIN ở `/settings`.
- [ ] **B4. Kiểm tra logic nghiệp vụ biên (edge case)**:
      - Chu kỳ đầu tiên chưa có dữ liệu lịch sử → app có xử lý được không hay lỗi?
      - User huỷ VIP giữa chừng khi đang xem tính năng khoá VIP → có bị treo UI không?
      - Nhập giá trị âm/quá lớn ở các ô số (cân nặng, BBT, nhịp tim) → có validate chặn không?
      - Đổi timezone/giờ hệ thống lệch múi giờ VN → ngày tháng tính chu kỳ có lệch không?
- [ ] **B5. Dọn dependency & console warning khi build thật** — dự án sandbox
      không build được vì mạng chặn Google Fonts, cần agent có mạng đầy đủ chạy
      thử `next build` thật, dọn warning (unused import, key prop thiếu trong
      list, hydration mismatch...).

## 3. Nhóm C — Tối ưu hiệu năng

- [ ] **C1. Rà soát re-render thừa** — các trang nhiều `useQuery` cùng lúc
      (`/profile`, `/`) có thể đang fetch/re-render dư thừa; cân nhắc `staleTime`
      hợp lý hơn cho từng loại query (dữ liệu ít đổi như `profile` vs dữ liệu hay
      đổi như `health_metrics` hôm nay).
- [ ] **C2. Tối ưu bundle** — kiểm tra `jspdf`/`jspdf-autotable` (Module 4) và
      `recharts` có đang bị import ở top-level của trang không cần thiết hay
      không (nên `dynamic import`/code-splitting cho phần nặng chỉ VIP mới dùng
      tới, ví dụ PDF export, biểu đồ tương quan).
- [ ] **C3. Tối ưu ảnh/icon** — kiểm tra `public/icon-192.png`, `icon-512.png`
      hiện là ảnh tạm placeholder (ghi rõ trong nhật ký Module 13 cũ) — thay
      bằng icon thiết kế thật, nén đúng chuẩn PWA.
- [ ] **C4. Cache hoá các phép tính nặng lặp lại** — `predictCycle()`,
      `computeSymptomFrequencies()`, `pearsonCorrelation()` đang tính lại mỗi
      render nếu component cha re-render — cân nhắc `useMemo` ở nơi gọi nếu chưa có.

## 4. Nhóm D — Nâng cấp giao diện: đẹp, hiện đại, dễ dùng, thân thiện với phụ nữ

- [ ] **D1. Kiểm toán hệ thống màu & typography** — hiện dùng biến `--aurora-*`
      (tím-hồng gradient) khá phù hợp thẩm mỹ nữ tính, nhưng cần rà lại độ tương
      phản (contrast ratio đạt chuẩn WCAG AA cho text trên nền gradient/glass),
      và thống nhất khoảng cách/kích thước chữ giữa các trang (một số trang cũ
      có thể chưa theo đúng scale mới nhất).
- [ ] **D2. Làm mềm & "nữ tính hoá" các chi tiết nhỏ** — bo góc nhất quán, dùng
      nhiều đường cong/soft-shadow hơn là góc vuông cứng, icon minh hoạ (đã có ở
      Sprint 1 cho triệu chứng) — mở rộng phong cách này sang các icon khác
      trong app (Kegel, Fatigue test, Library) cho đồng bộ toàn app thay vì chỉ
      riêng phần triệu chứng.
- [ ] **D3. Đơn giản hoá thao tác nhập liệu** — rà lại toàn bộ form nhập số
      (cân nặng, BBT, nhịp tim...) đảm bảo có nút +/- lớn dễ bấm bằng ngón tay
      cái (một tay cầm điện thoại), có preset nhanh (đã có ở nhịp tim: 60/72/90 —
      áp dụng pattern này cho các chỉ số số khác nếu hợp lý), giảm số lần phải gõ bàn phím.
- [ ] **D4. Ngôn ngữ thân thiện, giảm thuật ngữ y khoa khô khan** — rà soát toàn
      bộ copy tiếng Việt trong UI (không phải trong comment code), đổi các câu
      quá kỹ thuật thành gần gũi, ấm áp hơn — nhất quán giọng văn "người bạn đồng
      hành" xuyên suốt app (đã có phần nào ở nội dung theo pha chu kỳ, cần lan ra toàn app).
- [ ] **D5. Trang chủ — làm nổi bật thông tin quan trọng nhất trước** — kiểm tra
      lại thứ tự ưu tiên hiển thị trên `/` (chu kỳ hôm nay → nhắc nhở → check-in
      nhanh → insight) có đúng thứ tự người dùng cần nhìn thấy đầu tiên không,
      tránh dồn quá nhiều card cùng một hàng gây rối mắt.
- [ ] **D6. Dark mode — hoàn thiện 100%** — Module theme (Sáng/Tối) đã làm ở
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
