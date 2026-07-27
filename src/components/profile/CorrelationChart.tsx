"use client";

// Module 5 — Event/Correlation Analysis (VIP).
// UI cho phép chọn 2 chỉ số bất kỳ đã log (health_metrics) và xem biểu đồ
// chồng theo thời gian + hệ số tương quan Pearson diễn giải bằng lời.

import { useMemo, useState } from "react";
import {
  HeartPulse,
  Moon,
  Droplets,
  Smile,
  Flame,
  Scale,
  Thermometer,
  LucideIcon,
} from "lucide-react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import EmptyState from "@/components/ui/EmptyState";
import { MetricType, useMetricTrend } from "@/lib/queries";
import { alignMetricsByDate, pearsonCorrelation, interpretCorrelation } from "@/lib/correlation";

const METRIC_META: Record<MetricType, { label: string; unit: string; color: string; icon: LucideIcon }> = {
  stress: { label: "Stress", unit: "pts", color: "var(--c-stress)", icon: Flame },
  heart_rate: { label: "Nhịp tim", unit: "bpm", color: "var(--c-heart)", icon: HeartPulse },
  sleep: { label: "Giấc ngủ", unit: "giờ", color: "var(--c-sleep)", icon: Moon },
  hydration: { label: "Nước uống", unit: "ml", color: "var(--c-hydration)", icon: Droplets },
  mood: { label: "Tâm trạng", unit: "/5", color: "var(--c-mood)", icon: Smile },
  weight: { label: "Cân nặng", unit: "kg", color: "var(--c-ovulation)", icon: Scale },
  bbt: { label: "BBT", unit: "°C", color: "var(--c-fertile)", icon: Thermometer },
};

const METRIC_OPTIONS = Object.keys(METRIC_META) as MetricType[];

function MetricSelect({
  value,
  onChange,
  exclude,
}: {
  value: MetricType;
  onChange: (t: MetricType) => void;
  exclude: MetricType;
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value as MetricType)}
      className="flex-1 rounded-2xl border border-black/[0.08] bg-white/70 px-3 py-2 text-sm font-medium text-[var(--ink)]"
    >
      {METRIC_OPTIONS.filter((m) => m !== exclude).map((m) => (
        <option key={m} value={m}>
          {METRIC_META[m].label}
        </option>
      ))}
    </select>
  );
}

export default function CorrelationChart() {
  const [metricA, setMetricA] = useState<MetricType>("stress");
  const [metricB, setMetricB] = useState<MetricType>("sleep");

  const { data: rowsA = [], isLoading: loadingA } = useMetricTrend(metricA, 90);
  const { data: rowsB = [], isLoading: loadingB } = useMetricTrend(metricB, 90);
  const isLoading = loadingA || loadingB;

  const aligned = useMemo(() => alignMetricsByDate(rowsA, rowsB), [rowsA, rowsB]);
  const r = useMemo(() => pearsonCorrelation(aligned.a, aligned.b), [aligned]);
  const interpretation = useMemo(() => interpretCorrelation(r), [r]);

  const chartData = aligned.dates.map((date, i) => ({
    label: new Date(date).toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit" }),
    a: aligned.a[i],
    b: aligned.b[i],
  }));

  const configA = METRIC_META[metricA];
  const configB = METRIC_META[metricB];

  function handleChangeA(next: MetricType) {
    setMetricA(next);
    if (next === metricB) setMetricB(METRIC_OPTIONS.find((m) => m !== next) ?? metricB);
  }

  function handleChangeB(next: MetricType) {
    setMetricB(next);
    if (next === metricA) setMetricA(METRIC_OPTIONS.find((m) => m !== next) ?? metricA);
  }

  const strengthColor =
    interpretation.strength === "strong"
      ? "var(--c-period)"
      : interpretation.strength === "moderate"
        ? "var(--c-mood)"
        : "var(--ink-faint)";

  return (
    <section className="glass-card flex flex-col gap-4 rounded-[24px] p-5">
      <p className="font-display text-base font-bold text-[var(--ink)]">Phân tích tương quan</p>
      <p className="-mt-2 text-xs text-[var(--ink-soft)]">
        Chọn 2 chỉ số để xem chúng biến động cùng nhau như thế nào (vd: stress cao có
        đi kèm ngủ ít không?).
      </p>

      <div className="flex items-center gap-2">
        <MetricSelect value={metricA} onChange={handleChangeA} exclude={metricB} />
        <span className="text-xs font-semibold text-[var(--ink-faint)]">vs</span>
        <MetricSelect value={metricB} onChange={handleChangeB} exclude={metricA} />
      </div>

      {!isLoading && chartData.filter((d) => d.a != null && d.b != null).length < 3 ? (
        <EmptyState
          title="Chưa đủ dữ liệu"
          description={`Cần ít nhất 3 ngày có cả ${configA.label.toLowerCase()} và ${configB.label.toLowerCase()} để phân tích tương quan.`}
        />
      ) : (
        <>
          <div className="h-[190px] w-full overflow-hidden pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 16, right: 12, left: 4, bottom: 4 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--glass-border)" vertical={false} />
                <XAxis
                  dataKey="label"
                  tick={{ fontSize: 10, fill: "var(--ink-faint)" }}
                  axisLine={false}
                  tickLine={false}
                  padding={{ left: 8, right: 8 }}
                  interval="preserveStartEnd"
                />
                <YAxis
                  yAxisId="a"
                  width={28}
                  tick={{ fontSize: 10, fill: configA.color }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  yAxisId="b"
                  orientation="right"
                  width={28}
                  tick={{ fontSize: 10, fill: configB.color }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  formatter={(value, name) => [
                    value,
                    name === "a" ? `${configA.label} (${configA.unit})` : `${configB.label} (${configB.unit})`,
                  ]}
                  contentStyle={{
                    borderRadius: 12,
                    border: "1px solid var(--glass-border)",
                    fontSize: 12,
                  }}
                />
                <Line
                  yAxisId="a"
                  type="monotone"
                  dataKey="a"
                  stroke={configA.color}
                  strokeWidth={2}
                  dot={{ r: 2.5 }}
                  connectNulls
                  isAnimationActive={false}
                />
                <Line
                  yAxisId="b"
                  type="monotone"
                  dataKey="b"
                  stroke={configB.color}
                  strokeWidth={2}
                  dot={{ r: 2.5 }}
                  connectNulls
                  isAnimationActive={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="flex items-center justify-between gap-3 rounded-2xl p-3" style={{ background: "rgba(0,0,0,0.03)" }}>
            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full" style={{ background: configA.color }} />
              <span className="text-xs text-[var(--ink-soft)]">{configA.label}</span>
              <span className="h-2.5 w-2.5 rounded-full" style={{ background: configB.color }} />
              <span className="text-xs text-[var(--ink-soft)]">{configB.label}</span>
            </div>
            <span className="text-xs font-semibold" style={{ color: strengthColor }}>
              {interpretation.label}
              {r != null ? ` (r=${r.toFixed(2)})` : ""}
            </span>
          </div>
        </>
      )}

      <p className="text-[11px] leading-relaxed text-[var(--ink-faint)]">
        Tương quan không đồng nghĩa với nhân quả — kết quả chỉ mang tính tham khảo,
        không thay thế tư vấn y khoa.
      </p>
    </section>
  );
}
