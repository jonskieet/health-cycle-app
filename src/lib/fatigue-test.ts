// Module 9 — Fatigue Test / Trắc nghiệm năng lượng nhanh (P5, VIP).
// Business logic thuần, tách khỏi component theo convention của repo.
//
// Đây là bài trắc nghiệm ngắn (không phải chẩn đoán y khoa) đánh giá mức
// năng lượng/mệt mỏi chủ quan trong 7 ngày gần nhất, tương tự các "mini quiz
// sức khoẻ" phổ biến trong app theo dõi chu kỳ. Khác với `HealthCheckIns`
// (check-in nhanh 1 giá trị/ngày), bài test này gồm nhiều câu hỏi chấm điểm
// cộng dồn ra 1 kết quả tổng, để phát hiện các khía cạnh khác nhau của mệt
// mỏi (thể chất, tinh thần, giấc ngủ, động lực).

export interface FatigueQuestion {
  id: string;
  text: string;
  /** Nhãn cho 5 mức độ, điểm số ứng với index (0-4). Index càng cao càng mệt mỏi. */
  options: string[];
}

export const FATIGUE_QUESTIONS: FatigueQuestion[] = [
  {
    id: "physical_energy",
    text: "Trong 7 ngày qua, mức năng lượng thể chất của bạn thế nào?",
    options: ["Luôn tràn đầy", "Khá tốt", "Bình thường", "Khá thấp", "Kiệt sức thường xuyên"],
  },
  {
    id: "morning_tiredness",
    text: "Buổi sáng thức dậy, bạn có cảm thấy đã được nghỉ ngơi đủ không?",
    options: ["Luôn thấy khoẻ", "Thường thấy khoẻ", "Thỉnh thoảng mệt", "Thường mệt", "Luôn mệt mỏi"],
  },
  {
    id: "concentration",
    text: "Bạn có gặp khó khăn khi tập trung làm việc/học tập không?",
    options: ["Không hề", "Rất ít", "Thỉnh thoảng", "Khá thường xuyên", "Liên tục"],
  },
  {
    id: "motivation",
    text: "Động lực làm các việc thường ngày của bạn ra sao?",
    options: ["Rất cao", "Khá cao", "Bình thường", "Khá thấp", "Không còn động lực"],
  },
  {
    id: "physical_activity",
    text: "Các hoạt động thể chất nhẹ (đi bộ, leo cầu thang) có khiến bạn nhanh mệt hơn bình thường không?",
    options: ["Không", "Hiếm khi", "Đôi lúc", "Thường xuyên", "Luôn luôn"],
  },
  {
    id: "recovery",
    text: "Sau một đêm ngủ, bạn cảm thấy phục hồi năng lượng nhanh đến mức nào?",
    options: ["Rất nhanh", "Khá nhanh", "Bình thường", "Chậm", "Hầu như không phục hồi"],
  },
];

export type FatigueLevel = "low" | "moderate" | "high";

export interface FatigueResult {
  score: number; // 0-100, càng cao càng mệt mỏi
  level: FatigueLevel;
  label: string;
  summary: string;
  tips: string[];
}

/**
 * `answers` là mảng index (0-4) theo thứ tự `FATIGUE_QUESTIONS`, mỗi câu tối đa
 * 4 điểm → tổng tối đa = questions.length * 4, quy đổi về thang 0-100.
 */
export function scoreFatigueTest(answers: number[]): FatigueResult {
  const maxPerQuestion = 4;
  const maxTotal = FATIGUE_QUESTIONS.length * maxPerQuestion;
  const rawTotal = answers.reduce((sum, value) => sum + Math.max(0, Math.min(maxPerQuestion, value)), 0);
  const score = Math.round((rawTotal / maxTotal) * 100);

  if (score <= 33) {
    return {
      score,
      level: "low",
      label: "Năng lượng tốt",
      summary: "Mức độ mệt mỏi của bạn hiện khá thấp — cơ thể đang phục hồi và duy trì năng lượng ổn định.",
      tips: [
        "Duy trì thói quen ngủ và vận động hiện tại.",
        "Tiếp tục theo dõi chu kỳ và chỉ số sức khoẻ hàng ngày để phát hiện sớm thay đổi.",
      ],
    };
  }
  if (score <= 66) {
    return {
      score,
      level: "moderate",
      label: "Mệt mỏi mức trung bình",
      summary: "Bạn đang có dấu hiệu mệt mỏi ở mức vừa phải — có thể liên quan đến giấc ngủ, căng thẳng hoặc giai đoạn chu kỳ hiện tại.",
      tips: [
        "Ưu tiên ngủ đủ 7-8 tiếng trong vài ngày tới.",
        "Giảm bớt caffeine buổi chiều, tăng thời gian nghỉ ngơi giữa các hoạt động.",
        "Theo dõi thêm chỉ số Stress/Giấc ngủ ở mục Ghi nhận để xem có tương quan không.",
      ],
    };
  }
  return {
    score,
    level: "high",
    label: "Mệt mỏi mức cao",
    summary: "Mức độ mệt mỏi hiện khá cao. Đây chỉ là bài tự đánh giá tham khảo, không thay thế chẩn đoán y khoa.",
    tips: [
      "Nếu tình trạng kéo dài trên 2 tuần, nên trao đổi với bác sĩ.",
      "Ưu tiên nghỉ ngơi, hạn chế lịch trình dày đặc trong vài ngày tới.",
      "Có thể dùng mục \"Báo cáo sức khỏe cho bác sĩ\" để mang theo dữ liệu chu kỳ khi đi khám.",
    ],
  };
}
