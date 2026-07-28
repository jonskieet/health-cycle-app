"use client";

import { useMemo, useState } from "react";
import { Plus, ChevronRight, Sparkles } from "lucide-react";
import AuroraRing from "@/components/ui/AuroraRing";
import CycleCalendar from "@/components/cycle/CycleCalendar";
import PhaseOutlook from "@/components/cycle/PhaseOutlook";
import DailyInsights from "@/components/cycle/DailyInsights";
import HealthCheckIns from "@/components/cycle/HealthCheckIns";
import AiChatSheet from "@/components/cycle/AiChatSheet";
import AbnormalCycleBanner from "@/components/cycle/AbnormalCycleBanner";
import EmptyState from "@/components/ui/EmptyState";
import { SkeletonCard, SkeletonRows } from "@/components/ui/Skeleton";
import CycleLogForm from "@/components/log/CycleLogForm";
import { useCycleLogs, useProfile, CycleLogFull } from "@/lib/queries";
import { predictCycle, phaseLabel, phaseColor, daysUntil } from "@/lib/cycle-utils";
import { getSuggestedPrompts } from "@/lib/cycle-insights";

export default function CyclePage() {
  const { data: profile } = useProfile();
  const { data: cycleLogs = [], isLoading } = useCycleLogs();
  const [editingLog, setEditingLog] = useState<CycleLogFull | null>(null);
  const [addingNew, setAddingNew] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [chatInitialMessage, setChatInitialMessage] = useState<string | undefined>(undefined);

  const avgCycleLength = profile?.avg_cycle_length ?? 28;
  const avgPeriodLength = profile?.avg_period_length ?? 5;
  // Module C4: tránh tính lại predictCycle() (sort + lặp toàn bộ cycleLogs)
  // mỗi khi trang re-render vì lý do khác (mở/đóng modal, gõ chat...).
  const prediction = useMemo(
    () => predictCycle(cycleLogs, { avgCycleLength, avgPeriodLength }),
    [cycleLogs, avgCycleLength, avgPeriodLength]
  );
  const daysToNext = daysUntil(prediction.nextPeriodDate);
  const daysToOvulation = daysUntil(prediction.ovulationDate);
  const ringPercent = Math.min(100, (prediction.currentDay / prediction.avgCycleLength) * 100);

  return (
    <main className="flex flex-1 flex-col gap-6 px-5 pt-8">
      <header className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-bold text-[var(--ink)]">Chu kỳ</h1>
        <button
          type="button"
          onClick={() => setAddingNew(true)}
          className="flex h-9 w-9 items-center justify-center rounded-full text-white"
          style={{ background: "var(--c-period)" }}
        >
          <Plus size={18} />
        </button>
      </header>

      {isLoading ? (
        <div className="flex flex-col gap-6">
          <SkeletonCard withRing />
          <SkeletonRows rows={3} />
        </div>
      ) : cycleLogs.length === 0 ? (
        <EmptyState
          title="Chưa có dữ liệu chu kỳ"
          description="Ghi nhận ngày bắt đầu kỳ kinh gần nhất để KVCycle bắt đầu dự đoán chu kỳ cho bạn."
          actionLabel="Ghi nhận kỳ kinh"
          onAction={() => setAddingNew(true)}
        />
      ) : (
        <>
          <AbnormalCycleBanner cycleLogs={cycleLogs} />

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

            {profile?.usage_goal === "conceive" && (
              <p
                className="w-full rounded-2xl px-3 py-2.5 text-center text-xs font-medium"
                style={{ background: "color-mix(in srgb, var(--c-fertile) 18%, var(--surface))", color: "var(--ink)" }}
              >
                🌷 Cửa sổ thụ thai: {prediction.fertileWindow.start.toLocaleDateString("vi-VN")} –{" "}
                {prediction.fertileWindow.end.toLocaleDateString("vi-VN")}
              </p>
            )}
          </section>

          <CycleCalendar prediction={prediction} cycleLogs={cycleLogs} />

          <DailyInsights phase={prediction.phase} />

          <PhaseOutlook phase={prediction.phase} />

          <section className="flex flex-col gap-3">
            <div className="flex items-center gap-2 px-1">
              <Sparkles size={16} style={{ color: "var(--c-sleep)" }} />
              <p className="font-display text-sm font-bold text-[var(--ink)]">
                Có thắc mắc? Hỏi trợ lý nhé ✨
              </p>
            </div>
            <div className="-mx-5 flex gap-2 overflow-x-auto px-5 pb-1" style={{ scrollbarWidth: "none" }}>
              {getSuggestedPrompts(prediction.phase).map((prompt) => (
                <button
                  key={prompt}
                  type="button"
                  onClick={() => {
                    setChatInitialMessage(prompt);
                    setChatOpen(true);
                  }}
                  className="glass-card shrink-0 whitespace-nowrap rounded-full px-4 py-2.5 text-xs font-medium text-[var(--c-period)] active:scale-[0.98]"
                >
                  {prompt}
                </button>
              ))}
            </div>
            <button
              type="button"
              onClick={() => {
                setChatInitialMessage(undefined);
                setChatOpen(true);
              }}
              className="glass-card rounded-full px-4 py-3 text-left text-xs text-[var(--ink-faint)]"
            >
              Nhập câu hỏi của bạn...
            </button>
          </section>

          <HealthCheckIns />

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
      {addingNew && <CycleLogForm onClose={() => setAddingNew(false)} />}
      {chatOpen && (
        <AiChatSheet initialMessage={chatInitialMessage} onClose={() => setChatOpen(false)} />
      )}
    </main>
  );
}
