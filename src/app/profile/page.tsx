"use client";

import { useState } from "react";
import { User, LogOut, Loader2, Check } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { useProfile, useUpdateProfile } from "@/lib/queries";

export default function ProfilePage() {
  const { user, signOut } = useAuth();
  const { data: profile, isLoading } = useProfile();
  const updateProfile = useUpdateProfile();

  // Local override once the user starts dragging a slider; falls back to
  // the loaded profile value (or a sane default) until then.
  const [cycleOverride, setCycleOverride] = useState<number | null>(null);
  const [periodOverride, setPeriodOverride] = useState<number | null>(null);
  const [saved, setSaved] = useState(false);

  const avgCycleLength = cycleOverride ?? profile?.avg_cycle_length ?? 28;
  const avgPeriodLength = periodOverride ?? profile?.avg_period_length ?? 5;
  const setAvgCycleLength = setCycleOverride;
  const setAvgPeriodLength = setPeriodOverride;

  async function handleSave() {
    setSaved(false);
    await updateProfile.mutateAsync({ avg_cycle_length: avgCycleLength, avg_period_length: avgPeriodLength });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <main className="flex flex-1 flex-col gap-6 px-5 pt-8">
      <h1 className="font-display text-2xl font-bold text-[var(--ink)]">Cá nhân</h1>

      <section className="glass-card-strong flex flex-col items-center gap-2 rounded-[28px] p-8 text-center">
        <span
          className="flex h-16 w-16 items-center justify-center rounded-full text-white"
          style={{ background: "var(--c-sleep)" }}
        >
          <User size={28} />
        </span>
        <p className="font-display text-base font-bold text-[var(--ink)]">
          {profile?.display_name || user?.email}
        </p>
        {profile?.display_name && (
          <p className="text-xs text-[var(--ink-faint)]">{user?.email}</p>
        )}
      </section>

      {!isLoading && (
        <section className="glass-card flex flex-col gap-5 rounded-[24px] p-5">
          <p className="text-xs font-medium uppercase tracking-wide text-[var(--ink-faint)]">
            Thông số chu kỳ mặc định
          </p>

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
            onClick={handleSave}
            disabled={updateProfile.isPending}
            className="flex items-center justify-center gap-2 rounded-2xl py-3 text-sm font-semibold text-white disabled:opacity-60"
            style={{ background: saved ? "var(--c-mood)" : "var(--c-sleep)" }}
          >
            {updateProfile.isPending ? (
              <Loader2 size={16} className="animate-spin" />
            ) : saved ? (
              <Check size={16} />
            ) : null}
            {saved ? "Đã lưu" : "Lưu thay đổi"}
          </button>
        </section>
      )}

      <button
        onClick={signOut}
        className="glass-card flex items-center justify-center gap-2 rounded-[22px] p-4 text-sm font-semibold"
        style={{ color: "var(--c-period)" }}
      >
        <LogOut size={16} />
        Đăng xuất
      </button>
    </main>
  );
}
