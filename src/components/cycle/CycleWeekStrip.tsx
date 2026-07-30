"use client";

// Dai 7 ngay (hom nay + 3 truoc + 3 sau) hien o dau khoi chu ky, giong anh
// mau tham khao — khac voi lich thang `CycleCalendar` da co san ben duoi
// trang (khong thay the, chi them phia tren vong tron cho giong mau).

const WEEKDAY_LABELS = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];

interface CycleWeekStripProps {
  today?: Date;
  /** Cac ngay (yyyy-mm-dd) dang trong ky hanh kinh, de cham diem duoi so ngay. */
  periodDates?: Set<string>;
  periodColor: string;
}

function toKey(d: Date) {
  return d.toISOString().slice(0, 10);
}

export default function CycleWeekStrip({ today = new Date(), periodDates, periodColor }: CycleWeekStripProps) {
  const days = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date(today);
    d.setDate(d.getDate() - 3 + i);
    return d;
  });

  return (
    <div className="flex w-full items-start justify-between px-1">
      {days.map((d) => {
        const isToday = d.toDateString() === today.toDateString();
        const isPeriod = periodDates?.has(toKey(d)) ?? false;
        return (
          <div key={d.toISOString()} className="flex flex-col items-center gap-1.5">
            <span className="text-[10px] font-medium text-[var(--ink-faint)]">
              {isToday ? "Hôm nay" : WEEKDAY_LABELS[d.getDay()]}
            </span>
            <span
              className="flex h-9 w-9 items-center justify-center rounded-full text-xs font-bold"
              style={
                isToday
                  ? { border: `2px solid ${periodColor}`, color: "var(--ink)" }
                  : { color: "var(--ink-soft)" }
              }
            >
              {d.getDate()}
            </span>
            <span
              className="h-1.5 w-1.5 rounded-full"
              style={{ background: isPeriod ? periodColor : "transparent" }}
            />
          </div>
        );
      })}
    </div>
  );
}
