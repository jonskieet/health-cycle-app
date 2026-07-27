# Clover vs Health-Cycle-App — Phân tích nghiệp vụ & Roadmap triển khai

> **File này dùng cho AI agent (Claude Code, Cursor, v.v.) đọc và tiếp tục triển khai.**
> Mỗi khi hoàn thành một mục, **cập nhật checkbox `[x]` và ghi chú vào phần "Nhật ký triển khai"** ở cuối file để agent kế tiếp biết phải làm tiếp từ đâu — không tự xoá lịch sử, chỉ append.

---

## 0. Bối cảnh dự án hiện tại (đã khảo sát code)

- Next.js App Router + TypeScript, Supabase (Postgres + Auth + RLS), TanStack Query.
- Trang hiện có: `/` (trang chủ), `/cycle`, `/log`, `/profile`, `/profile/report`, `/appointments`, `/settings`, `/onboarding`, `/login`, `/reset-password`.
- Data model hiện tại (`supabase/schema.sql`):
  - `profiles`: display_name, birth_date, birth_year, avatar_key, avg_cycle_length, avg_period_length, onboarded, **is_vip** (bảo vệ bằng trigger, chỉ service_role đổi được).
  - `cycle_logs`: start_date, end_date, flow (light/medium/heavy), symptoms[], note.
  - `health_metrics`: metric_type (stress/heart_rate/sleep/hydration/mood), value, logged_at (unique theo user+type+ngày).
  - `appointments`: title, doctor_name, appointment_at, note.
- Logic nghiệp vụ đã có (`src/lib/`):
  - `cycle-utils.ts`: dự đoán chu kỳ (currentDay, nextPeriodDate, ovulationDate, fertileWindow, phase 5 trạng thái), lịch sử chu kỳ, phát hiện bất thường (chu kỳ 21-35 ngày, hành kinh 2-8 ngày), độ biến thiên/"irregular".
  - `health-score.ts`: Health Score 0-100 theo trọng số (heart_rate 25%, sleep 25%, stress 20%, hydration 15%, mood 15%).
  - `cycle-insights.ts`: nội dung tĩnh theo pha chu kỳ (outlook metrics, insight card).
  - `vip.ts`: phân loại free/vip dựa cột `is_vip`.
  - `ai-chat.ts` + `api/ai-chat/route.ts`: chatbot hỏi-đáp AI (Anthropic API, server-side, rate-limit in-memory 10 req/phút).
- UI đã có: Calendar chu kỳ, form log chu kỳ/metric, check-in sức khoẻ hàng ngày, phase outlook, membership card, locked-feature/locked-chart component (khung UI khoá VIP đã có sẵn nhưng chưa nối đủ tính năng thật đằng sau).

**Kết luận:** khung kỹ thuật (auth, DB, RLS, prediction engine, AI chat, gói VIP) đã khá vững. Phần thiếu chủ yếu là **bề rộng nghiệp vụ** (số lượng module/tính năng) và **độ sâu dữ liệu** (loại triệu chứng, loại theo dõi) so với một app kinh nguyệt thương mại đầy đủ như Clover.

---

## 1. Phân tích nghiệp vụ Clover (Wachanga LTD) — Free vs Premium

Nguồn: mô tả store (App Store/Google Play), bài đánh giá tổng hợp, video walkthrough. Ghi chú: một số chi tiết UI suy ra từ mô tả public, không phải source code của Clover.

### 1.1 Nhóm tính năng FREE (lõi)

| # | Tính năng | Mô tả nghiệp vụ |
|---|-----------|------------------|
| F1 | Lịch chu kỳ & máy tính chu kỳ | Hiển thị lịch tháng, tô màu ngày hành kinh dự đoán/thực tế, ngày rụng trứng, cửa sổ thụ thai |
| F2 | Máy tính rụng trứng / cửa sổ thụ thai | Tính riêng cho nhu cầu "muốn có thai" |
| F3 | Ghi log triệu chứng, tâm trạng, tình trạng cơ thể | Nhật ký hàng ngày: mood, symptoms, flow |
| F4 | Cảnh báo chu kỳ bất thường / PMS | So sánh với ngưỡng "bình thường", cảnh báo lượng máu, độ dài kỳ kinh |
| F5 | Nhắc nhở (reminder) | Thông báo trước khi chu kỳ sắp bắt đầu/kết thúc, nhắc uống thuốc, nhắc log hàng ngày |
| F6 | Chỉnh sửa dữ liệu quá khứ | Sửa/xoá log các chu kỳ cũ |
| F7 | Widget màn hình chính | Hiển thị nhanh ngày trong chu kỳ / pha hiện tại ngoài home screen (native, không áp dụng trực tiếp cho web nhưng có thể thay bằng PWA shortcut/notification) |
| F8 | Onboarding dạng quiz cá nhân hoá | Chuỗi câu hỏi dài (tuổi, chu kỳ gần nhất, mục tiêu sử dụng — theo dõi/mang thai/tránh thai) trước khi vào app, tạo cảm giác cá nhân hoá trước khi mời nâng cấp |
| F9 | Không bắt buộc tài khoản (ẩn danh) | Có thể dùng ngay không cần đăng ký (khác với app hiện tại đang bắt buộc auth) |
| F10 | Đồng bộ Apple Health / Google Fit | Xuất dữ liệu sang health platform |

### 1.2 Nhóm tính năng PREMIUM (VIP)

