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
 * Gộp các log chồng lấn hoặc liền kề (cách nhau <=1 ngày) thành 1 kỳ kinh
 * logic duy nhất — lấy start_date sớm nhất và end_date muộn nhất. Đây là
 * lớp phòng vệ cho dữ liệu cũ/lỗi (VD trước khi sửa form, mỗi ngày hành
 * kinh bị lưu thành 1 dòng riêng): nếu không gộp, 2 dòng liền kề sẽ bị tính
 * là 2 chu kỳ cách nhau 0-1 ngày → báo "chu kỳ bất thường" sai và
 * currentDay/lịch hiển thị sai. Không sửa dữ liệu trong DB — chỉ gộp khi
 * tính toán hiển thị.
 */
export function coalesceCycleLogs<T extends CycleLog>(logs: T[]): T[] {
  const ascending = [...logs].sort(
    (a, b) => new Date(a.start_date).getTime() - new Date(b.start_date).getTime()
  );

  const merged: T[] = [];
  for (const log of ascending) {
    const prev = merged[merged.length - 1];
    if (prev) {
      const prevEnd = prev.end_date ? new Date(prev.end_date) : new Date(prev.start_date);
      const curStart = new Date(log.start_date);
      // liền kề/chồng lấn nếu kỳ mới bắt đầu trong vòng 1 ngày sau khi kỳ
      // trước đó "kết thúc" (hoặc trước khi nó kết thúc, tức chồng lấn).
      if (diffInDays(curStart, prevEnd) <= 1) {
        const prevEndKey = prev.end_date ?? prev.start_date;
        const curEndKey = log.end_date ?? log.start_date;
        const newEnd = new Date(curEndKey) > new Date(prevEndKey) ? curEndKey : prevEndKey;
        merged[merged.length - 1] = { ...prev, end_date: newEnd };
        continue;
      }
    }
    merged.push({ ...log });
  }

  return merged.sort((a, b) => new Date(b.start_date).getTime() - new Date(a.start_date).getTime());
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
  const sorted = coalesceCycleLogs(logs).sort(
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

  // Ưu tiên anchor vào kỳ đang MỞ (chưa có end_date) gần nhất — vì đó là kỳ
  // thực sự đang diễn ra. Nếu không có kỳ nào đang mở (mọi kỳ đều đã đóng),
  // dùng kỳ có start_date gần nhất như cũ. Việc này giúp "Ngày X/Y" hiển thị
  // đúng ngay cả khi dữ liệu cũ còn sót vài dòng 1-ngày trùng lặp.
  const openSorted = sorted.filter((l) => !l.end_date);
  const anchorLog = openSorted[0] ?? sorted[0] ?? null;
  const lastStart = anchorLog ? new Date(anchorLog.start_date) : addDays(today, -avgCycleLength / 2);
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
  const sorted = coalesceCycleLogs(logs);

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

// Dong phu ngan, nhe nhang duoi so ngay lon o giua vong tron chu ky (giong
// "Be Gentle With Yourself" trong anh mau tham khao).
export const phaseSubtitle: Record<CyclePrediction["phase"], string> = {
  period: "Nhẹ nhàng với bản thân nhé",
  fertile: "Dễ thụ thai trong giai đoạn này",
  ovulation: "Khả năng thụ thai cao nhất",
  luteal: "Nghỉ ngơi, lắng nghe cơ thể",
  follicular: "Năng lượng đang hồi phục",
};

export const phaseColor: Record<CyclePrediction["phase"], string> = {
  period: "var(--c-period)",
  fertile: "var(--c-fertile)",
  ovulation: "var(--c-ovulation)",
  luteal: "var(--c-sleep)",
  follicular: "var(--c-mood)",
};
