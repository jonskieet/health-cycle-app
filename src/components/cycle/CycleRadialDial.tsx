"use client";

// J9 (theo Cycle_Wheel_Design_Specification.md — viết lại toàn bộ component):
// Day KHONG con la 1 progress ring. Day la 1 duong tron 360 do bieu dien
// TOAN BO chu ky, voi cac lop doc lap:
//   Layer 1  Outer Tick Ring       — moi vach = 1 ngay trong chu ky
//   Layer 2  Decorative Bg Ring    — vong mo trang tri, tach timeline khoi tam
//   Layer 3  Phase Timeline Ring   — cung mau CO DINH cho Ky kinh / Cua so thu thai
//   Layer 4  Current Position Marker — cham "Hom nay", DI CHUYEN theo currentDay
//   Layer 5  Center Circle         — nen tron nhat o giua
//   Layer 6  Center Content        — do children ben ngoai truyen vao
//
// Quan trong: 2 cung mau (period/fertile) la vi tri CO DINH theo ngay chu
// ky, KHONG phai % hoan thanh — khong duoc animate nhu 1 gauge. Chi co
// Layer 4 (marker Hom nay) la di chuyen quanh vong theo currentDay.

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

// Uoc luong tho do rong chu in dam theo fontSize (SSR-friendly, khong dung canvas).
function estimateTextWidth(label: string, fontSize: number) {
  return label.length * fontSize * 0.58;
}

