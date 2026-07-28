"use client";

// Banner cảnh báo chu kỳ/hành kinh bất thường — hiển thị CHỦ ĐỘNG ở trang chủ & trang Chu kỳ.
// Trước đây `abnormalCycle`/`abnormalPeriod`/`irregular` (từ cycle-utils.ts) chỉ được
// tính toán và hiển thị bị động trong CycleInsights.tsx ở /profile — user phải tự vào
// xem mới biết. Component này đưa cảnh báo lên ngay nơi user mở app hằng ngày.

import { useState } from "react";
import { AlertTriangle, X } from "lucide-react";
import {
  buildCycleHistory,
  summarizeCycleHistory,
  NORMAL_CYCLE_RANGE,
  NORMAL_PERIOD_RANGE,
  type CycleLog,
} from "@/lib/cycle-utils";

export default function AbnormalCycleBanner({ cycleLogs }: { cycleLogs: CycleLog[] }) {
  const [dismissed, setDismissed] = useState(false);

  const history = buildCycleHistory(cycleLogs);
  const summary = summarizeCycleHistory(history);

  const messages: string[] = [];
  if (summary.previousCycleAbnormal && summary.previousCycleLength != null) {
    // D4: câu cũ đọc như báo cáo xét nghiệm ("dài X ngày — ngoài khoảng bình
    // thường Y-Z ngày") — đổi giọng gần gũi hơn, vẫn giữ nguyên số liệu chính
    // xác (đây là banner cảnh báo hiện chủ động hằng ngày, cần đúng mực nhưng
    // không nên gây cảm giác như đọc kết quả xét nghiệm y khoa).
    messages.push(
      `Chu kỳ gần nhất của bạn kéo dài ${summary.previousCycleLength} ngày, hơi ngoài mức thường gặp (${NORMAL_CYCLE_RANGE.min}-${NORMAL_CYCLE_RANGE.max} ngày).`
    );
  }
  if (summary.previousPeriodAbnormal && summary.previousPeriodLength != null) {
    messages.push(
      `Kỳ kinh gần nhất kéo dài ${summary.previousPeriodLength} ngày, hơi ngoài mức thường gặp (${NORMAL_PERIOD_RANGE.min}-${NORMAL_PERIOD_RANGE.max} ngày).`
    );
  }
  if (summary.irregular && summary.cycleLengthDelta != null) {
    messages.push(
      `Độ dài chu kỳ gần đây thay đổi khá nhiều, chênh khoảng ${summary.cycleLengthDelta} ngày so với lần trước.`
    );
  }

  if (dismissed || messages.length === 0) return null;

  return (
    <section
      className="flex items-start gap-3 rounded-[22px] p-4"
      style={{ background: "color-mix(in srgb, var(--c-period) 12%, var(--surface))" }}
    >
      <span
        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-white"
        style={{ background: "var(--c-period)" }}
      >
        <AlertTriangle size={15} />
      </span>
      <div className="flex-1">
        <p className="text-sm font-semibold text-[var(--ink)]">Có điểm cần chú ý</p>
        <ul className="mt-1 flex flex-col gap-0.5">
          {messages.map((m) => (
            <li key={m} className="text-xs leading-relaxed text-[var(--ink-soft)]">
              {m}
            </li>
          ))}
        </ul>
        <p className="mt-1.5 text-[11px] text-[var(--ink-faint)]">
          Đây chỉ là quan sát tham khảo dựa trên dữ liệu bạn ghi nhận, không thay thế chẩn đoán y
          khoa. Nếu lo lắng, hãy đặt lịch hẹn với bác sĩ.
        </p>
      </div>
      <button
        type="button"
        onClick={() => setDismissed(true)}
        className="shrink-0 rounded-full p-1 text-[var(--ink-faint)]"
        aria-label="Đóng cảnh báo"
      >
        <X size={14} />
      </button>
    </section>
  );
}
