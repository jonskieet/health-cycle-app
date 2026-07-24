"use client";

import { Sparkles } from "lucide-react";
import { getOutlook } from "@/lib/cycle-insights";
import type { CyclePrediction } from "@/lib/cycle-utils";

export default function PhaseOutlook({ phase }: { phase: CyclePrediction["phase"] }) {
  const metrics = getOutlook(phase);

  return (
    <section className="glass-card flex flex-col gap-4 rounded-[24px] p-5">
      <div className="flex items-center gap-2">
        <Sparkles size={16} style={{ color: "var(--c-ovulation)" }} />
        <p className="font-display text-sm font-bold text-[var(--ink)]">Hôm nay bạn có thể mong đợi</p>
      </div>
      <p className="-mt-2 text-xs leading-relaxed text-[var(--ink-soft)]">
        Mỗi ngày trong chu kỳ mang lại cảm nhận khác nhau — đây là những gì cơ thể bạn có thể trải qua hôm nay,
        dựa trên giai đoạn chu kỳ hiện tại.
      </p>
      <div className="flex flex-col gap-3">
        {metrics.map((m) => (
          <div key={m.key}>
            <div className="mb-1.5 flex items-center justify-between">
              <span className="text-xs font-medium text-[var(--ink)]">{m.label}</span>
              <span className="text-[10px] font-semibold text-[var(--ink-faint)]">
                {m.value >= 70 ? "Cao" : m.value >= 45 ? "Trung bình" : "Thấp"}
              </span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-black/[0.06]">
              <div
                className="h-full rounded-full transition-all"
                style={{ width: `${m.value}%`, background: m.color }}
              />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
