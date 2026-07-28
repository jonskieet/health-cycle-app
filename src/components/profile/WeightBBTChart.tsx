"use client";

// Module 3 — biểu đồ xu hướng cân nặng & nhiệt độ cơ bản (BBT).
// Dùng lại pattern LineChart/ResponsiveContainer giống CycleInsights.tsx để
// đồng bộ phong cách. Không khoá VIP (roadmap không yêu cầu weight/BBT là
// tính năng trả phí — chỉ P1/P2/P3/P8 mới khoá).

import { useState } from "react";
import { Scale, Thermometer } from "lucide-react";
import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import EmptyState from "@/components/ui/EmptyState";
import { Skeleton } from "@/components/ui/Skeleton";
import { useMetricTrend } from "@/lib/queries";

type Tab = "weight" | "bbt";

const TAB_CONFIG: Record<Tab, { label: string; unit: string; color: string; icon: typeof Scale }> = {
  weight: { label: "Cân nặng", unit: "kg", color: "var(--c-sleep)", icon: Scale },
  bbt: { label: "Nhiệt độ cơ bản", unit: "°C", color: "var(--c-fertile)", icon: Thermometer },
};

export default function WeightBBTChart() {
  const [tab, setTab] = useState<Tab>("weight");
  const { data: rows = [], isLoading } = useMetricTrend(tab, 90);
  const config = TAB_CONFIG[tab];

  const chartData = rows.map((r) => ({
    label: new Date(r.logged_at).toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit" }),
    value: r.value,
  }));

  const values = chartData.map((d) => d.value);
  const yDomain: [number, number] =
    values.length > 0
      ? [Math.min(...values) - (tab === "bbt" ? 0.3 : 1), Math.max(...values) + (tab === "bbt" ? 0.3 : 1)]
      : [0, 1];

  return (
    <section className="glass-card flex flex-col gap-4 rounded-[24px] p-5">
      <div className="flex items-center justify-between">
        <p className="font-display text-base font-bold text-[var(--ink)]">Cân nặng & BBT</p>
        <div className="flex gap-1 rounded-full bg-black/[0.04] p-1">
          {(Object.keys(TAB_CONFIG) as Tab[]).map((key) => {
            const Icon = TAB_CONFIG[key].icon;
            const active = tab === key;
            return (
              <button
                key={key}
                type="button"
                onClick={() => setTab(key)}
                className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition-colors"
                style={{
                  background: active ? TAB_CONFIG[key].color : "transparent",
                  color: active ? "white" : "var(--ink-soft)",
                }}
              >
                <Icon size={13} />
                {TAB_CONFIG[key].label}
              </button>
            );
          })}
        </div>
      </div>

      {isLoading && <Skeleton className="h-[180px] w-full" />}

      {!isLoading && chartData.length === 0 && (
        <EmptyState
          title={`Chưa có dữ liệu ${config.label.toLowerCase()}`}
          description={`Ghi lại ${config.label.toLowerCase()} hàng ngày để thấy xu hướng theo thời gian.`}
        />
      )}

      {chartData.length >= 2 && (
        <div className="h-[180px] w-full overflow-hidden pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 16, right: 20, left: 4, bottom: 4 }}>
              <XAxis
                dataKey="label"
                tick={{ fontSize: 10, fill: "var(--ink-faint)" }}
                axisLine={false}
                tickLine={false}
                padding={{ left: 12, right: 12 }}
                interval="preserveStartEnd"
              />
              <YAxis
                width={32}
                domain={yDomain}
                tick={{ fontSize: 10, fill: "var(--ink-faint)" }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                formatter={(value) => [`${value} ${config.unit}`, config.label]}
                contentStyle={{
                  borderRadius: 12,
                  border: "1px solid var(--glass-border)",
                  fontSize: 12,
                }}
                cursor={{ stroke: "var(--glass-border)", strokeWidth: 1 }}
              />
              <Line
                type="monotone"
                dataKey="value"
                stroke={config.color}
                strokeWidth={2}
                isAnimationActive={false}
                dot={{ r: 3, fill: config.color, stroke: "white", strokeWidth: 1 }}
                activeDot={{ r: 6, stroke: "white", strokeWidth: 2, style: { outline: "none" } }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {chartData.length === 1 && (
        <p className="text-center text-xs text-[var(--ink-faint)]">
          Cần ít nhất 2 lần ghi để vẽ được biểu đồ xu hướng.
        </p>
      )}
    </section>
  );
}
