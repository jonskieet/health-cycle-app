// Công thức tính Health Score (0-100), trọng số đơn giản ban đầu.
// Mỗi metric được chuẩn hoá về thang 0-100 theo ngưỡng "khoẻ mạnh" tham khảo,
// sau đó cộng theo trọng số. Metric nào không có dữ liệu hôm nay sẽ bị loại khỏi
// tổng trọng số (không tính là 0 điểm) để không phạt oan người mới dùng app.
//
// Trọng số: heart_rate 25%, sleep 25%, stress 20%, hydration 15%, mood 15%.

export interface LatestMetrics {
  heart_rate?: number; // bpm
  sleep?: number; // giờ
  stress?: number; // 1-10, càng cao càng stress
  hydration?: number; // ml
  mood?: number; // 1-5, càng cao càng tích cực
}

const WEIGHTS = {
  heart_rate: 0.25,
  sleep: 0.25,
  stress: 0.2,
  hydration: 0.15,
  mood: 0.15,
} as const;

function scoreHeartRate(bpm: number) {
  // Vùng lý tưởng nghỉ ngơi: 60-80bpm = 100 điểm, giảm dần ra ngoài vùng đó.
  if (bpm >= 60 && bpm <= 80) return 100;
  const dist = bpm < 60 ? 60 - bpm : bpm - 80;
  return Math.max(0, 100 - dist * 3);
}

function scoreSleep(hours: number) {
  // 7-9 giờ = 100 điểm.
  if (hours >= 7 && hours <= 9) return 100;
  const dist = hours < 7 ? 7 - hours : hours - 9;
  return Math.max(0, 100 - dist * 18);
}

function scoreStress(level: number) {
  // Thang 1-10, càng thấp càng tốt.
  return Math.max(0, 100 - (level - 1) * (100 / 9));
}

function scoreHydration(ml: number) {
  // Mục tiêu tham khảo 2000ml/ngày.
  return Math.max(0, Math.min(100, (ml / 2000) * 100));
}

function scoreMood(level: number) {
  // Thang 1-5.
  return Math.max(0, Math.min(100, ((level - 1) / 4) * 100));
}

export function computeHealthScore(metrics: LatestMetrics): number | null {
  let totalWeight = 0;
  let weightedSum = 0;

  if (metrics.heart_rate != null) {
    weightedSum += scoreHeartRate(metrics.heart_rate) * WEIGHTS.heart_rate;
    totalWeight += WEIGHTS.heart_rate;
  }
  if (metrics.sleep != null) {
    weightedSum += scoreSleep(metrics.sleep) * WEIGHTS.sleep;
    totalWeight += WEIGHTS.sleep;
  }
  if (metrics.stress != null) {
    weightedSum += scoreStress(metrics.stress) * WEIGHTS.stress;
    totalWeight += WEIGHTS.stress;
  }
  if (metrics.hydration != null) {
    weightedSum += scoreHydration(metrics.hydration) * WEIGHTS.hydration;
    totalWeight += WEIGHTS.hydration;
  }
  if (metrics.mood != null) {
    weightedSum += scoreMood(metrics.mood) * WEIGHTS.mood;
    totalWeight += WEIGHTS.mood;
  }

  if (totalWeight === 0) return null; // chưa có dữ liệu nào hôm nay
  return Math.round(weightedSum / totalWeight);
}
