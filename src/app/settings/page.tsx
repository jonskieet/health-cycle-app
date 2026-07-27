"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  X,
  Moon,
  Sun,
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
  ShieldCheck as ShieldLockIcon,
  Lock,
  Delete,
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { useProfile, useUpdateProfile, UsageGoal, useReminders, useUpsertReminder } from "@/lib/queries";
import { hashPin, isValidPinFormat, clearSessionUnlock, markSessionUnlocked } from "@/lib/app-lock";
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

  // Module 11: App Lock (PIN) — modal thiết lập/đổi mã PIN.
  const appLockEnabled = profile?.app_lock_enabled ?? false;
  const [pinModalOpen, setPinModalOpen] = useState(false);
  const [pinStep, setPinStep] = useState<"new" | "confirm">("new");
  const [pinDraft, setPinDraft] = useState("");
  const [pinConfirmDraft, setPinConfirmDraft] = useState("");
  const [pinError, setPinError] = useState<string | null>(null);
  const [savingPin, setSavingPin] = useState(false);

  function openPinSetup() {
    setPinStep("new");
    setPinDraft("");
    setPinConfirmDraft("");
    setPinError(null);
    setPinModalOpen(true);
  }

  function closePinModal() {
    setPinModalOpen(false);
  }

  function handleToggleAppLock(next: boolean) {
    if (next) {
      openPinSetup();
    } else {
      updateProfile.mutate({ app_lock_enabled: false, app_lock_pin_hash: null });
      clearSessionUnlock();
    }
  }

  function handlePinNewSubmit() {
    if (!isValidPinFormat(pinDraft)) {
      setPinError("Mã PIN phải gồm 4-6 chữ số");
      return;
    }
    setPinError(null);
    setPinStep("confirm");
  }

  async function handlePinConfirmSubmit() {
    if (pinConfirmDraft !== pinDraft) {
      setPinError("Mã PIN nhập lại không khớp");
      setPinConfirmDraft("");
      return;
    }
    setSavingPin(true);
    const hash = await hashPin(pinDraft);
    await updateProfile.mutateAsync({ app_lock_enabled: true, app_lock_pin_hash: hash });
    markSessionUnlocked(); // không bắt nhập lại ngay sau khi vừa tự đặt PIN
    setSavingPin(false);
    setPinModalOpen(false);
  }

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

  const isDarkTheme = profile?.theme === "dark";
  function handleToggleTheme(next: boolean) {
    updateProfile.mutate({ theme: next ? "dark" : "light" });
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
        <SettingsRow
          icon={isDarkTheme ? Moon : Sun}
          label="Chủ đề"
          subtitle={isDarkTheme ? "Tối" : "Sáng (mặc định)"}
          color="var(--c-sleep)"
          right={<Switch checked={isDarkTheme} onChange={handleToggleTheme} label="Chủ đề tối" />}
        />
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

      <SettingsSection title="Bảo mật">
        <SettingsRow
          icon={ShieldLockIcon}
          label="Khoá ứng dụng (PIN)"
          subtitle={appLockEnabled ? "Đang bật" : "Đang tắt"}
          color="var(--c-period)"
          right={<Switch checked={appLockEnabled} onChange={handleToggleAppLock} label="Khoá ứng dụng bằng PIN" />}
        />
        {appLockEnabled && (
          <SettingsRow icon={Lock} label="Đổi mã PIN" color="var(--c-sleep)" onClick={openPinSetup} />
        )}
        <p className="px-1 pb-3 text-[11px] leading-relaxed text-[var(--ink-faint)]">
          Yêu cầu nhập PIN mỗi khi mở lại ứng dụng trên trình duyệt này. Đây là lớp khoá
          bổ sung đơn giản, không thay thế mật khẩu tài khoản.
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

      {pinModalOpen && (
        <div className="fixed inset-0 z-30 flex items-end justify-center bg-black/30" onClick={closePinModal}>
          <div
            onClick={(e) => e.stopPropagation()}
            className="glass-card-strong flex w-full max-w-md flex-col gap-4 rounded-t-[28px] p-6"
          >
            <div className="flex items-center justify-between">
              <h2 className="font-display text-lg font-bold text-[var(--ink)]">
                {pinStep === "new" ? "Đặt mã PIN mới" : "Nhập lại mã PIN"}
              </h2>
              <button type="button" onClick={closePinModal} className="rounded-full p-1.5 hover:bg-black/5">
                <Delete size={18} />
              </button>
            </div>

            <p className="text-xs text-[var(--ink-faint)]">
              {pinStep === "new"
                ? "Gồm 4-6 chữ số, dùng để mở khoá ứng dụng mỗi khi truy cập lại."
                : "Nhập lại chính xác mã PIN vừa đặt để xác nhận."}
            </p>

            <input
              type="password"
              inputMode="numeric"
              maxLength={6}
              autoFocus
              value={pinStep === "new" ? pinDraft : pinConfirmDraft}
              onChange={(e) => {
                const digits = e.target.value.replace(/\D/g, "").slice(0, 6);
                if (pinStep === "new") setPinDraft(digits);
                else setPinConfirmDraft(digits);
                setPinError(null);
              }}
              placeholder="••••"
              className="rounded-2xl border border-black/10 bg-white px-4 py-3 text-center text-lg font-semibold tracking-[0.5em] text-[var(--ink)] outline-none"
            />

            {pinError && <p className="text-center text-xs font-medium text-[var(--c-period)]">{pinError}</p>}

            <button
              type="button"
              disabled={savingPin}
              onClick={pinStep === "new" ? handlePinNewSubmit : handlePinConfirmSubmit}
              className="flex items-center justify-center gap-2 rounded-2xl py-3 text-sm font-semibold text-white disabled:opacity-60"
              style={{ background: "linear-gradient(135deg, var(--c-sleep), var(--c-period))" }}
            >
              {savingPin ? "Đang lưu..." : pinStep === "new" ? "Tiếp tục" : "Xác nhận"}
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
