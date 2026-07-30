"use client";

// J2 (MAJOR_REDESIGN_BRIEF.md): thay `AuroraRing` (progress ring trơn 1
// gradient) bằng vòng tròn dạng "mặt đồng hồ" cho riêng khối chính của
// trang Chu kỳ — theo màn 1 của `ref-06-radial-dial-mascot-mockup.webp`:
// vạch chia nhỏ chạy quanh viền ngoài, 2 CUNG MÀU (hành kinh + cửa sổ thụ
// thai) vẽ chồng lên viền đó, mỗi cung có nhãn chữ CONG theo cung bằng SVG
// `<textPath>`. Chỉ dùng ở đây — không thay `AuroraRing` ở KegelTimer/Trang
// chủ vì 2 nơi đó là progress đơn giản (thời gian tập, điểm sức khoẻ), không
// có khái niệm "giai đoạn theo cung" để gắn nhãn.
//
// Hệ quy chiếu góc: 0° = đỉnh vòng (12h), đi THEO CHIỀU KIM ĐỒNG HỒ — khớp
// với cách "currentDay" tăng dần từ ngày 1 chu kỳ.

interface CycleRadialDialProps {
  size?: number;
  avgCycleLength: number;
  avgPeriodLength: number;
  currentDay: number;
  periodColor: string;
  fertileColor: string;
  children?: React.ReactNode;
}

const TICK_COUNT = 60;
const ARC_TRACK_R_RATIO = 0.92; // bán kính vòng vạch chia/cung màu so với size/2
const PROGRESS_R_RATIO = 0.78; // bán kính vòng progress trơn (ngày hiện tại) phía trong

function polar(cx: number, cy: number, r: number, angleDeg: number) {
  // -90 để 0° bắt đầu từ đỉnh (12h) thay vì bên phải (mặc định lượng giác).
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

function arcPath(cx: number, cy: number, r: number, startDeg: number, endDeg: number) {
  const start = polar(cx, cy, r, startDeg);
  const end = polar(cx, cy, r, endDeg);
  const largeArc = endDeg - startDeg > 180 ? 1 : 0;
  return `M ${start.x} ${start.y} A ${r} ${r} 0 ${largeArc} 1 ${end.x} ${end.y}`;
}

export default function CycleRadialDial({
  size = 200,
  avgCycleLength,
  avgPeriodLength,
  currentDay,
  periodColor,
  fertileColor,
  children,
}: CycleRadialDialProps) {
  const cx = size / 2;
  const cy = size / 2;
  const arcR = (size / 2) * ARC_TRACK_R_RATIO;
  const progressR = (size / 2) * PROGRESS_R_RATIO;

  // Quy đổi "ngày thứ N trong chu kỳ" sang góc (độ), toàn vòng = avgCycleLength ngày.
  const dayToDeg = (day: number) => (day / avgCycleLength) * 360;

  // Cung "Hành kinh": ngày 1 → avgPeriodLength.
  const periodStartDeg = dayToDeg(0);
  const periodEndDeg = dayToDeg(avgPeriodLength);

  // Cung "Cửa sổ thụ thai": rụng trứng = ngày (avgCycleLength - 14), cửa sổ
  // = 5 ngày trước tới 1 ngày sau (khớp `fertileWindow` trong `predictCycle`).
  const ovulationDay = avgCycleLength - 14;
  const fertileStartDeg = dayToDeg(Math.max(0, ovulationDay - 5));
  const fertileEndDeg = dayToDeg(ovulationDay + 1);

  const progressDeg = Math.min(360, dayToDeg(currentDay));

  const periodArcId = "cycle-dial-period-arc";
  const fertileArcId = "cycle-dial-fertile-arc";

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <defs>
          <path id={periodArcId} d={arcPath(cx, cy, arcR, periodStartDeg, periodEndDeg)} fill="none" />
          <path id={fertileArcId} d={arcPath(cx, cy, arcR, fertileStartDeg, fertileEndDeg)} fill="none" />
        </defs>

        {/* Vạch chia nhỏ quanh viền ngoài, kiểu mặt đồng hồ. */}
        {Array.from({ length: TICK_COUNT }).map((_, i) => {
          const deg = (i / TICK_COUNT) * 360;
          const isMajor = i % 5 === 0;
          const inner = polar(cx, cy, arcR - (isMajor ? 6 : 3), deg);
          const outer = polar(cx, cy, arcR + (isMajor ? 2 : 1), deg);
          return (
            <line
              key={i}
              x1={inner.x}
              y1={inner.y}
              x2={outer.x}
              y2={outer.y}
              stroke="var(--ink)"
              strokeOpacity={isMajor ? 0.14 : 0.07}
              strokeWidth={isMajor ? 1.4 : 1}
              strokeLinecap="round"
            />
          );
        })}

        {/* Cung "Hành kinh" */}
        <path
          d={arcPath(cx, cy, arcR, periodStartDeg, periodEndDeg)}
          fill="none"
          stroke={periodColor}
          strokeWidth={5}
          strokeLinecap="round"
        />
        {/* Cung "Cửa sổ thụ thai" */}
        <path
          d={arcPath(cx, cy, arcR, fertileStartDeg, fertileEndDeg)}
          fill="none"
          stroke={fertileColor}
          strokeWidth={5}
          strokeLinecap="round"
        />

        {/* Nhãn chữ cong theo từng cung — bám theo <textPath>. */}
        <text fontSize="7.5" fontWeight={700} fill={periodColor} letterSpacing="0.3">
          <textPath href={`#${periodArcId}`} startOffset="4">
            HÀNH KINH
          </textPath>
        </text>
        <text fontSize="7.5" fontWeight={700} fill={fertileColor} letterSpacing="0.3">
          <textPath href={`#${fertileArcId}`} startOffset="4">
            CỬA SỔ THỤ THAI
          </textPath>
        </text>

        {/* Vòng progress trơn phía trong — cho biết đang ở ngày thứ mấy, giữ
            lại cảm giác quen thuộc của `AuroraRing` cũ nhưng thu nhỏ vào
            trong để nhường chỗ cho vòng vạch chia + cung màu bên ngoài. */}
        <circle cx={cx} cy={cy} r={progressR} fill="none" stroke="rgba(36,27,47,0.06)" strokeWidth={10} />
        <circle
          cx={cx}
          cy={cy}
          r={progressR}
          fill="none"
          stroke={periodColor}
          strokeWidth={10}
          strokeLinecap="round"
          strokeDasharray={2 * Math.PI * progressR}
          strokeDashoffset={2 * Math.PI * progressR * (1 - progressDeg / 360)}
          transform={`rotate(-90 ${cx} ${cy})`}
          style={{ transition: "stroke-dashoffset 0.6s ease" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">{children}</div>
    </div>
  );
}
