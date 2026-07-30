"use client";

// J6 (them theo yeu cau moi): them 1 VONG THANH NHO (tick) BAO QUANH vong
// tron, moi thanh dai dien cho 1 NGAY trong chu ky (tong so thanh =
// avgCycleLength) - thanh tai NGAY HIEN TAI duoc lam noi bat (dam +dai
// hon). Them 1 CHI BAO HINH GIOT NUOC (teardrop) nam NGOAI vong, dau nhon
// cham dung vao thanh cua ngay hien tai de "chi" vao đo - huong cua giot
// nuoc tu xoay theo goc (`rotate(angleDeg)`) nen dau nhon luon huong dung
// vao tam vong tron bat ke ngay hien tai roi vao vi tri nao quanh vong.
//
// J5 (giu nguyen, van con hieu luc):
// 1. Chu tren dai mau CHI thu nho khi can (khong bao gio phong to/keo
//    gian) - lay `Math.min(do_dai_chu_tu_nhien, do_dai_cung_kha_dung)`.
// 2. Huy hieu tron o 2 diem noi giua 2 dai mau nho lai (~1.2x be day dai).
// 3. Mui ten trong huy hieu xoay theo dung huong tiep tuyen chieu kim dong
//    ho tai vi tri dat no, khong con gan cung 1 huong cho ca 2 huy hieu.

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

interface DayTicksProps {
  cx: number;
  cy: number;
  r: number;
  count: number;
  currentDay: number;
  tickLength: number;
  majorEvery?: number;
}

/** Vong thanh nho quanh vien - moi thanh = 1 ngay trong chu ky. */
function DayTicks({ cx, cy, r, count, currentDay, tickLength, majorEvery = 7 }: DayTicksProps) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => {
        const day = i + 1;
        const deg = (i / count) * 360;
        const isToday = day === currentDay;
        const isMajor = !isToday && day % majorEvery === 0;
        const len = isToday ? tickLength * 1.5 : isMajor ? tickLength * 1.15 : tickLength * 0.8;
        const inner = polar(cx, cy, r - len, deg);
        const outer = polar(cx, cy, r + len * 0.15, deg);
        return (
          <line
            key={day}
            x1={inner.x}
            y1={inner.y}
            x2={outer.x}
            y2={outer.y}
            stroke={isToday ? "var(--ink)" : "var(--ink)"}
            strokeOpacity={isToday ? 0.9 : isMajor ? 0.35 : 0.18}
            strokeWidth={isToday ? 2.6 : isMajor ? 1.6 : 1.1}
            strokeLinecap="round"
          />
        );
      })}
    </>
  );
}

interface TodayTeardropProps {
  cx: number;
  cy: number;
  r: number;
  angleDeg: number;
  size: number;
  color: string;
}

/**
 * Chi bao hinh giot nuoc, dau nhon cham dung vao thanh ngay hien tai tren
 * vong tick. Xoay theo `angleDeg` (cung cach tinh nhu `JunctionBadge`) nen
 * dau nhon luon huong vao tam vong tron, bat ke ngay hien tai o vi tri nao.
 */
function TodayTeardrop({ cx, cy, r, angleDeg, size, color }: TodayTeardropProps) {
  const tip = polar(cx, cy, r, angleDeg);
  const bulbR = size * 0.5;
  const h = size * 1.35;
  const d = `M 0 0
    C ${-bulbR * 0.95} ${-h * 0.5} ${-bulbR} ${-h * 0.95} 0 ${-h}
    C ${bulbR} ${-h * 0.95} ${bulbR * 0.95} ${-h * 0.5} 0 0 Z`;
  return (
    <g transform={`translate(${tip.x}, ${tip.y}) rotate(${angleDeg})`}>
      <path d={d} fill={color} stroke="var(--surface)" strokeWidth={1.5} />
      <circle cx={0} cy={-h * 0.62} r={bulbR * 0.34} fill="var(--surface)" />
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
// Canvas SVG lon hon kich thuoc "logic" (`size`) de vong tick + chi bao
// giot nuoc moi (nam NGOAI dai mau) co du cho, khong bi cat. Div bao ngoai
// van giu dung `width/height = size` (khong doi bo cuc trang goi component
// - card cha da co du khoang trong xung quanh de phan tran ra ngoai nay
// khong va cham gi).
const CANVAS_RATIO = 1.45;

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
  const r = (size / 2) * TRACK_R_RATIO;
  const bandWidth = size * BAND_WIDTH_RATIO;
  const fontSize = Math.max(9, size * 0.038);
  const tickLength = bandWidth * 0.55;
  const tickR = r + bandWidth * 0.75;

  const dayToDeg = (day: number) => (day / avgCycleLength) * 360;

  const periodStartDeg = dayToDeg(0);
  const periodEndDeg = dayToDeg(avgPeriodLength);

  const ovulationDay = avgCycleLength - 14;
  const fertileStartDeg = dayToDeg(Math.max(periodEndDeg / 360 * avgCycleLength + 1, ovulationDay - 5));
  const fertileEndDeg = dayToDeg(ovulationDay + 1);

  const clampedDay = Math.min(currentDay, avgCycleLength);
  const todayDeg = dayToDeg(clampedDay - 0.5);
  const todayColor = clampedDay <= avgPeriodLength ? periodColor : "var(--ink)";

  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg
        width={canvas}
        height={canvas}
        viewBox={`0 0 ${canvas} ${canvas}`}
        className="absolute overflow-visible"
        style={{ left: (size - canvas) / 2, top: (size - canvas) / 2 }}
      >
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

        <DayTicks
          cx={cx}
          cy={cy}
          r={tickR}
          count={avgCycleLength}
          currentDay={clampedDay}
          tickLength={tickLength}
        />
        <TodayTeardrop
          cx={cx}
          cy={cy}
          r={tickR + tickLength * 1.5 + 1}
          angleDeg={todayDeg}
          size={bandWidth * 0.6}
          color={todayColor}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-1 px-9 text-center">
        {children}
      </div>
    </div>
  );
}
