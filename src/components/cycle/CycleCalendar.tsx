"use client";

// P11 fix: lịch trước đây tô màu "hành kinh" bằng công thức thuần suy đoán
// (nextPeriodDate - avgCycleLength), KHÔNG đọc dữ liệu `cycle_logs` thật —
// nên có thể lệch hẳn so với "Lịch sử gần đây" và chồng lấn với cửa sổ thụ
// thai. Giờ: ngày hành kinh trong quá khứ/hiện tại lấy trực tiếp từ các
// khoảng start_date→end_date đã ghi (kỳ chưa kết thúc thì tính tới hôm nay);
// chỉ có "Rụng trứng" / "Cửa sổ thụ thai" / kỳ tiếp theo là suy đoán, và suy
// đoán không bao giờ vẽ đè lên ngày đã có dữ liệu thật.

import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { CyclePrediction, CycleLog } from "@/lib/cycle-utils";

const weekdays = ["T2", "T3", "T4", "T5", "T6", "T7", "CN"];
const monthNames = [
  "Tháng 1", "Tháng 2", "Tháng 3", "Tháng 4", "Tháng 5", "Tháng 6",
  "Tháng 7", "Tháng 8", "Tháng 9", "Tháng 10", "Tháng 11", "Tháng 12",
];

function isSameDay(a: Date, b: Date) {
  return a.toDateString() === b.toDateString();
}

function toKey(d: Date) {
  return d.toDateString();
}

function addDays(d: Date, n: number) {
  const out = new Date(d);
  out.setDate(out.getDate() + n);
  return out;
}

/** Tập hợp các ngày hành kinh THẬT, dựng từ start_date→end_date của mọi log.
 *  Kỳ chưa có end_date (đang mở) tính tới hôm nay, giới hạn tối đa 15 ngày để
 *  tránh tô tràn lan nếu dữ liệu lỗi. */
function buildLoggedPeriodDays(logs: CycleLog[], today: Date): Set<string> {
  const set = new Set<string>();
  for (const log of logs) {
    const start = new Date(log.start_date);
    const end = log.end_date ? new Date(log.end_date) : today;
    let cur = start;
    let guard = 0;
    while (cur <= end && guard < 15) {
      set.add(toKey(cur));
      cur = addDays(cur, 1);
      guard++;
    }
  }
  return set;
}

function dayType(
  date: Date,
  prediction: CyclePrediction,
  loggedPeriodDays: Set<string>
) {
  if (loggedPeriodDays.has(toKey(date))) return "period";
  if (isSameDay(date, prediction.ovulationDate)) return "ovulation";
  if (date >= prediction.fertileWindow.start && date <= prediction.fertileWindow.end) return "fertile";
  if (isSameDay(date, prediction.nextPeriodDate)) return "period-next";
  return null;
}

const typeColor: Record<string, string> = {
  period: "var(--c-period)",
  "period-next": "var(--c-period)",
  ovulation: "var(--c-ovulation)",
  fertile: "var(--c-fertile)",
};

// J3 (MAJOR_REDESIGN_BRIEF.md): lịch trước đây tô mỗi ngày 1 hình tròn RỜI
// RẠC. Giờ: các ngày LIÊN TIẾP cùng loại (hành kinh/cửa sổ thụ thai/rụng
// trứng) trong CÙNG 1 HÀNG (tuần) được nối thành 1 dải nền liền mạch, bo góc
// CHỈ Ở 2 ĐẦU dải — giống màn 2 của `ref-06-radial-dial-mascot-mockup.webp`.
// Chỉ nối trong cùng hàng (không nối qua hàng khác) vì lưới vốn đã ngắt dòng
// trực quan ở cuối mỗi tuần, đúng với chính ảnh tham khảo (dải "Cửa sổ thụ
// thai" ngày 23–27 không nối tràn sang hàng dưới dù dài hơn 1 tuần).
// Không đổi cấu trúc "1 tháng + nút </>": brief cho phép tách riêng phần
// "cuộn dọc nhiều tháng" thành module con khác vì rủi ro UX cao hơn hẳn —
// giữ nguyên điều hướng cũ, chỉ đổi cách TÔ MÀU từng dải.
type DayCell = {
  date: Date;
  type: string | null;
  isToday: boolean;
  isRunStart: boolean;
  isRunEnd: boolean;
};

function buildRows(
  days: (Date | null)[],
  prediction: CyclePrediction,
  loggedPeriodDays: Set<string>,
  today: Date
): (DayCell | null)[][] {
  const rows: (DayCell | null)[][] = [];
  for (let i = 0; i < days.length; i += 7) {
    const rawRow = days.slice(i, i + 7);
    const row: (DayCell | null)[] = rawRow.map((date) =>
      date
        ? {
            date,
            type: dayType(date, prediction, loggedPeriodDays),
            isToday: isSameDay(date, today),
            isRunStart: false,
            isRunEnd: false,
          }
        : null
    );
    // Đánh dấu đầu/cuối dải: 1 ô là "đầu dải" nếu ô liền trước trong hàng
    // trống hoặc khác loại; "cuối dải" nếu ô liền sau trống hoặc khác loại.
    row.forEach((cell, idx) => {
      if (!cell || !cell.type) return;
      const prev = row[idx - 1];
      const next = row[idx + 1];
      cell.isRunStart = !prev || prev.type !== cell.type;
      cell.isRunEnd = !next || next.type !== cell.type;
    });
    rows.push(row);
  }
  return rows;
}