| # | Tính năng | Mô tả nghiệp vụ |
|---|-----------|------------------|
| P1 | **Báo cáo sức khoẻ cho bác sĩ ("doctor-ready report")** | Xuất PDF thống kê độ dài chu kỳ/kỳ kinh theo thời gian, biểu đồ, để mang đi khám |
| P2 | **Phân tích triệu chứng chuyên sâu (Symptom Analysis)** | Không chỉ liệt kê mà phân tích tương quan/xu hướng theo thời gian |
| P3 | **Event Analysis — tương quan 2 chỉ số bất kỳ** | Cho phép chọn 2 triệu chứng/chỉ số đã log và vẽ chồng biểu đồ theo chu kỳ để tìm tương quan (vd: đau đầu vs mất ngủ) |
| P4 | **Bài tập Kegel (Kegel Trainer)** | Timer bài tập cơ sàn chậu, có hướng dẫn, lịch tập |
| P5 | **Fatigue test / bài test nhanh sức khoẻ** | Trắc nghiệm ngắn đánh giá mức năng lượng/mệt mỏi |
| P6 | **Theo dõi cân nặng (Weight tracking)** | Log cân nặng theo thời gian, biểu đồ xu hướng |
| P7 | **Theo dõi nhiệt độ cơ thể cơ bản (BBT - Basal Body Temperature)** | Log nhiệt độ buổi sáng để tăng độ chính xác dự đoán rụng trứng (phương pháp giao hợp có kế hoạch) |
| P8 | **Thư viện nội dung/bài viết đầy đủ ("full access to all topics")** | Kho bài viết giáo dục sức khoẻ sinh sản, mở khoá toàn bộ (free chỉ xem một phần) |
| P9 | **Bộ giao diện/theme, app icon tuỳ chỉnh** | Đổi skin định kỳ cập nhật, đổi icon app |
| P10 | **Chế độ mang thai (Pregnancy mode)** | Chuyển sang theo dõi thai kỳ theo tuần khi phát hiện có thai |
| P11 | **Đa tài khoản / hồ sơ nhiều người dùng** | Một app quản lý theo dõi cho nhiều người (theo bài so sánh tổng hợp) |
| P12 | **Sao lưu qua Dropbox / cloud backup riêng** | Backup ngoài tài khoản chính |
| P13 | **Bảo vệ bằng mật khẩu / App Lock riêng cho app** | Khoá app bằng PIN/FaceID độc lập với khoá máy |
| P14 | **Không quảng cáo** | Ẩn banner ads (nếu bản free có ads) |

### 1.3 So sánh với đối thủ khác (bổ sung bối cảnh, không phải để copy 1-1)
Clue nổi bật ở: ghi nhận >100 biểu hiện cơ thể, quản lý biện pháp tránh thai đang dùng, widget màn hình chính, phân tích PMS/tâm trạng/năng lượng theo pha rất chi tiết. Đây là gợi ý mở rộng "loại triệu chứng" và "quản lý biện pháp tránh thai" nên tham khảo thêm khi thiết kế симптом taxonomy.

---

## 2. Bảng so sánh Gap — Clover vs App hiện tại (health-cycle-app)

Ký hiệu: ✅ Đã có · ⚠️ Có khung nhưng chưa đủ sâu · ❌ Chưa có

| Tính năng Clover | Trạng thái hiện tại | Ghi chú kỹ thuật |
|---|---|---|
| F1 Lịch chu kỳ + dự đoán | ✅ | `CycleCalendar.tsx`, `cycle-utils.ts` đã tính đủ 5 pha |
| F2 Máy tính rụng trứng/cửa sổ thụ thai | ✅ | có trong `predictCycle()` |
| F3 Log triệu chứng/mood/flow | ⚠️ | có `symptoms: string[]` tự do, nhưng **chưa có taxonomy triệu chứng chuẩn** (danh sách cố định + icon), chưa tách riêng loại: thể chất / tâm trạng / dịch tiết / hoạt động tình dục |
| F4 Cảnh báo bất thường/PMS | ⚠️ | có `abnormalCycle`/`abnormalPeriod`/`irregular` trong `cycle-utils.ts` nhưng **chưa có UI cảnh báo chủ động** (banner/notification), chưa có mục PMS riêng |
| F5 Nhắc nhở (reminders/push notification) | ❌ | Chưa thấy hệ thống notification/reminder (không có bảng `reminders`, không có service worker/push) |
| F6 Sửa/xoá log quá khứ | ✅ | `useUpdateCycleLog`, `useDeleteCycleLog` đã có |
| F7 Widget/PWA quick glance | ❌ | Chưa có PWA manifest/service worker |
| F8 Onboarding quiz cá nhân hoá | ⚠️ | có `/onboarding` nhưng cần kiểm tra độ sâu — thường chỉ hỏi cơ bản (chu kỳ trung bình), chưa có quiz dài kiểu "mục tiêu sử dụng" (theo dõi thường/mong con/tránh thai) |
| F9 Dùng không cần tài khoản | ❌ | App bắt buộc đăng nhập (`AuthGate.tsx`) — khác chiến lược, có thể giữ nguyên (tuỳ định hướng sản phẩm) |
| F10 Đồng bộ Health app | ❌ | Không có tích hợp Apple Health/Google Fit (hợp lý vì là web app, có thể thay bằng export CSV/PDF) |
| P1 Doctor-ready PDF report | ⚠️ | Có `/profile/report` + `CycleInsights.tsx` hiển thị insight, nhưng **chưa có xuất PDF** |
| P2 Symptom analysis chuyên sâu | ❌ | Chưa có phân tích tần suất/xu hướng triệu chứng theo thời gian |
| P3 Event/Correlation Analysis (2 chỉ số) | ❌ | Chưa có tính năng chọn 2 metric và vẽ tương quan |
| P4 Kegel Trainer | ❌ | Chưa có |
| P5 Fatigue test / mini quiz sức khoẻ | ❌ | Chưa có (khác `HealthCheckIns.tsx` là check-in hàng ngày, không phải quiz đánh giá) |
| P6 Theo dõi cân nặng | ❌ | `MetricType` hiện tại chỉ có stress/heart_rate/sleep/hydration/mood — **thiếu weight** |
| P7 Theo dõi nhiệt độ cơ bản (BBT) | ❌ | **Thiếu hẳn** — quan trọng cho nhóm người dùng "muốn có thai", nên bổ sung metric_type mới |
| P8 Thư viện nội dung giáo dục | ⚠️ | Có `DailyInsights.tsx`/`cycle-insights.ts` nhưng là nội dung tĩnh ngắn theo pha, chưa phải "thư viện bài viết" có danh mục, tìm kiếm, khoá theo VIP |
| P9 Theme/app icon tuỳ chỉnh | ❌ | Chưa có |
| P10 Pregnancy mode | ❌ | Hoàn toàn chưa có — là module lớn, cần bảng dữ liệu riêng (tuần thai, ngày dự sinh...) |
| P11 Đa hồ sơ | ❌ | Chưa có (1 user = 1 profile) |
| P12 Backup ngoài (Dropbox…) | ❌ | Không cần thiết vì đã có Supabase cloud, có thể bỏ qua hoặc thay bằng "export dữ liệu" |
| P13 App Lock (PIN/biometric riêng) | ❌ | Chưa có, `/settings` cần bổ sung |
| P14 Ẩn quảng cáo | N/A | App hiện tại không có ads, không áp dụng |
| Locked feature UI framework | ✅ | Đã có sẵn `LockedFeature.tsx`, `LockedCycleChart.tsx`, `MembershipCard.tsx`, `vip.ts` — **hạ tầng khoá tính năng theo VIP đã sẵn sàng, chỉ cần áp vào tính năng mới** |

### 2.1 Ưu tiên đề xuất (Impact vs Effort)

