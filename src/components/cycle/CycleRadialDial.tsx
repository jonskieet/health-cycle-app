"use client";

// Redesign (2026-08-04, theo ảnh tham khảo "Flo-style" chủ dự án gửi + phản
// hồi "bỏ hẳn khối tròn giữa đi"): bỏ HOÀN TOÀN khối tròn tô nền (gradient/
// CenterArt) và vòng số ngày dày đặc của các bản trước — đổi sang kiểu "vòng
// mở" tối giản: 1 track chấm tròn mờ chạy hết viền (đại diện từng ngày,
// không cần đọc số), 2 cung dày bo tròn có "tay cầm" ở 2 đầu (period +
// fertile) nổi trên track, và 1 badge ngày hiện tại nổi bên ngoài vòng —
// đúng tinh thần ảnh mẫu nhưng vẽ lại 100% bằng SVG nguyên bản theo đúng
// cặp periodColor/fertileColor sẵn có của KVCycle. Phần giữa giờ HOÀN TOÀN
// trong suốt, chỉ còn chữ (children) — không còn nền/hoạ tiết nào che mắt.

function polar(cx: number, cy: number, r: number, angleDeg: number) {
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

function arcPath(cx: number, cy: number, r: number, startDeg: number, endDeg: number) {
  const start = polar(cx, cy, r, startDeg);
  const end = polar(cx, cy, r, endDeg);
  const largeArc = endDeg - startDeg <= 180 ? 0 : 1;
  return `M ${start.x} ${start.y} A ${r} ${r} 0 ${largeArc} 1 ${end.x} ${end.y}`;
}

/** Track chấm tròn mờ đại diện từng ngày trong chu kỳ — thay hẳn vòng số. */
function DotTrack({ cx, cy, r, count, dotR }: { cx: number; cy: number; r: number; count: number; dotR: number }) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => {
        const pos = polar(cx, cy, r, (i / count) * 360);
        return <circle key={i} cx={pos.x} cy={pos.y} r={dotR} fill="var(--ink-faint)" opacity={0.28} />;
      })}
    </>
  );
}

interface PhaseArcProps {
  cx: number;
  cy: number;
  r: number;
  startDeg: number;
  endDeg: number;
  color: string;
  strokeWidth: number;
  knobR: number;
}

/**
 * 1 cung dày bo tròn đầu, có "tay cầm" (chấm tròn viền trắng) ở 2 đầu mút —
 * đúng chi tiết nổi bật nhất của ảnh mẫu, giúp phân biệt điểm bắt đầu/kết
 * thúc pha rõ ràng hơn 1 cung trơn.
 */
function PhaseArc({ cx, cy, r, startDeg, endDeg, color, strokeWidth, knobR }: PhaseArcProps) {
  const startPos = polar(cx, cy, r, startDeg);
  const endPos = polar(cx, cy, r, endDeg);
  return (
    <>
      <path d={arcPath(cx, cy, r, startDeg, endDeg)} fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
      <circle cx={startPos.x} cy={startPos.y} r={knobR} fill={color} stroke="var(--surface)" strokeWidth={2} />
      <circle cx={endPos.x} cy={endPos.y} r={knobR} fill={color} stroke="var(--surface)" strokeWidth={2} />
    </>
  );
}

/** Vòng SỐ NGÀY đầy đủ quanh viền — "linh hồn" của thiết kế theo đúng phản
 * hồi chủ dự án, mỗi số tự xoay theo hướng kính tuyến tại vị trí của nó.
 * Vì đã có `PhaseArc` lo việc thể hiện pha bằng màu, số ngày ở đây giữ tông
 * trung tính, chỉ đậm hơn nhẹ ở ngày trong pha; riêng ngày hiện tại có 1
 * badge nền tròn nổi bật phía sau số.
 */
