"use client";

// Module J1 (CONTROLS_REFINEMENT_ROADMAP.md) — component slider dùng chung,
// thay 6 chỗ `<input type="range">` mặc định trình duyệt (track/thumb hệ điều
// hành, không đồng bộ ngôn ngữ thiết kế bo tròn mềm mại của app). Vẫn dựng
// trên input range thật (giữ accessibility — bàn phím, screen reader, kéo
// chuột/tay đều chuẩn), chỉ ẩn appearance mặc định và vẽ track/thumb riêng đè
// lên bằng 1 lớp div phủ, không dựng lại logic kéo-thả bằng JS thuần.

import { useState } from "react";

interface SliderControlProps {
  min: number;
  max: number;
  step?: number;
  value: number;
  onChange: (value: number) => void;
  /** Màu accent theo từng nơi dùng (period, sleep...), không hard-code. */
  accentColor: string;
  disabled?: boolean;
  /** Hiện giá trị nổi ngay trên thumb khi đang kéo — tuỳ chọn, không bật mặc định mọi nơi. */
  showValueBubble?: boolean;
  /** Định dạng giá trị hiển thị trong bubble, vd (v) => `${v} ngày`. */
  formatValue?: (value: number) => string;
  "aria-label"?: string;
}

export default function SliderControl({
  min,
  max,
  step = 1,
  value,
  onChange,
  accentColor,
  disabled,
  showValueBubble,
  formatValue,
  "aria-label": ariaLabel,
}: SliderControlProps) {
  const [dragging, setDragging] = useState(false);
  const percent = ((value - min) / (max - min)) * 100;

  return (
    <div className="relative w-full py-2.5">
      {showValueBubble && dragging && (
        <div
          className="pointer-events-none absolute -top-1.5 -translate-x-1/2 -translate-y-full rounded-full px-2.5 py-1 text-[11px] font-semibold text-white shadow-sm transition-opacity"
          style={{ left: `${percent}%`, background: accentColor }}
        >
          {formatValue ? formatValue(value) : value}
        </div>
      )}

      {/* Track vẽ riêng, phủ dưới input thật (input trong suốt, chỉ để bắt tương tác). */}
      <div className="pointer-events-none relative h-2 w-full overflow-hidden rounded-full bg-black/[0.06]">
        <div
          className="h-full rounded-full transition-[width] duration-150 ease-out"
          style={{
            width: `${percent}%`,
            background: `linear-gradient(90deg, color-mix(in srgb, ${accentColor} 78%, black), ${accentColor})`,
          }}
        />
      </div>

      {/* Thumb vẽ riêng, theo dõi vị trí input thật bên dưới. */}
      <div
        className="pointer-events-none absolute top-1/2 h-6 w-6 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white shadow-[0_2px_6px_rgba(36,27,47,0.28)] transition-transform"
        style={{
          left: `${percent}%`,
          background: accentColor,
          transform: `translate(-50%, -50%) scale(${dragging ? 1.12 : 1})`,
        }}
      />

      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        disabled={disabled}
        aria-label={ariaLabel}
        onChange={(e) => onChange(Number(e.target.value))}
        onPointerDown={() => setDragging(true)}
        onPointerUp={() => setDragging(false)}
        onKeyDown={() => setDragging(true)}
        onBlur={() => setDragging(false)}
        className="absolute inset-0 m-0 h-full w-full cursor-pointer appearance-none bg-transparent opacity-0 disabled:cursor-not-allowed"
        style={{ WebkitAppearance: "none" }}
      />
    </div>
  );
}
