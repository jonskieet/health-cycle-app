"use client";

import { useState } from "react";
import { X, Loader2, LucideIcon } from "lucide-react";
import { useLogMetric, MetricType } from "@/lib/queries";

interface MetricConfig {
  type: MetricType;
  label: string;
  unit: string;
  icon: LucideIcon;
  color: string;
  min: number;
  max: number;
  step: number;
  default: number;
}

export default function MetricLogForm({
  config,
  onClose,
}: {
  config: MetricConfig;
  onClose: () => void;
}) {
  const logMetric = useLogMetric();
  const [value, setValue] = useState(config.default);
  const Icon = config.icon;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    await logMetric.mutateAsync({ metric_type: config.type, value });
    onClose();
  }

  return (
    <div className="fixed inset-0 z-30 flex items-end justify-center bg-black/30" onClick={onClose}>
      <form
        onSubmit={handleSubmit}
        onClick={(e) => e.stopPropagation()}
        className="glass-card-strong flex w-full max-w-md flex-col gap-5 rounded-t-[28px] p-6"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span
              className="flex h-9 w-9 items-center justify-center rounded-full"
              style={{ background: `color-mix(in srgb, ${config.color} 18%, white)` }}
            >
              <Icon size={18} style={{ color: config.color }} />
            </span>
            <h2 className="font-display text-lg font-bold text-[var(--ink)]">{config.label}</h2>
          </div>
          <button type="button" onClick={onClose} className="rounded-full p-1.5 hover:bg-black/5">
            <X size={18} />
          </button>
        </div>

        <div className="flex flex-col items-center gap-4 py-2">
          <div className="font-display text-4xl font-extrabold text-[var(--ink)]">
            {value}
            <span className="ml-1.5 text-base font-normal text-[var(--ink-faint)]">{config.unit}</span>
          </div>
          <input
            type="range"
            min={config.min}
            max={config.max}
            step={config.step}
            value={value}
            onChange={(e) => setValue(Number(e.target.value))}
            className="w-full"
            style={{ accentColor: config.color }}
          />
          <div className="flex w-full justify-between text-[11px] text-[var(--ink-faint)]">
            <span>{config.min}</span>
            <span>{config.max}</span>
          </div>
        </div>

        <button
          type="submit"
          disabled={logMetric.isPending}
          className="flex items-center justify-center gap-2 rounded-2xl py-3 text-sm font-semibold text-white disabled:opacity-60"
          style={{ background: config.color }}
        >
          {logMetric.isPending && <Loader2 size={16} className="animate-spin" />}
          Lưu
        </button>
      </form>
    </div>
  );
}
