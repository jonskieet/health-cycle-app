// Nội dung "thông minh theo pha chu kỳ" cho trang Chu kỳ — lấy cảm hứng từ các app
// theo dõi chu kỳ phổ biến (thẻ dự đoán triệu chứng, story insight, mini quiz sức khỏe),
// nhưng dữ liệu ở đây hoàn toàn tĩnh/suy luận từ `phase`, không cần gọi thêm API.

import type { CyclePrediction } from "./cycle-utils";

type Phase = CyclePrediction["phase"];

// ---------- 1) "Hôm nay bạn có thể mong đợi" ----------

export interface OutlookMetric {
  key: string;
  label: string;
  value: number; // 0-100
  color: string;
}

const OUTLOOK_BY_PHASE: Record<Phase, OutlookMetric[]> = {
  period: [
    { key: "energy", label: "Năng lượng", value: 30, color: "var(--c-mood)" },
    { key: "cramps", label: "Đau bụng kinh", value: 70, color: "var(--c-period)" },
    { key: "mood", label: "Thay đổi tâm trạng", value: 55, color: "var(--c-heart)" },
    { key: "appetite", label: "Thèm ăn", value: 40, color: "var(--c-hydration)" },
  ],
  follicular: [
    { key: "energy", label: "Năng lượng", value: 75, color: "var(--c-mood)" },
    { key: "skin", label: "Da sáng khỏe", value: 65, color: "var(--c-sleep)" },
    { key: "mood", label: "Tâm trạng tích cực", value: 70, color: "var(--c-heart)" },
    { key: "focus", label: "Khả năng tập trung", value: 68, color: "var(--c-hydration)" },
  ],
  fertile: [
    { key: "energy", label: "Năng lượng", value: 80, color: "var(--c-mood)" },
    { key: "libido", label: "Ham muốn tình dục", value: 75, color: "var(--c-period)" },
    { key: "cm", label: "Dịch nhầy cổ tử cung", value: 60, color: "var(--c-hydration)" },
    { key: "mood", label: "Tâm trạng", value: 65, color: "var(--c-heart)" },
  ],
  ovulation: [
    { key: "libido", label: "Ham muốn tình dục", value: 85, color: "var(--c-period)" },
    { key: "energy", label: "Năng lượng", value: 78, color: "var(--c-mood)" },
    { key: "bloating", label: "Đầy hơi nhẹ", value: 35, color: "var(--c-hydration)" },
    { key: "mood", label: "Tâm trạng", value: 70, color: "var(--c-heart)" },
  ],
  luteal: [
    { key: "energy", label: "Năng suất", value: 45, color: "var(--c-mood)" },
    { key: "acne", label: "Mụn", value: 55, color: "var(--c-sleep)" },
    { key: "appetite", label: "Tăng cảm giác thèm ăn", value: 60, color: "var(--c-hydration)" },
    { key: "mood", label: "Thay đổi tâm trạng", value: 58, color: "var(--c-heart)" },
  ],
};

export function getOutlook(phase: Phase): OutlookMetric[] {
  return OUTLOOK_BY_PHASE[phase];
}

// ---------- 2) "Câu chuyện hàng ngày" — thẻ insight cuộn ngang ----------

export interface DailyInsightCard {
  id: string;
  tag: string;
  title: string;
  body: string;
  gradient: string; // css background
  textColor: string;
}