**Nhóm A — Ưu tiên cao (giá trị lớn, effort vừa phải, tận dụng hạ tầng có sẵn):**
1. Chuẩn hoá taxonomy triệu chứng (F3) + cảnh báo chủ động PMS/bất thường (F4)
2. Hệ thống nhắc nhở (F5) — reminder chu kỳ sắp tới, nhắc log hàng ngày
3. Theo dõi cân nặng + nhiệt độ cơ bản BBT (P6, P7) — chỉ cần thêm `metric_type`
4. Xuất báo cáo PDF cho bác sĩ (P1) — VIP feature, tận dụng dữ liệu đã có
5. Event/Correlation Analysis (P3) — VIP feature nổi bật, khác biệt hoá

**Nhóm B — Ưu tiên trung bình:**
6. Symptom analysis chuyên sâu (P2) — biểu đồ tần suất triệu chứng theo thời gian
7. Thư viện nội dung giáo dục dạng bài viết có danh mục (P8)
8. Onboarding quiz mở rộng theo mục tiêu sử dụng (F8)
9. Kegel Trainer (P4) — tính năng độc lập, dễ làm module riêng
10. Fatigue test / mini quiz sức khoẻ định kỳ (P5)
11. App Lock PIN (P13)

**Nhóm C — Ưu tiên thấp / cân nhắc theo định hướng sản phẩm:**
12. Đa hồ sơ (P11)
13. Theme/app icon tuỳ chỉnh (P9)
14. PWA widget (F7)
15. Đăng nhập ẩn danh (F9) — mâu thuẫn với kiến trúc auth hiện tại, cần bàn với chủ dự án trước khi làm

> Lưu ý: **Pregnancy mode (P10)** đã được loại khỏi roadmap triển khai theo quyết định của chủ dự án (module đổi cả trải nghiệm chính của app, không nằm trong phạm vi hiện tại).

---

## 3. Prompt triển khai cho AI Agent

> Agent tiếp theo: đọc kỹ phần "Nhật ký triển khai" ở cuối trước khi bắt đầu để biết đã làm đến đâu. Sau khi hoàn thành **mỗi module**, bắt buộc:
> 1. Cập nhật checkbox tương ứng thành `[x]`.
> 2. Thêm 1 mục vào "Nhật ký triển khai" (ngày, module, file đã sửa/tạo, quyết định thiết kế, việc còn dang dở nếu có).
> 3. Nếu có thay đổi schema Supabase, note rõ cần chạy `supabase/schema.sql` cập nhật trên project Supabase thật (agent không tự chạy được migration lên server).

### Nguyên tắc chung khi code
- Giữ nguyên convention hiện tại: TanStack Query hooks trong `src/lib/queries.ts`, business logic thuần (không phụ thuộc React) đặt trong `src/lib/*.ts` riêng theo domain, comment tiếng Việt giải thích "vì sao" giống style code hiện tại.
- Tính năng VIP: dùng `isVipProfile()` từ `src/lib/vip.ts` + component `LockedFeature`/`LockedCycleChart` có sẵn để khoá UI, **không tự chế cơ chế khoá mới**.
- Mọi bảng mới trong Supabase: thêm vào `supabase/schema.sql` theo đúng pattern đang dùng (`add column if not exists`, RLS policy, index), KHÔNG viết migration file riêng rời rạc.
- Nếu thay đổi code trong `server/` hoặc cần deploy backend riêng — dự án này không có thư mục `server/` (Next.js full-stack), nên deploy là qua Vercel/hosting Next.js bình thường, không áp dụng quy trình git push riêng cho `server/`.

### Module 1 — Chuẩn hoá triệu chứng & cảnh báo PMS
- [ ] Định nghĩa danh sách triệu chứng chuẩn có nhóm (thể chất: đau bụng, đau đầu, đau lưng...; tâm trạng: cáu gắt, lo âu...; khác: thèm ăn, mất ngủ...) trong `src/lib/symptoms.ts` mới, mỗi item có `id`, `label`, `group`, `icon`.
- [ ] Cập nhật `CycleLogForm.tsx` dùng danh sách chuẩn thay vì text tự do (giữ khả năng thêm ghi chú tự do song song).
- [ ] Thêm banner cảnh báo trong `PhaseOutlook.tsx` hoặc trang `/cycle` khi `abnormalCycle`/`abnormalPeriod`/`irregular` = true (đã có sẵn logic trong `cycle-utils.ts`, chỉ thiếu UI).

### Module 2 — Hệ thống nhắc nhở (Reminders)
- [ ] Thêm bảng `reminders` vào `supabase/schema.sql`: `id, user_id, type (period_upcoming/log_daily/medication/custom), enabled, lead_days, time_of_day, created_at`.
- [ ] Quyết định kênh gửi: web app không có push notification native dễ dàng như mobile — đề xuất dùng **Web Push API (service worker)** hoặc đơn giản hơn là **in-app banner + email** (qua Supabase Edge Function/cron). Ghi rõ lựa chọn cuối cùng vào nhật ký.
- [ ] UI cấu hình reminder trong `/settings`.

### Module 3 — Theo dõi cân nặng & nhiệt độ cơ bản (BBT)
- [ ] Mở rộng `MetricType` trong `queries.ts` và constraint `health_metrics_type_check` trong schema: thêm `'weight'`, `'bbt'`.
- [ ] Thêm form nhập trong `MetricLogForm.tsx`.
- [ ] Thêm biểu đồ xu hướng cân nặng/BBT (tái sử dụng `MiniBars.tsx` hoặc thêm chart mới).
- [ ] BBT ảnh hưởng dự đoán rụng trứng — **không bắt buộc** phải tích hợp vào `predictCycle()` ngay, có thể để giai đoạn 2; nếu tích hợp, note rõ thuật toán dùng (vd: phát hiện tăng nhiệt 0.3-0.5°C sau rụng trứng).

### Module 4 — Xuất báo cáo PDF cho bác sĩ (VIP)
- [ ] Tạo `src/lib/export-report.ts`: build dữ liệu báo cáo từ `buildCycleHistory()` + `summarizeCycleHistory()` + health metrics.
- [ ] Dùng thư viện PDF phía client (vd: `@react-pdf/renderer` hoặc `jspdf`) để xuất file — kiểm tra `package.json` xem đã có lib PDF chưa trước khi thêm mới.
- [ ] Khoá tính năng bằng `LockedFeature`/`isVipProfile()`.
- [ ] Nút "Xuất báo cáo" đặt ở `/profile/report`.

