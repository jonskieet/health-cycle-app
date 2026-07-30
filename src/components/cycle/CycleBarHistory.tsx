"use client";

import { useMemo } from "react";
import type { CycleHistoryEntry } from "@/lib/cycle-utils";

// J1 (MAJOR_REDESIGN_BRIEF.md): thay "Lịch sử gần đây" dạng danh sách chữ
// phẳng bằng biểu đồ CỘT theo tháng — mỗi cột = 1 kỳ kinh gần đây, chiều
// cao theo `periodLength` (số ngày hành kinh). Tháng gần nhất (index 0 sau
// khi đảo mảng để hiện bên phải) tô ĐẶC màu accent + nhãn bubble nổi phía
// trên ghi rõ số ngày, giống `ref-01-cycle-bar-history.png` /
// `ref-04-reports-bar-history.png`. Các cột cũ hơn dùng hoạ tiết CHẤM BI mờ
// (SVG <pattern>, không phải chỉ giảm opacity) để phân biệt "đã qua" —
// đúng chi tiết hoạ tiết trong ảnh tham khảo, khác `MiniBars.tsx` (chỉ hạ
// opacity, dùng cho biểu đồ tuần nhỏ khác).
//
// `accentColor` truyền vào là 1 CSS color (thường là `var(--c-period)` hay
// `var(--c-fertile)`) — đổi theo màu chủ đề của trang đang xem, không cố
// định 1 màu (ảnh 01 tông tím, ảnh 04 tông cam dù cùng 1 kiểu biểu đồ).

const CHART_HEIGHT = 108;
const MAX_MONTHS = 6;

function monthLabel(dateStr: string) {
  const d = new Date(dateStr);
  return `T${d.getMonth() + 1}`;
}

export default function CycleBarHistory({
  history,
  accentColor,
}: {
  history: CycleHistoryEntry[];
  accentColor: string;
}) {
  // `history` đến từ `buildCycleHistory()` — mới nhất trước. Lấy tối đa 6 kỳ
  // gần nhất rồi đảo lại để cột mới nhất nằm bên PHẢI (đọc trái→phải theo
  // thời gian, giống trục thời gian tự nhiên và giống ảnh tham khảo).
  const bars = useMemo(() => {
    return history
      .slice(0, MAX_MONTHS)
      .filter((h) => h.periodLength != null)
      .slice()
      .reverse();
  }, [history]);

  if (bars.length === 0) return null;

  const max = Math.max(...bars.map((b) => b.periodLength ?? 0), 1);

  // Hoạ tiết "chấm bi mờ" cho cột đã qua — dựng bằng radial-gradient lặp lại
  // (áp dụng trực tiếp cho `background` của div), thay vì SVG <pattern> vốn
  // chỉ hoạt động với `fill` trong ngữ cảnh SVG chứ không phải CSS background
  // của phần tử HTML thường.
  const dotTexture = `radial-gradient(circle, ${accentColor} 1.1px, transparent 1.3px)`;

  return (
    <div className="w-full">
      <div className="flex w-full items-end justify-between gap-2 px-1" style={{ height: CHART_HEIGHT + 34 }}>
        {bars.map((bar, i) => {
          const isCurrent = i === bars.length - 1;
          const heightPx = Math.max((bar.periodLength! / max) * CHART_HEIGHT, 18);
          return (
            <div key={bar.id} className="flex min-w-0 flex-1 flex-col items-center">
              {/* Nhãn bubble nổi phía trên — chỉ cột hiện tại, giống "5day" trong ảnh 01. */}
              <div className="flex h-7 items-end">
                {isCurrent && (
                  <span
                    className="rounded-full px-2 py-0.5 text-[10px] font-bold text-white shadow-sm"
                    style={{ background: accentColor }}
                  >
                    {bar.periodLength}d
                  </span>
                )}
              </div>
              <div
                className="relative w-full max-w-[26px] overflow-hidden rounded-full"
                style={{ height: CHART_HEIGHT }}
              >
                {/* Track nền mờ cao hết khung — luôn có "trần" tham chiếu. */}
                <div
                  className="absolute inset-0 rounded-full"
                  style={{ background: accentColor, opacity: 0.08 }}
                />
                <div
                  className="absolute bottom-0 w-full rounded-full transition-all"
                  style={{
                    height: heightPx,
                    background: isCurrent
                      ? accentColor
                      : `${dotTexture}, color-mix(in srgb, ${accentColor} 10%, var(--surface))`,
                    backgroundSize: isCurrent ? undefined : "6px 6px",
                    border: isCurrent ? "none" : `1px solid color-mix(in srgb, ${accentColor} 35%, transparent)`,
                  }}
                >
                  {/* Nhãn số ngày nhỏ bên trong mỗi cột (không chỉ cột hiện tại),
                      giống các nhãn "3day"/"4day" nhỏ trong ảnh 01. */}
                  {heightPx >= 30 && (
                    <span
                      className="absolute bottom-1 left-1/2 -translate-x-1/2 text-[9px] font-semibold"
                      style={{ color: isCurrent ? "#fff" : accentColor }}
                    >
                      {bar.periodLength}
                    </span>
                  )}
                </div>
              </div>
              <span className="mt-1.5 text-[10px] text-[var(--ink-faint)]">
                {monthLabel(bar.start_date)}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