const INSIGHTS_BY_PHASE: Record<Phase, DailyInsightCard[]> = {
  period: [
    {
      id: "nutrition",
      tag: "DINH DƯỠNG",
      title: "Ăn gì để giảm đau bụng kinh",
      body: "Ưu tiên thực phẩm giàu sắt và omega-3 như rau bina, cá hồi, hạt óc chó. Hạn chế muối và caffein trong những ngày này để giảm đầy hơi.",
      gradient: "linear-gradient(135deg, #2c2440, #4a3868)",
      textColor: "#fff",
    },
    {
      id: "backpain",
      tag: "TRIỆU CHỨNG",
      title: "Đau lưng có thể liên quan đến chu kỳ",
      body: "Đau lưng dưới trong kỳ kinh là phổ biến do prostaglandin gây co bóp tử cung. Chườm ấm và giãn cơ nhẹ nhàng có thể giúp giảm khó chịu.",
      gradient: "linear-gradient(135deg, #c9a8f5, #e85c8a)",
      textColor: "#fff",
    },
    {
      id: "selfcare",
      tag: "CHĂM SÓC BẢN THÂN",
      title: "Hôm nay hãy đi chậm lại",
      body: "Năng lượng thấp là điều bình thường trong ngày hành kinh. Ưu tiên nghỉ ngơi, ngủ đủ giấc và các bài tập nhẹ như yoga hoặc đi bộ.",
      gradient: "linear-gradient(135deg, #f4a261, #e85c8a)",
      textColor: "#fff",
    },
  ],
  follicular: [
    {
      id: "energy",
      tag: "VẬN ĐỘNG",
      title: "Thời điểm vàng để tập luyện cường độ cao",
      body: "Estrogen tăng giúp bạn có nhiều năng lượng hơn. Đây là lúc lý tưởng để thử các bài tập HIIT hoặc cardio.",
      gradient: "linear-gradient(135deg, #4cae8e, #4fa8e8)",
      textColor: "#fff",
    },
    {
      id: "productivity",
      tag: "NĂNG SUẤT",
      title: "Ngày này được sinh ra để lập kế hoạch",
      body: "Khả năng tập trung và tư duy sáng tạo thường ở mức cao. Tận dụng để bắt đầu dự án mới hoặc học kỹ năng mới.",
      gradient: "linear-gradient(135deg, #1a1a2e, #16213e)",
      textColor: "#fff",
    },
  ],
  fertile: [
    {
      id: "fertility",
      tag: "KHẢ NĂNG THỤ THAI",
      title: "Bạn đang ở cửa sổ thụ thai",
      body: "Đây là những ngày dễ thụ thai nhất trong chu kỳ. Nếu đang có kế hoạch mang thai, đây là thời điểm nên quan hệ đều đặn.",
      gradient: "linear-gradient(135deg, #c9a8f5, #7c6ff0)",
      textColor: "#fff",
    },
    {
      id: "mood",
      tag: "TÂM TRẠNG",
      title: "Ham muốn tình dục thường tăng cao",
      body: "Sự thay đổi nội tiết tố trong giai đoạn này có thể khiến bạn cảm thấy tự tin và hấp dẫn hơn — đó là điều hoàn toàn tự nhiên.",
      gradient: "linear-gradient(135deg, #f1667a, #e85c8a)",
      textColor: "#fff",
    },
  ],
  ovulation: [
    {
      id: "ovulation-symptoms",
      tag: "RỤNG TRỨNG",
      title: "Đau nhẹ một bên bụng là bình thường",
      body: "Một số người cảm nhận được cơn đau nhẹ ở một bên bụng dưới khi rụng trứng (mittelschmerz). Nếu đau dữ dội, hãy tham khảo bác sĩ.",
      gradient: "linear-gradient(135deg, #f0b93e, #f4a261)",
      textColor: "#2c2440",
    },
  ],
  luteal: [
    {
      id: "pms",
      tag: "TIỀN KINH NGUYỆT",
      title: "Vì sao bạn thèm đồ ngọt hơn?",
      body: "Progesterone tăng có thể khiến bạn thèm ăn nhiều hơn, đặc biệt là đồ ngọt và tinh bột. Ăn nhẹ đều đặn giúp ổn định đường huyết.",
      gradient: "linear-gradient(135deg, #4fa8e8, #7c6ff0)",
      textColor: "#fff",
    },
    {
      id: "acne",
      tag: "LÀN DA",
      title: "Nổi mụn có thể liên quan đến chu kỳ",
      body: "Sự sụt giảm estrogen trước kỳ kinh khiến da tiết dầu nhiều hơn. Làm sạch da nhẹ nhàng và tránh nặn mụn để hạn chế sẹo.",
      gradient: "linear-gradient(135deg, #2c2440, #4a3868)",
      textColor: "#fff",
    },
  ],
};

export function getDailyInsights(phase: Phase): DailyInsightCard[] {
  return INSIGHTS_BY_PHASE[phase];
}

// ---------- 3) "Đã đến lúc kiểm tra!" — mini quiz sức khỏe ----------

export interface CheckInQuestion {
  id: string;
  question: string;
  options: string[];
}

export interface CheckInQuiz {
  id: string;
  title: string;
  subtitle: string;
  gradient: string;
  questions: CheckInQuestion[];
  /** Diễn giải kết quả theo chỉ số điểm trung bình (0 = đáp án đầu tiên, tăng dần theo mức độ). */
  resultForScore: (avgScore: number) => { title: string; body: string };
}