### Module 5 — Event/Correlation Analysis (VIP)
- [ ] Cho phép user chọn 2 metric (vd: stress vs sleep, hoặc 1 metric vs 1 triệu chứng) và hiển thị biểu đồ chồng theo trục thời gian/theo ngày-trong-chu-kỳ.
- [ ] Tạo `src/lib/correlation.ts`: hàm thuần tính alignment dữ liệu 2 chuỗi theo ngày.
- [ ] Component mới `src/components/profile/CorrelationChart.tsx`.
- [ ] Khoá VIP.

### Module 6 — Symptom Analysis chuyên sâu (VIP)
- [ ] Thống kê tần suất từng triệu chứng theo pha chu kỳ (dùng taxonomy từ Module 1) qua nhiều chu kỳ.
- [ ] Hiển thị dạng bar chart "triệu chứng nào xuất hiện nhiều nhất ở pha nào".
- [ ] Khoá VIP, đặt trong `/profile` hoặc `/profile/report`.

### Module 7 — Thư viện nội dung giáo dục
- [ ] Thêm bảng `articles` (nếu muốn quản trị nội dung động) hoặc mở rộng file tĩnh `cycle-insights.ts` thành danh mục lớn hơn có phân loại + trang danh sách `/library` hoặc `/insights`.
- [ ] Free: xem giới hạn số bài/tháng hoặc chỉ xem preview; VIP: xem toàn bộ — dùng lại `LockedFeature`.

### Module 8 — Onboarding quiz mở rộng
- [ ] Xem lại `src/app/onboarding/page.tsx` hiện tại, bổ sung câu hỏi "mục tiêu sử dụng" (theo dõi thường / mong có thai / tránh thai) → lưu vào `profiles` (thêm cột `usage_goal`).
- [ ] Dùng mục tiêu này để cá nhân hoá nội dung insight (vd: nếu goal = "mong có thai" thì nhấn mạnh cửa sổ thụ thai, BBT).

### Module 9 — Kegel Trainer (VIP)
- [ ] Component timer bài tập đơn giản (không cần dữ liệu Supabase phức tạp, có thể lưu lịch sử tập vào bảng `kegel_sessions` nếu muốn theo dõi).
- [ ] Trang riêng hoặc modal, khoá VIP.

### Module 10 — Fatigue test / mini quiz sức khoẻ định kỳ
- [ ] Thiết kế bộ câu hỏi ngắn (3-5 câu) trả về điểm số, lưu kết quả như một `health_metrics` entry mới hoặc bảng riêng `wellness_checks`.

### Module 11 — App Lock (PIN)
- [ ] Thêm cột `app_lock_pin_hash` vào `profiles` (hash, không lưu plaintext).
- [ ] UI thiết lập/nhập PIN trong `/settings`, kiểm tra khi mở app (session-based, không cần phức tạp như biometric thật vì là web).

---

## 5. Bổ sung phân tích sâu codebase (đọc trực tiếp `2707.zip`)

> Phần này soát lại toàn bộ `src/`, `supabase/schema.sql`, `package.json` để xác nhận/chỉnh lại độ chính xác của bảng gap ở mục 2, và phát hiện thêm vài điểm chưa được nêu.

### 5.1 Xác nhận đúng với bảng gap gốc
- Schema Supabase khớp 100% với mô tả ở mục 0 (4 bảng, RLS đầy đủ theo `auth.uid() = user_id`, trigger `protect_vip_columns` chặn client tự set `is_vip`).
- `cycle-utils.ts`: `predictCycle`, `buildCycleHistory`, `summarizeCycleHistory` đúng như mô tả, có `abnormalCycle`/`abnormalPeriod`/`irregular` (ngưỡng 21-35 ngày chu kỳ, 2-8 ngày hành kinh, lệch >7 ngày = "irregular").
- `onboarding/page.tsx`: xác nhận chỉ 3 trường (ngày sinh tuỳ chọn, độ dài chu kỳ, độ dài hành kinh) — không có câu hỏi "mục tiêu sử dụng". Khớp F8 ⚠️.
- Không có `signInAnonymously`/guest mode ở `auth-context.tsx`/`AuthGate.tsx`/`login/page.tsx` — khớp F9 ❌.
- Không có bảng `reminders`, không có `Notification`/service worker/push trong toàn bộ `src/` — khớp F5 ❌.
- `package.json`: không có lib PDF (jspdf/react-pdf/pdfkit), không có PWA plugin (next-pwa/workbox), không có lib push (web-push) — càng củng cố F7/P1 đều ❌/⚠️ đúng như đã ghi.

### 5.2 Phát hiện thêm — chưa có trong bảng gap gốc

