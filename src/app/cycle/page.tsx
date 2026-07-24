import Link from "next/link";
import { Plus } from "lucide-react";
import AuroraRing from "@/components/ui/AuroraRing";
import CycleCalendar from "@/components/cycle/CycleCalendar";
import { mockCycleLogs } from "@/lib/mock-data";
import { predictCycle, phaseLabel, phaseColor, daysUntil } from "@/lib/cycle-utils";

export default function CyclePage() {
  const prediction = predictCycle(mockCycleLogs);
  const daysToNext = daysUntil(prediction.nextPeriodDate);
  const daysToOvulation = daysUntil(prediction.ovulationDate);
  const ringPercent = Math.min(
    100,
    (prediction.currentDay / prediction.avgCycleLength) * 100
  );

  return (
    <main className="flex flex-1 flex-col gap-6 px-5 pt-8">
      <header className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-bold text-[var(--ink)]">Chu kỳ</h1>
        <Link
          href="/log"
          className="flex h-9 w-9 items-center justify-center rounded-full text-white"
          style={{ background: "var(--c-period)" }}
        >
          <Plus size={18} />
        </Link>
      </header>

      <section className="glass-card-strong flex flex-col items-center gap-3 rounded-[28px] p-6 text-center">
        <AuroraRing
          percent={ringPercent}
          colorFrom={phaseColor[prediction.phase]}
          colorTo="var(--c-fertile)"
          size={160}
        >
          <span className="text-xs text-[var(--ink-faint)]">Ngày</span>
          <span className="font-display text-3xl font-extrabold text-[var(--ink)]">
            {prediction.currentDay}
          </span>
          <span className="text-xs text-[var(--ink-faint)]">/ {prediction.avgCycleLength}</span>
        </AuroraRing>
        <p
          className="font-display text-base font-bold"
          style={{ color: phaseColor[prediction.phase] }}
        >
          {phaseLabel[prediction.phase]}
        </p>
        <div className="grid w-full grid-cols-2 gap-3 pt-2 text-left">
          <div className="rounded-2xl bg-black/[0.03] p-3">
            <p className="text-[11px] text-[var(--ink-faint)]">Kỳ kinh tiếp theo</p>
            <p className="font-display text-sm font-bold text-[var(--ink)]">
              {daysToNext === 0 ? "Hôm nay" : `${daysToNext} ngày nữa`}
            </p>
          </div>
          <div className="rounded-2xl bg-black/[0.03] p-3">
            <p className="text-[11px] text-[var(--ink-faint)]">Ngày rụng trứng</p>
            <p className="font-display text-sm font-bold text-[var(--ink)]">
              {daysToOvulation === 0 ? "Hôm nay" : `${daysToOvulation} ngày nữa`}
            </p>
          </div>
        </div>
      </section>

      <CycleCalendar prediction={prediction} />

      <section className="glass-card rounded-[24px] p-5">
        <p className="mb-3 text-xs font-medium uppercase tracking-wide text-[var(--ink-faint)]">
          Lịch sử gần đây
        </p>
        <ul className="flex flex-col gap-3">
          {mockCycleLogs.map((log) => (
            <li key={log.id} className="flex items-center justify-between text-sm">
              <span className="text-[var(--ink)]">
                {new Date(log.start_date).toLocaleDateString("vi-VN")} –{" "}
                {log.end_date ? new Date(log.end_date).toLocaleDateString("vi-VN") : "..."}
              </span>
              <span className="text-xs text-[var(--ink-faint)]">
                {Math.round(
                  (new Date(log.end_date ?? log.start_date).getTime() -
                    new Date(log.start_date).getTime()) /
                    (1000 * 60 * 60 * 24) +
                    1
                )}{" "}
                ngày
              </span>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}
