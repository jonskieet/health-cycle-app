// Dữ liệu mẫu — cấu trúc khớp với các bảng Supabase (health_metrics, cycle_logs)
// để khi nối dữ liệu thật (bước Auth + fetch), chỉ cần thay nguồn, không đổi UI.

export const mockHealthMetrics = {
  stress: { value: 4.2, unit: "pts", status: "Căng thẳng", chart: [3, 2, 4, 5, 3, 1, 2] },
  heartRate: { value: 72, unit: "bpm", status: "Nhịp nghỉ", chart: [70, 74, 71, 76, 73, 70, 72] },
  sleep: { value: "6.5", unit: "giờ", status: "Ổn định", chart: [5, 7, 6, 4, 8, 6, 7] },
  hydration: { value: 1800, unit: "ml", status: "Đạt mục tiêu", chart: [6, 5, 7, 6, 8, 7, 6] },
  mood: { value: "Vui vẻ", unit: "", status: "Ghi nhận 5/7 ngày", chart: [3, 4, 2, 4, 5, 4, 5] },
};

export const mockCycleLogs = [
  { id: "1", start_date: "2026-06-02", end_date: "2026-06-06" },
  { id: "2", start_date: "2026-05-05", end_date: "2026-05-10" },
  { id: "3", start_date: "2026-04-07", end_date: "2026-04-12" },
];

export const mockHealthScore = 87;
