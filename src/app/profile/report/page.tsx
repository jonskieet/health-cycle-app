"use client";

import { useMemo } from "react";
import Link from "next/link";
import { ArrowLeft, Printer, FileDown } from "lucide-react";
import { useProfile, useCycleLogs, useHealthMetrics, MetricType } from "@/lib/queries";
import { predictCycle, buildCycleHistory } from "@/lib/cycle-utils";
import { isVipProfile } from "@/lib/vip";
import LockedFeature from "@/components/profile/LockedFeature";

const METRIC_LABELS: Record<MetricType, string> = {
  stress: "Stress (pts)",
  heart_rate: "Nhịp tim (bpm)",
  sleep: "Giấc ngủ (giờ)",
  hydration: "Hydration (ml)",
  mood: "Tâm trạng",
  weight: "Cân nặng (kg)",
  bbt: "Nhiệt độ cơ bản (°C)",
};

export default function HealthReportPage() {
  const { data: profile } = useProfile();
  const { data: cycleLogs = [] } = useCycleLogs();
  const { data: metrics = [] } = useHealthMetrics();
  const vip = isVipProfile(profile);

  const avgCycleLength = profile?.avg_cycle_length ?? 28;
  const avgPeriodLength = profile?.avg_period_length ?? 5;
  // Module C4: trang này còn build cả PDF (jspdf) khi bấm xuất — tránh tính
  // lại predictCycle()/buildCycleHistory() (đều lặp toàn bộ cycleLogs) ở
  // mỗi lần re-render không liên quan.
  const prediction = useMemo(
    () => predictCycle(cycleLogs, { avgCycleLength, avgPeriodLength }),
    [cycleLogs, avgCycleLength, avgPeriodLength]
  );
  const history = useMemo(() => buildCycleHistory(cycleLogs).slice(0, 6), [cycleLogs]);

  const metricsByDate = new Map<string, Partial<Record<MetricType, number>>>();
  metrics.forEach((m) => {
    const row = metricsByDate.get(m.logged_at) ?? {};
    row[m.metric_type] = m.value;
    metricsByDate.set(m.logged_at, row);
  });
  const metricDates = Array.from(metricsByDate.keys()).sort((a, b) => (a < b ? 1 : -1));

  // Module C2: `jspdf` + `jspdf-autotable` khá nặng và CHỈ dùng khi user bấm
  // nút này — trước đây `export-report.ts` được import tĩnh ở đầu file nên
  // jsPDF luôn nằm trong chunk của trang report, tải ngay cả khi user chỉ
  // ghé xem báo cáo rồi bấm "In" (window.print, không cần jsPDF) chứ không
  // xuất PDF. Chuyển sang dynamic import ngay tại thời điểm bấm nút.
  async function handleExportPdf() {
    const { buildAndDownloadReportPdf } = await import("@/lib/export-report");
    buildAndDownloadReportPdf({
      displayName: profile?.display_name || "Người dùng",
      avgCycleLength: prediction.avgCycleLength,
      avgPeriodLength: prediction.avgPeriodLength,
      totalCyclesLogged: cycleLogs.length,
      history,
      metricLabels: METRIC_LABELS,
      metricsByDate,
      metricDates,
    });
  }

  return (
    <main className="report-page flex flex-1 flex-col gap-6 px-5 pt-8 pb-10">
      <header className="report-hide flex items-center justify-between">
        <Link
          href="/profile"
          className="flex h-9 w-9 items-center justify-center rounded-full glass-card"
        >
          <ArrowLeft size={16} className="text-[var(--ink)]" />
        </Link>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => window.print()}
            className="flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold text-[var(--ink)] glass-card"
          >
            <Printer size={15} />
            In
          </button>
          <LockedFeature locked={!vip} title="Xuất PDF cho bác sĩ">
            <button
              type="button"
              onClick={handleExportPdf}
              className="flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold text-white"
              style={{ background: "var(--c-sleep)" }}
            >
              <FileDown size={15} />
              Xuất PDF
            </button>
          </LockedFeature>
        </div>
      </header>

      <div>
        <h1 className="font-display text-xl font-bold text-[var(--ink)]">
          Báo cáo sức khỏe — KVCycle
        </h1>
        <p className="mt-1 text-xs text-[var(--ink-soft)]">
          {profile?.display_name || "Người dùng"} · Xuất ngày{" "}
          {new Date().toLocaleDateString("vi-VN")}
        </p>
      </div>

      <section className="glass-card rounded-[20px] p-5">
        <p className="mb-3 text-xs font-medium uppercase tracking-wide text-[var(--ink-faint)]">
          Tổng quan chu kỳ
        </p>
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <p className="text-[var(--ink-faint)]">Độ dài chu kỳ trung bình</p>
            <p className="font-semibold text-[var(--ink)]">{prediction.avgCycleLength} ngày</p>
          </div>
          <div>
            <p className="text-[var(--ink-faint)]">Độ dài hành kinh trung bình</p>
            <p className="font-semibold text-[var(--ink)]">{prediction.avgPeriodLength} ngày</p>
          </div>
          <div>
            <p className="text-[var(--ink-faint)]">Kỳ kinh gần nhất bắt đầu</p>
            <p className="font-semibold text-[var(--ink)]">
              {history[0]
                ? new Date(history[0].start_date).toLocaleDateString("vi-VN")
                : "Chưa có dữ liệu"}
            </p>
          </div>
          <div>
            <p className="text-[var(--ink-faint)]">Tổng số kỳ đã ghi nhận</p>
            <p className="font-semibold text-[var(--ink)]">{cycleLogs.length}</p>
          </div>
        </div>
      </section>

      {history.length > 0 && (
        <section className="glass-card rounded-[20px] p-5">
          <p className="mb-3 text-xs font-medium uppercase tracking-wide text-[var(--ink-faint)]">
            Lịch sử chu kỳ gần đây
          </p>
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="text-xs text-[var(--ink-faint)]">
                <th className="pb-2 font-medium">Bắt đầu</th>
                <th className="pb-2 font-medium">Độ dài kỳ kinh</th>
                <th className="pb-2 font-medium">Độ dài chu kỳ</th>
              </tr>
            </thead>
            <tbody>
              {history.map((h) => (
                <tr key={h.id} className="border-t border-black/[0.06]">
                  <td className="py-2 text-[var(--ink)]">
                    {new Date(h.start_date).toLocaleDateString("vi-VN")}
                  </td>
                  <td className="py-2 text-[var(--ink)]">
                    {h.periodLength != null ? `${h.periodLength} ngày` : "—"}
                  </td>
                  <td className="py-2 text-[var(--ink)]">
                    {h.cycleLength != null ? `${h.cycleLength} ngày` : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      )}

      {metricDates.length > 0 && (
        <section className="glass-card rounded-[20px] p-5">
          <p className="mb-3 text-xs font-medium uppercase tracking-wide text-[var(--ink-faint)]">
            Chỉ số sức khỏe gần đây
          </p>
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="text-xs text-[var(--ink-faint)]">
                <th className="pb-2 pr-2 font-medium">Ngày</th>
                {(Object.keys(METRIC_LABELS) as MetricType[]).map((type) => (
                  <th key={type} className="pb-2 pr-2 font-medium">
                    {METRIC_LABELS[type]}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {metricDates.map((date) => {
                const row = metricsByDate.get(date)!;
                return (
                  <tr key={date} className="border-t border-black/[0.06]">
                    <td className="py-2 pr-2 text-[var(--ink)]">
                      {new Date(date).toLocaleDateString("vi-VN")}
                    </td>
                    {(Object.keys(METRIC_LABELS) as MetricType[]).map((type) => (
                      <td key={type} className="py-2 pr-2 text-[var(--ink)]">
                        {row[type] ?? "—"}
                      </td>
                    ))}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </section>
      )}

      <p className="report-hide text-center text-[11px] text-[var(--ink-faint)]">
        Báo cáo này được tạo tự động từ dữ liệu bạn tự ghi nhận trên KVCycle, chỉ mang tính tham
        khảo và không thay thế chẩn đoán y khoa.
      </p>
    </main>
  );
}
