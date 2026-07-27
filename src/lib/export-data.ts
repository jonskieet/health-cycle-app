// Module 12 — Sao lưu / Xuất dữ liệu (P12: "Sao lưu qua Dropbox / cloud backup riêng").
//
// Quyết định phạm vi (ghi trong Nhật ký triển khai):
// Dữ liệu đã nằm trên Supabase cloud nên không cần backup ra dịch vụ ngoài (Dropbox)
// như Clover — thay vào đó cung cấp "Xuất dữ liệu" dạng file JSON tải về máy, đúng
// hướng thay thế đã ghi sẵn trong roadmap gốc (mục P12/F10). File JSON dùng làm bản
// sao lưu cá nhân, không phải cơ chế đồng bộ 2 chiều.
//
// Business logic thuần — không phụ thuộc React/hook, chỉ nhận dữ liệu đã fetch sẵn
// từ các hook trong queries.ts rồi build ra 1 object JSON duy nhất + tải file.

import { CycleLogFull, HealthMetricRow, Appointment, Reminder, KegelSession, FatigueTestResult, Profile } from "@/lib/queries";

export interface FullDataExport {
  exported_at: string;
  app: "KVCycle";
  export_version: 1;
  profile: Partial<Profile> | null;
  cycle_logs: CycleLogFull[];
  health_metrics: HealthMetricRow[];
  appointments: Appointment[];
  reminders: Reminder[];
  kegel_sessions: KegelSession[];
  fatigue_tests: FatigueTestResult[];
}

// Các field nhạy cảm/nội bộ không nên nằm trong file backup mang đi chia sẻ:
// PIN hash (bảo mật) và is_vip/vip_activated_at (server tự quản lý, import lại không có
// tác dụng vì bị trigger `protect_vip_columns` chặn — giữ trong export sẽ gây hiểu nhầm).
const PROFILE_EXCLUDE_KEYS: (keyof Profile)[] = [
  "app_lock_pin_hash",
  "is_vip",
  "vip_activated_at",
];

export function buildFullDataExport(data: {
  profile: Profile | null | undefined;
  cycleLogs: CycleLogFull[] | undefined;
  healthMetrics: HealthMetricRow[] | undefined;
  appointments: Appointment[] | undefined;
  reminders: Reminder[] | undefined;
  kegelSessions: KegelSession[] | undefined;
  fatigueTests: FatigueTestResult[] | undefined;
}): FullDataExport {
  let profile: Partial<Profile> | null = null;
  if (data.profile) {
    profile = { ...data.profile };
    for (const key of PROFILE_EXCLUDE_KEYS) delete profile[key];
  }

  return {
    exported_at: new Date().toISOString(),
    app: "KVCycle",
    export_version: 1,
    profile,
    cycle_logs: data.cycleLogs ?? [],
    health_metrics: data.healthMetrics ?? [],
    appointments: data.appointments ?? [],
    reminders: data.reminders ?? [],
    kegel_sessions: data.kegelSessions ?? [],
    fatigue_tests: data.fatigueTests ?? [],
  };
}

// Đếm nhanh tổng số bản ghi để hiển thị trước khi tải (giúp user hình dung dữ liệu có gì).
export function countExportRecords(exportData: FullDataExport): number {
  return (
    exportData.cycle_logs.length +
    exportData.health_metrics.length +
    exportData.appointments.length +
    exportData.reminders.length +
    exportData.kegel_sessions.length +
    exportData.fatigue_tests.length
  );
}

function todayStamp(): string {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}`;
}

// Tải file JSON về máy — chạy client-side thuần bằng Blob + thẻ <a>, không qua server,
// giống cách export-report.ts đang làm cho PDF (không thêm dependency mới).
export function downloadFullDataExport(exportData: FullDataExport) {
  const json = JSON.stringify(exportData, null, 2);
  const blob = new Blob([json], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `kvcycle-backup-${todayStamp()}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
