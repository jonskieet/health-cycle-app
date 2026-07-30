"use client";

// J5 (sua 3 loi sau khi xem anh chup may that cua ban J4):
// 1. Chu tren dai mau bi KEO GIAN qua muc ("Kỳ kinh" thanh "K ỳ  k i n h"
//    deu deu). Nguyen nhan: J4 ep `textLength` = het chieu dai CUNG (vd
//    ~100px) trong khi chu that su chi dai ~40px o co chu do -> trinh
//    duyet phai keo gian tung ky tu ra ~2.5 lan de lap day 100px. Sua: chi
//    dung `textLength` de THU NHO khi chu dai hon cung (chong tran), khong
//    bao gio dung no de PHONG TO chu khi cung con du cho - lay
//    `Math.min(do_dai_chu_tu_nhien_uoc_luong, do_dai_cung_kha_dung)`.
// 2. Huy hieu tron o 2 diem noi qua to (dang ban bandWidth*1.9). Sua: giam
//    con ~1.2x be day dai mau, gan voi ty le trong anh mau.
// 3. Mui ten trong huy hieu khong theo huong cua vong chu ky (dai mau di
//    theo chieu kim dong ho nhung ban cu gan cung 1 huong "xuong"/"len" cho
//    ca 2 huy hieu, sai huong tai vi tri gan ngang o mot huy hieu). Sua:
//    KHONG dung 2 huong co dinh (down/up) nua - thay bang 1 mui ten hinh
//    chevron xoay theo dung goc tiep tuyen chieu kim dong ho tai vi tri do
//    (transform rotate = angleDeg), nen luon "chi" dung huong dong chay
//    cua vong chu ky bat ke huy hieu nam o dau tren vong tron.

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

// Uoc luong tho do rong tu nhien cua chu in dam theo fontSize (khong the
// do chinh xac vi day la SSR-friendly, khong dung canvas) - he so ~0.58
// la trung binh hop ly cho font sans-serif dam, chu hoa dau tieng Viet.
function estimateTextWidth(label: string, fontSize: number) {
  return label.length * fontSize * 0.58;
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

/** 1 dai mau day (band) + chu cong nam giua dai, fit KHI CAN THU NHO, khong bao gio bi phong to/keo gian. */
function ArcBand({ id, cx, cy, r, bandWidth, fromDeg, toDeg, color, label, fontSize }: BandProps) {
  const mid = (fromDeg + toDeg) / 2;
  const bottomHalf = mid > 95 && mid < 265;
  const textPathD = bottomHalf
    ? describeArc(cx, cy, r, toDeg, fromDeg, 0)
    : describeArc(cx, cy, r, fromDeg, toDeg, 1);
  const bandPathD = describeArc(cx, cy, r, fromDeg, toDeg, 1);

  const fullLen = arcLengthPx(r, fromDeg, toDeg);
  const available = Math.max(8, fullLen - bandWidth * 1.2);
  const naturalWidth = estimateTextWidth(label, fontSize);
  const fitLen = Math.min(naturalWidth, available);

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
      <text fontSize={fontSize} fontWeight={700} fill="#ffffff" letterSpacing="0.2">
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
}

/**
 * Huy hieu tron den nho o diem noi giua 2 dai mau. Mui ten ben trong luon
 * xoay theo dung huong tiep tuyen CHIEU KIM DONG HO cua vong chu ky tai vi
 * tri `angleDeg` (0deg = 12h, tang dan theo chieu kim dong ho) - vi vay
 * huong mui ten luon khop voi huong "chay" cua chu ky bat ke huy hieu nam
 * o vi tri nao quanh vong tron.
 */
function JunctionBadge({ cx, cy, r, angleDeg, size }: JunctionBadgeProps) {
  const pos = polar(cx, cy, r, angleDeg);
  const half = size / 2;
  const arrow = size * 0.16;
  return (
    <g transform={`translate(${pos.x}, ${pos.y}) rotate(${angleDeg})`}>
      <circle cx={0} cy={0} r={half} fill="var(--ink)" stroke="var(--surface)" strokeWidth={2.5} />
      <path
        d={`M ${-arrow * 0.5} ${-arrow} L ${arrow * 0.5} 0 L ${-arrow * 0.5} ${arrow}`}
        fill="none"
        stroke="#ffffff"
        strokeWidth={1.8}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
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
  const fontSize = Math.max(9, size * 0.038);

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

        <JunctionBadge cx={cx} cy={cy} r={r} angleDeg={periodEndDeg} size={bandWidth * 1.2} />
        <JunctionBadge cx={cx} cy={cy} r={r} angleDeg={fertileStartDeg} size={bandWidth * 1.2} />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-1 px-8 text-center">
        {children}
      </div>
    </div>
  );
}