function DayRing({
  cx,
  cy,
  r,
  count,
  fontSize,
  currentDay,
  periodColor,
  fertileColor,
  avgPeriodLength,
  fertileStartDay,
  fertileEndDay,
  badgeR,
}: {
  cx: number;
  cy: number;
  r: number;
  count: number;
  fontSize: number;
  currentDay: number;
  periodColor: string;
  fertileColor: string;
  avgPeriodLength: number;
  fertileStartDay: number;
  fertileEndDay: number;
  badgeR: number;
}) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => {
        const day = i + 1;
        const deg = (i / count) * 360;
        const pos = polar(cx, cy, r, deg);
        const isPeriod = day <= avgPeriodLength;
        const isFertile = day >= fertileStartDay && day <= fertileEndDay;
        const isToday = day === currentDay;
        const accent = isPeriod ? periodColor : isFertile ? fertileColor : null;
        return (
          <g key={day}>
            {isToday && (
              <>
                <circle cx={pos.x} cy={pos.y} r={badgeR * 1.7} fill={accent ?? "var(--c-period)"} opacity={0.18} />
                <circle
                  cx={pos.x}
                  cy={pos.y}
                  r={badgeR}
                  fill={accent ?? "var(--c-period)"}
                  stroke="var(--surface)"
                  strokeWidth={2}
                />
              </>
            )}
            <text
              x={pos.x}
              y={pos.y}
              fontSize={fontSize}
              fontWeight={isToday ? 700 : accent ? 600 : 500}
              fill={isToday ? "#fff" : accent ?? "var(--ink-faint)"}
              fillOpacity={isToday ? 1 : accent ? 0.85 : 0.45}
              textAnchor="middle"
              dominantBaseline="middle"
              transform={`rotate(${deg}, ${pos.x}, ${pos.y})`}
            >
              {day}
            </text>
          </g>
        );
      })}
    </>
  );
}

interface CycleRadialDialProps {
  size?: number;
  avgCycleLength: number;
  avgPeriodLength: number;
  currentDay: number;
  periodColor: string;
  fertileColor: string;
  children?: React.ReactNode;
}

const RING_R_RATIO = 0.35;
const NUMBER_R_RATIO = 0.48;
const CANVAS_RATIO = 1.16;

export default function CycleRadialDial({
  size = 260,
  avgCycleLength,
  avgPeriodLength,
  currentDay,
  periodColor,
  fertileColor,
  children,
}: CycleRadialDialProps) {
  const canvas = size * CANVAS_RATIO;
  const cx = canvas / 2;
  const cy = canvas / 2;

  const ringR = size * RING_R_RATIO;
  const numberR = size * NUMBER_R_RATIO;
  const numberFontSize = Math.max(7, size * 0.034);
  const dotR = Math.max(1, size * 0.006);
  const strokeWidth = Math.max(6, size * 0.05);
  const knobR = strokeWidth / 2 + 2;
  const badgeR = size * (9 / 260);

  const ovulationDay = avgCycleLength - 14;
  const fertileStartDay = Math.max(avgPeriodLength + 1, ovulationDay - 5);
  const fertileEndDay = ovulationDay + 1;
  const clampedDay = Math.min(Math.max(currentDay, 1), avgCycleLength);

  const periodStartDeg = 0;
  const periodEndDeg = (avgPeriodLength / avgCycleLength) * 360;
  const fertileStartDeg = ((fertileStartDay - 1) / avgCycleLength) * 360;
  const fertileEndDeg = (fertileEndDay / avgCycleLength) * 360;

  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <div
        className="absolute overflow-visible"
        style={{ width: canvas, height: canvas, left: (size - canvas) / 2, top: (size - canvas) / 2 }}
      >
        <svg width={canvas} height={canvas} viewBox={`0 0 ${canvas} ${canvas}`} className="absolute overflow-visible">
          <DotTrack cx={cx} cy={cy} r={ringR} count={avgCycleLength} dotR={dotR} />

          <PhaseArc
            cx={cx}
            cy={cy}
            r={ringR}
            startDeg={periodStartDeg}
            endDeg={periodEndDeg}
            color={periodColor}
            strokeWidth={strokeWidth}
            knobR={knobR}
          />
          <PhaseArc
            cx={cx}
            cy={cy}
            r={ringR}
            startDeg={fertileStartDeg}
            endDeg={fertileEndDeg}
            color={fertileColor}
            strokeWidth={strokeWidth}
            knobR={knobR}
          />

          <DayRing
            cx={cx}
            cy={cy}
            r={numberR}
            count={avgCycleLength}
            fontSize={numberFontSize}
            currentDay={clampedDay}
            periodColor={periodColor}
            fertileColor={fertileColor}
            avgPeriodLength={avgPeriodLength}
            fertileStartDay={fertileStartDay}
            fertileEndDay={fertileEndDay}
            badgeR={badgeR}
          />
        </svg>
      </div>

      {/* Giữa hoàn toàn trong suốt — không còn khối tròn/nền nào, chỉ còn
          chữ do trang cha truyền vào. */}
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-1.5 px-8 text-center">
        {children}
      </div>
    </div>
  );
}
