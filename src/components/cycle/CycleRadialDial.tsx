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

interface CycleRadialDialProps {
  size?: number;
  avgCycleLength: number;
  avgPeriodLength: number;
  currentDay: number;
  periodColor: string;
  fertileColor: string;
  children?: React.ReactNode;
}

const RING_R_RATIO = 0.42;
const CANVAS_RATIO = 1.14;

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
  const dotR = Math.max(1, size * 0.006);
  const strokeWidth = Math.max(6, size * 0.055);
  const knobR = strokeWidth / 2 + 2;
  const badgeR = Math.max(11, size * 0.05);

  const ovulationDay = avgCycleLength - 14;
  const fertileStartDay = Math.max(avgPeriodLength + 1, ovulationDay - 5);
  const fertileEndDay = ovulationDay + 1;
  const clampedDay = Math.min(Math.max(currentDay, 1), avgCycleLength);

  const periodStartDeg = 0;
  const periodEndDeg = (avgPeriodLength / avgCycleLength) * 360;
  const fertileStartDeg = ((fertileStartDay - 1) / avgCycleLength) * 360;
  const fertileEndDeg = (fertileEndDay / avgCycleLength) * 360;
  const todayDeg = ((clampedDay - 1) / avgCycleLength) * 360;
  const todayPos = polar(cx, cy, ringR + strokeWidth / 2 + badgeR + 3, todayDeg);

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

          {/* Badge ngày hiện tại, nổi hẳn ra ngoài vòng — giống bong bóng số
              ngày-trong-tháng của ảnh mẫu (không phải ngày-trong-chu-kỳ). */}
          <circle
            cx={todayPos.x}
            cy={todayPos.y}
            r={badgeR}
            fill="var(--surface)"
            stroke="var(--ink-faint)"
            strokeOpacity={0.25}
            strokeWidth={1.5}
          />
          <text
            x={todayPos.x}
            y={todayPos.y}
            fontSize={badgeR * 0.95}
            fontWeight={700}
            fill="var(--ink)"
            textAnchor="middle"
            dominantBaseline="middle"
          >
            {clampedDay}
          </text>
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
