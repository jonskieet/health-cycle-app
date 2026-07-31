"use client";

// J7 (bam sat lai theo anh mau tham khao, bo chi bao giot nuoc bi loi):
// 1. Bo han `TodayTeardrop` - anh mau khong co chi tiet nay, va no la
//    nguon goc loi hien thi (oval + duong thang vot ra ngoai the o ban
//    truoc). Ngay hien tai gio chi duoc nhan biet qua thanh tick dam/dai
//    hon trong `DayTicks` (khong them phan tu rieng nao khac).
// 2. Doi icon trong huy hieu tron den TU mui ten chevron SANG icon dong ho
//    (kim gio + kim phut) giong het anh mau - khong con xoay theo goc nua
//    (icon dong ho nhin giong nhau moi huong nen khong can xoay).
// 3. Them DUONG TRANG DUT NET chay doc theo dai mau, noi tu giua chu
//    (label) den huy hieu tron - giong hieu ung "leader line" trong anh
//    mau, dung chinh cung tron ban kinh `r` (cung ban kinh voi dai mau).
// 4. Them hoa tiet net gach cheo mo (hatch pattern) lam nen phia sau toan
//    bo khoi vong tron, giong lop nen trang tri trong anh mau.
// Vong tick (moi thanh = 1 ngay) VAN nam ngoai vong dai mau nhu ban truoc
// - dung yeu cau, giu nguyen.

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
  /** Huy hieu (va duong dan trang) nam o dau "from" hay dau "to" cua cung. */
  badgeAtStart: boolean;
}

/**
 * 1 dai mau day (band) + chu cong nam giua dai (fit khi can thu nho, khong
 * bao gio bi phong to/keo gian) + 1 duong trang dut net noi tu chu den
 * huy hieu tron o dau con lai cua cung.
 */
function ArcBand({ id, cx, cy, r, bandWidth, fromDeg, toDeg, color, label, fontSize, badgeAtStart }: BandProps) {
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

  const badgeDeg = badgeAtStart ? fromDeg : toDeg;
  const leaderSweep = badgeDeg > mid ? 1 : 0;
  const leaderPathD = describeArc(cx, cy, r, mid, badgeDeg, leaderSweep);

  return (
    <>
      <defs>
        <path id={id} d={textPathD} fill="none" />
      </defs>
      <path d={bandPathD} fill="none" stroke={color} strokeWidth={bandWidth} strokeLinecap="round" />
      <path
        d={leaderPathD}
        fill="none"
        stroke="#ffffff"
        strokeOpacity={0.75}
        strokeWidth={1.4}
        strokeDasharray="1 4"
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

/** Huy hieu tron den nho o diem noi giua 2 dai mau, chua icon dong ho (kim gio + kim phut) giong anh mau. */
function JunctionBadge({ cx, cy, r, angleDeg, size }: JunctionBadgeProps) {
  const pos = polar(cx, cy, r, angleDeg);
  const half = size / 2;
  const faceR = size * 0.28;
  return (
    <g transform={`translate(${pos.x}, ${pos.y})`}>
      <circle cx={0} cy={0} r={half} fill="var(--ink)" stroke="var(--surface)" strokeWidth={2.5} />
      <circle cx={0} cy={0} r={faceR} fill="none" stroke="#ffffff" strokeWidth={1.4} />
      {/* kim gio */}
      <line x1={0} y1={0} x2={0} y2={-faceR * 0.55} stroke="#ffffff" strokeWidth={1.4} strokeLinecap="round" />
      {/* kim phut */}
      <line x1={0} y1={0} x2={faceR * 0.65} y2={0} stroke="#ffffff" strokeWidth={1.4} strokeLinecap="round" />
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

/** Vong thanh nho quanh vien, nam ngoai vong dai mau - moi thanh = 1 ngay trong chu ky. */
function DayTicks({ cx, cy, r, count, currentDay, tickLength, majorEvery = 7 }: DayTicksProps) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => {
        const day = i + 1;
        const deg = (i / count) * 360;
        const isToday = day === currentDay;
        const isMajor = !isToday && day % majorEvery === 0;
        const len = isToday ? tickLength * 1.6 : isMajor ? tickLength * 1.2 : tickLength * 0.8;
        const inner = polar(cx, cy, r, deg);
        const outer = polar(cx, cy, r + len, deg);
        return (
          <line
            key={day}
            x1={inner.x}
            y1={inner.y}
            x2={outer.x}
            y2={outer.y}
            stroke="var(--ink)"
            strokeOpacity={isToday ? 0.85 : isMajor ? 0.32 : 0.16}
            strokeWidth={isToday ? 2.4 : isMajor ? 1.6 : 1.1}
            strokeLinecap="round"
          />
        );
      })}
    </>
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

const TRACK_R_RATIO = 0.78;
const BAND_WIDTH_RATIO = 0.1;
// Canvas SVG hoi lon hon kich thuoc "logic" (`size`) de vong tick (nam
// NGOAI dai mau) co du cho, khong bi cat o mep.
const CANVAS_RATIO = 1.22;

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
  const tickLength = bandWidth * 0.7;
  const tickR = r + bandWidth * 0.75;

  const dayToDeg = (day: number) => (day / avgCycleLength) * 360;

  const periodStartDeg = dayToDeg(0);
  const periodEndDeg = dayToDeg(avgPeriodLength);

  const ovulationDay = avgCycleLength - 14;
  const fertileStartDeg = dayToDeg(Math.max(periodEndDeg / 360 * avgCycleLength + 1, ovulationDay - 5));
  const fertileEndDeg = dayToDeg(ovulationDay + 1);

  const clampedDay = Math.min(currentDay, avgCycleLength);

  // Hoa tiet net gach cheo mo lam nen trang tri phia sau vong tron, giong
  // lop nen trong anh mau - 1 pattern SVG lap lai, mau tim/hong rat nhat.
  const hatchId = "cycle-dial-hatch";

  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg
        width={canvas}
        height={canvas}
        viewBox={`0 0 ${canvas} ${canvas}`}
        className="absolute overflow-visible"
        style={{ left: (size - canvas) / 2, top: (size - canvas) / 2 }}
      >
        <defs>
          <pattern id={hatchId} width={9} height={9} patternTransform="rotate(45)" patternUnits="userSpaceOnUse">
            <line x1={0} y1={0} x2={0} y2={9} stroke="var(--c-fertile)" strokeOpacity={0.22} strokeWidth={1} />
          </pattern>
        </defs>
        <circle cx={cx} cy={cy} r={r + bandWidth * 0.5} fill={`url(#${hatchId})`} />

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
          badgeAtStart={false}
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
          badgeAtStart={true}
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
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-1 px-9 text-center">
        {children}
      </div>
    </div>
  );
}