export default function CycleCalendar({
  prediction,
  cycleLogs,
}: {
  prediction: CyclePrediction;
  cycleLogs: CycleLog[];
}) {
  const [cursor, setCursor] = useState(() => {
    const d = new Date();
    d.setDate(1);
    return d;
  });

  const days = useMemo(() => {
    const year = cursor.getFullYear();
    const month = cursor.getMonth();
    const firstDay = new Date(year, month, 1);
    const startOffset = (firstDay.getDay() + 6) % 7; // Mon=0
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const cells: (Date | null)[] = Array(startOffset).fill(null);
    for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(year, month, d));
    return cells;
  }, [cursor]);

  // `today` (dùng làm fallback ngày kết thúc cho kỳ đang mở, và đánh dấu ô
  // "hôm nay") được gọi trực tiếp `new Date()` riêng trong từng useMemo bên
  // dưới thay vì 1 biến chung — vì `new Date()` khác reference mỗi render,
  // đưa vào mảng deps sẽ làm useMemo luôn tính lại, mất tác dụng memo hoá.
  // 2 giá trị gọi cách nhau vài mili-giây trong cùng 1 lần render, không ảnh
  // hưởng vì đều chỉ dùng cấp độ ngày.
  const loggedPeriodDays = useMemo(
    () => buildLoggedPeriodDays(cycleLogs, new Date()),
    [cycleLogs]
  );

  const rows = useMemo(
    () => buildRows(days, prediction, loggedPeriodDays, new Date()),
    [days, prediction, loggedPeriodDays]
  );

  return (
    <div className="glass-card rounded-[26px] p-5">
      <div className="mb-4 flex items-center justify-between">
        <button
          onClick={() => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() - 1, 1))}
          className="rounded-full p-1.5 text-[var(--ink-soft)] hover:bg-black/5"
        >
          <ChevronLeft size={18} />
        </button>
        <span className="font-display text-sm font-bold text-[var(--ink)]">
          {monthNames[cursor.getMonth()]} {cursor.getFullYear()}
        </span>
        <button
          onClick={() => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1))}
          className="rounded-full p-1.5 text-[var(--ink-soft)] hover:bg-black/5"
        >
          <ChevronRight size={18} />
        </button>
      </div>

      <div className="flex flex-col gap-2">
        <div className="grid grid-cols-7 text-center">
          {weekdays.map((w) => (
            <span key={w} className="text-[10px] font-medium text-[var(--ink-faint)]">
              {w}
            </span>
          ))}
        </div>
        {rows.map((row, rowIdx) => (
          <div key={rowIdx} className="grid grid-cols-7">
            {row.map((cell, i) => {
              if (!cell) return <div key={i} className="h-8" />;
              const { date, type, isToday, isRunStart, isRunEnd } = cell;
              return (
                <div key={i} className="relative flex h-8 items-center justify-center">
                  {/* Dải nền liền mạch — chỉ bo góc ở đầu/cuối dải thật sự,
                      giữa dải là cạnh vuông để nối liền sang ô kế bên (2 ô
                      cùng màu chạm sát cạnh, không có khoảng hở giữa vì cột
                      lưới vốn đã sát nhau — `grid-cols-7` không đặt gap-x). */}
                  {type && (
                    <div
                      className="absolute inset-y-0 left-0 right-0"
                      style={{
                        background: typeColor[type],
                        borderTopLeftRadius: isRunStart ? 9999 : 0,
                        borderBottomLeftRadius: isRunStart ? 9999 : 0,
                        borderTopRightRadius: isRunEnd ? 9999 : 0,
                        borderBottomRightRadius: isRunEnd ? 9999 : 0,
                      }}
                    />
                  )}
                  <span
                    className="relative z-10 flex h-6 w-6 items-center justify-center rounded-full text-xs font-medium"
                    style={{
                      color: type ? "#fff" : "var(--ink)",
                      outline: isToday ? "2px solid var(--c-sleep)" : "none",
                      outlineOffset: 1,
                    }}
                  >
                    {date.getDate()}
                  </span>
                </div>
              );
            })}
          </div>
        ))}
      </div>

      <div className="mt-4 flex flex-wrap gap-x-4 gap-y-1.5 border-t border-black/5 pt-3 text-[11px] text-[var(--ink-soft)]">
        <Legend color="var(--c-period)" label="Hành kinh" />
        <Legend color="var(--c-fertile)" label="Cửa sổ thụ thai" />
        <Legend color="var(--c-ovulation)" label="Rụng trứng" />
      </div>
    </div>
  );
}

function Legend({ color, label }: { color: string; label: string }) {
  return (
    <span className="flex items-center gap-1.5">
      <span className="h-2 w-2 rounded-full" style={{ background: color }} />
      {label}
    </span>
  );
}
