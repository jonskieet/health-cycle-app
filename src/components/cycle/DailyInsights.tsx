"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { getDailyInsights, DailyInsightCard } from "@/lib/cycle-insights";
import type { CyclePrediction } from "@/lib/cycle-utils";

export default function DailyInsights({ phase }: { phase: CyclePrediction["phase"] }) {
  const cards = getDailyInsights(phase);
  const [active, setActive] = useState<DailyInsightCard | null>(null);

  return (
    <section className="flex flex-col gap-3">
      <p className="px-1 font-display text-sm font-bold text-[var(--ink)]">Câu chuyện hàng ngày</p>
      <div className="-mx-5 flex gap-3 overflow-x-auto px-5 pb-1" style={{ scrollbarWidth: "none" }}>
        {cards.map((c) => (
          <button
            key={c.id}
            type="button"
            onClick={() => setActive(c)}
            className="flex h-40 w-32 shrink-0 flex-col justify-between rounded-[20px] p-3 text-left shadow-sm active:scale-[0.98]"
            style={{ background: c.gradient }}
          >
            <span
              className="w-fit rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide"
              style={{ background: "rgba(255,255,255,0.25)", color: c.textColor }}
            >
              {c.tag}
            </span>
            <span className="text-sm font-bold leading-snug" style={{ color: c.textColor }}>
              {c.title}
            </span>
          </button>
        ))}
      </div>

      {active && (
        <div
          className="fixed inset-0 z-30 flex items-end justify-center bg-black/30"
          onClick={() => setActive(null)}
        >
          <div
            className="glass-card-strong w-full max-w-md rounded-t-[28px] p-6"
            style={{ paddingBottom: "max(2rem, env(safe-area-inset-bottom, 0px))" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-4 flex items-start justify-between gap-4">
              <div>
                <p
                  className="mb-1 w-fit rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white"
                  style={{ background: active.gradient }}
                >
                  {active.tag}
                </p>
                <p className="font-display text-lg font-bold text-[var(--ink)]">{active.title}</p>
              </div>
              <button
                type="button"
                onClick={() => setActive(null)}
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-black/[0.05] text-[var(--ink-soft)]"
              >
                <X size={16} />
              </button>
            </div>
            <p className="text-sm leading-relaxed text-[var(--ink-soft)]">{active.body}</p>
          </div>
        </div>
      )}
    </section>
  );
}
