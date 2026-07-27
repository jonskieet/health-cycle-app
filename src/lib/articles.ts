// Module 7 — Thư viện nội dung giáo dục (Clover gap P8).
//
// Quyết định thiết kế: thay vì thêm bảng `articles` trong Supabase (cần CMS/quy trình
// quản trị nội dung mà chủ dự án chưa yêu cầu), nội dung được đặt tĩnh trong file này —
// giống đúng cách `cycle-insights.ts` đang làm với "Câu chuyện hàng ngày". Ưu điểm: không
// cần migration, deploy là có nội dung ngay; nhược điểm (ghi rõ để agent sau biết): muốn
// thêm/sửa bài viết phải sửa code + deploy lại, không có trang quản trị. Nếu sau này cần
// nhiều bài + cập nhật thường xuyên, nên tách sang bảng `articles` trong Supabase.
//
// Free vs VIP theo đúng tinh thần P8 gốc ("full access to all topics"): mọi bài đều xem
// được danh sách + đoạn mở đầu (preview) miễn phí, nhưng bài đánh dấu `isPremium` chỉ VIP
// mới đọc được toàn bộ nội dung — dùng lại `LockedFeature`/`isVipProfile()` có sẵn, không
// chế cơ chế khoá mới.

export type ArticleCategory =
  | "cycle_basics"
  | "nutrition"
  | "fertility"
  | "contraception"
  | "mental_health"
  | "symptom_relief";

export const ARTICLE_CATEGORY_LABELS: Record<ArticleCategory, string> = {
  cycle_basics: "Kiến thức chu kỳ",
  nutrition: "Dinh dưỡng",
  fertility: "Khả năng sinh sản",
  contraception: "Biện pháp tránh thai",
  mental_health: "Tâm lý & cảm xúc",
  symptom_relief: "Giảm triệu chứng",
};

export const ARTICLE_CATEGORIES = Object.keys(ARTICLE_CATEGORY_LABELS) as ArticleCategory[];

export interface Article {
  id: string;
  category: ArticleCategory;
  title: string;
  summary: string;
  readMinutes: number;
  /** true = chỉ VIP đọc được toàn bộ, free chỉ thấy đoạn mở đầu (paragraphs[0]) */
  isPremium: boolean;
  /** Mỗi phần tử là 1 đoạn văn hiển thị tách dòng. */
  paragraphs: string[];
}

