"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { useUpdateProfile } from "@/lib/queries";

export default function OnboardingPage() {
  const router = useRouter();
  const updateProfile = useUpdateProfile();

  const [birthDate, setBirthDate] = useState("");
  const [avgCycleLength, setAvgCycleLength] = useState(28);
  const [avgPeriodLength, setAvgPeriodLength] = useState(5);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    await updateProfile.mutateAsync({
      birth_date: birthDate || null,
      avg_cycle_length: avgCycleLength,
      avg_period_length: avgPeriodLength,
      onboarded: true,
    });
    router.replace("/");
  }

  return (
    <main className="flex flex-1 flex-col justify-center gap-6 px-6">
      <div className="text-center">
        <h1 className="font-display text-2xl font-bold text-[var(--ink)]">Bắt đầu nhé 🌸</h1>
        <p className="mt-1 text-sm text-[var(--ink-soft)]">
          Vài thông tin để KVCycle dự đoán chu kỳ chính xác hơn.
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

        <button
          type="submit"
          disabled={updateProfile.isPending}
          className="mt-2 flex items-center justify-center gap-2 rounded-2xl py-3 text-sm font-semibold text-white disabled:opacity-60"
          style={{ background: "linear-gradient(135deg, var(--c-sleep), var(--c-period))" }}
        >
          {updateProfile.isPending && <Loader2 size={16} className="animate-spin" />}
          Hoàn tất
        </button>
      </form>
    </main>
  );
}
