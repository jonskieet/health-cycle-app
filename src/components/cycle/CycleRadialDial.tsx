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
 * Hoạ tiết khối tròn tối giữa, bản vẽ minh hoạ đầy đủ (2026-08-03, theo ảnh
 * tham khảo mới chủ dự án gửi — phong cách "bầu trời hoàng hôn + trăng lưỡi
 * liềm + mây + đồi sóng"): vẽ lại HOÀN TOÀN nguyên bản bằng SVG path/ellipse
 * tự tạo (không dùng ảnh nào của ảnh mẫu), giữ đúng bố cục cảm hứng (trăng
 * lệch trên, mây rải giữa, đồi sóng dưới) nhưng đổi bảng màu theo đúng cặp
 * periodColor/fertileColor của KVCycle thay vì xanh dương/vàng cố định của
 * ảnh mẫu, để hoạ tiết tự đổi màu theo theme mà không lệch nhận diện app.
 * Có thêm lớp vignette tối mờ ở giữa để chữ trắng (Ngày X, nút Nhật ký...)
 * luôn đủ tương phản dù hoạ tiết sáng.
 */
function CenterArt({ size, color1, color2 }: { size: number; color1: string; color2: string }) {
  const c = size / 2;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="absolute" style={{ left: 0, top: 0 }}>
      <defs>
        {/* Bầu trời hoàng hôn: nhạt phía trên (gần fertileColor) xuống đậm
            phía dưới (gần periodColor), đúng cảm giác ảnh mẫu nhưng theo
            theme của app. */}
        <linearGradient id="cycle-dial-sky-grad" x1="0" y1="0" x2="0.35" y2="1">
          <stop offset="0%" stopColor={color2} stopOpacity={0.55} />
          <stop offset="55%" stopColor={color2} stopOpacity={0.85} />
          <stop offset="100%" stopColor={color1} stopOpacity={0.96} />
        </linearGradient>
        <radialGradient id="cycle-dial-moon-glow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#fff8e6" stopOpacity={0.9} />
          <stop offset="60%" stopColor="#fff2cf" stopOpacity={0.5} />
          <stop offset="100%" stopColor="#fff2cf" stopOpacity={0} />
        </radialGradient>
        <linearGradient id="cycle-dial-moon-body" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#fffaf0" />
          <stop offset="100%" stopColor="#ffe9b8" />
        </linearGradient>
        <radialGradient id="cycle-dial-vignette" cx="50%" cy="58%" r="55%">
          <stop offset="0%" stopColor="#000" stopOpacity={0.22} />
          <stop offset="70%" stopColor="#000" stopOpacity={0.05} />
          <stop offset="100%" stopColor="#000" stopOpacity={0} />
        </radialGradient>
        <clipPath id="cycle-dial-clip">
          <circle cx={c} cy={c} r={c} />
        </clipPath>
      </defs>

      <g clipPath="url(#cycle-dial-clip)">
        <rect x={0} y={0} width={size} height={size} fill="url(#cycle-dial-sky-grad)" />

        {/* Sao nhỏ rải rác góc trên */}
        <circle cx={size * 0.14} cy={size * 0.12} r={size * 0.009} fill="#fff" opacity={0.55} />
        <circle cx={size * 0.24} cy={size * 0.08} r={size * 0.012} fill="#fff" opacity={0.5} />
        <circle cx={size * 0.08} cy={size * 0.24} r={size * 0.007} fill="#fff" opacity={0.45} />

        {/* Vầng sáng + trăng lưỡi liềm lệch góc trên-trái */}
        <circle cx={size * 0.33} cy={size * 0.28} r={size * 0.26} fill="url(#cycle-dial-moon-glow)" />
        <path
          d={`M ${size * 0.4} ${size * 0.14}
              a ${size * 0.155} ${size * 0.155} 0 1 0 0 ${size * 0.28}
              a ${size * 0.115} ${size * 0.115} 0 1 1 0 -${size * 0.28} Z`}
          fill="url(#cycle-dial-moon-body)"
        />

        {/* Mây rải rác giữa nền, dạng chùm ellipse chồng mềm */}
        <g opacity={0.85}>
          <ellipse cx={size * 0.68} cy={size * 0.36} rx={size * 0.13} ry={size * 0.05} fill="#fff" opacity={0.75} />
          <ellipse cx={size * 0.6} cy={size * 0.34} rx={size * 0.09} ry={size * 0.045} fill="#fff" opacity={0.7} />
          <ellipse cx={size * 0.78} cy={size * 0.4} rx={size * 0.08} ry={size * 0.038} fill="#fff" opacity={0.6} />
        </g>
        <g opacity={0.55}>
          <ellipse cx={size * 0.24} cy={size * 0.5} rx={size * 0.1} ry={size * 0.04} fill="#fff" />
          <ellipse cx={size * 0.15} cy={size * 0.48} rx={size * 0.06} ry={size * 0.032} fill="#fff" />
        </g>

        {/* Đồi sóng nhiều lớp phía dưới, tạo chiều sâu như ảnh mẫu */}
        <path
          d={`M 0 ${size * 0.78}
              C ${size * 0.22} ${size * 0.7}, ${size * 0.4} ${size * 0.86}, ${size * 0.62} ${size * 0.76}
              S ${size * 0.9} ${size * 0.72}, ${size} ${size * 0.8}
              L ${size} ${size} L 0 ${size} Z`}
          fill="#fff"
          opacity={0.16}
        />
        <path
          d={`M 0 ${size * 0.88}
              C ${size * 0.26} ${size * 0.98}, ${size * 0.5} ${size * 0.8}, ${size * 0.74} ${size * 0.9}
              S ${size * 0.92} ${size * 0.98}, ${size} ${size * 0.92}
              L ${size} ${size} L 0 ${size} Z`}
          fill="#fff"
          opacity={0.22}
        />

        <circle cx={c} cy={c} r={c} fill="url(#cycle-dial-vignette)" />
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
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-1 px-7 text-center">
        {children}
      </div>
    </div>
  );
}