export const ARTICLES: Article[] = [
  {
    id: "cycle-101",
    category: "cycle_basics",
    title: "Chu kỳ kinh nguyệt hoạt động như thế nào?",
    summary: "Tổng quan 4 pha của một chu kỳ và các hormone chi phối từng giai đoạn.",
    readMinutes: 4,
    isPremium: false,
    paragraphs: [
      "Một chu kỳ kinh nguyệt điển hình kéo dài 21-35 ngày, tính từ ngày đầu hành kinh đến ngày đầu hành kinh tiếp theo, và được chia làm 4 pha: hành kinh, nang trứng, rụng trứng, hoàng thể.",
      "Pha nang trứng bắt đầu cùng lúc với hành kinh, khi tuyến yên tiết FSH kích thích buồng trứng phát triển các nang trứng. Estrogen tăng dần trong pha này giúp niêm mạc tử cung dày lên.",
      "Rụng trứng xảy ra khi nồng độ LH tăng đột biến (LH surge), thường vào khoảng giữa chu kỳ, khiến nang trứng trưởng thành giải phóng trứng — đây là thời điểm dễ thụ thai nhất.",
      "Pha hoàng thể sau rụng trứng, progesterone tăng để duy trì niêm mạc tử cung. Nếu không có thai, hoàng thể thoái hoá, hormone giảm mạnh và kích hoạt kỳ kinh tiếp theo.",
    ],
  },
  {
    id: "irregular-cycle",
    category: "cycle_basics",
    title: "Khi nào chu kỳ được coi là bất thường?",
    summary: "Ngưỡng bình thường về độ dài chu kỳ, hành kinh và khi nào nên đi khám.",
    readMinutes: 3,
    isPremium: false,
    paragraphs: [
      "Chu kỳ 21-35 ngày và hành kinh kéo dài 2-8 ngày thường được coi là trong ngưỡng bình thường. Chu kỳ lệch nhau quá 7-9 ngày giữa các tháng cũng có thể là dấu hiệu 'không đều'.",
      "Nguyên nhân phổ biến gây bất thường: căng thẳng, thay đổi cân nặng đột ngột, rối loạn tuyến giáp, hội chứng buồng trứng đa nang (PCOS), tiền mãn kinh, hoặc mới bắt đầu/ngừng thuốc tránh thai.",
      "Nên đi khám nếu: chu kỳ liên tục dưới 21 hoặc trên 35 ngày qua vài tháng, mất kinh trên 3 tháng (không do thai kỳ), ra máu rất nhiều (thay băng mỗi 1-2 giờ), hoặc đau dữ dội ảnh hưởng sinh hoạt.",
    ],
  },
  {
    id: "iron-rich-foods",
    category: "nutrition",
    title: "Ăn gì để bù sắt trong kỳ kinh nguyệt?",
    summary: "Nhóm thực phẩm giàu sắt và cách kết hợp để cơ thể hấp thu tốt hơn.",
    readMinutes: 3,
    isPremium: false,
    paragraphs: [
      "Mất máu trong kỳ kinh có thể khiến lượng sắt dự trữ giảm, dễ gây mệt mỏi, chóng mặt. Thực phẩm giàu sắt gồm thịt đỏ, gan, lòng đỏ trứng, rau bina, đậu lăng, hạt bí.",
      "Vitamin C giúp tăng hấp thu sắt không heme (từ thực vật) — nên ăn kèm cam, ổi, ớt chuông trong cùng bữa ăn có rau củ giàu sắt.",
      "Ngược lại, trà và cà phê chứa tannin có thể cản trở hấp thu sắt nếu uống ngay sau bữa ăn — nên uống cách bữa ăn ít nhất 1 giờ.",
    ],
  },
  {
    id: "pms-cravings",
    category: "nutrition",
    title: "Vì sao bạn hay thèm đồ ngọt trước kỳ kinh?",
    summary: "Cơ chế hormone đứng sau cảm giác thèm ăn ở pha hoàng thể và cách kiểm soát.",
    readMinutes: 3,
    isPremium: true,
    paragraphs: [
      "Trong pha hoàng thể (7-10 ngày trước kỳ kinh), progesterone tăng cao có thể ảnh hưởng đến serotonin — chất dẫn truyền thần kinh liên quan cảm giác no và tâm trạng — khiến cơ thể thèm carbohydrate và đồ ngọt để bù đắp.",
      "Đường huyết dao động nhiều hơn trong giai đoạn này cũng góp phần vào cơn thèm ăn đột ngột. Ăn các bữa nhỏ đều đặn (thay vì để quá đói) giúp đường huyết ổn định hơn.",
      "Thay vì cắt hoàn toàn đồ ngọt (dễ gây phản tác dụng), có thể chọn phiên bản lành mạnh hơn: chocolate đen, trái cây sấy, sữa chua với mật ong — vẫn thoả cơn thèm nhưng ít ảnh hưởng đường huyết đột ngột hơn đồ ngọt tinh luyện.",
      "Magie cũng được ghi nhận giúp giảm cảm giác thèm ngọt trước kỳ kinh ở một số người — có trong hạt điều, hạnh nhân, chuối, chocolate đen trên 70% cacao.",
    ],
  },
  {
    id: "fertile-window",
    category: "fertility",
    title: "Cửa sổ thụ thai thực sự kéo dài bao lâu?",
    summary: "Vì sao 'ngày rụng trứng' chỉ là 1 ngày nhưng cửa sổ thụ thai lại dài hơn.",
    readMinutes: 4,
    isPremium: false,
    paragraphs: [
      "Trứng sau khi rụng chỉ sống được khoảng 12-24 giờ, nhưng tinh trùng có thể sống trong cơ thể người phụ nữ tới 5 ngày trong điều kiện dịch nhầy cổ tử cung thuận lợi.",
      "Vì vậy cửa sổ thụ thai thực tế thường được tính là 5-6 ngày: 5 ngày trước rụng trứng cộng với chính ngày rụng trứng — quan hệ trong khoảng này đều có khả năng dẫn đến thụ thai.",
      "Dịch nhầy cổ tử cung thay đổi rõ rệt gần ngày rụng trứng — trở nên trong, dai như lòng trắng trứng — đây là một trong những dấu hiệu tự nhiên giúp nhận biết cửa sổ thụ thai, bên cạnh theo dõi BBT.",
    ],
  },
  {
    id: "bbt-tracking-guide",
    category: "fertility",
    title: "Hướng dẫn đo nhiệt độ cơ bản (BBT) chính xác",
    summary: "Kỹ thuật đo BBT đúng cách để tăng độ tin cậy khi dự đoán rụng trứng.",
    readMinutes: 4,
    isPremium: true,
    paragraphs: [
      "BBT (Basal Body Temperature) là nhiệt độ cơ thể ở trạng thái nghỉ hoàn toàn, thường đo ngay khi vừa thức dậy, trước khi ra khỏi giường hay nói chuyện.",
      "Sau rụng trứng, progesterone tăng khiến BBT tăng nhẹ khoảng 0.3-0.5°C và duy trì ở mức cao đến khi kỳ kinh tiếp theo bắt đầu. Đây là cách xác nhận rụng trứng đã xảy ra (nhưng không dự đoán trước được).",
      "Để có kết quả đáng tin cậy: đo vào cùng một thời điểm mỗi sáng (chênh lệch không quá 30 phút), dùng cùng một nhiệt kế cơ bản (độ chính xác 2 chữ số thập phân), đo sau ít nhất 3-4 giờ ngủ liên tục.",
      "Các yếu tố có thể làm sai lệch kết quả: sốt, uống rượu tối hôm trước, ngủ không đủ giấc, đổi múi giờ, hoặc đo không đúng giờ thường lệ — nên ghi chú lại những ngày này khi xem biểu đồ xu hướng.",
    ],
  },
  {
    id: "contraception-overview",
    category: "contraception",
    title: "Tổng quan các biện pháp tránh thai phổ biến",
    summary: "So sánh nhanh nội tiết, dụng cụ tử cung, và biện pháp rào cản.",
    readMinutes: 5,
    isPremium: true,
    paragraphs: [
      "Biện pháp nội tiết (thuốc uống hàng ngày, que cấy, vòng âm đạo) hoạt động bằng cách ngăn rụng trứng và làm đặc dịch nhầy cổ tử cung. Hiệu quả cao nếu dùng đúng cách nhưng cần tuân thủ lịch đều đặn.",
      "Dụng cụ tử cung (IUD) có 2 loại: nội tiết (giải phóng progestin tại chỗ) và đồng (không nội tiết). Hiệu quả lâu dài (3-10 năm tuỳ loại), không cần nhớ dùng hàng ngày, nhưng cần thủ thuật đặt bởi bác sĩ.",
      "Biện pháp rào cản (bao cao su) là lựa chọn duy nhất trong nhóm phổ biến vừa tránh thai vừa giảm nguy cơ lây nhiễm qua đường tình dục — phù hợp dùng kết hợp với biện pháp khác để tăng hiệu quả.",
      "Bài viết mang tính tham khảo chung, không thay thế tư vấn y khoa — hiệu quả và mức độ phù hợp phụ thuộc tình trạng sức khoẻ từng người, nên trao đổi với bác sĩ sản phụ khoa trước khi lựa chọn.",
    ],
  },
  {
    id: "pms-vs-pmdd",
    category: "mental_health",
    title: "Phân biệt PMS thông thường và PMDD",
    summary: "Khi nào tâm trạng trước kỳ kinh vượt quá mức 'bình thường'.",
    readMinutes: 4,
    isPremium: true,
    paragraphs: [
      "PMS (hội chứng tiền kinh nguyệt) là tập hợp triệu chứng thể chất và cảm xúc xảy ra 1-2 tuần trước kỳ kinh, mức độ nhẹ đến trung bình, thường không cản trở sinh hoạt hàng ngày quá nhiều.",
      "PMDD (rối loạn khó chịu tiền kinh nguyệt) là dạng nặng hơn nhiều, ảnh hưởng khoảng 3-8% người có kinh nguyệt, với triệu chứng cảm xúc dữ dội như tuyệt vọng, cáu gắt cực độ, lo âu nghiêm trọng, ảnh hưởng rõ rệt đến công việc/quan hệ.",
      "Khác biệt chính không nằm ở loại triệu chứng mà ở mức độ và tác động: nếu tâm trạng trước kỳ kinh khiến bạn khó duy trì sinh hoạt bình thường trong nhiều tháng liên tiếp, đây là dấu hiệu nên gặp chuyên gia tâm lý hoặc bác sĩ.",
      "PMDD có thể điều trị được (liệu pháp tâm lý, đôi khi kết hợp thuốc) — đây không phải điều phải 'chịu đựng mỗi tháng', ghi nhật ký triệu chứng theo chu kỳ (như trong ứng dụng) sẽ giúp bác sĩ chẩn đoán chính xác hơn.",
    ],
  },
  {
    id: "cramps-relief",
    category: "symptom_relief",
    title: "5 cách giảm đau bụng kinh không dùng thuốc",
    summary: "Các phương pháp giảm đau tự nhiên có thể thử trước khi dùng thuốc giảm đau.",
    readMinutes: 3,
    isPremium: false,
    paragraphs: [
      "Chườm ấm vùng bụng dưới giúp giãn cơ trơn tử cung, giảm co bóp gây đau — hiệu quả tương đương ibuprofen liều thấp trong một số nghiên cứu.",
      "Vận động nhẹ như đi bộ, yoga, giãn cơ giúp tăng lưu thông máu và giải phóng endorphin — chất giảm đau tự nhiên của cơ thể, dù cảm giác ban đầu có thể ngại vận động khi đang đau.",
      "Giảm muối và caffein trong những ngày đau giúp hạn chế đầy hơi làm cơn đau cảm giác nặng hơn. Uống đủ nước cũng giúp giảm co thắt cơ.",
      "Massage nhẹ vùng bụng dưới theo chuyển động tròn, hoặc dùng tinh dầu bạc hà pha loãng, được nhiều người báo cáo giúp dễ chịu hơn dù bằng chứng khoa học còn hạn chế.",
    ],
  },
  {
    id: "sleep-and-cycle",
    category: "symptom_relief",
    title: "Vì sao giấc ngủ thay đổi theo từng pha chu kỳ?",
    summary: "Progesterone và nhiệt độ cơ thể ảnh hưởng chất lượng giấc ngủ ra sao.",
    readMinutes: 3,
    isPremium: true,
    paragraphs: [
      "Progesterone có tác dụng an thần nhẹ, nên nhiều người ngủ sâu hơn ở đầu pha hoàng thể — nhưng khi hormone này giảm mạnh trước kỳ kinh, chất lượng giấc ngủ cũng giảm theo, dễ tỉnh giấc giữa đêm.",
      "Nhiệt độ cơ thể cơ bản (BBT) tăng nhẹ sau rụng trứng và duy trì ở mức cao suốt pha hoàng thể — nhiệt độ cơ thể cao hơn có thể khiến một số người khó đi vào giấc ngủ sâu hơn trong giai đoạn này.",
      "Nếu mất ngủ trước kỳ kinh ảnh hưởng nhiều đến sinh hoạt, có thể thử: giữ phòng ngủ mát hơn bình thường vài độ, hạn chế màn hình trước khi ngủ, và ghi nhận mẫu hình này trong nhật ký để trao đổi với bác sĩ nếu kéo dài.",
    ],
  },
];

export function getArticlesByCategory(category: ArticleCategory | "all"): Article[] {
  return category === "all" ? ARTICLES : ARTICLES.filter((a) => a.category === category);
}

export function getArticleById(id: string): Article | undefined {
  return ARTICLES.find((a) => a.id === id);
}
