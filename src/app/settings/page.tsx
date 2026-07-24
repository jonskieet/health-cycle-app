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
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";
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

export default function SettingsPage() {
  const router = useRouter();
  const { signOut } = useAuth();

  // Các tuỳ chọn giao diện cơ bản — lưu cục bộ trong phiên, chưa đồng bộ backend.
  const [notifications, setNotifications] = useState(true);
  const [metricUnits, setMetricUnits] = useState(true);

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
        <SettingsRow icon={Palette} label="Chủ đề" subtitle="Sáng" color="var(--c-sleep)" />
        <SettingsRow
          icon={Bell}
          label="Thông báo"
          subtitle={notifications ? "Đang bật" : "Đang tắt"}
          color="var(--c-heart)"
          right={<Switch checked={notifications} onChange={setNotifications} label="Thông báo" />}
        />
        <SettingsRow
          icon={Ruler}
          label="Hệ mét"
          subtitle={metricUnits ? "cm, kg" : "inch, lb"}
          color="var(--c-hydration)"
          right={<Switch checked={metricUnits} onChange={setMetricUnits} label="Hệ mét" />}
        />
      </SettingsSection>

      <SettingsSection title="Cài đặt sức khỏe">
        <SettingsRow
          icon={Target}
          label="Mục đích"
          subtitle="Theo dõi chu kỳ của bạn"
          color="var(--c-mood)"
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

      <SettingsSection title="Khác">
        <SettingsRow icon={Star} label="Đánh giá ứng dụng" color="var(--c-ovulation)" />
        <SettingsRow icon={MessageCircle} label="Phản hồi" color="var(--c-sleep)" />
        <SettingsRow icon={FileText} label="Điều khoản Sử dụng" color="var(--ink-soft)" />
        <SettingsRow icon={ShieldCheck} label="Chính sách Bảo mật" color="var(--ink-soft)" />
      </SettingsSection>

      <SettingsSection title="Tài khoản">
        <SettingsRow icon={LogOut} label="Đăng xuất" tone="danger" onClick={signOut} />
      </SettingsSection>
    </main>
  );
}
