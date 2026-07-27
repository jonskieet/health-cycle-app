// Module 6 — Symptom Analysis chuyên sâu (P2, VIP).
//
// Quyết định phạm vi quan trọng (đọc trước khi mở rộng module này):
// Roadmap gốc mô tả "thống kê tần suất từng triệu chứng theo PHA CHU KỲ qua
// nhiều chu kỳ". Nhưng trong schema/UI hiện tại, mỗi dòng `cycle_logs` đại
// diện cho MỘT KỲ KINH đã ghi (start_date = ngày bắt đầu hành kinh, end_date =
// ngày kết thúc), và `symptoms` được gắn vào dòng đó — tức triệu chứng chỉ
// từng được ghi nhận trong lúc hành kinh (pha "period"), KHÔNG có ghi nhận
// triệu chứng rời rạc cho pha nang trứng/rụng trứng/hoàng thể. Vì vậy, phân
// tích "theo pha" sẽ luôn quy về pha period và không phản ánh đúng thực tế.
//
// Điều chỉnh phạm vi hợp lý: phân tích **tần suất & xu hướng triệu chứng theo
// THỜI GIAN qua nhiều kỳ kinh đã ghi** (khớp đúng phần P2 "phân tích xu hướng
// theo thời gian" trong roadmap) thay vì theo pha. Nếu sau này có nhu cầu thật
// ghi nhận triệu chứng ngoài kỳ kinh (log hàng ngày độc lập với period), cần
// một module riêng thêm bảng dữ liệu mới — ngoài phạm vi ở đây.

import { CycleLogFull } from "@/lib/queries";
import { SymptomCategory, SYMPTOM_TAXONOMY, getSymptomDef } from "@/lib/symptoms";

export interface SymptomFrequency {
  id: string;
  label: string;
  category: SymptomCategory;
  count: number;
  percentage: number; // % số kỳ kinh (trong tổng số kỳ đã phân tích) có xuất hiện triệu chứng này
  trend: "up" | "down" | "flat" | "new" | "none";
}

/**
 * Tính tần suất xuất hiện của mỗi triệu chứng qua các kỳ kinh đã ghi, kèm xu hướng
 * so sánh nửa gần đây (recentHalf) với nửa trước đó (olderHalf) theo thời gian.
 * `logs` không cần sort trước — hàm tự sắp xếp theo `start_date` tăng dần.
 */
export function computeSymptomFrequencies(logs: CycleLogFull[]): SymptomFrequency[] {
  const sorted = [...logs].sort(
    (a, b) => new Date(a.start_date).getTime() - new Date(b.start_date).getTime()
  );
  const total = sorted.length;
  if (total === 0) return [];

  const mid = Math.ceil(total / 2);
  const olderHalf = sorted.slice(0, mid);
  const recentHalf = sorted.slice(mid);

  const countIn = (subset: CycleLogFull[], symptomId: string) =>
    subset.filter((l) => l.symptoms?.includes(symptomId)).length;

  // Gom tất cả symptom id thực sự xuất hiện trong dữ liệu (kể cả id "lạ" không có
  // trong taxonomy chuẩn, vd dữ liệu cũ trước Module 1) + toàn bộ taxonomy để
  // đảm bảo hiển thị nhất quán.
  const allIds = new Set<string>(SYMPTOM_TAXONOMY.map((s) => s.id));
  sorted.forEach((l) => l.symptoms?.forEach((s) => allIds.add(s)));

  const result: SymptomFrequency[] = [];
  for (const id of allIds) {
    const count = countIn(sorted, id);
    if (count === 0) continue;

    const olderCount = countIn(olderHalf, id);
    const recentCount = countIn(recentHalf, id);
    const olderRate = olderHalf.length > 0 ? olderCount / olderHalf.length : 0;
    const recentRate = recentHalf.length > 0 ? recentCount / recentHalf.length : 0;

    let trend: SymptomFrequency["trend"] = "flat";
    if (olderCount === 0 && recentCount > 0) trend = "new";
    else if (recentRate - olderRate > 0.15) trend = "up";
    else if (olderRate - recentRate > 0.15) trend = "down";
    else trend = "flat";

    const def = getSymptomDef(id);
    result.push({
      id,
      label: def?.label ?? id,
      category: def?.category ?? "physical",
      count,
      percentage: Math.round((count / total) * 100),
      trend: total < 4 ? "none" : trend, // quá ít dữ liệu thì không đủ tin cậy để nói xu hướng
    });
  }

  return result.sort((a, b) => b.count - a.count);
}
