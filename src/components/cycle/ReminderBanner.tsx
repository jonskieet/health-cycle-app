"use client";

// Module 2 — Hệ thống nhắc nhở, kênh "in-app banner" (xem lý do lựa chọn
// kênh này trong supabase/sql/module2_reminders.sql). Component này đọc
// bảng `reminders` của user + trạng thái chu kỳ/log hôm nay để quyết định
// có hiển thị banner hay không, mỗi lần chỉ hiển thị 1 banner ưu tiên nhất.

import { useState } from "react";
import { BellRing, NotebookPen, X } from "lucide-react";
import Link from "next/link";
import { useReminders, HealthMetricRow } from "@/lib/queries";
import { todayLocalKey } from "@/lib/date-key";

interface ReminderBannerProps {
  daysToNextPeriod: number;
  metrics: HealthMetricRow[];
}

export default function ReminderBanner({ daysToNextPeriod, metrics }: ReminderBannerProps) {
  const { data: reminders = [] } = useReminders();
  const [dismissed, setDismissed] = useState<string | null>(null);

  const periodReminder = reminders.find((r) => r.type === "period_upcoming");
  const logReminder = reminders.find((r) => r.type === "log_daily");

  // B4: trước đây dùng `toISOString().slice(0, 10)` — quy đổi UTC trước khi
  // format nên từ 00:00 đến 06:59 giờ VN vẫn còn tính là NGÀY HÔM QUA, khiến
  // banner "Nhắc log hôm nay" hiện sai (báo chưa log dù đã log ngay trước đó
  // trong đêm, hoặc ngược lại). Xem giải thích đầy đủ ở `lib/date-key.ts`.
  const todayStr = todayLocalKey();
  const loggedToday = metrics.some((m) => m.logged_at === todayStr);

  // Ưu tiên 1: sắp đến kỳ kinh trong vòng lead_days ngày.
  const showPeriodReminder =
    periodReminder?.enabled &&
    daysToNextPeriod >= 0 &&
    daysToNextPeriod <= (periodReminder.lead_days ?? 2);

  // Ưu tiên 2: chưa log gì hôm nay và có bật nhắc log hàng ngày.
  const showLogReminder = !showPeriodReminder && logReminder?.enabled && !loggedToday;

  const key = showPeriodReminder ? "period" : showLogReminder ? "log" : null;

  if (!key || dismissed === key) return null;

  if (key === "period") {
    return (
      <div
        className="glass-card flex items-center gap-3 rounded-[20px] p-4"
        style={{ background: "color-mix(in srgb, var(--c-period) 10%, var(--surface))" }}
      >
        <span
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-white"
          style={{ background: "var(--c-period)" }}
        >
          <BellRing size={16} />
        </span>
        <p className="flex-1 text-sm font-medium text-[var(--ink)]">
          {daysToNextPeriod === 0
            ? "Kỳ kinh dự kiến bắt đầu hôm nay."
            : `Còn ${daysToNextPeriod} ngày nữa tới kỳ kinh dự kiến.`}
        </p>
        <button
          type="button"
          onClick={() => setDismissed("period")}
          className="rounded-full p-1 text-[var(--ink-faint)] hover:bg-black/5"
        >
          <X size={16} />
        </button>
      </div>
    );
  }

  return (
    <div
      className="glass-card flex items-center gap-3 rounded-[20px] p-4"
      style={{ background: "color-mix(in srgb, var(--c-hydration) 10%, var(--surface))" }}
    >
      <span
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-white"
        style={{ background: "var(--c-hydration)" }}
      >
        <NotebookPen size={16} />
      </span>
      <p className="flex-1 text-sm font-medium text-[var(--ink)]">
        Bạn chưa ghi log gì hôm nay. Dành 30 giây cập nhật nhé!
      </p>
      <Link
        href="/log"
        className="shrink-0 rounded-full px-3 py-1.5 text-xs font-semibold text-white"
        style={{ background: "var(--c-hydration)" }}
      >
        Ghi ngay
      </Link>
      <button
        type="button"
        onClick={() => setDismissed("log")}
        className="rounded-full p-1 text-[var(--ink-faint)] hover:bg-black/5"
      >
        <X size={16} />
      </button>
    </div>
  );
}
