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
// FIX (sau khi chủ dự án chụp ảnh báo lỗi thực tế trên máy): 2 lỗi hiển thị
// so với bản đầu:
// 1. Vạch chia chỉ thấy 2 cụm nhỏ ngay sát 2 cung màu, phần còn lại của
//    vòng trống trơn — nguyên nhân: `strokeOpacity` đặt quá thấp (0.07/0.14)
//    để làm "mờ" có chủ đích, nhưng trên nền card gần như trắng, mức đó gần
//    như vô hình — chỉ "ăn theo" được độ tương phản từ 2 cung màu đậm ở gần
//    đó nên tạo ảo giác "chỉ có 2 cụm". Sửa: tăng hẳn độ đậm lên mức luôn
//    nhìn thấy rõ trên nền trắng (không phụ thuộc vị trí cạnh cung màu hay
//    không).
// 2. Nhãn chữ cong ("HÀNH KINH"/"CỬA SỔ THỤ THAI") không hiện ra chút nào —
//    `<textPath href="#id">` dùng thuộc tính `href` thuần, nhiều WebView di
//    động (đặc biệt bản cũ) chỉ nhận `xlink:href`. Sửa: thêm cả `xlinkHref`
//    song song `href` để tương thích rộng hơn.
// Nhân tiện sửa luôn hướng đọc chữ: cung nằm ở nửa DƯỚI vòng tròn (như "Cửa
// sổ thụ thai" khi rụng trứng rơi vào nửa sau chu kỳ dài) trước đây sẽ bị
// chữ lộn ngược nếu vẽ path cùng chiều kim đồng hồ — nay tự đảo hướng path
// dùng RIÊNG cho text (path cho màu vẫn giữ nguyên hướng cũ) khi trung điểm
// cung rơi vào nửa dưới, để chữ luôn đọc xuôi.

import { useId } from "react";

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
const ARC_TRACK_R_RATIO = 0.92;
const PROGRESS_R_RATIO = 0.78;

function polar(cx: number, cy: number, r: number, angleDeg: number) {
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

function describeArc(cx: number, cy: number, r: number, fromDeg: number, toDeg: number, sweep: 0 | 1) {
  const from = polar(cx, cy, r, fromDeg);
  const to = polar(cx, cy, r, toDeg);
  return `M ${from.x} ${from.y} A ${r} ${r} 0 0 ${sweep} ${to.x} ${to.y}`;
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
  const uid = useId();
  const cx = size / 2;
  const cy = size / 2;
  const arcR = (size / 2) * ARC_TRACK_R_RATIO;
  const progressR = (size / 2) * PROGRESS_R_RATIO;

  const dayToDeg = (day: number) => (day / avgCycleLength) * 360;

  const periodStartDeg = dayToDeg(0);
  const periodEndDeg = dayToDeg(avgPeriodLength);

  const ovulationDay = avgCycleLength - 14;
  const fertileStartDeg = dayToDeg(Math.max(0, ovulationDay - 5));
  const fertileEndDeg = dayToDeg(ovulationDay + 1);

  const progressDeg = Math.min(360, dayToDeg(currentDay));

  const periodColorPath = describeArc(cx, cy, arcR, periodStartDeg, periodEndDeg, 1);
  const fertileColorPath = describeArc(cx, cy, arcR, fertileStartDeg, fertileEndDeg, 1);

  function textPathFor(startDeg: number, endDeg: number) {
    const mid = (startDeg + endDeg) / 2;
    const bottomHalf = mid > 90 && mid < 270;
    return bottomHalf
      ? describeArc(cx, cy, arcR, endDeg, startDeg, 0)
      : describeArc(cx, cy, arcR, startDeg, endDeg, 1);
  }
  const periodTextPath = textPathFor(periodStartDeg, periodEndDeg);
  const fertileTextPath = textPathFor(fertileStartDeg, fertileEndDeg);

  const periodArcId = `cycle-dial-period-${uid}`;
  const fertileArcId = `cycle-dial-fertile-${uid}`;

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <defs>
          <path id={periodArcId} d={periodTextPath} fill="none" />
          <path id={fertileArcId} d={fertileTextPath} fill="none" />
        </defs>

        {Array.from({ length: TICK_COUNT }).map((_, i) => {
          const deg = (i / TICK_COUNT) * 360;
          const isMajor = i % 5 === 0;
          const inner = polar(cx, cy, arcR - (isMajor ? 7 : 4), deg);
          const outer = polar(cx, cy, arcR + (isMajor ? 2 : 1), deg);
          return (
            <line
              key={i}
              x1={inner.x}
              y1={inner.y}
              x2={outer.x}
              y2={outer.y}
              stroke="var(--ink)"
              strokeOpacity={isMajor ? 0.4 : 0.2}
              strokeWidth={isMajor ? 1.6 : 1.1}
              strokeLinecap="round"
            />
          );
        })}

        <path d={periodColorPath} fill="none" stroke={periodColor} strokeWidth={5} strokeLinecap="round" />
        <path d={fertileColorPath} fill="none" stroke={fertileColor} strokeWidth={5} strokeLinecap="round" />

        <text fontSize="7.5" fontWeight={700} fill={periodColor} letterSpacing="0.3">
          <textPath href={`#${periodArcId}`} xlinkHref={`#${periodArcId}`} startOffset="4">
            HÀNH KINH
          </textPath>
        </text>
        <text fontSize="7.5" fontWeight={700} fill={fertileColor} letterSpacing="0.3">
          <textPath href={`#${fertileArcId}`} xlinkHref={`#${fertileArcId}`} startOffset="4">
            CỬA SỔ THỤ THAI
          </textPath>
        </text>

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
