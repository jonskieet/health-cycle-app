"use client";

// P12 redesign: 2 vấn đề chính được báo —
// 1) modal "xuyên thấu" khó nhìn -> đổi glass-card-strong (kính mờ) sang nền
//    đặc var(--surface), giống fix đã áp cho CycleLogForm/AppDatePicker.
// 2) chỉ số "không lưu được" -> lỗi từ mutation trước đây bị NUỐT âm thầm
//    (await ... rồi onClose() ngay, không catch), nên nếu insert thất bại
//    (VD thiếu unique constraint cho upsert onConflict ở DB) người dùng
//    không hề biết. Giờ có try/catch + banner lỗi hiển thị rõ, modal KHÔNG
//    tự đóng khi lưu thất bại để không mất giá trị đã nhập.
// Nhân tiện làm mới giao diện: stepper +/- và các mốc chọn nhanh thay vì chỉ
// có 1 thanh slider trần, để nhập nhanh + trực quan hơn.

import { useState } from "react";
import { X, Loader2, LucideIcon, Minus, Plus, AlertTriangle } from "lucide-react";
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
  /** Vài mốc hay dùng để bấm nhanh (VD giấc ngủ: 6 / 7 / 8 giờ). Tuỳ chọn. */
  presets?: number[];
}

function clamp(v: number, min: number, max: number) {
  return Math.min(max, Math.max(min, v));
}

function formatValue(v: number, step: number) {
  // Tránh hiện thập phân thừa (VD 7.000000001) khi cộng/trừ step lẻ như 0.05.
  const decimals = step.toString().split(".")[1]?.length ?? 0;
  return Number(v.toFixed(decimals));
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
  const [error, setError] = useState<string | null>(null);
  const Icon = config.icon;

  function step(dir: 1 | -1) {
    setValue((v) => clamp(formatValue(v + dir * config.step, config.step), config.min, config.max));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      await logMetric.mutateAsync({ metric_type: config.type, value });
      onClose();
    } catch (err) {
      // Không đóng modal khi lỗi — người dùng không bị mất giá trị vừa chỉnh,
      // và biết rõ lần lưu này thất bại thay vì tưởng đã lưu thành công.
      setError(
        err instanceof Error
          ? `Lưu thất bại: ${err.message}`
          : "Lưu thất bại. Vui lòng thử lại."
      );
    }
  }

  return (
    <div className="fixed inset-0 z-30 flex items-end justify-center bg-black/55 backdrop-blur-[2px]" onClick={onClose}>
      <form
        onSubmit={handleSubmit}
        onClick={(e) => e.stopPropagation()}
        className="flex w-full max-w-md flex-col gap-5 rounded-t-[28px] p-6 pt-3"
        style={{ background: "var(--surface)", boxShadow: "0 -8px 40px -8px rgba(36,27,47,0.35)" }}
      >
        <div className="mx-auto h-1 w-10 rounded-full" style={{ background: "var(--ink-faint)", opacity: 0.4 }} />

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span
              className="flex h-10 w-10 items-center justify-center rounded-full"
              style={{ background: `color-mix(in srgb, ${config.color} 16%, var(--surface))` }}
            >
              <Icon size={19} style={{ color: config.color }} />
            </span>
            <h2 className="font-display text-lg font-bold text-[var(--ink)]">{config.label}</h2>
          </div>
          <button type="button" onClick={onClose} className="rounded-full p-1.5 hover:bg-black/5">
            <X size={18} />
          </button>
        </div>

        {error && (
          <div
            className="flex items-start gap-2 rounded-2xl p-3 text-xs leading-relaxed"
            style={{ background: "color-mix(in srgb, var(--c-heart) 12%, white)", color: "var(--c-heart)" }}
          >
            <AlertTriangle size={15} className="mt-0.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Stepper trung tâm: số to + nút +/- hai bên, dễ bấm hơn kéo slider nhỏ. */}
        <div className="flex flex-col items-center gap-4 py-2">
          <div className="flex items-center gap-5">
            <button
              type="button"
              onClick={() => step(-1)}
              className="flex h-11 w-11 items-center justify-center rounded-full text-lg font-bold transition active:scale-90"
              style={{ background: "var(--surface-soft)", color: "var(--ink-soft)" }}
              aria-label="Giảm"
            >
              <Minus size={18} />
            </button>
            <div className="flex min-w-[7rem] flex-col items-center">
              <span className="font-display text-4xl font-extrabold tabular-nums text-[var(--ink)]">
                {value}
              </span>
              <span className="text-xs text-[var(--ink-faint)]">{config.unit}</span>
            </div>
            <button
              type="button"
              onClick={() => step(1)}
              className="flex h-11 w-11 items-center justify-center rounded-full text-lg font-bold transition active:scale-90"
              style={{ background: "var(--surface-soft)", color: "var(--ink-soft)" }}
              aria-label="Tăng"
            >
              <Plus size={18} />
            </button>
          </div>

          <input
            type="range"
            min={config.min}
            max={config.max}
            step={config.step}
            value={value}
            onChange={(e) => setValue(formatValue(Number(e.target.value), config.step))}
            className="w-full"
            style={{ accentColor: config.color }}
          />
          <div className="flex w-full justify-between text-[11px] text-[var(--ink-faint)]">
            <span>{config.min}</span>
            <span>{config.max}</span>
          </div>

          {config.presets && config.presets.length > 0 && (
            <div className="flex flex-wrap justify-center gap-2 pt-1">
              {config.presets.map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setValue(clamp(p, config.min, config.max))}
                  className="rounded-full px-3.5 py-1.5 text-xs font-semibold transition active:scale-95"
                  style={{
                    background: value === p ? config.color : "var(--surface-soft)",
                    color: value === p ? "#fff" : "var(--ink-soft)",
                  }}
                >
                  {p} {config.unit}
                </button>
              ))}
            </div>
          )}
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
