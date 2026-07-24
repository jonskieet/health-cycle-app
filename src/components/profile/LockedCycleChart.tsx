"use client";

import { Gem } from "lucide-react";

// Đường minh hoạ tĩnh (không phải dữ liệu thật của user) — chỉ để cho thấy
// hình dạng biểu đồ trước khi mở khoá PRO, giống bản xem trước của Clover.
const ILLUSTRATIVE_POINTS = [
  { x: 40, y: 78 },
  { x: 96, y: 118 },
  { x: 152, y: 62 },
  { x: 208, y: 92 },
  { x: 264, y: 30 },
  { x: 320, y: 84 },
];
const ABNORMAL_INDEXES = [1, 4];

function buildSmoothPath(points: { x: number; y: number }[]) {
  if (points.length < 2) return "";
  let d = `M ${points[0].x} ${points[0].y}`;
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[i];
    const p1 = points[i + 1];
    const midX = (p0.x + p1.x) / 2;
    d += ` C ${midX} ${p0.y}, ${midX} ${p1.y}, ${p1.x} ${p1.y}`;
  }
  return d;
}

export default function LockedCycleChart() {
  const path = buildSmoothPath(ILLUSTRATIVE_POINTS);

  return (
    <section className="glass-card flex flex-col gap-4 rounded-[24px] p-5">
      <p className="font-display text-base font-bold text-[var(--ink)]">Đồ thị chu kỳ</p>

      <div className="relative">
        {/* Trục y minh hoạ */}
        <div className="absolute left-0 top-0 flex h-[150px] flex-col justify-between py-1">
          {Array.from({ length: 4 }).map((_, i) => (
            <span key={i} className="h-3 w-7 rounded-full" style={{ background: "rgba(36,27,47,0.06)" }} />
          ))}
        </div>

        <svg viewBox="0 0 360 150" className="h-[150px] w-full pl-10" preserveAspectRatio="none">
          {[0, 50, 100, 150].map((y) => (
            <line key={y} x1={0} y1={y} x2={360} y2={y} stroke="rgba(36,27,47,0.06)" strokeWidth={1} />
          ))}
          {ILLUSTRATIVE_POINTS.map((p, i) => (
            <line key={i} x1={p.x} y1={0} x2={p.x} y2={150} stroke="rgba(36,27,47,0.08)" strokeDasharray="3 4" />
          ))}
          <path d={path} fill="none" stroke="var(--ink-faint)" strokeWidth={2.5} />
          {ILLUSTRATIVE_POINTS.map((p, i) => {
            const abnormal = ABNORMAL_INDEXES.includes(i);
            if (!abnormal) {
              return <circle key={i} cx={p.x} cy={p.y} r={4} fill="var(--ink-faint)" />;
            }
            return (
              <g key={i}>
                <circle cx={p.x} cy={p.y} r={16} fill="var(--c-period)" opacity={0.14} />
                <circle cx={p.x} cy={p.y} r={9} fill="var(--c-period)" opacity={0.22} />
                <circle cx={p.x} cy={p.y} r={5} fill="var(--c-period)" stroke="white" strokeWidth={2} />
                <text
                  x={p.x}
                  y={p.y > 75 ? p.y + 28 : p.y - 18}
                  textAnchor="middle"
                  fontSize={10}
                  fontWeight={700}
                  letterSpacing={0.5}
                  fill="var(--ink)"
                >
                  BẤT THƯỜNG
                </text>
              </g>
            );
          })}
        </svg>

        {/* Trục x minh hoạ */}
        <div className="mt-2 flex justify-between pl-10">
          {ILLUSTRATIVE_POINTS.map((_, i) => (
            <span key={i} className="h-2.5 w-9 rounded-full" style={{ background: "rgba(36,27,47,0.06)" }} />
          ))}
        </div>
      </div>

      <p className="text-center text-sm leading-relaxed text-[var(--ink-soft)]">
        Biểu đồ sẽ giúp bạn theo dõi động lực trong chu kỳ của mình. Nâng cấp lên hạng cao cấp
        Premium để phát hiện các sai lệch càng sớm càng tốt và có khả năng chia sẻ dữ liệu với
        bác sĩ của bạn.
      </p>

      <button
        type="button"
        className="flex items-center justify-center gap-2 rounded-full py-3.5 text-sm font-semibold text-white"
        style={{ background: "var(--c-period)" }}
      >
        <Gem size={16} />
        Mở khoá PRO
      </button>
    </section>
  );
}
