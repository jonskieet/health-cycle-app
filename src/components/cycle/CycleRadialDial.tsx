"use client";

// Redesign (2026-07-31, theo yêu cầu chủ dự án + ảnh tham khảo "Moontide"
// app gửi kèm): đổi từ kiểu "vòng vạch chia mặt đồng hồ + 2 cung màu gradient
// nổi trên viền" (bản J2 cũ) sang kiểu "vòng SỐ NGÀY đầy đủ quanh viền + khối
// tròn tối màu ở giữa" giống bố cục ảnh Moontide. CHỈ lấy Ý TƯỞNG bố cục
// (vòng số + khối tròn tối giữa + badge ngày hiện tại) — không sao chép hình
// vẽ mặt trăng/hoạ tiết cụ thể của ảnh mẫu (đổi thành hoạ tiết sóng mờ trừu
// tượng nguyên bản, đúng tông tím-hồng sẵn có của KVCycle thay vì xanh navy).
// Không có cung màu gradient nổi trên viền nữa — thay bằng chính SỐ NGÀY tô
// đậm màu theo pha (hành kinh/cửa sổ thụ thai) để phân biệt, ngày thường tô
// nhạt — đúng cơ chế ảnh mẫu dùng (số đậm/nhạt khác nhau, không phải cung
// tô nền).

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

interface PhaseArcProps {
  cx: number;
  cy: number;
  r: number;
  count: number;
  avgPeriodLength: number;
  fertileStartDay: number;
  fertileEndDay: number;
  periodColor: string;
  fertileColor: string;
  strokeWidth: number;
}

/**
 * Vòng cung tiến trình dày (2026-08-04, theo yêu cầu "tham khảo nhiều mẫu
 * khác nhau, hiện đại hơn"): thay vòng viền mờ mảnh trước đây bằng 1 track
 * tròn rất nhạt full 360° + 2 cung dày bo tròn đầu (period/fertile) — kiểu
 * "activity ring" quen thuộc ở các app chu kỳ hiện đại (Flo, Clue...), giúp
 * nhận ra pha hiện tại ngay từ xa mà không cần đọc từng số.
 */
function PhaseArc({
  cx,
  cy,
  r,
  count,
  avgPeriodLength,
  fertileStartDay,
  fertileEndDay,
  periodColor,
  fertileColor,
  strokeWidth,
}: PhaseArcProps) {
  // Sửa lỗi lệch 1 ngày (2026-08-04, theo phản hồi "dòng chảy đã vượt qua
  // ngày X rồi"): vị trí góc của NGÀY d trên vòng số là (d-1)/count*360 (xem
  // `DayRing`). Trước đây điểm kết thúc cung dùng avgPeriodLength/count*360
  // — đúng ra là góc của ngày (avgPeriodLength + 1), tức đầu cung luôn lấn
  // sang đúng vị trí của ngày NGAY SAU ngày cuối cùng thuộc pha, dù ngày đó
  // không được tô màu. Đổi lại để đầu cung dừng CHÍNH XÁC tại vị trí của
  // ngày cuối cùng còn thuộc pha — không vượt quá nữa.
  const periodEndDeg = ((avgPeriodLength - 1) / count) * 360;
  const fertileStartDeg = ((fertileStartDay - 1) / count) * 360;
  const fertileEndDeg = ((fertileEndDay - 1) / count) * 360;
  return (
    <>
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="var(--ink-faint)" strokeOpacity={0.1} strokeWidth={strokeWidth} />
      <path
        d={arcPath(cx, cy, r, 0, periodEndDeg)}
        fill="none"
        stroke={periodColor}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
      />
      <path
        d={arcPath(cx, cy, r, fertileStartDeg, fertileEndDeg)}
        fill="none"
        stroke={fertileColor}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
      />
    </>
  );
}

interface DayRingProps {
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
}

/**
 * Vòng SỐ NGÀY đầy đủ quanh viền (1 → avgCycleLength, không chỉ mỗi 5 ngày
 * như bản cũ) — mỗi số tự xoay theo hướng kính tuyến tại vị trí của nó. Từ
 * khi có `PhaseArc` làm nền cung màu riêng, các số không cần tự "gánh" việc
 * phân biệt pha bằng màu đậm/nhạt nữa — số ngày thường giờ đồng nhất 1 tông
 * trung tính nhẹ, chỉ ngày trong pha mới nổi bật hơn 1 chút, đỡ rối mắt hơn
 * bản trước (từng tô đậm màu period/fertile trùng với cung bên dưới).
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
}: DayRingProps) {
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

/**
 * (2026-08-04 – theo yêu cầu chủ dự án "giữ nguyên vòng tròn cũ, chỉ bỏ hình
 * tròn ở giữa đi"): đã XOÁ hẳn `CenterArt` (khối tròn nền gradient) — phần
 * giữa giờ trong suốt hoàn toàn, để lộ nền thẻ phía sau, chỉ còn chữ nổi lên
 * trên. Vòng cung + vòng số NGÀY giữ nguyên 100% như bản trước, không đổi.
 */

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
const NUMBER_R_RATIO = 0.5;
const BADGE_R_RATIO = 9 / 260;
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
  const badgeR = size * BADGE_R_RATIO;
  const arcStrokeWidth = Math.max(3, size * 0.02);

  const ovulationDay = avgCycleLength - 14;
  const fertileStartDay = Math.max(avgPeriodLength + 1, ovulationDay - 5);
  const fertileEndDay = ovulationDay + 1;
  const clampedDay = Math.min(Math.max(currentDay, 1), avgCycleLength);

  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <div
        className="absolute overflow-visible"
        style={{ width: canvas, height: canvas, left: (size - canvas) / 2, top: (size - canvas) / 2 }}
      >
        <svg width={canvas} height={canvas} viewBox={`0 0 ${canvas} ${canvas}`} className="absolute overflow-visible">
          <PhaseArc
            cx={cx}
            cy={cy}
            r={ringR}
            count={avgCycleLength}
            avgPeriodLength={avgPeriodLength}
            fertileStartDay={fertileStartDay}
            fertileEndDay={fertileEndDay}
            periodColor={periodColor}
            fertileColor={fertileColor}
            strokeWidth={arcStrokeWidth}
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

      <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 px-9 text-center">
        {children}
      </div>
    </div>
  );
}
