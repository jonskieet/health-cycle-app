"use client";

// J4 (thay ban J3 theo yeu cau lam GIONG Y CHANG anh mau moi - khong con
// dang "mat dong ho" nua ma la 1 VONG TRON LON voi 2 DAI MAU DAY (khong
// phai net mong) chay doc theo vien, chu "Period"/"Fertile window" NAM
// TREN chinh 2 dai mau do (cong theo cung), 2 huy hieu tron den nho o 2
// diem noi giua 2 dai, giua vong la khoi noi dung lon (nhan giai doan +
// so ngay to + dong phu + nut pill "Nhat ky ky kinh").
//
// Diem mau chot de chu cong KHONG BAO GIO vo/tran nhu ban cu: dung thuoc
// tinh SVG `textLength` + `lengthAdjust="spacingAndGlyphs"` tren <textPath>
// - trinh duyet se CO GIAN chu (nen/giai chu) de vua khop dung do dai chi
// dinh, bat ke cung dai/ngan bao nhieu hay chu dai/ngan bao nhieu. Day la
// co che ep-vua-khop cua chinh SVG spec, khong phu thuoc uoc luong do dai
// cung thu cong (nguon goc loi cua 2 ban truoc).

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

function arcLengthPx(r: number, fromDeg: number, toDeg: number) {
  return (Math.abs(toDeg - fromDeg) * Math.PI * r) / 180;
}

interface BandProps {
  id: string;
  cx: number;
  cy: number;
  r: number;
  bandWidth: number;
  fromDeg: number;
  toDeg: number;
  color: string;
  label: string;
  fontSize: number;
}

/** 1 dai mau day (band) + chu cong nam giua dai, luon fit du cung dai/ngan. */
function ArcBand({ id, cx, cy, r, bandWidth, fromDeg, toDeg, color, label, fontSize }: BandProps) {
  const mid = (fromDeg + toDeg) / 2;
  const bottomHalf = mid > 95 && mid < 265;
  // Chieu ve cua path CHU luon giu trai->phai theo huong doc thuong (khong
  // lat nguoc), doi voi cung o nua duoi thi dao dau/cuoi de chu khong bi
  // lon nguoc dau.
  const textPathD = bottomHalf
    ? describeArc(cx, cy, r, toDeg, fromDeg, 0)
    : describeArc(cx, cy, r, fromDeg, toDeg, 1);
  const bandPathD = describeArc(cx, cy, r, fromDeg, toDeg, 1);
  const fullLen = arcLengthPx(r, fromDeg, toDeg);
  const fitLen = Math.max(10, fullLen - bandWidth * 1.1);

  return (
    <>
      <defs>
        <path id={id} d={textPathD} fill="none" />
      </defs>
      <path
        d={bandPathD}
        fill="none"
        stroke={color}
        strokeWidth={bandWidth}
        strokeLinecap="round"
      />
      <text fontSize={fontSize} fontWeight={700} fill="#ffffff" letterSpacing="0.4">
        <textPath
          href={`#${id}`}
          xlinkHref={`#${id}`}
          startOffset="50%"
          textAnchor="middle"
          textLength={fitLen}
          lengthAdjust="spacingAndGlyphs"
        >
          {label}
        </textPath>
      </text>
    </>
  );
}

interface JunctionBadgeProps {
  cx: number;
  cy: number;
  r: number;
  angleDeg: number;
  size: number;
  direction: "down" | "up";
}

/** Huy hieu tron den nho o diem giao giua 2 dai mau, co mui ten trang ben trong. */
function JunctionBadge({ cx, cy, r, angleDeg, size, direction }: JunctionBadgeProps) {
  const pos = polar(cx, cy, r, angleDeg);
  const half = size / 2;
  return (
    <g transform={`translate(${pos.x - half}, ${pos.y - half})`}>
      <circle cx={half} cy={half} r={half} fill="var(--ink)" stroke="var(--surface)" strokeWidth={2.5} />
      {direction === "down" ? (
        <path
          d={`M ${half - size * 0.16} ${half - size * 0.07} L ${half} ${half + size * 0.13} L ${half + size * 0.16} ${half - size * 0.07}`}
          fill="none"
          stroke="#ffffff"
          strokeWidth={1.8}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      ) : (
        <path
          d={`M ${half - size * 0.16} ${half + size * 0.07} L ${half} ${half - size * 0.13} L ${half + size * 0.16} ${half + size * 0.07}`}
          fill="none"
          stroke="#ffffff"
          strokeWidth={1.8}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      )}
    </g>
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

const TRACK_R_RATIO = 0.9;
const BAND_WIDTH_RATIO = 0.1;

export default function CycleRadialDial({
  size = 260,
  avgCycleLength,
  avgPeriodLength,
  periodColor,
  fertileColor,
  children,
}: CycleRadialDialProps) {
  const cx = size / 2;
  const cy = size / 2;
  const r = (size / 2) * TRACK_R_RATIO;
  const bandWidth = size * BAND_WIDTH_RATIO;
  const fontSize = Math.max(9, size * 0.042);

  const dayToDeg = (day: number) => (day / avgCycleLength) * 360;

  const periodStartDeg = dayToDeg(0);
  const periodEndDeg = dayToDeg(avgPeriodLength);

  const ovulationDay = avgCycleLength - 14;
  const fertileStartDeg = dayToDeg(Math.max(periodEndDeg / 360 * avgCycleLength + 1, ovulationDay - 5));
  const fertileEndDeg = dayToDeg(ovulationDay + 1);

  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="block">
        {/* Ray nen mo cho phan con lai cua vong tron (ngoai 2 dai mau) */}
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="var(--ink)" strokeOpacity={0.06} strokeWidth={bandWidth} />

        <ArcBand
          id="cycle-dial-period-band"
          cx={cx}
          cy={cy}
          r={r}
          bandWidth={bandWidth}
          fromDeg={periodStartDeg}
          toDeg={periodEndDeg}
          color={periodColor}
          label="Kỳ kinh"
          fontSize={fontSize}
        />
        <ArcBand
          id="cycle-dial-fertile-band"
          cx={cx}
          cy={cy}
          r={r}
          bandWidth={bandWidth}
          fromDeg={fertileStartDeg}
          toDeg={fertileEndDeg}
          color={fertileColor}
          label="Cửa sổ thụ thai"
          fontSize={fontSize}
        />

        <JunctionBadge cx={cx} cy={cy} r={r} angleDeg={periodEndDeg} size={bandWidth * 1.9} direction="down" />
        <JunctionBadge cx={cx} cy={cy} r={r} angleDeg={fertileStartDeg} size={bandWidth * 1.9} direction="up" />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-1 px-8 text-center">
        {children}
      </div>
    </div>
  );
}

