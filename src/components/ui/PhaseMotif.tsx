// H1 (VISUAL_POLISH_ROADMAP.md — tìm 1 "signature" thật cho app): chủ dự án
// chọn hướng "hoạ tiết riêng theo từng giai đoạn chu kỳ" (thay vì đầu tư thêm
// cho AuroraRing). Component này vẽ 1 hoạ tiết SVG trừu tượng, KHÁC NHAU cho
// mỗi trong 5 giai đoạn — không phải icon lucide-react đơn thuần, mà là 1
// pattern line-art nhẹ nhàng, đặt làm nền trang trí (góc phải/trên) cho khối
// hiển thị giai đoạn ở Trang chủ + trang Chu kỳ. Ý tưởng từng hoạ tiết cố ý
// gắn với Ý NGHĨA của giai đoạn (không chỉ đổi màu ngẫu nhiên):
//   - period (hành kinh): các giọt nước rơi — echo icon droplet đã dùng cho
//     "chu kỳ" toàn app.
//   - follicular (nang trứng): cụm vòng tròn tăng dần kích thước — nang trứng
//     đang phát triển.
//   - fertile (cửa sổ thụ thai): 3 vòng tròn giao nhau — hình ảnh "cửa sổ"/
//     giao thoa.
//   - ovulation (rụng trứng): tia toả ra từ 1 điểm — khoảnh khắc "đỉnh điểm".
//   - luteal (hoàng thể): các vầng trăng khuyết chồng nhau — năng lượng dịu
//     dần, êm ả.
// Luôn vẽ bằng `stroke="currentColor"` (màu set qua CSS `color` ở component
// cha — dùng đúng `phaseColor` đã có, không thêm màu mới) + độ mờ rất thấp do
// nơi gọi tự quyết định — bản thân component không tự đặt opacity để nơi dùng
// linh hoạt tuỳ ngữ cảnh (nền sáng/tối, kích thước card khác nhau).

import type { CyclePrediction } from "@/lib/cycle-utils";

type Phase = CyclePrediction["phase"];

function PeriodMotif() {
  return (
    <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
      {[
        { cx: 150, cy: 40, r: 16 },
        { cx: 110, cy: 78, r: 10 },
        { cx: 168, cy: 96, r: 7 },
        { cx: 130, cy: 130, r: 5 },
      ].map((d, i) => (
        <path
          key={i}
          d={`M ${d.cx} ${d.cy - d.r} C ${d.cx + d.r} ${d.cy - d.r * 0.2}, ${d.cx + d.r} ${d.cy + d.r * 0.7}, ${d.cx} ${d.cy + d.r} C ${d.cx - d.r} ${d.cy + d.r * 0.7}, ${d.cx - d.r} ${d.cy - d.r * 0.2}, ${d.cx} ${d.cy - d.r} Z`}
          stroke="currentColor"
          strokeWidth={2}
        />
      ))}
    </svg>
  );
}

function FollicularMotif() {
  const dots = [
    { cx: 100, cy: 110, r: 6 },
    { cx: 122, cy: 96, r: 9 },
    { cx: 148, cy: 82, r: 13 },
    { cx: 178, cy: 64, r: 18 },
  ];
  return (
    <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
      {dots.map((d, i) => (
        <circle key={i} cx={d.cx} cy={d.cy} r={d.r} stroke="currentColor" strokeWidth={2} />
      ))}
    </svg>
  );
}

function FertileMotif() {
  return (
    <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="120" cy="70" r="34" stroke="currentColor" strokeWidth={2} />
      <circle cx="155" cy="100" r="34" stroke="currentColor" strokeWidth={2} />
      <circle cx="130" cy="115" r="34" stroke="currentColor" strokeWidth={2} />
    </svg>
  );
}

function OvulationMotif() {
  const rays = 10;
  const cx = 148;
  const cy = 60;
  return (
    <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx={cx} cy={cy} r="12" stroke="currentColor" strokeWidth={2} />
      {Array.from({ length: rays }).map((_, i) => {
        const angle = (i / rays) * Math.PI * 2;
        const r1 = 20;
        const r2 = i % 2 === 0 ? 40 : 30;
        return (
          <line
            key={i}
            x1={cx + Math.cos(angle) * r1}
            y1={cy + Math.sin(angle) * r1}
            x2={cx + Math.cos(angle) * r2}
            y2={cy + Math.sin(angle) * r2}
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
          />
        );
      })}
    </svg>
  );
}

function LutealMotif() {
  const moons = [
    { cx: 150, cy: 55, r: 22 },
    { cx: 128, cy: 95, r: 15 },
    { cx: 168, cy: 108, r: 10 },
  ];
  return (
    <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
      {moons.map((m, i) => (
        <path
          key={i}
          d={`M ${m.cx - m.r * 0.3} ${m.cy - m.r} A ${m.r} ${m.r} 0 1 0 ${m.cx - m.r * 0.3} ${m.cy + m.r} A ${m.r * 0.7} ${m.r * 0.7} 0 1 1 ${m.cx - m.r * 0.3} ${m.cy - m.r} Z`}
          stroke="currentColor"
          strokeWidth={2}
        />
      ))}
    </svg>
  );
}

const MOTIF_BY_PHASE: Record<Phase, () => React.JSX.Element> = {
  period: PeriodMotif,
  follicular: FollicularMotif,
  fertile: FertileMotif,
  ovulation: OvulationMotif,
  luteal: LutealMotif,
};

export default function PhaseMotif({
  phase,
  color,
  className = "",
}: {
  phase: Phase;
  /** Màu hoạ tiết — luôn truyền `phaseColor[phase]` đã có sẵn, không bịa màu mới. */
  color: string;
  className?: string;
}) {
  const Motif = MOTIF_BY_PHASE[phase];
  return (
    <div
      aria-hidden
      className={`pointer-events-none absolute ${className}`}
      style={{ color }}
    >
      <Motif />
    </div>
  );
}
