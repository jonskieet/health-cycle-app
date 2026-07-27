// Module 4 — Xuất báo cáo PDF cho bác sĩ (VIP).
// Dùng jsPDF + jspdf-autotable (chạy client-side, không cần server) để tạo file
// PDF thật tải về máy, khác với nút "In / Lưu PDF" cũ (window.print — vẫn giữ
// nguyên vì một số user thích in trực tiếp, nhưng phụ thuộc trình duyệt/máy in
// ảo, không phải file PDF "thật" nằm sẵn trên máy để gửi qua Zalo/email).
//
// Business logic thuần (không phụ thuộc React) theo đúng convention dự án:
// nhận dữ liệu đã tính sẵn từ cycle-utils.ts / queries.ts, không tự query DB.

import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { CycleHistoryEntry } from "@/lib/cycle-utils";
import { MetricType } from "@/lib/queries";

export interface DoctorReportData {
  displayName: string;
  avgCycleLength: number;
  avgPeriodLength: number;
  totalCyclesLogged: number;
  history: CycleHistoryEntry[]; // đã slice sẵn số kỳ muốn hiển thị (vd 6 kỳ gần nhất)
  metricLabels: Record<MetricType, string>;
  metricsByDate: Map<string, Partial<Record<MetricType, number>>>;
  metricDates: string[]; // đã sort giảm dần, đã có sẵn từ trang report
}

const METRIC_ORDER: MetricType[] = [
  "heart_rate",
  "sleep",
  "stress",
  "hydration",
  "mood",
  "weight",
  "bbt",
];

export function buildAndDownloadReportPdf(data: DoctorReportData) {
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const marginX = 40;
  let y = 50;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.text("Báo cáo sức khỏe — KVCycle", marginX, y);

  y += 20;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(110, 110, 110);
  doc.text(
    `${data.displayName || "Người dùng"} · Xuất ngày ${new Date().toLocaleDateString("vi-VN")}`,
    marginX,
    y
  );
  doc.setTextColor(20, 20, 20);

  y += 24;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.text("Tổng quan chu kỳ", marginX, y);

  y += 8;
  autoTable(doc, {
    startY: y,
    theme: "plain",
    styles: { fontSize: 10, cellPadding: 4 },
    body: [
      ["Độ dài chu kỳ trung bình", `${data.avgCycleLength} ngày`],
      ["Độ dài hành kinh trung bình", `${data.avgPeriodLength} ngày`],
      [
        "Kỳ kinh gần nhất bắt đầu",
        data.history[0]
          ? new Date(data.history[0].start_date).toLocaleDateString("vi-VN")
          : "Chưa có dữ liệu",
      ],
      ["Tổng số kỳ đã ghi nhận", `${data.totalCyclesLogged}`],
    ],
    margin: { left: marginX, right: marginX },
  });

  // @ts-expect-error - jspdf-autotable gắn lastAutoTable vào instance doc lúc runtime
  y = doc.lastAutoTable.finalY + 24;

  if (data.history.length > 0) {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.text("Lịch sử chu kỳ gần đây", marginX, y);
    y += 8;

    autoTable(doc, {
      startY: y,
      head: [["Bắt đầu", "Độ dài kỳ kinh", "Độ dài chu kỳ", "Bất thường"]],
      body: data.history.map((h) => [
        new Date(h.start_date).toLocaleDateString("vi-VN"),
        h.periodLength != null ? `${h.periodLength} ngày` : "—",
        h.cycleLength != null ? `${h.cycleLength} ngày` : "—",
        h.abnormalCycle || h.abnormalPeriod ? "Có" : "Không",
      ]),
      styles: { fontSize: 9, cellPadding: 5 },
      headStyles: { fillColor: [124, 111, 240] },
      margin: { left: marginX, right: marginX },
    });

    // @ts-expect-error - jspdf-autotable gắn lastAutoTable vào instance doc lúc runtime
    y = doc.lastAutoTable.finalY + 24;
  }

  if (data.metricDates.length > 0) {
    if (y > 680) {
      doc.addPage();
      y = 50;
    }
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.text("Chỉ số sức khỏe gần đây", marginX, y);
    y += 8;

    const presentTypes = METRIC_ORDER.filter((type) =>
      data.metricDates.some((date) => data.metricsByDate.get(date)?.[type] != null)
    );

    autoTable(doc, {
      startY: y,
      head: [["Ngày", ...presentTypes.map((t) => data.metricLabels[t])]],
      body: data.metricDates.map((date) => {
        const row = data.metricsByDate.get(date)!;
        return [
          new Date(date).toLocaleDateString("vi-VN"),
          ...presentTypes.map((t) => (row[t] != null ? String(row[t]) : "—")),
        ];
      }),
      styles: { fontSize: 8, cellPadding: 4 },
      headStyles: { fillColor: [124, 111, 240] },
      margin: { left: marginX, right: marginX },
    });
  }

  doc.setFontSize(8);
  doc.setTextColor(140, 140, 140);
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.text(
      "Báo cáo tự động từ dữ liệu tự ghi nhận trên KVCycle — chỉ mang tính tham khảo, không thay thế chẩn đoán y khoa.",
      marginX,
      810
    );
  }

  const filenameDate = new Date().toISOString().slice(0, 10);
  doc.save(`bao-cao-suc-khoe-kvcycle-${filenameDate}.pdf`);
}
