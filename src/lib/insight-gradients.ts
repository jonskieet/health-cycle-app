// F2 (VISUAL_POLISH_ROADMAP.md): trước đây mỗi thẻ insight ("Câu chuyện hàng
// ngày") và mỗi mini-quiz ("Đã đến lúc kiểm tra!") tự khai 1 cặp mã hex riêng
// (12 thẻ = 12 cặp màu độc lập, không có nguồn chung) — dẫn tới việc 2 thẻ
// nằm cạnh nhau (giai đoạn nang trứng: "Vận động" xanh ngọc-lam, "Năng suất"
// đen than) trông như 2 hệ màu không liên quan.
//
// File này định nghĩa 1 bộ "họ gradient" DUY NHẤT, dựng lại từ chính các biến
// màu accent đã có sẵn của app (`--c-*` trong globals.css) — không phải màu
// mới, chỉ là gom về 1 nguồn duy nhất. Rà lại 12 cặp hex cũ thì phần lớn đã
// KHỚP gần như chính xác với 1 cặp `--c-*` nào đó (trùng hợp vì cùng người
// thiết kế ban đầu chọn), chỉ có nơi "NĂNG SUẤT" đang lệch hẳn (dùng 1 cặp đen
// than KHÁC, gần giống nhưng không phải "night" — 1 họ tối trùng lặp không
// cần thiết) — họ này bị loại bỏ, thay bằng DUSK ở dưới.
export const INSIGHT_GRADIENTS = {
  /** Tối, trầm — dùng cho chủ đề cần cảm giác tĩnh lặng/nghiêm túc (dinh dưỡng, năng suất, làn da). */
  dusk: "linear-gradient(135deg, #2c2440, #4a3868)",
  /** Xanh lá–lam, tươi mới — chủ đề năng lượng/vận động. */
  meadow: "linear-gradient(135deg, var(--c-mood), var(--c-hydration))",
  /** Tím–hồng — chủ đề triệu chứng/khả năng thụ thai. */
  blossom: "linear-gradient(135deg, var(--c-fertile), var(--c-period))",
  /** Tím nhạt–tím sleep — chủ đề khả năng thụ thai/kế hoạch. */
  violet: "linear-gradient(135deg, var(--c-fertile), var(--c-sleep))",
  /** Cam–hồng, ấm — chủ đề chăm sóc bản thân/nghỉ ngơi. */
  warm: "linear-gradient(135deg, var(--c-stress), var(--c-period))",
  /** Lam–tím, dịu — chủ đề tiền kinh nguyệt/tâm trạng. */
  calmBlue: "linear-gradient(135deg, var(--c-hydration), var(--c-sleep))",
  /** Đỏ hồng — chủ đề tâm trạng/ham muốn. */
  rose: "linear-gradient(135deg, var(--c-heart), var(--c-period))",
  /** Vàng–cam — chủ đề rụng trứng (điểm nhấn sáng duy nhất, chữ tối màu). */
  gold: "linear-gradient(135deg, #f0b93e, var(--c-stress))",
  /** Tím đậm–xanh sleep — chủ đề mệt mỏi/căng thẳng (dùng cho mini-quiz). */
  twilight: "linear-gradient(135deg, #4a3868, var(--c-sleep))",
  /** Xanh lá đậm–nhạt — chủ đề chu kỳ/sức khoẻ sinh sản (dùng cho mini-quiz). */
  forest: "linear-gradient(135deg, #1f8a70, var(--c-mood))",
} as const;
