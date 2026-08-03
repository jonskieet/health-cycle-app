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
 * như bản cũ) — mỗi số tự xoay theo hướng kính tuyến tại vị trí của nó.
 * Ngày hành kinh/cửa sổ thụ thai tô đậm màu theo pha; ngày thường tô nhạt.
 * Ngày hiện tại có 1 badge nền tròn phía sau số, nổi bật như ảnh tham khảo.
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
        const color = isPeriod ? periodColor : isFertile ? fertileColor : "var(--ink-faint)";
        return (
          <g key={day}>
            {isToday && (
              <circle
                cx={pos.x}
                cy={pos.y}
                r={badgeR}
                fill={color}
                stroke="var(--surface)"
                strokeWidth={2}
              />
            )}
            <text
              x={pos.x}
              y={pos.y}
              fontSize={fontSize}
              fontWeight={isToday ? 700 : isPeriod || isFertile ? 700 : 500}
              fill={isToday ? "#fff" : color}
              fillOpacity={isToday ? 1 : isPeriod || isFertile ? 0.95 : 0.55}
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
 * Nền khối tròn giữa, bản ĐƠN GIẢN HOÁ (2026-08-03 – sau phản hồi "vẽ nhiều
 * chi tiết quá rối, bỏ hẳn kiểu minh hoạ này"): bỏ hoàn toàn trăng/mây/đồi —
 * chỉ còn 1 gradient phẳng theo đúng cặp periodColor/fertileColor + 2 quầng
 * sáng mờ (blur) làm điểm nhấn nhẹ, để chữ là trọng tâm thị giác chính thay
 * vì hoạ tiết.
 */
function CenterArt({ size, color1, color2 }: { size: number; color1: string; color2: string }) {
  const c = size / 2;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="absolute" style={{ left: 0, top: 0 }}>
      <defs>
        <linearGradient id="cycle-dial-flat-grad" x1="0.1" y1="0" x2="0.9" y2="1">
          <stop offset="0%" stopColor={color2} />
          <stop offset="100%" stopColor={color1} />
        </linearGradient>
        <filter id="cycle-dial-blur" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation={size * 0.06} />
        </filter>
        <clipPath id="cycle-dial-clip">
          <circle cx={c} cy={c} r={c} />
        </clipPath>
      </defs>

      <g clipPath="url(#cycle-dial-clip)">
        <circle cx={c} cy={c} r={c} fill="url(#cycle-dial-flat-grad)" />
        <circle cx={size * 0.18} cy={size * 0.16} r={size * 0.26} fill="#fff" opacity={0.16} filter="url(#cycle-dial-blur)" />
        <circle cx={size * 0.86} cy={size * 0.9} r={size * 0.3} fill="#000" opacity={0.12} filter="url(#cycle-dial-blur)" />
      </g>
    </svg>
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
const NUMBER_R_RATIO = 0.5;
const CENTER_D_RATIO = 0.74;
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
  const centerR = (size * CENTER_D_RATIO) / 2;
  const badgeR = size * BADGE_R_RATIO;

  const ovulationDay = avgCycleLength - 14;
  const fertileStartDay = Math.max(avgPeriodLength + 1, ovulationDay - 5);
  const fertileEndDay = ovulationDay + 1;
  const clampedDay = Math.min(Math.max(currentDay, 1), avgCycleLength);

  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      {/* Quầng sáng mờ phía sau vòng tròn. */}
      <div
        className="absolute inset-0 rounded-full"
        style={{
          background: `radial-gradient(circle, color-mix(in srgb, ${fertileColor} 16%, transparent) 0%, transparent 70%)`,
          filter: "blur(18px)",
        }}
      />

      <div
        className="absolute overflow-visible"
        style={{ width: canvas, height: canvas, left: (size - canvas) / 2, top: (size - canvas) / 2 }}
      >
        <svg width={canvas} height={canvas} viewBox={`0 0 ${canvas} ${canvas}`} className="absolute overflow-visible">
          {/* Vòng dẫn mờ phía sau số — chỉ để gợi hình dạng vòng, giống viền
              rất nhạt trong ảnh tham khảo, không mang thông tin riêng. */}
          <circle cx={cx} cy={cy} r={ringR} fill="none" stroke="var(--ink-faint)" strokeOpacity={0.12} strokeWidth={1} />

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

      {/* Khối tròn tối giữa — thay cho thẻ trắng phẳng trước đây, đúng tinh
          thần "khối tròn tối làm điểm nhấn thị giác chính" của ảnh mẫu. */}
      <div
        className="absolute overflow-hidden rounded-full"
        style={{
          width: centerR * 2,
          height: centerR * 2,
          left: size / 2 - centerR,
          top: size / 2 - centerR,
          boxShadow: "0 14px 30px -14px rgba(0,0,0,0.35)",
        }}
      >
        <CenterArt size={centerR * 2} color1={periodColor} color2={fertileColor} />
      </div>
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 px-7 text-center">
        {children}
      </div>
    </div>
  );
}
