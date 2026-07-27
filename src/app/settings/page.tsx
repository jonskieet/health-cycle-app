"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  X,
  Palette,
  Bell,
  Ruler,
  Target,
  Droplet,
  Star,
  MessageCircle,
  FileText,
  ShieldCheck,
  LogOut,
  CalendarClock,
  Heart,
  Baby,
  ShieldOff,
  Check,
  BellRing,
  NotebookPen,
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { useProfile, useUpdateProfile, UsageGoal, useReminders, useUpsertReminder } from "@/lib/queries";
import Switch from "@/components/ui/Switch";
import SettingsRow from "@/components/ui/SettingsRow";

function SettingsSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-1">
      <p className="mb-1 px-1 text-xs font-medium uppercase tracking-wide text-[var(--ink-faint)]">
        {title}
      </p>
      <div className="glass-card flex flex-col divide-y divide-black/[0.05] rounded-[22px] px-4">
        {children}
      </div>
    </section>
  );
}

const GOAL_OPTIONS: { value: UsageGoal; label: string; icon: typeof Heart }[] = [
  { value: "track", label: "Theo dõi chu kỳ", icon: Heart },
  { value: "conceive", label: "Mong có thai", icon: Baby },
  { value: "avoid", label: "Tránh thai", icon: ShieldOff },
];

const GOAL_LABEL: Record<UsageGoal, string> = {
  track: "Theo dõi chu kỳ của bạn",
  conceive: "Mong có thai",
  avoid: "Tránh thai",
};

