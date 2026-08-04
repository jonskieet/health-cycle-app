"use client";

// Module 6 — Symptom Analysis chuyên sâu (VIP).
// Bar chart tần suất triệu chứng qua các kỳ kinh đã ghi, có lọc theo nhóm và
// hiển thị xu hướng gần đây tăng/giảm/mới xuất hiện.

import { useMemo, useState } from "react";
import { TrendingUp, TrendingDown, Sparkles, Minus } from "lucide-react";
import EmptyState from "@/components/ui/EmptyState";
import ProgressBar from "@/components/ui/ProgressBar";
import { CycleLogFull } from "@/lib/queries";
import { computeSymptomFrequencies } from "@/lib/symptom-analysis";
import {
  SYMPTOM_CATEGORIES,
  SYMPTOM_CATEGORY_LABELS,
  SymptomCategory,
  getSymptomDef,
} from "@/lib/symptoms";

const TREND_META: Record<
  "up" | "down" | "flat" | "new" | "none",
  { icon: typeof TrendingUp; label: string; color: string }
> = {
  up: { icon: TrendingUp, label: "Gần đây tăng", color: "var(--c-period)" },
  down: { icon: TrendingDown, label: "Gần đây giảm", color: "var(--c-mood)" },
  new: { icon: Sparkles, label: "Mới xuất hiện", color: "var(--c-fertile)" },
  flat: { icon: Minus, label: "Ổn định", color: "var(--ink-faint)" },
  none: { icon: Minus, label: "", color: "var(--ink-faint)" },
};

export default function SymptomAnalysis({ cycleLogs }: { cycleLogs: CycleLogFull[] }) {
  const [categoryFilter, setCategoryFilter] = useState<SymptomCategory | "all">("all");

  const frequencies = useMemo(() => computeSymptomFrequencies(cycleLogs), [cycleLogs]);
  const filtered = useMemo(
    () =>
      (categoryFilter === "all" ? frequencies : frequencies.filter((f) => f.category === categoryFilter)).slice(
        0,
        8
      ),
    [frequencies, categoryFilter]
  );
  const maxPercentage = Math.max(...filtered.map((f) => f.percentage), 1);

  if (cycleLogs.length === 0) return null;

  return (
    <section className="glass-card flex flex-col gap-4 rounded-[24px] p-5">
      <div>
        <p className="font-display text-base font-bold text-[var(--ink)]">Phân tích triệu chứng</p>
        <p className="mt-0.5 text-xs text-[var(--ink-soft)]">
          Tần suất xuất hiện qua {cycleLogs.length} kỳ kinh đã ghi
        </p>
      </div>

      <div className="flex gap-1.5 overflow-x-auto pb-1">
        <button
          type="button"
          onClick={() => setCategoryFilter("all")}
          className="shrink-0 rounded-full px-3 py-1.5 text-xs font-semibold"
          style={{
            background: categoryFilter === "all" ? "var(--c-sleep)" : "rgba(0,0,0,0.04)",
            color: categoryFilter === "all" ? "white" : "var(--ink-soft)",
          }}
        >
          Tất cả
        </button>
        {SYMPTOM_CATEGORIES.map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => setCategoryFilter(cat)}
            className="shrink-0 rounded-full px-3 py-1.5 text-xs font-semibold"
            style={{
              background: categoryFilter === cat ? "var(--c-sleep)" : "rgba(0,0,0,0.04)",
              color: categoryFilter === cat ? "white" : "var(--ink-soft)",
            }}
          >
            {SYMPTOM_CATEGORY_LABELS[cat]}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          title="Chưa có dữ liệu triệu chứng"
          description="Ghi lại triệu chứng khi log kỳ kinh để xem phân tích tần suất tại đây."
        />
      ) : (
        <div className="flex flex-col gap-3">
          {filtered.map((f) => {
            const def = getSymptomDef(f.id);
            const Icon = def?.icon;
            const trendMeta = TREND_META[f.trend];
            const TrendIcon = trendMeta.icon;
            return (
              <div key={f.id} className="flex flex-col gap-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="flex items-center gap-1.5 font-medium text-[var(--ink)]">
                    {Icon && <Icon size={13} className="text-[var(--ink-faint)]" />}
                    {f.label}
                  </span>
                  <span className="flex items-center gap-1 text-[var(--ink-faint)]">
                    {f.trend !== "none" && f.trend !== "flat" && (
                      <TrendIcon size={12} style={{ color: trendMeta.color }} />
                    )}
                    {f.percentage}% ({f.count} kỳ)
                  </span>
                </div>
                <ProgressBar value={(f.percentage / maxPercentage) * 100} color="var(--c-sleep)" />
              </div>
            );
          })}
        </div>
      )}

      <p className="text-[11px] leading-relaxed text-[var(--ink-faint)]">
        Thống kê dựa trên triệu chứng ghi kèm mỗi kỳ kinh — chưa đủ dữ liệu (dưới 4 kỳ)
        sẽ không hiển thị xu hướng tăng/giảm để tránh gây hiểu lầm.
      </p>
    </section>
  );
}
