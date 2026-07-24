// Các hàm tính toán chu kỳ kinh nguyệt.
// Input/output được thiết kế để khớp trực tiếp với bảng `cycle_logs` trong Supabase,
// nên khi nối dữ liệu thật chỉ cần thay nguồn dữ liệu, không cần đổi logic.

export interface CycleLog {
  id: string;
  start_date: string; // ISO yyyy-mm-dd
  end_date: string | null;
}

export interface CyclePrediction {
  avgCycleLength: number;
  avgPeriodLength: number;
  currentDay: number; // ngày thứ mấy của chu kỳ hiện tại (1-indexed)
  nextPeriodDate: Date;
  ovulationDate: Date;
  fertileWindow: { start: Date; end: Date };
  phase: "period" | "fertile" | "ovulation" | "luteal" | "follicular";
}

const DAY_MS = 1000 * 60 * 60 * 24;

function diffInDays(a: Date, b: Date) {
  return Math.round((a.getTime() - b.getTime()) / DAY_MS);
}

function addDays(date: Date, days: number) {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

/**
 * Tính dự đoán chu kỳ dựa trên lịch sử `cycle_logs`, sắp xếp mới nhất trước.
 * Nếu chưa có đủ dữ liệu, dùng giá trị mặc định (28 ngày chu kỳ, 5 ngày hành kinh)
 * lấy từ `profiles.avg_cycle_length` / `avg_period_length`.
 */
export function predictCycle(
  logs: CycleLog[],
  fallback: { avgCycleLength: number; avgPeriodLength: number } = {
    avgCycleLength: 28,
    avgPeriodLength: 5,
  },
  today: Date = new Date()
): CyclePrediction {
  const sorted = [...logs].sort(
    (a, b) => new Date(b.start_date).getTime() - new Date(a.start_date).getTime()
  );

  let avgCycleLength = fallback.avgCycleLength;
  let avgPeriodLength = fallback.avgPeriodLength;

  if (sorted.length >= 2) {
    const gaps: number[] = [];
    for (let i = 0; i < sorted.length - 1; i++) {
      const gap = diffInDays(
        new Date(sorted[i].start_date),
        new Date(sorted[i + 1].start_date)
      );
      if (gap > 0 && gap < 60) gaps.push(gap);
    }
    if (gaps.length > 0) {
      avgCycleLength = Math.round(gaps.reduce((a, b) => a + b, 0) / gaps.length);
    }
  }

  if (sorted.length > 0) {
    const periodLengths = sorted
      .filter((l) => l.end_date)
      .map((l) => diffInDays(new Date(l.end_date as string), new Date(l.start_date)) + 1)
      .filter((n) => n > 0 && n < 15);
    if (periodLengths.length > 0) {
      avgPeriodLength = Math.round(
        periodLengths.reduce((a, b) => a + b, 0) / periodLengths.length
      );
    }
  }

  const lastStart = sorted.length > 0 ? new Date(sorted[0].start_date) : addDays(today, -avgCycleLength / 2);
  const currentDay = Math.max(1, diffInDays(today, lastStart) + 1);
  const nextPeriodDate = addDays(lastStart, avgCycleLength);
  const ovulationDate = addDays(nextPeriodDate, -14);
  const fertileWindow = {
    start: addDays(ovulationDate, -5),
    end: addDays(ovulationDate, 1),
  };

  let phase: CyclePrediction["phase"] = "follicular";
  if (currentDay <= avgPeriodLength) phase = "period";
  else if (today >= fertileWindow.start && today <= fertileWindow.end) {
    phase = diffInDays(today, ovulationDate) === 0 ? "ovulation" : "fertile";
  } else if (today > ovulationDate) phase = "luteal";

  return {
    avgCycleLength,
    avgPeriodLength,
    currentDay,
    nextPeriodDate,
    ovulationDate,
    fertileWindow,
    phase,
  };
}

export function daysUntil(date: Date, today: Date = new Date()) {
  return Math.max(0, diffInDays(date, today));
}

// ---------- Lịch sử & phân tích chu kỳ (dùng cho trang Cá nhân) ----------

// Ngưỡng lâm sàng phổ biến: chu kỳ 21–35 ngày và hành kinh 2–8 ngày được xem là bình thường.
export const NORMAL_CYCLE_RANGE = { min: 21, max: 35 };
export const NORMAL_PERIOD_RANGE = { min: 2, max: 8 };

export interface CycleHistoryEntry {
  id: string;
  start_date: string;
  end_date: string | null;
  /** Số ngày từ kỳ này đến kỳ kế tiếp gần đây hơn — null nếu là kỳ mới nhất (chưa có kỳ sau để so). */
  cycleLength: number | null;
  /** Số ngày hành kinh, null nếu chưa ghi nhận ngày kết thúc. */
  periodLength: number | null;
  abnormalCycle: boolean;
  abnormalPeriod: boolean;
}

/**
 * Dựng lịch sử chu kỳ từ `cycle_logs`, mới nhất trước. `cycleLength` của mỗi mục
 * là độ dài của chu kỳ NGAY TRƯỚC kỳ đó (khoảng cách đến kỳ kế tiếp gần hơn),
 * tức `history[0].cycleLength` = độ dài chu kỳ gần đây nhất đã hoàn thành.
 */
export function buildCycleHistory(logs: CycleLog[]): CycleHistoryEntry[] {
  const sorted = [...logs].sort(
    (a, b) => new Date(b.start_date).getTime() - new Date(a.start_date).getTime()
  );

  return sorted.map((log, i) => {
    const next = sorted[i + 1];
    const cycleLength = next
      ? diffInDays(new Date(log.start_date), new Date(next.start_date))
      : null;
    const periodLength = log.end_date
      ? diffInDays(new Date(log.end_date), new Date(log.start_date)) + 1
      : null;

    return {
      id: log.id,
      start_date: log.start_date,
      end_date: log.end_date,
      cycleLength,
      periodLength,
      abnormalCycle:
        cycleLength != null &&
        (cycleLength < NORMAL_CYCLE_RANGE.min || cycleLength > NORMAL_CYCLE_RANGE.max),
      abnormalPeriod:
        periodLength != null &&
        (periodLength < NORMAL_PERIOD_RANGE.min || periodLength > NORMAL_PERIOD_RANGE.max),
    };
  });
}

export interface CycleSummary {
  /** Có đủ dữ liệu (>=2 kỳ) để tính độ dài chu kỳ trước hay chưa. */
  hasPreviousCycle: boolean;
  /** Có đủ dữ liệu (>=3 kỳ) để so sánh sự thay đổi giữa 2 chu kỳ gần nhất hay chưa. */
  hasVariability: boolean;
  previousCycleLength: number | null;
  previousCycleAbnormal: boolean;
  previousPeriodLength: number | null;
  previousPeriodAbnormal: boolean;
  cycleLengthDelta: number | null;
  irregular: boolean;
}

// Chênh lệch giữa 2 chu kỳ gần nhất vượt quá 7 ngày được xem là "không đều đặn".
const IRREGULARITY_THRESHOLD_DAYS = 7;

export function summarizeCycleHistory(history: CycleHistoryEntry[]): CycleSummary {
  const withCycleLength = history.filter((h) => h.cycleLength != null);
  const withPeriodLength = history.filter((h) => h.periodLength != null);

  const previous = withCycleLength[0] ?? null;
  const previousPeriod = withPeriodLength[0] ?? null;
  const secondPrevious = withCycleLength[1] ?? null;

  const cycleLengthDelta =
    previous?.cycleLength != null && secondPrevious?.cycleLength != null
      ? Math.abs(previous.cycleLength - secondPrevious.cycleLength)
      : null;

  return {
    hasPreviousCycle: previous != null,
    hasVariability: cycleLengthDelta != null,
    previousCycleLength: previous?.cycleLength ?? null,
    previousCycleAbnormal: previous?.abnormalCycle ?? false,
    previousPeriodLength: previousPeriod?.periodLength ?? null,
    previousPeriodAbnormal: previousPeriod?.abnormalPeriod ?? false,
    cycleLengthDelta,
    irregular: cycleLengthDelta != null && cycleLengthDelta > IRREGULARITY_THRESHOLD_DAYS,
  };
}

export const phaseLabel: Record<CyclePrediction["phase"], string> = {
  period: "Đang hành kinh",
  fertile: "Cửa sổ thụ thai",
  ovulation: "Ngày rụng trứng",
  luteal: "Giai đoạn hoàng thể",
  follicular: "Giai đoạn nang trứng",
};

export const phaseColor: Record<CyclePrediction["phase"], string> = {
  period: "var(--c-period)",
  fertile: "var(--c-fertile)",
  ovulation: "var(--c-ovulation)",
  luteal: "var(--c-sleep)",
  follicular: "var(--c-mood)",
};