interface PhaseArcProps {
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

/**
 * Layer 3 — 1 doan cung "phase" voi bo tron 2 dau (rounded caps) + nhan chu
 * cong theo dung do cong cua cung (khong bao gio hien thi nhan nam ngang).
 */
function PhaseArc({ id, cx, cy, r, bandWidth, fromDeg, toDeg, color, label, fontSize }: PhaseArcProps) {
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
      <path d={bandPathD} fill="none" stroke={color} strokeWidth={bandWidth} strokeLinecap="round" />
      <text fontSize={fontSize} fontWeight={600} fill="#ffffff" letterSpacing="0.2">
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

interface TodayMarkerProps {
  cx: number;
  cy: number;
  r: number;
  angleDeg: number;
  outerSize: number;
}

/**
 * Layer 4 — cham "Hom nay" duy nhat, DI CHUYEN theo currentDay (khac han
 * huy hieu tinh o diem noi 2 cung nhu ban cu). Vong ngoai trang + shadow
 * noi, vong trong toi mau, dau check o giua. Cham nam de len mep cung mau
 * (overlap nhe), khong nam lot han vao trong stroke.
 */
function TodayMarker({ cx, cy, r, angleDeg, outerSize }: TodayMarkerProps) {
  const pos = polar(cx, cy, r, angleDeg);
  const outerR = outerSize / 2;
  const innerR = outerR * (28 / 36);
  return (
    <g transform={`translate(${pos.x}, ${pos.y})`}>
      <circle cx={0} cy={0} r={outerR + 2} fill="#000000" opacity={0.14} />
      <circle cx={0} cy={0} r={outerR} fill="#ffffff" />
      <circle cx={0} cy={0} r={innerR} fill="#202020" />
      <path
        d={`M ${-innerR * 0.42} ${0} L ${-innerR * 0.1} ${innerR * 0.32} L ${innerR * 0.45} ${-innerR * 0.35}`}
        fill="none"
        stroke="#ffffff"
        strokeWidth={Math.max(1.5, innerR * 0.16)}
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
  tickLength: number;
  majorEvery?: number;
}

/** Layer 1 — vong tick ngoai cung, moi vach = 1 ngay trong chu ky (thuan tuy tham chieu, khong phai chi bao tien do). */
function DayTicks({ cx, cy, r, count, tickLength, majorEvery = 5 }: DayTicksProps) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => {
        const day = i + 1;
        const deg = (i / count) * 360;
        const isMajor = day % majorEvery === 0;
        const len = isMajor ? tickLength * 1.5 : tickLength;
        const inner = polar(cx, cy, r, deg);
        const outer = polar(cx, cy, r + len, deg);
        return (
          <line
            key={day}
            x1={inner.x}
            y1={inner.y}
            x2={outer.x}
            y2={outer.y}
            stroke="#2F2F2F"
            strokeOpacity={0.35}
            strokeWidth={1.5}
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

// Ty le hinh hoc theo dung Cycle_Wheel_Design_Specification.md, quy ve
// phan tram cua `size` (duong kinh logic cua wheel).
const PHASE_R_RATIO = 0.375; // ban kinh vong Phase Timeline (Layer 3)
const BAND_WIDTH_RATIO = 0.1; // do day cung mau
const DECORATIVE_R_RATIO = 0.43; // ban kinh vong nen trang tri (Layer 2)
const CENTER_CIRCLE_D_RATIO = 0.72; // duong kinh Center Circle (Layer 5) ≈72% wheel
const MARKER_D_RATIO = 36 / 260; // duong kinh cham Hom nay, ty le theo spec (36px @ size 260)
// Canvas SVG lon hon size logic de vong tick (nam NGOAI cung mau) co du cho, khong bi cat mep.
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

  const r = size * PHASE_R_RATIO;
  const bandWidth = size * BAND_WIDTH_RATIO;
  const fontSize = Math.max(9, size * 0.038);

  const decorativeR = size * DECORATIVE_R_RATIO;
  const tickR = decorativeR + bandWidth * 0.28;
  const tickLength = bandWidth * 0.65;

  const centerCircleR = (size * CENTER_CIRCLE_D_RATIO) / 2;
  const markerOuterSize = size * MARKER_D_RATIO;

  const dayToDeg = (day: number) => (day / avgCycleLength) * 360;

  const periodStartDeg = dayToDeg(0);
  const periodEndDeg = dayToDeg(avgPeriodLength);

  const ovulationDay = avgCycleLength - 14;
  const fertileStartDeg = dayToDeg(Math.max(periodEndDeg / 360 * avgCycleLength + 1, ovulationDay - 5));
  const fertileEndDeg = dayToDeg(ovulationDay + 1);

  const clampedDay = Math.min(Math.max(currentDay, 1), avgCycleLength);
  // Layer 4: vi tri cham "Hom nay" — DUY NHAT phan tu di chuyen theo currentDay.
  // Dat o giua ngay hien tai (trung diem [day-1, day]) de nam tren duong tick tuong ung.
  const markerDeg = dayToDeg(clampedDay - 0.5);

  // Hoa tiet net gach cheo rat mo dung chung cho Layer 2 va Layer 5 (////, opacity 3-5%).
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
            <line x1={0} y1={0} x2={0} y2={9} stroke="#2F2F2F" strokeOpacity={0.4} strokeWidth={1} />
          </pattern>
        </defs>

        {/* Layer 1 — Outer Tick Ring: moi vach = 1 ngay, day 1.5px, moi ngay thu 5 dai hon. */}
        <DayTicks cx={cx} cy={cy} r={tickR} count={avgCycleLength} tickLength={tickLength} />

        {/* Layer 2 — Decorative Background Ring: vong mo #F5F5F7, hoa tiet gach cheo 3-5%, tach timeline khoi tam. */}
        <circle cx={cx} cy={cy} r={decorativeR} fill="none" stroke="#F5F5F7" strokeWidth={bandWidth * 1.7} />
        <circle
          cx={cx}
          cy={cy}
          r={decorativeR}
          fill="none"
          stroke={`url(#${hatchId})`}
          strokeWidth={bandWidth * 1.7}
          opacity={0.04}
        />

        {/* Cac pha con lai (khong phai Ky kinh/Cua so thu thai) hoa mo vao nen — trong so hinh anh thap hon han. */}
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="var(--ink)" strokeOpacity={0.05} strokeWidth={bandWidth} />

        {/* Layer 3 — Phase Timeline Ring: 2 cung CO DINH theo ngay chu ky, khong phai % hoan thanh. */}
        <PhaseArc
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
        <PhaseArc
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

        {/* Layer 4 — Current Position Marker: cham "Hom nay" duy nhat, di chuyen theo currentDay. */}
        <TodayMarker cx={cx} cy={cy} r={r} angleDeg={markerDeg} outerSize={markerOuterSize} />

        {/* Layer 5 — Center Circle: nen tron nhat giua wheel, cung hoa tiet voi Layer 2, khong vien. */}
        <circle cx={cx} cy={cy} r={centerCircleR} fill="#F5F5F7" />
        <circle cx={cx} cy={cy} r={centerCircleR} fill={`url(#${hatchId})`} opacity={0.04} />
      </svg>

      {/* Layer 6 — Center Content: do phia goi (children) quyet dinh thu tu Pha / So ngay / Nhan / CTA. */}
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-1 px-9 text-center">
        {children}
      </div>
    </div>
  );
}