| # | Phát hiện | Vị trí | Mức độ |
|---|-----------|--------|--------|
| N1 | **`abnormalCycle`/`abnormalPeriod`/`irregular` chỉ được dùng ở `CycleInsights.tsx`** (trang `/profile`), không hề xuất hiện ở trang chủ (`/`) hay `CycleCalendar.tsx`. Cảnh báo bất thường hoàn toàn bị động — user phải tự vào Profile mới thấy, không có banner/toast chủ động khi vừa log xong hoặc khi mở app. | Toàn repo chỉ 1 file dùng các flag này | Nên nâng độ ưu tiên F4 từ ⚠️ lên gần ❌ về mặt UX chủ động |
| N2 | **Nút "Mở khoá VIP" trong `LockedFeature.tsx` không có `onClick`** — hoàn toàn chưa nối vào bất kỳ luồng thanh toán/nâng cấp nào (không Stripe, không link, không modal). `MembershipCard.tsx`/`LockedCycleChart.tsx` cũng không có logic upgrade. | `src/components/profile/LockedFeature.tsx` | Cao — đây là gap kinh doanh cốt lõi: có UI khoá tính năng nhưng **không có đường nào để user thực sự trả tiền/nâng cấp**. Cấp VIP hiện tại 100% thủ công qua SQL (`grant-vip-tempmail-orc.sql`) |
| N3 | **`/settings` phần lớn là UI giả** — "Thông báo" và "Hệ mét" chỉ là `useState` cục bộ, mất khi reload, không lưu Supabase, không có tác dụng thật. "Chủ đề" hiển thị cứng "Sáng", không bấm được. | `src/app/settings/page.tsx` | Trung bình — dễ gây hiểu lầm cho user rằng cài đặt đã được lưu |
| N4 | **AI chat dùng model free ngẫu nhiên qua OpenRouter** (`openrouter/free` x4, đua song song bằng `Promise.any`, lọc reply rác bằng heuristic). Không dùng model cố định/trả phí nên chất lượng & độ ổn định câu trả lời không đảm bảo, đặc biệt cho nội dung sức khoẻ nhạy cảm. | `src/app/api/ai-chat/route.ts` | Trung bình-Cao — rủi ro chất lượng nội dung y tế, nên cân nhắc model cố định (vd Claude/GPT trả phí) ít nhất cho user VIP |
| N5 | **Lịch sử chat AI không được lưu trữ** — chỉ tồn tại trong state phiên (`ai-chat.ts` có TODO sẵn ghi chú việc này), mất khi refresh trang hoặc đổi thiết bị. | `src/lib/ai-chat.ts` (dòng TODO) | Thấp-Trung bình — đã có TODO sẵn trong code nên dễ làm |
| N6 | **Rate limit AI chat dùng in-memory Map** (`RATE_LIMIT = 10 req/60s`) — không bền vững khi deploy serverless nhiều instance (Vercel) vì mỗi instance có bộ đếm riêng, không đồng bộ. | `src/app/api/ai-chat/route.ts` (`requestLog` Map) | Thấp — chấp nhận được ở MVP, cần thay bằng Redis/Upstash khi lên production thật |
| N7 | **Không có trường `usage_goal`/mục đích sử dụng trong schema** — xác nhận đúng hướng đề xuất ở Module 8, nhưng `EditProfileModal.tsx`/`useUpdateProfile()` hiện chỉ nhận field cố định trong interface `Profile`, cần mở rộng interface + schema đồng thời khi làm Module 8. | `src/lib/queries.ts` (`Profile` interface) | Ghi chú kỹ thuật, không phải gap độc lập |
| N8 | **`MetricType` là union string cứng 5 giá trị** (`stress/heart_rate/sleep/hydration/mood`), CHECK constraint DB cũng hard-code 5 giá trị. Khi làm P6 (weight)/P7 (BBT), cần sửa đồng thời 4 lớp: (a) constraint SQL, (b) type `MetricType` trong `queries.ts`, (c) `MetricConfig` trong `MetricLogForm.tsx`, (d) trọng số trong `health-score.ts` nếu muốn tính vào điểm sức khoẻ. | `schema.sql`, `queries.ts`, `MetricLogForm.tsx`, `health-score.ts` | Ghi chú kỹ thuật quan trọng cho Module 3 (P6/P7) |

### 5.3 Đề xuất module mới (ưu tiên cao) dựa trên phát hiện N2

### Module 0 (mới, nên làm sớm) — Luồng nâng cấp VIP thực sự
- [ ] Quyết định phương thức thanh toán cho thị trường VN (vd: chuyển khoản QR + admin duyệt qua bảng `vip_requests`, hoặc tích hợp VNPay/MoMo/PayOS).
- [ ] Nối `onClick` ở `LockedFeature.tsx`, `MembershipCard.tsx` đến trang/modal "Nâng cấp VIP" thật.
- [ ] Trang `/upgrade` hoặc modal hiển thị lợi ích VIP (P1-P14) + CTA thanh toán.
- [ ] Webhook/endpoint service-role để tự động set `is_vip = true` sau khi xác nhận thanh toán (thay vì chạy SQL tay như hiện tại).

---

## 6. Nhật ký triển khai

> Agent: thêm entry mới ở **cuối** danh sách này, không sửa/xoá entry cũ.

- **2026-07-27** — Khởi tạo file phân tích + roadmap (chưa triển khai module nào). Người thực hiện: Claude (phân tích qua source code hiện có + research web về Clover/Wachanga). Việc còn dang dở: toàn bộ Module 1–12 ở trạng thái chưa bắt đầu.
- **2026-07-27** — Review sâu codebase `2707.zip` (đọc trực tiếp toàn bộ `src/`, `supabase/schema.sql`, `package.json`). Xác nhận bảng gap gốc đúng 100%; bổ sung 8 phát hiện mới (N1-N8) ở mục 5.2, đáng chú ý nhất: (1) nút "Mở khoá VIP" chưa nối luồng thanh toán nào (N2) — đề xuất Module 0 mới ưu tiên cao; (2) cảnh báo chu kỳ bất thường chỉ hiển thị bị động ở `/profile` (N1); (3) AI chat dùng model free ngẫu nhiên, rủi ro chất lượng nội dung y tế (N4). Người thực hiện: Claude. Việc còn dang dở: chưa code module nào, kể cả Module 0 mới đề xuất.
- **2026-07-27** — **Hoàn thành Module 0 — Luồng nâng cấp VIP.** Đã triển khai:
  - `supabase/sql/module0_vip_requests.sql`: bảng `vip_requests` (status pending/approved/rejected, transfer_code, note) + RLS + trigger chặn user tự đổi status + template SQL duyệt thủ công cuối file.
  - `src/lib/queries.ts`: thêm `useLatestVipRequest()`, `useCreateVipRequest()`, type `VipRequest`.
  - `src/app/upgrade/page.tsx` (mới): trang hiển thị lợi ích VIP (P1/P2/P3/P6/P7/P8 tóm tắt), mã QR VietQR động (dùng `img.vietqr.io`, cần thay `BANK.bankId`/`accountNo`/`accountName` thật trước khi deploy), nội dung chuyển khoản có mã định danh user, nút "Tôi đã chuyển khoản" tạo `vip_requests` row, hiển thị trạng thái pending/rejected nếu đã từng gửi.
  - Nối `onClick` thật ở `LockedFeature.tsx`, `MembershipCard.tsx`, `LockedCycleChart.tsx` → `router.push("/upgrade")` (trước đó không có onClick nào — N2).
  - `BottomNav.tsx`: ẩn thanh nav ở `/upgrade` (theo pattern các trang modal khác).
  - Đã chạy `tsc --noEmit` không lỗi. Chưa chạy `next build`/test UI thực tế trên trình duyệt.
  - **Còn thiếu để hoàn thiện Module 0 (không tự động hoá được vì cần thông tin thật)**: (a) thay thông tin ngân hàng demo trong `BANK` object bằng thông tin thật; (b) hiện tại duyệt VIP vẫn thủ công (chạy SQL trong Supabase SQL Editor) — chưa có endpoint/webhook tự động; (c) chưa có trang admin để xem danh sách `vip_requests` pending, tạm thời phải xem trực tiếp qua Supabase Table Editor.
  - Người thực hiện: Claude. File package gửi cho user: `module0_vip_upgrade_flow.zip` (7 file: 1 SQL mới, 1 trang mới, 4 file sửa).
