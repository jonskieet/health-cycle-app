"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Settings,
  Loader2,
  Check,
  CalendarClock,
  ChevronRight,
  Pencil,
  FileText,
  HeartPulse,
  Battery,
  BookOpen,
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { useProfile, useUpdateProfile, useCycleLogs } from "@/lib/queries";
import { predictCycle } from "@/lib/cycle-utils";
import { isVipProfile } from "@/lib/vip";
import { useToast } from "@/components/ui/Toast";
import CycleInsights from "@/components/profile/CycleInsights";
import WeightBBTChart from "@/components/profile/WeightBBTChart";
import CorrelationChart from "@/components/profile/CorrelationChart";
import SymptomAnalysis from "@/components/profile/SymptomAnalysis";
import ProfileAvatar from "@/components/profile/ProfileAvatar";
import MembershipCard from "@/components/profile/MembershipCard";
import LockedFeature from "@/components/profile/LockedFeature";
import EditProfileModal from "@/components/profile/EditProfileModal";

export default function ProfilePage() {
  const { user } = useAuth();
  const { data: profile, isLoading } = useProfile();
  const { data: cycleLogs = [] } = useCycleLogs();
  const updateProfile = useUpdateProfile();
  const toast = useToast();
  const vip = isVipProfile(profile);

  const lifetimeStats = predictCycle(cycleLogs, {
    avgCycleLength: profile?.avg_cycle_length ?? 28,
    avgPeriodLength: profile?.avg_period_length ?? 5,
  });

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
    try {
      // Module A3: trước đây `setSaved(true)` chạy vô điều kiện SAU
      // `mutateAsync` — nhưng vì không có try/catch, nếu mutation lỗi thì
      // dòng code ném lỗi và dừng lại TRƯỚC khi tới `setSaved(true)` nên thực
      // ra không có "success giả" — vẫn bọc try/catch tường minh để rõ ràng ý
      // đồ + thêm toast nhất quán với phần còn lại của app.
      await updateProfile.mutateAsync({ avg_cycle_length: avgCycleLength, avg_period_length: avgPeriodLength });
      setSaved(true);
      toast.success("Đã lưu độ dài chu kỳ");
      setTimeout(() => setSaved(false), 2000);
    } catch {
      // toast lỗi do MutationCache global xử lý.
    }
  }

  // ---- Modal chỉnh sửa hồ sơ ----
  const [editingProfile, setEditingProfile] = useState(false);

  return (
    <main className="flex flex-1 flex-col gap-6 px-5 pt-8">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-bold text-[var(--ink)]">Cá nhân</h1>
        <Link
          href="/settings"
          className="flex h-10 w-10 items-center justify-center rounded-full text-[var(--ink-soft)]"
          style={{ background: "rgba(36,27,47,0.06)" }}
        >
          <Settings size={18} />
        </Link>
      </div>

      <section className="glass-card-strong flex flex-col items-center gap-2 rounded-[28px] p-8 text-center">
        <button type="button" onClick={() => setEditingProfile(true)}>
          <ProfileAvatar
            name={profile?.display_name}
            email={user?.email}
            isVip={vip}
            size={72}
            avatarKey={profile?.avatar_key}
          />
        </button>

        <button
          type="button"
          onClick={() => setEditingProfile(true)}
          className="mt-1 flex items-center gap-1.5"
        >
          <p className="font-display text-base font-bold text-[var(--ink)]">
            {profile?.display_name || user?.email}
          </p>
          <Pencil size={13} className="text-[var(--ink-faint)]" />
        </button>

        {profile?.display_name && (
          <p className="text-xs text-[var(--ink-faint)]">{user?.email}</p>
        )}
      </section>

      {editingProfile && (
        <EditProfileModal
          profile={profile}
          fallbackName={user?.email}
          onClose={() => setEditingProfile(false)}
        />
      )}

      <MembershipCard isVip={vip} />

      {cycleLogs.length > 0 && (
        <>
          <section>
            <p className="mb-2 text-xs font-medium uppercase tracking-wide text-[var(--ink-faint)]">
              Số liệu thống kê
            </p>
            <div className="grid grid-cols-2 gap-3">
              <div className="glass-card rounded-2xl p-4">
                <p className="text-xs text-[var(--ink-soft)]">Chiều dài chu kỳ trung bình</p>
                <p className="mt-1 font-display text-2xl font-extrabold text-[var(--ink)]">
                  {lifetimeStats.avgCycleLength} ngày
                </p>
              </div>
              <div className="glass-card rounded-2xl p-4">
                <p className="text-xs text-[var(--ink-soft)]">Thời gian hành kinh trung bình</p>
                <p className="mt-1 font-display text-2xl font-extrabold text-[var(--ink)]">
                  {lifetimeStats.avgPeriodLength} ngày
                </p>
              </div>
            </div>
          </section>

          <LockedFeature locked={!vip} title="Báo cáo sức khỏe VIP">
            <Link
              href="/profile/report"
              className="glass-card flex items-center gap-3 rounded-[22px] p-4"
            >
              <span
                className="flex h-9 w-9 items-center justify-center rounded-full text-white"
                style={{ background: "var(--c-mood)" }}
              >
                <FileText size={16} />
              </span>
              <span className="flex-1 text-left">
                <span className="block text-sm font-semibold text-[var(--ink)]">
                  Báo cáo sức khỏe cho bác sĩ
                </span>
                <span className="block text-xs text-[var(--ink-faint)]">
                  Tóm tắt chu kỳ & chỉ số gần đây, sẵn sàng để in
                </span>
              </span>
              <ChevronRight size={16} className="text-[var(--ink-faint)]" />
            </Link>
          </LockedFeature>

          <CycleInsights cycleLogs={cycleLogs} isVip={vip} />
        </>
      )}

      <WeightBBTChart />

      <LockedFeature locked={!vip} title="Phân tích tương quan VIP">
        <CorrelationChart />
      </LockedFeature>

      {cycleLogs.length > 0 && (
        <LockedFeature locked={!vip} title="Phân tích triệu chứng VIP">
          <SymptomAnalysis cycleLogs={cycleLogs} />
        </LockedFeature>
      )}

      <LockedFeature locked={!vip} title="Bài tập Kegel VIP">
        <Link href="/kegel" className="glass-card flex items-center gap-3 rounded-[22px] p-4">
          <span
            className="flex h-9 w-9 items-center justify-center rounded-full text-white"
            style={{ background: "linear-gradient(135deg, var(--c-period), var(--c-sleep))" }}
          >
            <HeartPulse size={16} />
          </span>
          <span className="flex-1 text-left">
            <span className="block text-sm font-semibold text-[var(--ink)]">Bài tập Kegel</span>
            <span className="block text-xs text-[var(--ink-faint)]">
              Timer hướng dẫn co-thả lỏng cơ sàn chậu
            </span>
          </span>
          <ChevronRight size={16} className="text-[var(--ink-faint)]" />
        </Link>
      </LockedFeature>

      <LockedFeature locked={!vip} title="Trắc nghiệm năng lượng VIP">
        <Link href="/fatigue-test" className="glass-card flex items-center gap-3 rounded-[22px] p-4">
          <span
            className="flex h-9 w-9 items-center justify-center rounded-full text-white"
            style={{ background: "var(--c-stress)" }}
          >
            <Battery size={16} />
          </span>
          <span className="flex-1 text-left">
            <span className="block text-sm font-semibold text-[var(--ink)]">Trắc nghiệm năng lượng</span>
            <span className="block text-xs text-[var(--ink-faint)]">
              Bài test nhanh đánh giá mức độ mệt mỏi
            </span>
          </span>
          <ChevronRight size={16} className="text-[var(--ink-faint)]" />
        </Link>
      </LockedFeature>

      <Link href="/library" className="glass-card flex items-center gap-3 rounded-[22px] p-4">
        <span
          className="flex h-9 w-9 items-center justify-center rounded-full text-white"
          style={{ background: "var(--c-sleep)" }}
        >
          <BookOpen size={16} />
        </span>
        <span className="flex-1 text-left">
          <span className="block text-sm font-semibold text-[var(--ink)]">Thư viện kiến thức</span>
          <span className="block text-xs text-[var(--ink-faint)]">
            Bài viết về chu kỳ, dinh dưỡng, khả năng sinh sản
          </span>
        </span>
        <ChevronRight size={16} className="text-[var(--ink-faint)]" />
      </Link>

      <Link href="/appointments" className="glass-card flex items-center gap-3 rounded-[22px] p-4">
        <span
          className="flex h-9 w-9 items-center justify-center rounded-full text-white"
          style={{ background: "var(--c-fertile)" }}
        >
          <CalendarClock size={16} />
        </span>
        <span className="flex-1 text-left">
          <span className="block text-sm font-semibold text-[var(--ink)]">Lịch hẹn</span>
          <span className="block text-xs text-[var(--ink-faint)]">Quản lý các buổi khám sắp tới</span>
        </span>
        <ChevronRight size={16} className="text-[var(--ink-faint)]" />
      </Link>

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
    </main>
  );
}
