# Patch: Module 5 — Event/Correlation Analysis (VIP)

## Cách áp dụng
1. Giải nén đè vào gốc dự án.
2. File MỚI: `src/lib/correlation.ts`, `src/components/profile/CorrelationChart.tsx`
3. File THAY: `src/app/profile/page.tsx`
4. Không có thay đổi schema Supabase, không cần dependency mới — không cần
   chạy SQL hay `npm install` cho patch này.

## Tính năng
- Trang `/profile` có thêm mục **"Phân tích tương quan"** — chọn 2 chỉ số bất
  kỳ (stress, nhịp tim, giấc ngủ, nước uống, tâm trạng, cân nặng, BBT) và xem
  biểu đồ chồng theo thời gian + hệ số tương quan Pearson diễn giải bằng lời
  (vd "Tương quan trung bình, ngược chiều (r=-0.52)").
- Khoá VIP bằng `LockedFeature`/`isVipProfile()` có sẵn — giống các tính năng
  VIP khác trong dự án.

## Phạm vi đã cân nhắc và loại bỏ (quan trọng, đọc trước khi mở rộng)
Module này CHỈ làm tương quan giữa 2 **chỉ số** (metric), KHÔNG làm tương quan
với **triệu chứng** (symptoms). Lý do: trong schema hiện tại, `symptoms` được
gắn vào một *kỳ kinh* (`cycle_logs.start_date`/`end_date`), không phải log
theo từng ngày riêng — nên không có "giá trị triệu chứng của ngày X" rõ ràng
để so khớp với metric theo trục thời gian. Muốn làm tương quan với triệu
chứng cần đổi model dữ liệu (thêm bảng log triệu chứng theo ngày), nên đây là
quyết định phạm vi có chủ đích, không phải thiếu sót.

## Việc còn thiếu
- Ngưỡng diễn giải mạnh/yếu/trung bình (0.2/0.4/0.7) dùng chuẩn thống kê phổ
  biến tham khảo, chưa được kiểm chứng bởi chuyên gia y tế — chỉ mang tính
  tham khảo (đã có disclaimer trong UI).