- **2026-07-27** — **Hoàn thành Module 1 — Taxonomy triệu chứng chuẩn (F3).** Đã triển khai:
  - `src/lib/symptoms.ts` (mới): định nghĩa `SYMPTOM_TAXONOMY` — 25 triệu chứng chia 5 nhóm (Thể chất, Tâm trạng, Dịch tiết, Hoạt động tình dục, Da & tóc), mỗi triệu chứng có icon (lucide-react) + category. `id` của mỗi triệu chứng giữ nguyên chuỗi tiếng Việt cũ (vd "Đau bụng") để **tương thích ngược 100% với dữ liệu `cycle_logs.symptoms` đã có** — không cần migration DB. Có sẵn helper `groupSymptomIdsByCategory()` và `getSymptomDef()` để Module 6 (Symptom Analysis) dùng lại sau này.
  - `src/components/log/CycleLogForm.tsx`: thay danh sách triệu chứng phẳng 8 mục bằng UI tab theo category (cuộn ngang, có badge số lượng đã chọn mỗi nhóm) + hiển thị icon từng triệu chứng + tóm tắt "Đã chọn (n)" cuối form.
  - Đã chạy `tsc --noEmit` không lỗi.
  - **Còn thiếu để hoàn thiện đầy đủ**: các nơi hiển thị symptoms khác (CycleInsights, AI chat context ở `route.ts`) hiện vẫn hiển thị raw string, chưa dùng icon/category — có thể nâng cấp thêm ở Module 6 khi làm Symptom Analysis. Chưa thêm UI "quản lý danh sách triệu chứng tuỳ chỉnh" (thêm triệu chứng riêng ngoài taxonomy).
  - Người thực hiện: Claude. File package gửi cho user: `module1_symptom_taxonomy.zip` (1 file mới, 1 file sửa).
- **2026-07-27** — **Hoàn thành Module 4 / N1 — Cảnh báo chu kỳ bất thường chủ động (F4).** Đã triển khai:
  - `src/components/cycle/AbnormalCycleBanner.tsx` (mới): dùng lại `buildCycleHistory()`/`summarizeCycleHistory()` có sẵn trong `cycle-utils.ts` (trước đây chỉ dùng ở `CycleInsights.tsx`). Banner hiển thị tối đa 3 cảnh báo cùng lúc (chu kỳ dài/ngắn bất thường, hành kinh dài/ngắn bất thường, biến động >7 ngày giữa 2 chu kỳ gần nhất) kèm disclaimer "không thay thế chẩn đoán y khoa". Có nút đóng (dismiss theo session, chưa lưu persist).
  - `src/app/page.tsx`: chèn banner ngay dưới card Health Score ở trang chủ — nơi user mở app đầu tiên mỗi ngày.
  - `src/app/cycle/page.tsx`: chèn banner ở đầu nội dung trang Chu kỳ.
  - Đã chạy `tsc --noEmit` không lỗi.
  - **Còn thiếu để hoàn thiện đầy đủ**: dismiss hiện chỉ tồn tại trong session (mất khi reload) — nếu muốn "đã đóng thì không hiện lại trong ngày/tuần" cần lưu vào localStorage hoặc DB. Chưa có push notification thật (vẫn thuộc phạm vi F5, module riêng).
  - Người thực hiện: Claude. File package gửi cho user: `module4_abnormal_cycle_banner.zip` (1 file mới, 2 file sửa).
- **2026-07-27** — **Hoàn thành Module 8 — Onboarding quiz mở rộng (F8).** Đã triển khai:
  - `supabase/sql/module8_usage_goal.sql` (mới): thêm cột `profiles.usage_goal` (`'track' | 'conceive' | 'avoid'`, nullable, có CHECK constraint).
  - `src/lib/queries.ts`: thêm type `UsageGoal`, thêm field `usage_goal` vào interface `Profile`.
  - `src/app/onboarding/page.tsx`: chuyển thành 2 bước — bước 1 hỏi mục đích sử dụng (Theo dõi chu kỳ / Mong có thai / Tránh thai, mỗi lựa chọn có icon riêng), bước 2 giữ nguyên 3 câu hỏi cũ (ngày sinh, độ dài chu kỳ, độ dài hành kinh) + nút "Quay lại". Lưu `usage_goal` cùng lúc với `onboarded: true`.
  - `src/app/cycle/page.tsx`: cá nhân hoá nhẹ — nếu `usage_goal === "conceive"`, hiện thêm dải "🌷 Cửa sổ thụ thai: [ngày] – [ngày]" ngay dưới 2 ô "Kỳ tới"/"Ngày rụng trứng" để nhấn mạnh thông tin quan trọng với nhóm mục tiêu này (khớp gợi ý ở Module 8 gốc: "nếu goal = mong có thai thì nhấn mạnh cửa sổ thụ thai").
  - Đã chạy `tsc --noEmit` không lỗi.
  - **Còn thiếu để hoàn thiện đầy đủ**: user hiện có (đã `onboarded = true` từ trước) sẽ có `usage_goal = null` — cần thêm cách chỉnh sau ở `/settings` hoặc `EditProfileModal.tsx` nếu muốn họ khai báo sau (chưa làm, vì "Cài đặt sức khỏe > Mục đích" trong `/settings` hiện vẫn là dòng tĩnh không bấm được — thuộc N3, module riêng). Nội dung `cycle-insights.ts` (Outlook, DailyInsights) chưa được cá nhân hoá theo goal — mới chỉ áp dụng ở cửa sổ thụ thai trên `/cycle`.
  - Người thực hiện: Claude. File package gửi cho user: `module8_onboarding_quiz.zip` (1 file SQL mới, 3 file sửa).
- **2026-07-27** — **Hoàn thành Module N3 — `/settings` từ UI giả thành lưu thật.** Đã triển khai:
  - `supabase/sql/module_n3_settings.sql` (mới): thêm cột `profiles.notifications_enabled` (boolean, default true) và `profiles.metric_units` (boolean, default true = hệ mét).
  - `src/lib/queries.ts`: thêm 2 field trên vào interface `Profile`.
  - `src/app/settings/page.tsx`: viết lại — bỏ `useState` cục bộ, dùng `useProfile()`/`useUpdateProfile()` thật để đọc/ghi Supabase. Toggle "Thông báo" và "Hệ mét" giờ lưu persist qua reload/đổi thiết bị. Dòng "Mục đích" giờ bấm được, mở bottom sheet chọn lại giữa 3 lựa chọn (dùng chung `UsageGoal` từ Module 8) và lưu ngay lập tức — giải quyết luôn phần "còn thiếu" đã ghi ở log Module 8 (user cũ/đổi ý có thể tự đặt `usage_goal` mà không cần onboarding lại).
  - "Chủ đề" vẫn giữ tĩnh (đổi text phụ thành "Sáng (mặc định)" cho rõ ràng hơn là không phải bug) vì app chưa có hệ thống theme thật — nằm ngoài phạm vi P9 (chưa làm).
  - Đã chạy `tsc --noEmit` không lỗi.
  - **Còn thiếu để hoàn thiện đầy đủ**: bật "Thông báo" hiện chỉ lưu ý định của user vào DB, CHƯA có cơ chế gửi thông báo thật (vẫn là gap F5 — cần service worker/push, module riêng). `metric_units` mới lưu được nhưng CHƯA có nơi nào trong app đọc giá trị này để đổi đơn vị hiển thị (áp dụng khi làm Module P6 cân nặng, cần convert kg/lb theo cờ này).
  - Người thực hiện: Claude. File package gửi cho user: `moduleN3_real_settings.zip` (1 file SQL mới, 2 file sửa).
