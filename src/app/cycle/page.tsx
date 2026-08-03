"use client";

import { useMemo, useState } from "react";
import { Plus, Sparkles, ChevronRight } from "lucide-react";
import CycleRadialDial from "@/components/cycle/CycleRadialDial";
import CycleWeekStrip from "@/components/cycle/CycleWeekStrip";
import CycleCalendar from "@/components/cycle/CycleCalendar";
import PhaseOutlook from "@/components/cycle/PhaseOutlook";
import DailyInsights from "@/components/cycle/DailyInsights";
import HealthCheckIns from "@/components/cycle/HealthCheckIns";
import AiChatSheet from "@/components/cycle/AiChatSheet";
import AbnormalCycleBanner from "@/components/cycle/AbnormalCycleBanner";
import EmptyState from "@/components/ui/EmptyState";
import PhaseMotif from "@/components/ui/PhaseMotif";
import { SkeletonCard, SkeletonRows } from "@/components/ui/Skeleton";
import CycleLogForm from "@/components/log/CycleLogForm";
import CycleBarHistory from "@/components/cycle/CycleBarHistory";
import { useCycleLogs, useProfile, CycleLogFull } from "@/lib/queries";
import { predictCycle, phaseLabel, phaseColor, phaseSubtitle, daysUntil, buildCycleHistory } from "@/lib/cycle-utils";
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
  // J1 (MAJOR_REDESIGN_BRIEF.md): dữ liệu cho biểu đồ cột lịch sử — tái dùng
  // `buildCycleHistory()` đã có sẵn (dùng chung với trang Báo cáo), không
  // cần API/tính toán mới, chỉ đổi cách HIỂN THỊ.
  const cycleHistory = useMemo(() => buildCycleHistory(cycleLogs), [cycleLogs]);
  const daysToNext = daysUntil(prediction.nextPeriodDate);
  const daysToOvulation = daysUntil(prediction.ovulationDate);

  // Tap ngay (yyyy-mm-dd) roi vao ky hanh kinh da ghi nhan, de cham diem
  // duoi so ngay trong dai tuan (`CycleWeekStrip`).
  const periodDates = useMemo(() => {
    const set = new Set<string>();
    for (const log of cycleLogs) {
      const start = new Date(log.start_date);
      const end = log.end_date ? new Date(log.end_date) : start;
      for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
        set.add(d.toISOString().slice(0, 10));
      }
    }
    return set;
  }, [cycleLogs]);

  return (
    <main className="flex flex-1 flex-col gap-6 px-5 pt-8">
      <header className="flex items-center justify-between">
        <h1 className="font-display text-xl font-semibold tracking-tight text-[var(--ink)]">Chu kỳ</h1>
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

          <section className="glass-card-strong relative flex flex-col items-center gap-5 overflow-hidden rounded-[28px] p-6 text-center">
            {/* H1: cùng hoạ tiết dùng ở Trang chủ, phóng to hơn cho khối
                chính của trang Chu kỳ — đặt sau lưng nội dung (z-index mặc
                định thấp hơn vì đứng trước trong DOM + nội dung có `relative`
                z-auto phía sau che lên nhờ thứ tự render). */}
            <PhaseMotif
              phase={prediction.phase}
              color={phaseColor[prediction.phase]}
              className="-right-8 -top-10 h-48 w-48 opacity-[0.14]"
            />

            <div className="relative w-full">
              <CycleWeekStrip periodDates={periodDates} periodColor="var(--c-period)" />
            </div>

            <div className="relative flex w-full justify-center py-1">
              <CycleRadialDial
                size={288}
                avgCycleLength={prediction.avgCycleLength}
                avgPeriodLength={prediction.avgPeriodLength}
                currentDay={prediction.currentDay}
                periodColor="var(--c-period)"
                fertileColor="var(--c-fertile)"
              >
                <span className="text-[11px] font-medium text-white/70">
                  {phaseLabel[prediction.phase]}
                </span>
                <span className="font-display text-[26px] font-extrabold leading-tight text-white">
                  Ngày {prediction.currentDay}
                </span>
                <span className="max-w-[8.5rem] text-[11px] leading-snug text-white/80">
                  {phaseSubtitle[prediction.phase]}
                </span>
                <button
                  type="button"
                  onClick={() => setAddingNew(true)}
                  className="mt-1 flex items-center gap-0.5 rounded-full px-3.5 py-1.5 text-[11px] font-bold text-white"
                  style={{ background: phaseColor[prediction.phase] }}
                >
                  Nhật ký
                  <ChevronRight size={12} />
                </button>
              </CycleRadialDial>
            </div>

            <div className="relative grid w-full grid-cols-2 gap-3 text-left">
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
            {/* I2 (VISUAL_POLISH_ROADMAP.md): cùng vấn đề với hàng thẻ
                "Câu chuyện hàng ngày" ở trên — luôn có 4 câu gợi ý dài
                (`getSuggestedPrompts`), gần như chắc chắn tràn khỏi màn hình
                điện thoại nên không cần điều kiện độ dài như bên đó, áp dụng
                mờ dần cố định. */}
            <div
              className="-mx-5 flex gap-2 overflow-x-auto px-5 pb-1"
              style={{
                scrollbarWidth: "none",
                WebkitMaskImage: "linear-gradient(to right, black calc(100% - 28px), transparent 100%)",
                maskImage: "linear-gradient(to right, black calc(100% - 28px), transparent 100%)",
              }}
            >
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

          {cycleHistory.some((h) => h.periodLength != null) && (
            <section className="glass-card rounded-[24px] p-5">
              <p className="mb-4 text-xs font-medium uppercase tracking-wide text-[var(--ink-faint)]">
                Xu hướng hành kinh theo tháng
              </p>
              <CycleBarHistory history={cycleHistory} accentColor="var(--c-period)" />
            </section>
          )}

          <section className="glass-card rounded-[24px] p-5">
            <p className="mb-3 text-xs font-medium uppercase tracking-wide text-[var(--ink-faint)]">
              Lịch sử gần đây
            </p>
            {/* E3 (đã đính chính trong Nhật ký — section này vốn ĐÃ nằm trong
                glass-card, không lệch hệ thống thẻ như ghi chú ban đầu):
                vấn đề thật là các dòng không có gì phân tách, dính liền khó
                đọc khi danh sách dài. Thêm `divide-y` mảnh, cùng tông màu đen
                mờ đã dùng cho hover (`black/[0.03]`) — đủ để mắt tách dòng mà
                không phá vỡ vẻ mềm mại chung. */}
            <ul className="flex flex-col divide-y divide-black/[0.06]">
              {cycleLogs.map((log) => (
                <li key={log.id}>
                  <button
                    type="button"
                    onClick={() => setEditingLog(log)}
                    className="flex w-full items-center justify-between rounded-2xl px-2 py-3 text-sm transition-colors hover:bg-black/[0.03]"
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