export default function SettingsPage() {
  const router = useRouter();
  const { signOut } = useAuth();
  const { data: profile } = useProfile();
  const updateProfile = useUpdateProfile();
  const { data: reminders = [] } = useReminders();
  const upsertReminder = useUpsertReminder();

  const [goalPickerOpen, setGoalPickerOpen] = useState(false);

  // Module 2: reminders — hiện tại chỉ hỗ trợ dạng in-app banner (xem note
  // trong supabase/sql/module2_reminders.sql), chưa có push/email thật.
  const periodReminder = reminders.find((r) => r.type === "period_upcoming");
  const logReminder = reminders.find((r) => r.type === "log_daily");
  const periodReminderEnabled = periodReminder?.enabled ?? false;
  const logReminderEnabled = logReminder?.enabled ?? false;
  const periodLeadDays = periodReminder?.lead_days ?? 2;

  function handleTogglePeriodReminder(next: boolean) {
    upsertReminder.mutate({ type: "period_upcoming", enabled: next, lead_days: periodLeadDays });
  }

  function handleChangeLeadDays(days: number) {
    upsertReminder.mutate({ type: "period_upcoming", enabled: true, lead_days: days });
  }

  function handleToggleLogReminder(next: boolean) {
    upsertReminder.mutate({ type: "log_daily", enabled: next });
  }

  const notifications = profile?.notifications_enabled ?? true;
  const metricUnits = profile?.metric_units ?? true;

  function handleToggleNotifications(next: boolean) {
    updateProfile.mutate({ notifications_enabled: next });
  }

  function handleToggleUnits(next: boolean) {
    updateProfile.mutate({ metric_units: next });
  }

  function handleSelectGoal(goal: UsageGoal) {
    updateProfile.mutate({ usage_goal: goal });
    setGoalPickerOpen(false);
  }

  return (
    <main className="flex flex-1 flex-col gap-6 px-5 pt-8">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-bold text-[var(--ink)]">Cài đặt</h1>
        <button
          type="button"
          onClick={() => router.push("/profile")}
          className="flex h-9 w-9 items-center justify-center rounded-full text-[var(--ink-soft)]"
          style={{ background: "rgba(36,27,47,0.06)" }}
        >
          <X size={16} />
        </button>
      </div>

      <SettingsSection title="Cài đặt ứng dụng">
        <SettingsRow icon={Palette} label="Chủ đề" subtitle="Sáng (mặc định)" color="var(--c-sleep)" />
        <SettingsRow
          icon={Bell}
          label="Thông báo"
          subtitle={notifications ? "Đang bật" : "Đang tắt"}
          color="var(--c-heart)"
          right={<Switch checked={notifications} onChange={handleToggleNotifications} label="Thông báo" />}
        />
        <SettingsRow
          icon={Ruler}
          label="Hệ mét"
          subtitle={metricUnits ? "cm, kg" : "inch, lb"}
          color="var(--c-hydration)"
          right={<Switch checked={metricUnits} onChange={handleToggleUnits} label="Hệ mét" />}
        />
      </SettingsSection>

      <SettingsSection title="Cài đặt sức khỏe">
        <SettingsRow
          icon={Target}
          label="Mục đích"
          subtitle={profile?.usage_goal ? GOAL_LABEL[profile.usage_goal] : "Chưa chọn"}
          color="var(--c-mood)"
          onClick={() => setGoalPickerOpen(true)}
        />
        <Link href="/profile" className="flex w-full items-center gap-3 px-1 py-3 text-left">
          <span
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-white"
            style={{ background: "var(--c-period)" }}
          >
            <Droplet size={16} />
          </span>
          <span className="flex-1 text-left">
            <span className="block text-sm font-semibold text-[var(--ink)]">Chu kỳ kinh nguyệt</span>
            <span className="block text-xs text-[var(--ink-faint)]">
              Chỉnh độ dài chu kỳ & kỳ kinh mặc định
            </span>
          </span>
        </Link>
        <Link href="/appointments" className="flex w-full items-center gap-3 px-1 py-3 text-left">
          <span
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-white"
            style={{ background: "var(--c-fertile)" }}
          >
            <CalendarClock size={16} />
          </span>
          <span className="flex-1 text-left">
            <span className="block text-sm font-semibold text-[var(--ink)]">Lịch hẹn</span>
            <span className="block text-xs text-[var(--ink-faint)]">Quản lý các buổi khám sắp tới</span>
          </span>
        </Link>
      </SettingsSection>

      <SettingsSection title="Nhắc nhở">
        <SettingsRow
          icon={BellRing}
          label="Sắp đến kỳ kinh"
          subtitle={
            periodReminderEnabled
              ? `Nhắc trước ${periodLeadDays} ngày`
              : "Đang tắt"
          }
          color="var(--c-period)"
          right={
            <Switch
              checked={periodReminderEnabled}
              onChange={handleTogglePeriodReminder}
              label="Nhắc sắp đến kỳ kinh"
            />
          }
        />
        {periodReminderEnabled && (
          <div className="flex flex-col gap-1.5 px-1 py-3">
            <span className="text-xs font-medium text-[var(--ink-soft)]">
              Nhắc trước: <b className="text-[var(--ink)]">{periodLeadDays} ngày</b>
            </span>
            <input
              type="range"
              min={1}
              max={5}
              value={periodLeadDays}
              onChange={(e) => handleChangeLeadDays(Number(e.target.value))}
              style={{ accentColor: "var(--c-period)" }}
            />
          </div>
        )}
        <SettingsRow
          icon={NotebookPen}
          label="Nhắc ghi log hàng ngày"
          subtitle={logReminderEnabled ? "Đang bật" : "Đang tắt"}
          color="var(--c-hydration)"
          right={
            <Switch
              checked={logReminderEnabled}
              onChange={handleToggleLogReminder}
              label="Nhắc ghi log hàng ngày"
            />
          }
        />
        <p className="px-1 pb-3 text-[11px] leading-relaxed text-[var(--ink-faint)]">
          Nhắc nhở hiển thị dạng banner ngay trong ứng dụng khi bạn mở app — chưa
          hỗ trợ thông báo đẩy (push) ngoài trình duyệt.
        </p>
      </SettingsSection>

      <SettingsSection title="Khác">
        <SettingsRow icon={Star} label="Đánh giá ứng dụng" color="var(--c-ovulation)" />
        <SettingsRow icon={MessageCircle} label="Phản hồi" color="var(--c-sleep)" />
        <SettingsRow icon={FileText} label="Điều khoản Sử dụng" color="var(--ink-soft)" />
        <SettingsRow icon={ShieldCheck} label="Chính sách Bảo mật" color="var(--ink-soft)" />
      </SettingsSection>

      <SettingsSection title="Tài khoản">
        <SettingsRow icon={LogOut} label="Đăng xuất" tone="danger" onClick={signOut} />
      </SettingsSection>

      {goalPickerOpen && (
        <div
          className="fixed inset-0 z-30 flex items-end justify-center bg-black/30"
          onClick={() => setGoalPickerOpen(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="glass-card-strong flex w-full max-w-md flex-col gap-3 rounded-t-[28px] p-6"
          >
            <div className="flex items-center justify-between">
              <h2 className="font-display text-lg font-bold text-[var(--ink)]">Mục đích sử dụng</h2>
              <button
                type="button"
                onClick={() => setGoalPickerOpen(false)}
                className="rounded-full p-1.5 hover:bg-black/5"
              >
                <X size={18} />
              </button>
            </div>
            {GOAL_OPTIONS.map(({ value, label, icon: Icon }) => {
              const active = profile?.usage_goal === value;
              return (
                <button
                  key={value}
                  type="button"
                  onClick={() => handleSelectGoal(value)}
                  className="flex items-center gap-3 rounded-2xl p-3 text-left"
                  style={{ background: active ? "rgba(124,111,240,0.12)" : "rgba(0,0,0,0.03)" }}
                >
                  <span
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-white"
                    style={{ background: "var(--c-sleep)" }}
                  >
                    <Icon size={16} />
                  </span>
                  <span className="flex-1 text-sm font-semibold text-[var(--ink)]">{label}</span>
                  {active && <Check size={16} style={{ color: "var(--c-sleep)" }} />}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </main>
  );
}