- **2026-07-27** — **Hoàn thành Module 3 — Theo dõi cân nặng & nhiệt độ cơ bản (P6/P7).** Đã triển khai:
  - `supabase/schema.sql`: mở rộng constraint `health_metrics_type_check` thêm `'weight'`, `'bbt'` (drop constraint cũ rồi tạo lại, an toàn chạy lại nhiều lần).
  - `src/lib/queries.ts`: `MetricType` thêm `'weight' | 'bbt'`; thêm hook `useMetricTrend(type, days=90)` riêng (khác `useHealthMetrics()` vốn chỉ lấy 7 ngày) để có đủ dữ liệu vẽ xu hướng dài hạn.
  - `src/app/log/page.tsx`: thêm 2 `metricConfig`/`logOptions` mới — Cân nặng (30–120kg, bước 0.1) và BBT (35–39°C, bước 0.05).
  - `src/components/profile/WeightBBTChart.tsx` (mới): biểu đồ LineChart (recharts, đồng bộ style với `CycleInsights.tsx`) có tab chuyển đổi Cân nặng/BBT, tự động chọn domain trục Y theo dữ liệu.
  - `src/app/profile/page.tsx`: chèn `<WeightBBTChart />` giữa `CycleInsights` và mục Lịch hẹn.
  - `src/app/profile/report/page.tsx`: bổ sung nhãn `weight`/`bbt` vào `METRIC_LABELS` (báo cáo bác sĩ) — nếu không sẽ lỗi TypeScript vì thiếu key.
  - Không khoá VIP (đúng roadmap — chỉ P1/P2/P3/P8 mới là tính năng khoá).
  - Đã chạy `npm install` + `tsc --noEmit` không lỗi.
  - **Còn thiếu để hoàn thiện đầy đủ**: BBT chưa được tích hợp vào `predictCycle()` để tăng độ chính xác dự đoán rụng trứng (roadmap gốc ghi rõ có thể để giai đoạn 2 — quyết định: CHƯA làm ở module này). `metric_units` (cờ mét/imperial đã lưu ở Module N3) chưa được đọc để đổi đơn vị hiển thị kg/lb cho cân nặng — cần làm khi có nhu cầu thực tế từ user quốc tế.
  - Người thực hiện: Claude. File package gửi cho user: `module2_module3.zip` (patch gộp chung với Module 2, xem entry bên dưới).
- **2026-07-27** — **Hoàn thành Module 2 — Hệ thống nhắc nhở (F5).** Đã triển khai:
  - `supabase/sql/module2_reminders.sql` (mới): bảng `reminders` (`user_id, type, enabled, lead_days, time_of_day, created_at`), CHECK `type in ('period_upcoming','log_daily','medication','custom')`, unique `(user_id, type)`, RLS đầy đủ.
  - **Quyết định kênh gửi** (ghi theo yêu cầu roadmap): app là Next.js web, chưa có hạ tầng push (không service worker/VAPID) hay cron/edge function gửi email → chọn kênh đơn giản nhất triển khai được ngay: **in-app banner**, hiển thị khi user mở app và điều kiện đúng (còn ≤ lead_days ngày tới kỳ kinh, hoặc chưa log gì hôm nay). Schema vẫn đủ field để agent sau nối thêm web-push/email mà không cần đổi DB.
  - `src/lib/queries.ts`: thêm `ReminderType`, `Reminder`, `useReminders()`, `useUpsertReminder()` (upsert theo `user_id,type`).
  - `src/app/settings/page.tsx`: thêm section "Nhắc nhở" — toggle "Sắp đến kỳ kinh" (kèm slider chỉnh số ngày báo trước 1–5) và toggle "Nhắc ghi log hàng ngày", có ghi chú rõ đây là banner in-app chứ không phải push.
  - `src/components/cycle/ReminderBanner.tsx` (mới): tính `daysToNextPeriod` (dùng lại `daysUntil`/`predictCycle` có sẵn) và kiểm tra đã log hôm nay chưa (từ `useHealthMetrics()`), ưu tiên hiển thị 1 banner (period trước, log sau), có nút đóng theo session.
  - `src/app/page.tsx`: chèn `<ReminderBanner />` ngay dưới `AbnormalCycleBanner` ở trang chủ.
  - Đã chạy `tsc --noEmit` không lỗi.
  - **Còn thiếu để hoàn thiện đầy đủ**: chưa có push notification/email thật (cần thêm hạ tầng ngoài phạm vi 1 module — VAPID + service worker, hoặc Supabase Edge Function + cron quét `reminders` mỗi ngày). Loại `medication`/`custom` đã có trong CHECK constraint DB nhưng CHƯA có UI cấu hình (mới làm `period_upcoming` + `log_daily` theo đúng 2 mục ưu tiên cao nhất trong roadmap gốc). Dismiss banner chỉ theo session (mất khi reload), chưa lưu persist.
  - Người thực hiện: Claude. File package gửi cho user: `module2_module3.zip` (10 file: 2 SQL — 1 sửa 1 mới, 6 file sửa, 2 file mới).
