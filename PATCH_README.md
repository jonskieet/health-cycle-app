# Patch: Module 7 — Kegel Trainer (P4) + Module 9 — Fatigue Test (P5), cả 2 đều VIP

## Cách áp dụng
1. Chạy 2 file SQL mới trong Supabase SQL Editor (thứ tự không quan trọng):
   - `supabase/sql/module7_kegel_sessions.sql`
   - `supabase/sql/module9_fatigue_tests.sql`
2. Giải nén đè phần còn lại vào gốc dự án.
3. File MỚI:
   - `src/lib/kegel.ts`, `src/lib/fatigue-test.ts`
   - `src/components/kegel/KegelTimer.tsx`
   - `src/components/fatigue/FatigueQuiz.tsx`
   - `src/app/kegel/page.tsx`
   - `src/app/fatigue-test/page.tsx`
4. File THAY (chỉ thêm, không xoá gì của module cũ):
   - `src/lib/queries.ts` — thêm hook `useKegelSessions`/`useLogKegelSession`/`useFatigueTests`/`useSaveFatigueTest`
   - `src/app/profile/page.tsx` — thêm 2 mục liên kết mới (khoá VIP) tới `/kegel` và `/fatigue-test`
   - `src/components/layout/BottomNav.tsx` — ẩn thanh nav ở 2 trang mới (theo đúng pattern `/upgrade`, `/settings`)
5. Không cần cài dependency mới (dùng lại `recharts`... không, thực ra module này không dùng chart, chỉ dùng `AuroraRing`/`EmptyState`/`lucide-react` đã có sẵn).

## Module 7 — Bài tập Kegel (P4, VIP)
- Trang `/kegel`: chọn 1 trong 3 preset (Người mới / Trung cấp / Nâng cao), mỗi preset
  có nhịp co-thả lỏng khác nhau, chia thành các "set" có nghỉ giữa hiệp.
- `KegelTimer.tsx`: timer trực quan dùng lại `AuroraRing` có sẵn, đổi màu theo phase
  (Co cơ / Thả lỏng / Nghỉ), có nút Bắt đầu lại/Tạm dừng/Dừng.
- Hoàn thành bài hoặc dừng giữa chừng đều được ghi vào bảng `kegel_sessions`
  (`completed = true/false`) — hiển thị lại ở mục "Lịch sử tập luyện" trên chính trang này.
- Khoá VIP bằng `LockedFeature`/`isVipProfile()` có sẵn, không tạo cơ chế khoá mới.

## Module 9 — Trắc nghiệm năng lượng / Fatigue test (P5, VIP)
- Trang `/fatigue-test`: bài quiz 6 câu hỏi (thang 5 mức độ mỗi câu) đánh giá mệt mỏi
  thể chất/tinh thần/giấc ngủ/động lực trong 7 ngày gần nhất.
- `scoreFatigueTest()` (`src/lib/fatigue-test.ts`) quy điểm về thang 0-100, phân loại
  3 mức (Tốt/Trung bình/Cao) kèm gợi ý riêng cho từng mức, luôn có disclaimer
  "không thay thế chẩn đoán y khoa".
- Kết quả lưu vào bảng `fatigue_tests` (điểm, mức, câu trả lời dạng jsonb) — hiển thị
  lịch sử các lần làm test trước đó ngay dưới quiz.
- Khoá VIP bằng `LockedFeature`/`isVipProfile()` có sẵn.

## Quyết định phạm vi (đọc trước khi mở rộng)
- **Không dùng chung `health_metrics`/`MetricType`** cho 2 module này. Lý do: Kegel
  session và Fatigue test đều là dữ liệu nhiều-trường (nhiều rep/nhiều câu trả lời),
  không phải "1 giá trị/loại/ngày" như model `health_metrics` hiện có — ép vào đó sẽ
  mất thông tin (vd không lưu được từng câu trả lời của quiz). Nên tạo 2 bảng riêng,
  giữ nguyên schema cũ không đổi (không cần sửa 4 lớp như lưu ý N8 trong roadmap).
- **Kegel Trainer chỉ có 3 preset cố định**, chưa cho tạo bài tập tuỳ chỉnh (đổi giây
  co/thả lỏng riêng) — đủ dùng cho đa số người mới, giữ phạm vi module gọn.
- **Không thêm mục vào `BottomNav`** (thanh nav dưới chỉ có 4 chỗ cố định) — theo đúng
  pattern các trang phụ khác (`/upgrade`, `/settings`, `/profile/report`): vào từ danh
  sách liên kết ở trang Cá nhân, ẩn bottom nav khi ở trang đó.

## Việc còn thiếu để hoàn thiện đầy đủ
- Kegel: chưa có biểu đồ tiến độ luyện tập theo thời gian (mới chỉ có danh sách lịch
  sử dạng list) — có thể thêm chart số buổi/tuần nếu cần sau.
- Kegel: timer chạy hoàn toàn client-side bằng `setInterval` — nếu user khoá màn hình
  giữa chừng trên mobile, timer có thể bị trình duyệt tạm dừng (giới hạn chung của
  cách làm timer không dùng Web Worker/Wake Lock, ngoài phạm vi module này).
- Fatigue test: ngưỡng phân loại 33/66 điểm là ước lượng hợp lý (chia đều 3 mức),
  chưa được kiểm chứng bởi chuyên gia y tế — giống cách đã làm ở Module 5/6.
- Fatigue test: chưa có biểu đồ xu hướng điểm số qua các lần test (mới chỉ liệt kê
  lịch sử dạng list, giống Kegel) — nên làm chung nếu về sau muốn thêm chart cho
  cả 2 module cùng lúc, dùng lại style `WeightBBTChart.tsx`.

Đã chạy `tsc --noEmit` và `eslint` trên toàn bộ file mới/sửa — không lỗi.
Đã merge patch vào bản copy đầy đủ của dự án để kiểm tra type end-to-end — không lỗi.
`next build` không chạy được trong sandbox do mạng chặn Google Fonts (không liên
quan tới code của patch này).
