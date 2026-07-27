"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { HeartPulse, Moon, Droplets, Smile, Flame, Droplet, Scale, Thermometer } from "lucide-react";
import CycleLogForm from "@/components/log/CycleLogForm";
import MetricLogForm from "@/components/log/MetricLogForm";
import { MetricType } from "@/lib/queries";

const metricConfigs: Record<Exclude<MetricType, never>, {
  type: MetricType;
  label: string;
  unit: string;
  icon: typeof HeartPulse;
  color: string;
  min: number;
  max: number;
  step: number;
  default: number;
}> = {
  stress: { type: "stress", label: "Mức độ stress", unit: "pts", icon: Flame, color: "var(--c-stress)", min: 1, max: 10, step: 1, default: 5 },
  heart_rate: { type: "heart_rate", label: "Nhịp tim", unit: "bpm", icon: HeartPulse, color: "var(--c-heart)", min: 40, max: 180, step: 1, default: 72 },
  sleep: { type: "sleep", label: "Giấc ngủ", unit: "giờ", icon: Moon, color: "var(--c-sleep)", min: 0, max: 12, step: 0.5, default: 7 },
  hydration: { type: "hydration", label: "Nước uống", unit: "ml", icon: Droplets, color: "var(--c-hydration)", min: 0, max: 4000, step: 100, default: 2000 },
  mood: { type: "mood", label: "Tâm trạng", unit: "/5", icon: Smile, color: "var(--c-mood)", min: 1, max: 5, step: 1, default: 3 },
  // Module 3: cân nặng & nhiệt độ cơ bản (BBT).
  weight: { type: "weight", label: "Cân nặng", unit: "kg", icon: Scale, color: "var(--c-sleep)", min: 30, max: 120, step: 0.1, default: 55 },
  bbt: { type: "bbt", label: "Nhiệt độ cơ bản (BBT)", unit: "°C", icon: Thermometer, color: "var(--c-fertile)", min: 35, max: 39, step: 0.05, default: 36.5 },
};

const logOptions: { key: string; label: string; icon: typeof HeartPulse; color: string }[] = [
  { key: "cycle", label: "Chu kỳ / triệu chứng", icon: Droplet, color: "var(--c-period)" },
  { key: "heart_rate", label: "Nhịp tim", icon: HeartPulse, color: "var(--c-heart)" },
  { key: "sleep", label: "Giấc ngủ", icon: Moon, color: "var(--c-sleep)" },
  { key: "hydration", label: "Nước uống", icon: Droplets, color: "var(--c-hydration)" },
  { key: "mood", label: "Tâm trạng", icon: Smile, color: "var(--c-mood)" },
  { key: "stress", label: "Mức độ stress", icon: Flame, color: "var(--c-stress)" },
  { key: "weight", label: "Cân nặng", icon: Scale, color: "var(--c-sleep)" },
  { key: "bbt", label: "Nhiệt độ cơ bản (BBT)", icon: Thermometer, color: "var(--c-fertile)" },
];

export default function LogPage() {
  return (
    <Suspense fallback={null}>
      <LogPageInner />
    </Suspense>
  );
}

function LogPageInner() {
  const searchParams = useSearchParams();
  const [open, setOpen] = useState<string | null>(() => searchParams.get("type"));

  return (
    <main className="flex flex-1 flex-col gap-6 px-5 pt-8">
      <h1 className="font-display text-2xl font-bold text-[var(--ink)]">Ghi nhận hôm nay</h1>
      <p className="-mt-3 text-sm text-[var(--ink-soft)]">Chọn chỉ số bạn muốn cập nhật.</p>
      <div className="grid grid-cols-2 gap-4">
        {logOptions.map(({ key, label, icon: Icon, color }) => (
          <button
            key={key}
            onClick={() => setOpen(key)}
            className="glass-card flex flex-col items-start gap-3 rounded-[22px] p-5 text-left active:scale-[0.98]"
          >
            <span
              className="flex h-9 w-9 items-center justify-center rounded-full"
              style={{ background: `color-mix(in srgb, ${color} 18%, white)` }}
            >
              <Icon size={18} style={{ color }} />
            </span>
            <span className="text-sm font-semibold text-[var(--ink)]">{label}</span>
          </button>
        ))}
      </div>

      {open === "cycle" && <CycleLogForm onClose={() => setOpen(null)} />}
      {open && open !== "cycle" && open in metricConfigs && (
        <MetricLogForm config={metricConfigs[open as MetricType]} onClose={() => setOpen(null)} />
      )}
    </main>
  );
}