- **2026-07-27** — **Hoàn thành Module 4 — Xuất báo cáo PDF cho bác sĩ (P1, VIP).** Đã triển khai:
  - `package.json`: thêm dependency `jspdf@^4.2.1` + `jspdf-autotable@^5.0.8` (kiểm tra trước — dự án chưa có lib PDF nào).
  - `src/lib/export-report.ts` (mới): hàm thuần `buildAndDownloadReportPdf(data)` build file PDF client-side (A4, có header, bảng tổng quan chu kỳ, bảng lịch sử chu kỳ có cột "Bất thường", bảng chỉ số sức khỏe gồm cả weight/bbt mới thêm ở Module 3, footer disclaimer y khoa ở mọi trang), trả về file tải trực tiếp qua `doc.save()` — không qua server.
  - `src/app/profile/report/page.tsx`: thêm nút "Xuất PDF" cạnh nút "In" cũ (nút In giữ nguyên window.print() cho ai thích in trực tiếp/máy in ảo). Nút "Xuất PDF" bọc trong `LockedFeature`/`isVipProfile()` có sẵn — đúng nguyên tắc "không tự chế cơ chế khoá mới".
  - Đã chạy `tsc --noEmit` không lỗi.
  - **Còn thiếu để hoàn thiện đầy đủ**: chưa test render PDF thực tế trên trình duyệt thật (chỉ kiểm tra logic + kiểu dữ liệu qua tsc); nếu dữ liệu quá dài (nhiều chỉ số/nhiều kỳ) mới chỉ có auto-add-page đơn giản trước bảng chỉ số sức khỏe, chưa xử lý ngắt trang tối ưu cho bảng lịch sử chu kỳ dài.
  - Người thực hiện: Claude. File package gửi cho user: `module4_pdf_report.zip` (1 file mới, 2 file sửa: `package.json` + `profile/report/page.tsx`).
- **2026-07-27** — **Hoàn thành Module 5 — Event/Correlation Analysis (P3, VIP).** Đã triển khai:
  - `src/lib/correlation.ts` (mới, business logic thuần không phụ thuộc React): `alignMetricsByDate()` ghép 2 chuỗi metric theo `logged_at`, `pearsonCorrelation()` tính hệ số r (yêu cầu tối thiểu 3 cặp ngày có đủ dữ liệu, trả `null` nếu phương sai = 0 hoặc thiếu dữ liệu), `interpretCorrelation()` diễn giải r thành nhãn tiếng Việt dễ hiểu (không đáng kể/yếu/trung bình/mạnh, cùng chiều/ngược chiều).
  - **Quyết định phạm vi quan trọng**: chỉ làm tương quan **metric-vs-metric** (vd stress vs sleep, weight vs mood...), KHÔNG làm metric-vs-symptom như gợi ý phụ trong roadmap gốc, vì `symptoms` trong schema hiện tại được gắn vào một *kỳ kinh* (`cycle_logs.start_date/end_date`) chứ không phải log theo từng ngày — không có "giá trị triệu chứng của ngày X" rõ ràng để so khớp trục thời gian với metric. Đã ghi rõ lý do trong comment đầu file `correlation.ts` để agent sau không làm trùng hướng đã cân nhắc và loại bỏ.
  - `src/components/profile/CorrelationChart.tsx` (mới): UI 2 dropdown chọn chỉ số (dùng lại toàn bộ `MetricType` kể cả weight/bbt mới thêm ở Module 3), biểu đồ chồng 2 trục Y riêng (recharts, `yAxisId` trái/phải theo màu từng chỉ số), badge hiển thị hệ số r + diễn giải, disclaimer "tương quan không đồng nghĩa nhân quả". Tự động đổi chỉ số còn lại nếu user chọn trùng 1 metric ở cả 2 ô.
  - `src/app/profile/page.tsx`: chèn `<CorrelationChart />` bọc trong `LockedFeature`/`isVipProfile()` có sẵn, đặt ngay sau `WeightBBTChart`.
  - Đã chạy `tsc --noEmit` không lỗi.
  - **Còn thiếu để hoàn thiện đầy đủ**: chưa có tương quan với triệu chứng (xem lý do ở trên — cần đổi model dữ liệu, để lại cho module riêng nếu chủ dự án muốn làm sau); ngưỡng diễn giải mạnh/yếu/trung bình dùng ngưỡng thống kê phổ biến tham khảo (0.2/0.4/0.7), chưa được validate với chuyên gia y tế.
  - Người thực hiện: Claude. File package gửi cho user: `module5_correlation_analysis.zip` (2 file mới, 1 file sửa).
- **2026-07-27** — **Hoàn thành Module 6 — Symptom Analysis chuyên sâu (P2, VIP).** Đã triển khai:
  - `src/lib/symptom-analysis.ts` (mới, business logic thuần): `computeSymptomFrequencies(logs)` tính tần suất (số kỳ + %) mỗi triệu chứng xuất hiện qua toàn bộ kỳ kinh đã ghi, và xu hướng (up/down/flat/new/none) bằng cách so sánh tỉ lệ xuất hiện ở nửa gần đây vs nửa trước đó theo thời gian (ngưỡng chênh lệch >15 điểm % mới tính là tăng/giảm; <4 kỳ tổng thì không đủ tin cậy để nói xu hướng → trend="none").
  - **Quyết định phạm vi quan trọng** (giống cách xử lý ở Module 5): roadmap gốc muốn phân tích "theo PHA chu kỳ", nhưng vì `symptoms` trong schema chỉ được gắn vào dòng `cycle_logs` đại diện MỘT KỲ KINH (tức luôn thuộc pha "period"), không có ghi nhận triệu chứng rời rạc ở pha nang trứng/rụng trứng/hoàng thể — nên điều chỉnh thành phân tích **tần suất & xu hướng theo THỜI GIAN qua nhiều kỳ** (đúng tinh thần phần "phân tích xu hướng" của P2), thay vì theo pha. Lý do đã ghi rõ trong comment đầu file để agent sau không hiểu nhầm là thiếu sót.
  - `src/components/profile/SymptomAnalysis.tsx` (mới): thanh tần suất (progress bar) top 8 triệu chứng, có tab lọc theo nhóm (dùng lại `SYMPTOM_CATEGORIES`/`SYMPTOM_CATEGORY_LABELS` từ Module 1), icon + badge xu hướng tăng/giảm/mới.
  - `src/app/profile/page.tsx`: chèn `<SymptomAnalysis cycleLogs={cycleLogs} />` bọc `LockedFeature`/`isVipProfile()`, đặt ngay sau `CorrelationChart` (Module 5).
  - Đã chạy `tsc --noEmit` không lỗi.
  - **Còn thiếu để hoàn thiện đầy đủ**: chưa có phân tích thật sự theo pha chu kỳ (xem lý do ở trên); ngưỡng "tăng/giảm" (15 điểm %) là ước lượng hợp lý, chưa được kiểm chứng bởi chuyên gia; danh sách chỉ hiển thị tối đa 8 triệu chứng đầu (không có nút "xem thêm").
  - Người thực hiện: Claude. File package gửi cho user: `module6_symptom_analysis.zip` (2 file mới, 1 file sửa).
