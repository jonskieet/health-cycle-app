// B4 (QUALITY_UX_ROADMAP.md) — helper format ngày "YYYY-MM-DD" dùng chung.
//
// Bug gốc phát hiện: rất nhiều nơi trong app dùng `new Date().toISOString().slice(0, 10)`
// để lấy "hôm nay" dạng chuỗi cho DB (recorded_date, start_date...). `toISOString()`
// LUÔN quy đổi về giờ UTC trước khi format — với user ở Việt Nam (UTC+7, không có DST),
// bất kỳ lúc nào từ 00:00 đến 06:59 giờ VN, giờ UTC tương ứng vẫn còn là NGÀY HÔM TRƯỚC.
// Kết quả: ai ghi nhận chỉ số sức khoẻ hoặc bắt đầu kỳ kinh vào khoảng nửa đêm -> gần
// sáng đều bị lưu NHẦM SANG NGÀY HÔM TRƯỚC một cách âm thầm, không có lỗi hay cảnh báo
// nào — chỉ phát hiện ra khi xem lại lịch sử thấy ngày sai.
//
// Sửa: luôn lấy year/month/day từ các getter LOCAL (`getFullYear`/`getMonth`/`getDate`),
// không đi qua UTC. Dùng hàm này ở mọi nơi cần "khoá ngày hôm nay/1 ngày cụ thể theo giờ
// máy người dùng" — KHÔNG dùng cho các cột cần lưu đúng thời điểm thực (timestamptz như
// `appointment_at`, `created_at`, `exported_at`) vì những cột đó cần giữ nguyên UTC thật.
export function toLocalDateKey(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function todayLocalKey(): string {
  return toLocalDateKey(new Date());
}
