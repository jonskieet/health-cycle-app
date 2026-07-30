"use client";

// J3 (thay bản J2 sau khi anh chup may that cho thay vo layout): ban cu ve
// nhan "HANH KINH"/"CUA SO THU THAI" cong theo cung bang SVG `<textPath>`
// ap truc tiep len vien chinh (arcR ~ 92% ban kinh, chi cach mep ngoai cua
// khung 168px vai px). Voi cung ngan + chu dai, chu bi bop/chong len chinh
// no va chong luon len so ngay o giua trung tam vong tron.
//
// Bo han textPath. Vong tron gio CHI hien thi: vach chia deu quanh vien +
// 2 cung mau (hanh kinh / cua so thu thai) de len vach chia + vong progress
// ngay hien tai o trong. Khong con chu nao ve trong SVG nua - ten 2 giai
// doan duoc doc qua chu thich (legend) dang cham mau + nhan phang dat NGAY
// DUOI vong tron (xem component `CycleDialLegend` o cuoi file, dung trong
// page.tsx), mau rat pho bien o cac app chu ky (Flo, Clue) va khong bao gio
// vo chu du vong tron nho toi dau.



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
const ARC_TRACK_R_RATIO = 0.86;
const PROGRESS_R_RATIO = 0.72;

function polar(cx: number, cy: number, r: number, angleDeg: number) {
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

function describeArc(cx: number, cy: number, r: number, fromDeg: number, toDeg: number, sweep: 0 | 1) {
  const from = polar(cx, cy, r, fromDeg);
  const to = polar(cx, cy, r, toDeg);
  const large = Math.abs(toDeg - fromDeg) > 180 ? 1 : 0;
  return `M ${from.x} ${from.y} A ${r} ${r} 0 ${large} ${sweep} ${to.x} ${to.y}`;
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

  const dayToDeg = (day: number) => (day / avgCycleLength) * 360;

  const periodStartDeg = dayToDeg(0);
  const periodEndDeg = dayToDeg(avgPeriodLength);

  const ovulationDay = avgCycleLength - 14;
  const fertileStartDeg = dayToDeg(Math.max(0, ovulationDay - 5));
  const fertileEndDeg = dayToDeg(ovulationDay + 1);

  const progressDeg = Math.min(360, dayToDeg(currentDay));

  const periodColorPath = describeArc(cx, cy, arcR, periodStartDeg, periodEndDeg, 1);
  const fertileColorPath = describeArc(cx, cy, arcR, fertileStartDeg, fertileEndDeg, 1);

  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="block">
        {Array.from({ length: TICK_COUNT }).map((_, i) => {
          const deg = (i / TICK_COUNT) * 360;
          const isMajor = i % 5 === 0;
          const inner = polar(cx, cy, arcR - (isMajor ? 6 : 3.5), deg);
          const outer = polar(cx, cy, arcR + (isMajor ? 1.5 : 0.5), deg);
          return (
            <line
              key={i}
              x1={inner.x}
              y1={inner.y}
              x2={outer.x}
              y2={outer.y}
              stroke="var(--ink)"
              strokeOpacity={isMajor ? 0.32 : 0.15}
              strokeWidth={isMajor ? 1.6 : 1.1}
              strokeLinecap="round"
            />
          );
        })}

        <path d={periodColorPath} fill="none" stroke={periodColor} strokeWidth={5.5} strokeLinecap="round" />
        <path d={fertileColorPath} fill="none" stroke={fertileColor} strokeWidth={5.5} strokeLinecap="round" />

        <circle cx={cx} cy={cy} r={progressR} fill="none" stroke="rgba(36,27,47,0.06)" strokeWidth={9} />
        <circle
          cx={cx}
          cy={cy}
          r={progressR}
          fill="none"
          stroke={periodColor}
          strokeWidth={9}
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

// Chu thich mau cho 2 cung tren vong tron - dat ben ngoai SVG (o page.tsx)
// ngay duoi CycleRadialDial, thay cho textPath cong da bi loi.
export function CycleDialLegend({
  periodColor,
  fertileColor,
}: {
  periodColor: string;
  fertileColor: string;
}) {
  return (
    <div className="flex items-center justify-center gap-4 text-[11px] font-medium text-[var(--ink-soft)]">
      <span className="flex items-center gap-1.5">
        <span className="h-2 w-2 rounded-full" style={{ background: periodColor }} />
        Hành kinh
      </span>
      <span className="flex items-center gap-1.5">
        <span className="h-2 w-2 rounded-full" style={{ background: fertileColor }} />
        Cửa sổ thụ thai
      </span>
    </div>
  );
}
