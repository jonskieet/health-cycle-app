"use client";

import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { CyclePrediction } from "@/lib/cycle-utils";

const weekdays = ["T2", "T3", "T4", "T5", "T6", "T7", "CN"];
const monthNames = [
  "Tháng 1", "Tháng 2", "Tháng 3", "Tháng 4", "Tháng 5", "Tháng 6",
  "Tháng 7", "Tháng 8", "Tháng 9", "Tháng 10", "Tháng 11", "Tháng 12",
];

function isSameDay(a: Date, b: Date) {
  return a.toDateString() === b.toDateString();
}

function dayType(date: Date, prediction: CyclePrediction, periodLength: number) {
  const periodStart = new Date(prediction.nextPeriodDate);
  periodStart.setDate(periodStart.getDate() - prediction.avgCycleLength);
  for (let i = 0; i < periodLength; i++) {
    const d = new Date(periodStart);
    d.setDate(d.getDate() + i);
    if (isSameDay(d, date)) return "period";
  }
  if (isSameDay(date, prediction.ovulationDate)) return "ovulation";
  if (date >= prediction.fertileWindow.start && date <= prediction.fertileWindow.end)
    return "fertile";
  if (isSameDay(date, prediction.nextPeriodDate)) return "period-next";
  return null;
}

const typeColor: Record<string, string> = {
  period: "var(--c-period)",
  "period-next": "var(--c-period)",
  ovulation: "var(--c-ovulation)",
  fertile: "var(--c-fertile)",
};

export default function CycleCalendar({ prediction }: { prediction: CyclePrediction }) {
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

  const today = new Date();

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

      <div className="grid grid-cols-7 gap-y-2 text-center">
        {weekdays.map((w) => (
          <span key={w} className="text-[10px] font-medium text-[var(--ink-faint)]">
            {w}
          </span>
        ))}
        {days.map((date, i) => {
          if (!date) return <div key={i} />;
          const type = dayType(date, prediction, prediction.avgPeriodLength);
          const isToday = isSameDay(date, today);
          return (
            <div key={i} className="flex justify-center">
              <div
                className="flex h-8 w-8 items-center justify-center rounded-full text-xs font-medium"
                style={{
                  background: type ? typeColor[type] : "transparent",
                  color: type ? "#fff" : "var(--ink)",
                  outline: isToday ? "2px solid var(--c-sleep)" : "none",
                  outlineOffset: 1,
                }}
              >
                {date.getDate()}
              </div>
            </div>
          );
        })}
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
