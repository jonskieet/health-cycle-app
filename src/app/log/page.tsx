import { HeartPulse, Moon, Droplets, Smile, Flame, Droplet } from "lucide-react";

const logOptions = [
  { label: "Chu kỳ / triệu chứng", icon: Droplet, color: "var(--c-period)" },
  { label: "Nhịp tim", icon: HeartPulse, color: "var(--c-heart)" },
  { label: "Giấc ngủ", icon: Moon, color: "var(--c-sleep)" },
  { label: "Nước uống", icon: Droplets, color: "var(--c-hydration)" },
  { label: "Tâm trạng", icon: Smile, color: "var(--c-mood)" },
  { label: "Mức độ stress", icon: Flame, color: "var(--c-stress)" },
];

export default function LogPage() {
  return (
    <main className="flex flex-1 flex-col gap-6 px-5 pt-8">
      <h1 className="font-display text-2xl font-bold text-[var(--ink)]">Ghi nhận hôm nay</h1>
      <p className="-mt-3 text-sm text-[var(--ink-soft)]">
        Chọn chỉ số bạn muốn cập nhật. Form nhập liệu chi tiết sẽ được nối ở bước tiếp theo.
      </p>
      <div className="grid grid-cols-2 gap-4">
        {logOptions.map(({ label, icon: Icon, color }) => (
          <button
            key={label}
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
    </main>
  );
}
