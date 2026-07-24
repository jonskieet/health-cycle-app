"use client";

import Link from "next/link";
import { useState } from "react";
import { Plus, ChevronRight } from "lucide-react";
import AuroraRing from "@/components/ui/AuroraRing";
import CycleCalendar from "@/components/cycle/CycleCalendar";
import EmptyState from "@/components/ui/EmptyState";
import CycleLogForm from "@/components/log/CycleLogForm";
import { useCycleLogs, useProfile, CycleLogFull } from "@/lib/queries";
import { predictCycle, phaseLabel, phaseColor, daysUntil } from "@/lib/cycle-utils";

export default function CyclePage() {
  const { data: profile } = useProfile();
  const { data: cycleLogs = [], isLoading } = useCycleLogs();
  const [editingLog, setEditingLog] = useState<CycleLogFull | null>(null);

  const prediction = predictCycle(cycleLogs, {
    avgCycleLength: profile?.avg_cycle_length ?? 28,
    avgPeriodLength: profile?.avg_period_length ?? 5,
  });
  const daysToNext = daysUntil(prediction.nextPeriodDate);
  const daysToOvulation = daysUntil(prediction.ovulationDate);
  const ringPercent = Math.min(100, (prediction.currentDay / prediction.avgCycleLength) * 100);

  return (
    <main className="flex flex-1 flex-col gap-6 px-5 pt-8">
      <header className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-bold text-[var(--ink)]">Chu kỳ</h1>
        <Link
          href="/log?type=cycle"
          className="flex h-9 w-9 items-center justify-center rounded-full text-white"
          style={{ background: "var(--c-period)" }}
        >
          <Plus size={18} />
        </Link>
      </header>

      {isLoading ? null : cycleLogs.length === 0 ? (
        <EmptyState
          title="Chưa có dữ liệu chu kỳ"
          description="Ghi nhận ngày bắt đầu kỳ kinh gần nhất để KVCycle bắt đầu dự đoán chu kỳ cho bạn."
          actionLabel="Ghi nhận kỳ kinh"
          actionHref="/log?type=cycle"
        />
      ) : (
        <>
          <section className="glass-card-strong flex flex-col items-center gap-3 rounded-[28px] p-6 text-center">
            <AuroraRing percent={ringPercent} colorFrom={phaseColor[prediction.phase]} colorTo="var(--c-fertile)" size={160}>
              <span className="text-xs text-[var(--ink-faint)]">Ngày</span>
              <span className="font-display text-3xl font-extrabold text-[var(--ink)]">
                {prediction.currentDay}
              </span>
              <span className="text-xs text-[var(--ink-faint)]">/ {prediction.avgCycleLength}</span>
            </AuroraRing>
            <p className="font-display text-base font-bold" style={{ color: phaseColor[prediction.phase] }}>
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
            <ul className="flex flex-col gap-1">
              {cycleLogs.map((log) => (
                <li key={log.id}>
                  <button
                    type="button"
                    onClick={() => setEditingLog(log)}
                    className="flex w-full items-center justify-between rounded-2xl px-2 py-2.5 text-sm transition-colors hover:bg-black/[0.03]"
                  >
                    <span className="text-[var(--ink)]">
                      {new Date(log.start_date).toLocaleDateString("vi-VN")} –{" "}
                      {log.end_date ? new Date(log.end_date).toLocaleDateString("vi-VN") : "..."}
                    </span>
                    <span className="flex items-center gap-2 text-xs text-[var(--ink-faint)]">
                      {Math.round(
                        (new Date(log.end_date ?? log.start_date).getTime() -
                          new Date(log.start_date).getTime()) /
                          (1000 * 60 * 60 * 24) +
                          1
                      )}{" "}
                      ngày
                      <ChevronRight size={14} />
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </section>
        </>
      )}

      {editingLog && <CycleLogForm editLog={editingLog} onClose={() => setEditingLog(null)} />}
    </main>
  );
}