export const CHECK_IN_QUIZZES: CheckInQuiz[] = [
  {
    id: "fatigue",
    title: "Mức độ mệt mỏi",
    subtitle: "Tình trạng của bạn có thể liên quan đến căng thẳng mãn tính",
    gradient: "linear-gradient(135deg, #4a3868, #7c6ff0)",
    questions: [
      {
        id: "q1",
        question: "Bạn cảm thấy mệt mỏi vào thời điểm nào trong ngày?",
        options: ["Hiếm khi mệt", "Chỉ vào buổi chiều", "Gần như cả ngày", "Ngay khi thức dậy"],
      },
      {
        id: "q2",
        question: "Giấc ngủ của bạn gần đây thế nào?",
        options: ["Ngủ ngon, đủ giấc", "Thỉnh thoảng khó ngủ", "Hay tỉnh giấc giữa đêm", "Mất ngủ kéo dài"],
      },
      {
        id: "q3",
        question: "Bạn có cảm thấy căng thẳng, áp lực trong công việc/cuộc sống không?",
        options: ["Không đáng kể", "Thỉnh thoảng", "Khá thường xuyên", "Liên tục"],
      },
    ],
    resultForScore: (avg) => {
      if (avg < 1)
        return {
          title: "Mức độ mệt mỏi thấp",
          body: "Cơ thể bạn có vẻ đang được nghỉ ngơi tốt. Tiếp tục duy trì lịch ngủ đều đặn nhé.",
        };
      if (avg < 2)
        return {
          title: "Mệt mỏi ở mức trung bình",
          body: "Có thể liên quan đến chu kỳ hoặc nhịp sinh hoạt gần đây. Thử ưu tiên ngủ sớm hơn và giảm caffein buổi chiều.",
        };
      return {
        title: "Mệt mỏi kéo dài — nên chú ý",
        body: "Tình trạng này có thể liên quan đến căng thẳng mãn tính hoặc thiếu ngủ tích lũy. Nếu kéo dài, hãy trao đổi với bác sĩ.",
      };
    },
  },
  {
    id: "pcos",
    title: "Chu kỳ không đều?",
    subtitle: "Tới 70% phụ nữ mắc hội chứng buồng trứng đa nang (PCOS) có thể không nhận ra họ mắc bệnh này",
    gradient: "linear-gradient(135deg, #1f8a70, #4cae8e)",
    questions: [
      {
        id: "q1",
        question: "Chu kỳ của bạn thường kéo dài bao lâu?",
        options: ["21–35 ngày (đều đặn)", "Thay đổi thất thường mỗi tháng", "Thường trên 35 ngày", "Đôi khi mất kinh vài tháng"],
      },
      {
        id: "q2",
        question: "Bạn có gặp tình trạng mụn nhiều hoặc rậm lông bất thường không?",
        options: ["Không", "Thỉnh thoảng", "Khá thường xuyên", "Rất nhiều"],
      },
      {
        id: "q3",
        question: "Gia đình bạn có ai từng được chẩn đoán PCOS hoặc tiểu đường không?",
        options: ["Không có", "Không rõ", "Có, họ hàng xa", "Có, người thân trực hệ"],
      },
    ],
    resultForScore: (avg) => {
      if (avg < 1)
        return {
          title: "Ít dấu hiệu bất thường",
          body: "Các chỉ số bạn cung cấp hiện chưa cho thấy dấu hiệu rõ rệt của chu kỳ không đều liên quan PCOS.",
        };
      if (avg < 2)
        return {
          title: "Có vài dấu hiệu cần theo dõi",
          body: "Hãy tiếp tục ghi nhận chu kỳ đều đặn trong ứng dụng để có dữ liệu chính xác hơn cho lần khám tiếp theo.",
        };
      return {
        title: "Nên trao đổi với bác sĩ",
        body: "Một số dấu hiệu bạn chọn có thể liên quan đến rối loạn nội tiết như PCOS. Đây không phải chẩn đoán — hãy đặt lịch khám để được tư vấn chính xác.",
      };
    },
  },
];

// ---------- 4) "Hỏi trợ lý" — gợi ý câu hỏi mở chat theo pha chu kỳ ----------

const SUGGESTED_PROMPTS_BY_PHASE: Record<Phase, string[]> = {
  period: [
    "Hôm nay nên ăn gì để đỡ đau bụng?",
    "Làm sao để giảm đau lưng trong kỳ kinh?",
    "Ra máu bao nhiêu là bình thường?",
    "Có nên tập thể dục khi đang hành kinh?",
  ],
  follicular: [
    "Đây có phải thời điểm tốt để tập luyện cường độ cao?",
    "Vì sao tâm trạng mình dạo này tốt hơn?",
    "Nên ăn gì để tăng năng lượng giai đoạn này?",
    "Làn da mình sẽ thay đổi thế nào trong giai đoạn này?",
  ],
  fertile: [
    "Khả năng thụ thai hôm nay thế nào?",
    "Dấu hiệu nào cho thấy sắp rụng trứng?",
    "Cửa sổ thụ thai kéo dài bao lâu?",
    "Dịch nhầy cổ tử cung thay đổi ra sao?",
  ],
  ovulation: [
    "Hôm nay có phải ngày dễ thụ thai nhất?",
    "Vì sao mình thấy đau nhẹ một bên bụng?",
    "Ham muốn tăng cao có bình thường không?",
    "Nên làm gì để theo dõi rụng trứng chính xác hơn?",
  ],
  luteal: [
    "Làm sao để giảm bớt hội chứng tiền kinh nguyệt?",
    "Vì sao mình hay nổi mụn giai đoạn này?",
    "Thèm ăn nhiều có bình thường không?",
    "Khi nào nên lo lắng nếu kinh nguyệt trễ?",
  ],
};

export function getSuggestedPrompts(phase: Phase): string[] {
  return SUGGESTED_PROMPTS_BY_PHASE[phase];
}
