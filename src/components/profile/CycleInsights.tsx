"use client";

import { useMemo, useState } from "react";
import { ChevronRight } from "lucide-react";
import StatusPill from "@/components/ui/StatusPill";
import EmptyState from "@/components/ui/EmptyState";
import LockedCycleChart from "@/components/profile/LockedCycleChart";
import RecordCycleButton from "@/components/profile/RecordCycleButton";
import { CycleLogFull } from "@/lib/queries";
import {
  buildCycleHistory,
  summarizeCycleHistory,
  NORMAL_CYCLE_RANGE,
} from "@/lib/cycle-utils";

interface CycleInsightsProps {
  cycleLogs: CycleLogFull[];
  isVip: boolean;
}

const HISTORY_PREVIEW_COUNT = 3;
const CHART_MAX_POINTS = 6;

export default function CycleInsights({ cycleLogs, isVip }: CycleInsightsProps) {
  const [showAllHistory, setShowAllHistory] = useState(false);

  const history = useMemo(() => buildCycleHistory(cycleLogs), [cycleLogs]);
  const summary = useMemo(() => summarizeCycleHistory(history), [history]);

  if (cycleLogs.length === 0) return null;

  const visibleHistory = showAllHistory ? history : history.slice(0, HISTORY_PREVIEW_COUNT);

  // Dữ liệu cho đồ thị: chỉ những kỳ đã tính được độ dài chu kỳ, theo thứ tự thời gian tăng dần.
  const chartData = [...history]
    .filter((h) => h.cycleLength != null)
    .slice(0, CHART_MAX_POINTS)
    .reverse()
    .map((h) => ({
      label: new Date(h.start_date).toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit" }),
      cycleLength: h.cycleLength as number,
      abnormal: h.abnormalCycle,
    }));

  const CHART_BAR_HEIGHT = 120;
  const chartMax =
    Math.max(NORMAL_CYCLE_RANGE.max, ...chartData.map((d) => d.cycleLength), 1) + 4;
  const scaleBar = (value: number) =>
    Math.max((Math.max(value, 0) / chartMax) * CHART_BAR_HEIGHT, 4);
  const bandBottom = scaleBar(NORMAL_CYCLE_RANGE.min);
  const bandHeight = scaleBar(NORMAL_CYCLE_RANGE.max) - bandBottom;

  return (
    <>
      {/* Tóm tắt chu kỳ */}
      <section className="glass-card flex flex-col gap-4 rounded-[24px] p-5">
        <div>
          <p className="font-display text-base font-bold text-[var(--ink)]">Tóm tắt chu kỳ</p>
          <p className="mt-1 text-xs text-[var(--ink-soft)]">
            Ghi nhận thêm chu kỳ để KVCycle đưa ra phân tích cá nhân hoá chính xác hơn.
          </p>
        </div>

        {!summary.hasPreviousCycle ? (
          cycleLogs.length === 1 ? (
            <RecordCycleButton label="Ghi lại thêm một kỳ kinh" />
          ) : (
            <EmptyState
              title="Chưa đủ dữ liệu để phân tích"
              description="Ghi nhận thêm ít nhất 2 kỳ kinh để xem tóm tắt chu kỳ của bạn."
              actionLabel="Ghi nhận kỳ kinh"
              actionHref="/log?type=cycle"
            />
          )
        ) : (
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between gap-3 rounded-2xl bg-black/[0.03] p-4">
              <span className="min-w-0 flex-1 text-sm text-[var(--ink-soft)]">Độ dài chu kỳ trước</span>
              <StatusPill
                ok={!summary.previousCycleAbnormal}
                okLabel="Bình thường"
                warnLabel="Bất thường"
              />
            </div>
            <p className="-mt-2 px-1 text-xs text-[var(--ink-faint)]">
              {summary.previousCycleLength} ngày · phạm vi bình thường {NORMAL_CYCLE_RANGE.min}–
              {NORMAL_CYCLE_RANGE.max} ngày
            </p>

            {summary.previousPeriodLength != null && (
              <div className="flex items-center justify-between gap-3 rounded-2xl bg-black/[0.03] p-4">
                <span className="min-w-0 flex-1 text-sm text-[var(--ink-soft)]">
                  Độ dài kỳ kinh nguyệt trước
                </span>
                <StatusPill
                  ok={!summary.previousPeriodAbnormal}
                  okLabel="Bình thường"
                  warnLabel="Bất thường"
                />
              </div>
            )}

            {summary.hasVariability ? (
              <div className="flex items-center justify-between gap-3 rounded-2xl bg-black/[0.03] p-4">
                <span className="min-w-0 flex-1 text-sm text-[var(--ink-soft)]">
                  Sự thay đổi độ dài chu kỳ
                </span>
                <StatusPill ok={!summary.irregular} okLabel="Đều đặn" warnLabel="Không đều đặn" />
              </div>
            ) : (
              <p className="px-1 text-xs text-[var(--ink-faint)]">
                Nhập thêm một kỳ kinh nữa để xem sự thay đổi giữa các chu kỳ.
              </p>
            )}

            <RecordCycleButton label="Ghi lại thêm một kỳ kinh" />
          </div>
        )}
      </section>

      {/* Lịch sử chu kỳ */}
      <section className="glass-card flex flex-col gap-4 rounded-[24px] p-5">
        <div className="flex items-center justify-between">
          <p className="font-display text-base font-bold text-[var(--ink)]">Lịch sử chu kỳ</p>
          {history.length > HISTORY_PREVIEW_COUNT && (
            <button
              type="button"
              onClick={() => setShowAllHistory((v) => !v)}
              className="flex items-center gap-0.5 text-xs font-semibold"
              style={{ color: "var(--c-sleep)" }}
            >
              {showAllHistory ? "Thu gọn" : "Tất cả"}
              <ChevronRight size={14} />
            </button>
          )}
        </div>

        <div className="flex flex-wrap gap-x-5 gap-y-1.5 text-xs text-[var(--ink-soft)]">
          <span className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full" style={{ background: "var(--c-period)" }} />
            Kinh nguyệt
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full" style={{ background: "var(--c-fertile)" }} />
            Cửa sổ sinh sản
          </span>
        </div>

        <div className="flex flex-col divide-y divide-black/[0.05]">
          {visibleHistory.map((entry, idx) => (
            <div key={entry.id} className="flex items-center justify-between gap-3 py-3">
              <div>
                <p className="text-sm font-semibold text-[var(--ink)]">
                  {entry.cycleLength != null ? `${entry.cycleLength} ngày` : "Chu kỳ hiện tại"}
                  {idx === 0 && (
                    <span className="ml-1.5 text-xs font-normal text-[var(--ink-faint)]">
                      (gần nhất)
                    </span>
                  )}
                </p>
                <p className="text-xs text-[var(--ink-faint)]">
                  Bắt đầu ngày{" "}
                  {new Date(entry.start_date).toLocaleDateString("vi-VN", {
                    day: "2-digit",
                    month: "long",
                  })}
                </p>
              </div>
              <div className="flex gap-1">
                {Array.from({ length: Math.min(entry.periodLength ?? 0, 8) || 4 }).map((_, i) => (
                  <span
                    key={i}
                    className="h-2 w-2 rounded-full"
                    style={{
                      background:
                        entry.periodLength != null
                          ? "var(--c-period)"
                          : "rgba(36,27,47,0.12)",
                    }}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>

        <RecordCycleButton
          label={history.length >= 2 ? "Ghi lại thêm một kỳ kinh" : "Ghi lại hai kỳ kinh nguyệt"}
        />
      </section>

      {/* Đồ thị chu kỳ */}
      {!isVip ? (
        <LockedCycleChart />
      ) : (
        <section className="glass-card flex flex-col gap-4 rounded-[24px] p-5">
          <p className="font-display text-base font-bold text-[var(--ink)]">Đồ thị chu kỳ</p>

          {chartData.length >= 2 ? (
            <>
              <div className="relative">
                {/* Dải phạm vi bình thường, phía sau các cột */}
                <div
                  className="pointer-events-none absolute inset-x-0 rounded-lg"
                  style={{
                    bottom: bandBottom,
                    height: bandHeight,
                    background: "color-mix(in srgb, var(--c-mood) 10%, transparent)",
                    borderTop: "1px dashed color-mix(in srgb, var(--c-mood) 45%, transparent)",
                    borderBottom: "1px dashed color-mix(in srgb, var(--c-mood) 45%, transparent)",
                  }}
                />

                <div
                  className="relative flex items-end justify-between gap-2 px-1"
                  style={{ height: CHART_BAR_HEIGHT }}
                >
                  {chartData.map((d, i) => {
                    const color = d.abnormal ? "var(--c-period)" : "var(--c-sleep)";
                    return (
                      <div key={i} className="flex h-full flex-1 flex-col items-center justify-end gap-1.5">
                        <span className="text-[10px] font-bold" style={{ color }}>
                          {d.cycleLength}
                        </span>
                        <div
                          className="w-3 rounded-full"
                          style={{ height: scaleBar(d.cycleLength), background: color }}
                        />
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="flex justify-between gap-2 px-1">
                {chartData.map((d, i) => (
                  <span key={i} className="flex-1 text-center text-[9px] text-[var(--ink-faint)]">
                    {d.label}
                  </span>
                ))}
              </div>

              <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 pt-1 text-[11px] text-[var(--ink-soft)]">
                <span className="flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-full" style={{ background: "var(--c-sleep)" }} />
                  Bình thường
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-full" style={{ background: "var(--c-period)" }} />
                  Bất thường
                </span>
                <span className="flex items-center gap-1.5">
                  <span
                    className="h-2.5 w-2.5 rounded-full border border-dashed"
                    style={{ borderColor: "var(--c-mood)" }}
                  />
                  Phạm vi {NORMAL_CYCLE_RANGE.min}–{NORMAL_CYCLE_RANGE.max} ngày
                </span>
              </div>
            </>
          ) : (
            <EmptyState
              title="Chưa đủ dữ liệu để vẽ đồ thị"
              description="Cần ít nhất 3 kỳ kinh với ngày bắt đầu khác nhau để tính độ dài chu kỳ và vẽ đồ thị xu hướng."
              actionLabel="Ghi nhận kỳ kinh"
              actionHref="/log?type=cycle"
            />
          )}
        </section>
      )}
    </>

  );
}
