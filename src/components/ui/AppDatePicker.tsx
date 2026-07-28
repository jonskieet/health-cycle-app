"use client";

// AppDatePicker — bottom-sheet chọn ngày tự vẽ, thay thế hoàn toàn <input type="date">.
// Dùng chung cho toàn app: chọn 1 ngày (BBT, cân nặng, que thử...) hoặc chọn khoảng
// ngày (bắt đầu -> kết thúc kỳ kinh). Nhận/trả về string "YYYY-MM-DD" để tương thích
// 100% với logic hiện có trong queries.ts (useAddCycleLog, useUpdateCycleLog...).

import { useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, X } from "lucide-react";

const WEEKDAYS = ["T2", "T3", "T4", "T5", "T6", "T7", "CN"];
const MONTH_NAMES = [
  "Tháng 1", "Tháng 2", "Tháng 3", "Tháng 4", "Tháng 5", "Tháng 6",
  "Tháng 7", "Tháng 8", "Tháng 9", "Tháng 10", "Tháng 11", "Tháng 12",
];

function toKey(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function fromKey(key: string): Date | null {
  if (!key) return null;
  const [y, m, d] = key.split("-").map(Number);
  if (!y || !m || !d) return null;
  return new Date(y, m - 1, d);
}

function formatDisplay(key: string) {
  const d = fromKey(key);
  if (!d) return "Chọn ngày";
  return `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()}`;
}

function isSameDay(a: Date | null, b: Date | null) {
  if (!a || !b) return false;
  return a.toDateString() === b.toDateString();
}

interface SingleProps {
  mode?: "single";
  value: string;
  onChange: (value: string) => void;
  label?: string;
  placeholder?: string;
  maxDate?: Date;
  loggedDates?: string[];
  required?: boolean;
}

interface RangeProps {
  mode: "range";
  startValue: string;
  endValue: string;
  onChangeStart: (value: string) => void;
  onChangeEnd: (value: string) => void;
  startLabel?: string;
  endLabel?: string;
  maxDate?: Date;
  loggedDates?: string[];
}

type Props = SingleProps | RangeProps;

export default function AppDatePicker(props: Props) {
  const [open, setOpen] = useState(false);
  const isRange = props.mode === "range";

  const initialAnchor = isRange
    ? fromKey((props as RangeProps).startValue) ?? new Date()
    : fromKey((props as SingleProps).value) ?? new Date();

  const [cursor, setCursor] = useState(() => new Date(initialAnchor.getFullYear(), initialAnchor.getMonth(), 1));
  // Trong chế độ range: bước 1 chọn ngày bắt đầu, bước 2 chọn ngày kết thúc.
  const [rangeStep, setRangeStep] = useState<"start" | "end">("start");

  // Reset con trỏ tháng + bước chọn range mỗi khi sheet MỞ LẠI (đồng bộ UI
  // với giá trị `props.value`/`startValue` hiện tại) — chỉ chạy khi `open`
  // đổi từ false -> true, không phải mỗi lần props đổi trong lúc đang mở,
  // nên không có cascading render lặp. Không thể tính trong lúc render vì
  // `cursor` cần giữ nguyên khi user bấm next/prev tháng lúc sheet đang mở.
  useEffect(() => {
    if (!open) return;
    const anchor = isRange
      ? fromKey((props as RangeProps).startValue) ?? new Date()
      : fromKey((props as SingleProps).value) ?? new Date();
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setCursor(new Date(anchor.getFullYear(), anchor.getMonth(), 1));
    setRangeStep("start");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const maxDate = props.maxDate ?? new Date();
  const loggedSet = useMemo(() => new Set(props.loggedDates ?? []), [props.loggedDates]);

  const cells = useMemo(() => {
    const year = cursor.getFullYear();
    const month = cursor.getMonth();
    const firstDay = new Date(year, month, 1);
    const startOffset = (firstDay.getDay() + 6) % 7; // Thứ 2 = 0
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const out: (Date | null)[] = Array(startOffset).fill(null);
    for (let d = 1; d <= daysInMonth; d++) out.push(new Date(year, month, d));
    return out;
  }, [cursor]);

  const today = new Date();
  const startDate = isRange ? fromKey((props as RangeProps).startValue) : fromKey((props as SingleProps).value);
  const endDate = isRange ? fromKey((props as RangeProps).endValue) : null;

  function pickDate(d: Date) {
    if (d > maxDate) return;
    const key = toKey(d);
    if (!isRange) {
      (props as SingleProps).onChange(key);
      setOpen(false);
      return;
    }
    const rp = props as RangeProps;
    if (rangeStep === "start") {
      rp.onChangeStart(key);
      // Nếu ngày kết thúc hiện có trước ngày bắt đầu mới -> reset
      const currentEnd = fromKey(rp.endValue);
      if (currentEnd && currentEnd < d) rp.onChangeEnd("");
      setRangeStep("end");
    } else {
      const s = fromKey(rp.startValue);
      if (s && d < s) {
        // chọn ngược -> coi ngày này là ngày bắt đầu mới
        rp.onChangeStart(key);
        rp.onChangeEnd("");
        return;
      }
      rp.onChangeEnd(key);
      setOpen(false);
    }
  }

  function dayState(d: Date) {
    const isToday = isSameDay(d, today);
    const isFuture = d > maxDate;
    const isStart = isSameDay(d, startDate);
    const isEnd = isRange && isSameDay(d, endDate);
    const inRange = isRange && startDate && endDate && d > startDate && d < endDate;
    const hasLog = loggedSet.has(toKey(d));
    return { isToday, isFuture, isStart, isEnd, inRange, hasLog };
  }

  const triggerLabel = isRange
    ? `${formatDisplay((props as RangeProps).startValue)}${(props as RangeProps).endValue ? " → " + formatDisplay((props as RangeProps).endValue) : ""}`
    : formatDisplay((props as SingleProps).value);

  return (
    <div className="flex flex-col gap-1.5">
      {!isRange && (props as SingleProps).label && (
        <span className="text-xs font-medium text-[var(--ink-soft)]">{(props as SingleProps).label}</span>
      )}
      {isRange && (
        <span className="text-xs font-medium text-[var(--ink-soft)]">
          {(props as RangeProps).startLabel ?? "Ngày bắt đầu"} → {(props as RangeProps).endLabel ?? "Ngày kết thúc"}
        </span>
      )}
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 rounded-2xl bg-black/[0.03] px-3 py-2.5 text-left text-sm text-[var(--ink)] outline-none transition active:scale-[0.98]"
      >
        <CalendarIcon size={16} className="shrink-0 text-[var(--ink-faint)]" />
        <span className={!isRange && !(props as SingleProps).value ? "text-[var(--ink-faint)]" : ""}>
          {triggerLabel}
        </span>
      </button>

      {open && (
        <div
          className="fixed inset-0 z-40 flex items-end justify-center bg-black/55 backdrop-blur-[2px]"
          onClick={() => setOpen(false)}
        >
          <div
            className="flex w-full max-w-md flex-col gap-4 rounded-t-[28px] p-6 pt-3"
            style={{
              background: "var(--surface)",
              boxShadow: "0 -8px 40px -8px rgba(36,27,47,0.35)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mx-auto h-1 w-10 rounded-full" style={{ background: "var(--ink-faint)", opacity: 0.4 }} />
            <div className="flex items-center justify-between">
              <h3 className="font-display text-sm font-bold text-[var(--ink)]">
                {isRange
                  ? rangeStep === "start"
                    ? (props as RangeProps).startLabel ?? "Chọn ngày bắt đầu"
                    : (props as RangeProps).endLabel ?? "Chọn ngày kết thúc"
                  : "Chọn ngày"}
              </h3>
              <button type="button" onClick={() => setOpen(false)} className="rounded-full p-1.5 hover:bg-black/5">
                <X size={18} />
              </button>
            </div>

            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={() => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() - 1, 1))}
                className="rounded-full p-1.5 text-[var(--ink-soft)] hover:bg-black/5"
              >
                <ChevronLeft size={18} />
              </button>
              <span className="font-display text-sm font-bold text-[var(--ink)]">
                {MONTH_NAMES[cursor.getMonth()]} {cursor.getFullYear()}
              </span>
              <button
                type="button"
                onClick={() => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1))}
                className="rounded-full p-1.5 text-[var(--ink-soft)] hover:bg-black/5"
              >
                <ChevronRight size={18} />
              </button>
            </div>

            <div className="grid grid-cols-7 gap-y-2 text-center">
              {WEEKDAYS.map((w) => (
                <span key={w} className="text-[10px] font-medium text-[var(--ink-faint)]">
                  {w}
                </span>
              ))}
              {cells.map((d, i) => {
                if (!d) return <div key={i} />;
                const { isToday, isFuture, isStart, isEnd, inRange, hasLog } = dayState(d);
                const selected = isStart || isEnd;
                return (
                  <div key={i} className="flex justify-center">
                    <button
                      type="button"
                      disabled={isFuture}
                      onClick={() => pickDate(d)}
                      className="relative flex h-9 w-9 items-center justify-center rounded-full text-xs font-medium transition active:scale-90 disabled:opacity-30"
                      style={{
                        background: selected
                          ? "var(--c-period)"
                          : inRange
                            ? "rgba(232,92,138,0.16)"
                            : "transparent",
                        color: selected ? "#fff" : "var(--ink)",
                        outline: isToday && !selected ? "1.5px solid var(--c-ovulation)" : "none",
                        outlineOffset: 1,
                      }}
                    >
                      {d.getDate()}
                      {hasLog && !selected && (
                        <span
                          className="absolute bottom-0.5 h-1 w-1 rounded-full"
                          style={{ background: "var(--c-fertile)" }}
                        />
                      )}
                    </button>
                  </div>
                );
              })}
            </div>

            <button
              type="button"
              onClick={() => {
                const t = new Date();
                setCursor(new Date(t.getFullYear(), t.getMonth(), 1));
                pickDate(t);
              }}
              className="self-center rounded-full bg-black/[0.04] px-4 py-1.5 text-xs font-semibold text-[var(--ink-soft)]"
            >
              Hôm nay
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
