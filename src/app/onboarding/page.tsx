"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Heart, Baby, ShieldOff } from "lucide-react";
import { useUpdateProfile, UsageGoal } from "@/lib/queries";
import { useToast } from "@/components/ui/Toast";

const GOAL_OPTIONS: { value: UsageGoal; label: string; desc: string; icon: typeof Heart }[] = [
  { value: "track", label: "Theo dõi chu kỳ", desc: "Nắm rõ cơ thể mình mỗi tháng", icon: Heart },
  { value: "conceive", label: "Mong có thai", desc: "Ưu tiên cửa sổ thụ thai & rụng trứng", icon: Baby },
  { value: "avoid", label: "Tránh thai", desc: "Theo dõi để chủ động phòng tránh", icon: ShieldOff },
];

export default function OnboardingPage() {
  const router = useRouter();
  const updateProfile = useUpdateProfile();
  const toast = useToast();

  const [step, setStep] = useState<1 | 2>(1);
  const [usageGoal, setUsageGoal] = useState<UsageGoal | null>(null);
  const [birthDate, setBirthDate] = useState("");
  const [avgCycleLength, setAvgCycleLength] = useState(28);
  const [avgPeriodLength, setAvgPeriodLength] = useState(5);

  function handleSelectGoal(goal: UsageGoal) {
    setUsageGoal(goal);
    setStep(2);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      await updateProfile.mutateAsync({
        usage_goal: usageGoal,
        birth_date: birthDate || null,
        avg_cycle_length: avgCycleLength,
        avg_period_length: avgPeriodLength,
        onboarded: true,
      });
      toast.success("Chào mừng bạn đến với KVCycle 🌸");
      router.replace("/");
    } catch {
      // toast lỗi do MutationCache global xử lý; ở lại bước 2 để không mất
      // dữ liệu người dùng vừa nhập (trước đây không có try/catch — nếu lỗi,
      // `router.replace` không chạy nên hành vi thực ra vẫn an toàn, nhưng
      // giờ tường minh hơn và nhất quán với các form khác trong app).
    }
  }

  if (step === 1) {
    return (
      <main className="flex flex-1 flex-col justify-center gap-6 px-6">
        <div className="text-center">
          <h1 className="font-display text-2xl font-bold text-[var(--ink)]">Chào mừng đến KVCycle 🌸</h1>
          <p className="mt-1 text-sm text-[var(--ink-soft)]">
            Bạn đang dùng KVCycle với mục đích gì?
          </p>
        </div>

        <div className="flex flex-col gap-3">
          {GOAL_OPTIONS.map(({ value, label, desc, icon: Icon }) => (
            <button
              key={value}
              type="button"
              onClick={() => handleSelectGoal(value)}
              className="glass-card-strong flex items-center gap-3 rounded-[24px] p-4 text-left active:scale-[0.98]"
            >
              <span
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-white"
                style={{ background: "linear-gradient(135deg, var(--c-sleep), var(--c-period))" }}
              >
                <Icon size={19} />
              </span>
              <span>
                <span className="block text-sm font-semibold text-[var(--ink)]">{label}</span>
                <span className="block text-xs text-[var(--ink-faint)]">{desc}</span>
              </span>
            </button>
          ))}
        </div>
      </main>
    );
  }

  return (
    <main className="flex flex-1 flex-col justify-center gap-6 px-6">
      <div className="text-center">
        <h1 className="font-display text-2xl font-bold text-[var(--ink)]">Vài thông tin nữa 🌸</h1>
        <p className="mt-1 text-sm text-[var(--ink-soft)]">
          Giúp KVCycle dự đoán chu kỳ chính xác hơn.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="glass-card-strong flex flex-col gap-5 rounded-[28px] p-6">
        <label className="flex flex-col gap-1.5">
          <span className="text-xs font-medium text-[var(--ink-soft)]">Ngày sinh (tuỳ chọn)</span>
          <input
            type="date"
            value={birthDate}
            onChange={(e) => setBirthDate(e.target.value)}
            className="rounded-2xl bg-black/[0.03] px-4 py-3 text-sm text-[var(--ink)] outline-none"
          />
        </label>

        <label className="flex flex-col gap-1.5">
          <span className="text-xs font-medium text-[var(--ink-soft)]">
            Độ dài chu kỳ trung bình: <b className="text-[var(--ink)]">{avgCycleLength} ngày</b>
          </span>
          <input
            type="range"
            min={21}
            max={40}
            value={avgCycleLength}
            onChange={(e) => setAvgCycleLength(Number(e.target.value))}
            style={{ accentColor: "var(--c-period)" }}
          />
        </label>

        <label className="flex flex-col gap-1.5">
          <span className="text-xs font-medium text-[var(--ink-soft)]">
            Số ngày hành kinh trung bình: <b className="text-[var(--ink)]">{avgPeriodLength} ngày</b>
          </span>
          <input
            type="range"
            min={2}
            max={10}
            value={avgPeriodLength}
            onChange={(e) => setAvgPeriodLength(Number(e.target.value))}
            style={{ accentColor: "var(--c-period)" }}
          />
        </label>

        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => setStep(1)}
            className="rounded-2xl px-4 py-3 text-sm font-semibold text-[var(--ink-soft)]"
            style={{ background: "rgba(36,27,47,0.06)" }}
          >
            Quay lại
          </button>
          <button
            type="submit"
            disabled={updateProfile.isPending}
            className="flex flex-1 items-center justify-center gap-2 rounded-2xl py-3 text-sm font-semibold text-white disabled:opacity-60"
            style={{ background: "linear-gradient(135deg, var(--c-sleep), var(--c-period))" }}
          >
            {updateProfile.isPending && <Loader2 size={16} className="animate-spin" />}
            Hoàn tất
          </button>
        </div>
      </form>
    </main>
  );
}
