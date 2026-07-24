"use client";

import { useMemo, useState } from "react";
import { ChevronRight } from "lucide-react";
import {
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import StatusPill from "@/components/ui/StatusPill";
import EmptyState from "@/components/ui/EmptyState";
import LockedCycleChart from "@/components/profile/LockedCycleChart";
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
          <EmptyState
            title="Chưa đủ dữ liệu để phân tích"
            description="Ghi nhận thêm ít nhất 2 kỳ kinh để xem tóm tắt chu kỳ của bạn."
            actionLabel="Ghi nhận kỳ kinh"
            actionHref="/log?type=cycle"
          />
        ) : (
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between gap-3 rounded-2xl bg-black/[0.03] p-4">
              <span className="text-sm text-[var(--ink-soft)]">Độ dài chu kỳ trước</span>
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
                <span className="text-sm text-[var(--ink-soft)]">Độ dài kỳ kinh nguyệt trước</span>
                <StatusPill
                  ok={!summary.previousPeriodAbnormal}
                  okLabel="Bình thường"
                  warnLabel="Bất thường"
                />
              </div>
            )}

            {summary.hasVariability ? (
              <div className="flex items-center justify-between gap-3 rounded-2xl bg-black/[0.03] p-4">
                <span className="text-sm text-[var(--ink-soft)]">Sự thay đổi độ dài chu kỳ</span>
                <StatusPill ok={!summary.irregular} okLabel="Đều đặn" warnLabel="Không đều đặn" />
              </div>
            ) : (
              <p className="px-1 text-xs text-[var(--ink-faint)]">
                Nhập thêm một kỳ kinh nữa để xem sự thay đổi giữa các chu kỳ.
              </p>
            )}
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
      </section>

      {/* Đồ thị chu kỳ */}
      {!isVip ? (
        <LockedCycleChart />
      ) : (
        <section className="glass-card flex flex-col gap-4 rounded-[24px] p-5">
          <p className="font-display text-base font-bold text-[var(--ink)]">Đồ thị chu kỳ</p>

          {chartData.length >= 2 ? (
            <>
              <div className="h-[200px] w-full pt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData} margin={{ top: 24, right: 16, left: -20, bottom: 0 }}>
                    <XAxis
                      dataKey="label"
                      tick={{ fontSize: 10, fill: "var(--ink-faint)" }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis tick={{ fontSize: 10, fill: "var(--ink-faint)" }} axisLine={false} tickLine={false} />
                    <ReferenceLine y={NORMAL_CYCLE_RANGE.min} stroke="rgba(36,27,47,0.12)" strokeDasharray="4 4" />
                    <ReferenceLine y={NORMAL_CYCLE_RANGE.max} stroke="rgba(36,27,47,0.12)" strokeDasharray="4 4" />
                    <Tooltip
                      formatter={(value) => [`${value} ngày`, "Độ dài chu kỳ"]}
                      contentStyle={{
                        borderRadius: 12,
                        border: "1px solid var(--glass-border)",
                        fontSize: 12,
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="cycleLength"
                      stroke="var(--c-sleep)"
                      strokeWidth={2}
                      dot={(props) => {
                        const { cx, cy, payload, index: dotIndex } = props;
                        const abnormal = payload.abnormal as boolean;
                        return (
                          <g key={`dot-${dotIndex}`}>
                            {abnormal && (
                              <circle cx={cx} cy={cy} r={11} fill="var(--c-period)" opacity={0.16} />
                            )}
                            <circle
                              cx={cx}
                              cy={cy}
                              r={5}
                              fill={abnormal ? "var(--c-period)" : "var(--c-sleep)"}
                              stroke="white"
                              strokeWidth={2}
                            />
                            {abnormal && cy != null && (
                              <text
                                x={cx}
                                y={cy - 16}
                                textAnchor="middle"
                                fontSize={9}
                                fontWeight={700}
                                letterSpacing={0.4}
                                fill="var(--c-period)"
                              >
                                BẤT THƯỜNG
                              </text>
                            )}
                          </g>
                        );
                      }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              <p className="text-center text-[11px] text-[var(--ink-faint)]">
                Chấm hồng đánh dấu chu kỳ nằm ngoài phạm vi bình thường ({NORMAL_CYCLE_RANGE.min}–
                {NORMAL_CYCLE_RANGE.max} ngày)
              </p>
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
