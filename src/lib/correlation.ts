// Module 5 — Event/Correlation Analysis (VIP).
// Business logic thuần, không phụ thuộc React, đặt riêng theo domain giống
// convention `cycle-utils.ts`/`health-score.ts`.
//
// Phạm vi bản đầu tiên: tương quan giữa 2 CHỈ SỐ (metric) đã log hàng ngày
// (vd stress vs sleep, weight vs mood...). Không bao gồm tương quan với
// triệu chứng (symptoms) vì trong schema hiện tại, symptoms được gắn vào
// MỘT kỳ kinh (cycle_logs.start_date/end_date) chứ không phải log theo từng
// ngày riêng lẻ — nên không có "giá trị symptom của ngày X" rõ ràng để so
// khớp theo trục thời gian như 2 metric. Nếu muốn làm sau, cần thêm bảng log
// triệu chứng theo ngày riêng (đổi model dữ liệu, ngoài phạm vi module này).

import { HealthMetricRow } from "@/lib/queries";

export interface AlignedSeries {
  dates: string[];
  a: (number | null)[];
  b: (number | null)[];
}

// Ghép 2 chuỗi dữ liệu theo ngày logged_at, giữ lại mọi ngày có ít nhất 1 trong 2
// chỉ số (để vẽ chart không bị "gãy" ngày), nhưng chỉ tính hệ số tương quan trên
// những ngày có ĐỦ CẢ HAI.
export function alignMetricsByDate(rowsA: HealthMetricRow[], rowsB: HealthMetricRow[]): AlignedSeries {
  const mapA = new Map(rowsA.map((r) => [r.logged_at, r.value]));
  const mapB = new Map(rowsB.map((r) => [r.logged_at, r.value]));
  const allDates = Array.from(new Set([...mapA.keys(), ...mapB.keys()])).sort();

  return {
    dates: allDates,
    a: allDates.map((d) => mapA.get(d) ?? null),
    b: allDates.map((d) => mapB.get(d) ?? null),
  };
}

// Hệ số tương quan Pearson (r), chỉ tính trên các cặp ngày có đủ cả 2 giá trị.
// Trả về null nếu không đủ dữ liệu (< 3 cặp) hoặc phương sai bằng 0 (dữ liệu không đổi).
export function pearsonCorrelation(a: (number | null)[], b: (number | null)[]): number | null {
  const pairs: [number, number][] = [];
  for (let i = 0; i < a.length; i++) {
    const x = a[i];
    const y = b[i];
    if (x != null && y != null) pairs.push([x, y]);
  }
  if (pairs.length < 3) return null;

  const n = pairs.length;
  const sumX = pairs.reduce((s, [x]) => s + x, 0);
  const sumY = pairs.reduce((s, [, y]) => s + y, 0);
  const meanX = sumX / n;
  const meanY = sumY / n;

  let cov = 0;
  let varX = 0;
  let varY = 0;
  for (const [x, y] of pairs) {
    const dx = x - meanX;
    const dy = y - meanY;
    cov += dx * dy;
    varX += dx * dx;
    varY += dy * dy;
  }

  if (varX === 0 || varY === 0) return null;
  return cov / Math.sqrt(varX * varY);
}

export interface CorrelationInterpretation {
  label: string;
  strength: "none" | "weak" | "moderate" | "strong";
  direction: "positive" | "negative" | "none";
}

// Diễn giải hệ số r thành ngôn ngữ dễ hiểu cho người dùng phổ thông (không phải
// nhà thống kê) — ngưỡng tham khảo thông dụng: <0.2 không đáng kể, 0.2-0.4 yếu,
// 0.4-0.7 trung bình, >0.7 mạnh.
export function interpretCorrelation(r: number | null): CorrelationInterpretation {
  if (r == null) {
    return { label: "Chưa đủ dữ liệu để tính tương quan", strength: "none", direction: "none" };
  }
  const abs = Math.abs(r);
  const direction: "positive" | "negative" = r >= 0 ? "positive" : "negative";
  let strength: CorrelationInterpretation["strength"];
  let strengthLabel: string;
  if (abs < 0.2) {
    strength = "none";
    strengthLabel = "không đáng kể";
  } else if (abs < 0.4) {
    strength = "weak";
    strengthLabel = "yếu";
  } else if (abs < 0.7) {
    strength = "moderate";
    strengthLabel = "trung bình";
  } else {
    strength = "strong";
    strengthLabel = "mạnh";
  }
  const directionLabel = direction === "positive" ? "cùng chiều" : "ngược chiều";
  return {
    label: strength === "none" ? "Không thấy tương quan rõ rệt" : `Tương quan ${strengthLabel}, ${directionLabel}`,
    strength,
    direction,
  };
}
