"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { HeartPulse, Moon, Droplets, Smile, Flame, Droplet, Scale, Thermometer } from "lucide-react";
import CycleLogForm from "@/components/log/CycleLogForm";
import MetricLogForm from "@/components/log/MetricLogForm";
import BlobIcon from "@/components/ui/BlobIcon";
import { MetricType, useMetricTrend } from "@/lib/queries";

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
  presets?: number[];
}> = {
  stress: { type: "stress", label: "Mức độ stress", unit: "pts", icon: Flame, color: "var(--c-stress)", min: 1, max: 10, step: 1, default: 5, presets: [2, 5, 8] },
  heart_rate: { type: "heart_rate", label: "Nhịp tim", unit: "bpm", icon: HeartPulse, color: "var(--c-heart)", min: 40, max: 180, step: 1, default: 72, presets: [60, 72, 90] },
  sleep: { type: "sleep", label: "Giấc ngủ", unit: "giờ", icon: Moon, color: "var(--c-sleep)", min: 0, max: 12, step: 0.5, default: 7, presets: [6, 7, 8] },
  hydration: { type: "hydration", label: "Nước uống", unit: "ml", icon: Droplets, color: "var(--c-hydration)", min: 0, max: 4000, step: 100, default: 2000, presets: [1000, 2000, 3000] },
  mood: { type: "mood", label: "Tâm trạng", unit: "/5", icon: Smile, color: "var(--c-mood)", min: 1, max: 5, step: 1, default: 3, presets: [2, 3, 4] },
  // Module 3: cân nặng & nhiệt độ cơ bản (BBT).
  weight: { type: "weight", label: "Cân nặng", unit: "kg", icon: Scale, color: "var(--c-sleep)", min: 30, max: 120, step: 0.1, default: 55 },
  bbt: { type: "bbt", label: "Nhiệt độ cơ bản (BBT)", unit: "°C", icon: Thermometer, color: "var(--c-fertile)", min: 35, max: 39, step: 0.05, default: 36.5, presets: [36.3, 36.6, 36.9] },
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

  // D3: cân nặng không có preset cố định hợp lý (không như nhịp tim/giấc ngủ —
  // mỗi người 1 khoảng cân nặng rất khác nhau) — thay vào đó lấy giá trị lần
  // ghi nhận gần nhất (trong 14 ngày) làm mặc định + chip "Như lần trước",
  // giảm số lần phải gõ tay vì cân nặng thường ít đổi giữa các lần đo liên tiếp.
  // Hook luôn gọi (Rules of Hooks không cho gọi có điều kiện) nhưng nhẹ — chỉ
  // query 14 ngày, TanStack Query tự cache/staleTime nên không tốn thêm gì
  // đáng kể khi user không mở modal cân nặng; chỉ giá trị đọc ra được gate lại.
  const { data: weightTrend } = useMetricTrend("weight", 14);
  const lastWeight = open === "weight" ? weightTrend?.at(-1)?.value : undefined;

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
            {/* F1: đổi khối tròn phẳng sang BlobIcon — thống nhất ngôn ngữ
                icon minh hoạ toàn app (trước đây mỗi màn 1 kiểu khác nhau:
                tròn phẳng ở đây, blob ở Kegel/Fatigue, vuông đặc ở Kiểm tra
                sức khoẻ...). Không dùng `active` — bản gốc là nền pastel nhạt
                + icon màu đậm (không phải khối màu đặc), giữ đúng độ tương
                phản cũ, chỉ đổi hình khối tròn → blob. */}
            <BlobIcon icon={Icon} bg={`color-mix(in srgb, ${color} 18%, white)`} fg={color} size="sm" />
            <span className="text-sm font-semibold text-[var(--ink)]">{label}</span>
          </button>
        ))}
      </div>

      {open === "cycle" && <CycleLogForm onClose={() => setOpen(null)} />}
      {open && open !== "cycle" && open in metricConfigs && (
        <MetricLogForm
          config={metricConfigs[open as MetricType]}
          onClose={() => setOpen(null)}
          lastValue={open === "weight" ? lastWeight : undefined}
        />
      )}
    </main>
  );
}
