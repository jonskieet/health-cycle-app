"use client";

// J10 — DAP DI XAY LAI TU DAU (thay vi vá tiếp bản J9).
//
// Huong thiet ke moi ("modern"):
// - Bo hoan toan chu cong tren <textPath> (nguon goc loi J9 tung gap tren
//   webkit) — nhan pha nay gio la 1 "chip" HTML phang, dat canh cung mau
//   bang toa do da tinh san, luon doc thang, khong bao gio bi meo/vang.
// - Bo lop "Decorative Ring" hoa tiet gach cheo kieu cu — thay bang 1 vong
//   nen phang + 1 quang sang mo (blurred aura) phia sau cho co chieu sau,
//   dung ngon ngu thiet ke "soft glow" pho bien o cac app suc khoe hien dai.
// - Cung mau dung gradient (dam -> nhat) + do bong mem cung mau (drop
//   shadow) thay vi mau phang don, nhin "cao cap" hon.
// - Cham "Hom nay" doi tu "huy hieu hinh check" sang 1 cham tron nho co
//   vong sang lan toa (pulse) — toi gian, hien dai, khong con chi tiet
//   thua.
// - Tick ngay: giu spec "1 vach = 1 ngay" nhung lam SIEU MANH + SIEU MO,
//   chi vach moi 5 ngay noi ro hon mot chut — tranh cam giac "vong rang
//   cua roi rac" cua ban cu.

function polar(cx: number, cy: number, r: number, angleDeg: number) {
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

function describeArc(cx: number, cy: number, r: number, fromDeg: number, toDeg: number) {
  const from = polar(cx, cy, r, fromDeg);
  const to = polar(cx, cy, r, toDeg);
  const large = Math.abs(toDeg - fromDeg) > 180 ? 1 : 0;
  return `M ${from.x} ${from.y} A ${r} ${r} 0 ${large} 1 ${to.x} ${to.y}`;
}

interface DayTicksProps {
  cx: number;
  cy: number;
  r: number;
  count: number;
  tickLength: number;
  majorEvery?: number;
}

/** Vong tick sieu manh — moi vach = 1 ngay, chi la tham chieu thoi gian, khong phai chi bao tien do. */
function DayTicks({ cx, cy, r, count, tickLength, majorEvery = 5 }: DayTicksProps) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => {
        const day = i + 1;
        const deg = (i / count) * 360;
        const isMajor = day % majorEvery === 0;
        const len = isMajor ? tickLength * 1.7 : tickLength;
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
            strokeOpacity={isMajor ? 0.28 : 0.12}
            strokeWidth={isMajor ? 1.4 : 1}
            strokeLinecap="round"
          />
        );
      })}
    </>
  );
}

interface PhaseArcProps {
  gradientId: string;
  cx: number;
  cy: number;
  r: number;
  bandWidth: number;
  fromDeg: number;
  toDeg: number;
  colorFrom: string;
  colorTo: string;
  glow: string;
}

/** Layer cung mau — gradient + do mo mem (glow) phia duoi, bo tron 2 dau. Khong con chu tren cung. */
function PhaseArc({ gradientId, cx, cy, r, bandWidth, fromDeg, toDeg, colorFrom, colorTo, glow }: PhaseArcProps) {
  const from = polar(cx, cy, r, fromDeg);
  const to = polar(cx, cy, r, toDeg);
  const d = describeArc(cx, cy, r, fromDeg, toDeg);
  return (
    <>
      <defs>
        <linearGradient id={gradientId} x1={from.x} y1={from.y} x2={to.x} y2={to.y} gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor={colorFrom} />
          <stop offset="100%" stopColor={colorTo} />
        </linearGradient>
      </defs>
      <path d={d} fill="none" stroke={glow} strokeWidth={bandWidth + 7} strokeLinecap="round" opacity={0.22} />
      <path d={d} fill="none" stroke={`url(#${gradientId})`} strokeWidth={bandWidth} strokeLinecap="round" />
    </>
  );
}

interface PhaseChipProps {
  cx: number;
  cy: number;
  r: number;
  angleDeg: number;
  color: string;
  label: string;
}

/**
 * Nhan pha dang "chip" HTML phang (khong phai chu cong SVG) — dat o mep
 * ngoai cung mau theo goc giua cung, TU DONG doi huong can trai/phai/tren
 * tuy vi tri quanh vong tron de khong bao gio bi trang chu bi cat/chong
 * len tick. Day la cach an toan nhat tren moi trinh duyet, thay cho
 * <textPath> tung gay loi.
 */
function PhaseChip({ cx, cy, r, angleDeg, color, label }: PhaseChipProps) {
  const pos = polar(cx, cy, r, angleDeg);
  const norm = ((angleDeg % 360) + 360) % 360;
  const isRight = norm > 20 && norm < 160;
  const isLeft = norm > 200 && norm < 340;
  const align: "left" | "right" | "center" = isRight ? "left" : isLeft ? "right" : "center";
  const translateX = align === "left" ? "4px" : align === "right" ? "calc(-100% - 4px)" : "-50%";
  const translateY = norm < 90 || norm > 270 ? "-100%" : "0%";
  return (
    <div
      className="absolute flex items-center gap-1 whitespace-nowrap rounded-full px-2 py-[3px] text-[10px] font-semibold text-white shadow-sm"
      style={{
        left: pos.x,
        top: pos.y,
        transform: `translate(${translateX}, ${translateY})`,
        background: color,
      }}
    >
      {label}
    </div>
  );
}

interface TodayDotProps {
  cx: number;
  cy: number;
  r: number;
  angleDeg: number;
  size: number;
  color: string;
}

/** Layer marker — 1 cham "Hom nay" toi gian, co vong sang lan toa (pulse), DI CHUYEN theo currentDay. */
function TodayDot({ cx, cy, r, angleDeg, size, color }: TodayDotProps) {
  const pos = polar(cx, cy, r, angleDeg);
  return (
    <g transform={`translate(${pos.x}, ${pos.y})`}>
      <circle cx={0} cy={0} r={size * 1.9} fill={color} opacity={0.25} className="cycle-dial-pulse" />
      <circle cx={0} cy={0} r={size + 3} fill="#ffffff" />
      <circle cx={0} cy={0} r={size} fill={color} />
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

const RING_R_RATIO = 0.4; // ban kinh vong cung mau
const BAND_WIDTH_RATIO = 0.095;
const CENTER_D_RATIO = 0.62; // duong kinh vung noi dung giua
const TICK_R_RATIO = 0.485;
const TODAY_DOT_R_RATIO = 5.5 / 260;
const CANVAS_RATIO = 1.3;

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

  const r = size * RING_R_RATIO;
  const bandWidth = size * BAND_WIDTH_RATIO;
  const tickR = size * TICK_R_RATIO;
  const tickLength = bandWidth * 0.5;
  const centerR = (size * CENTER_D_RATIO) / 2;
  const todayDotR = size * TODAY_DOT_R_RATIO;
  const chipR = r + bandWidth / 2 + 4;

  const dayToDeg = (day: number) => (day / avgCycleLength) * 360;

  const periodStartDeg = dayToDeg(0);
  const periodEndDeg = dayToDeg(avgPeriodLength);

  const ovulationDay = avgCycleLength - 14;
  const fertileStartDeg = dayToDeg(Math.max(avgPeriodLength + 1, ovulationDay - 5));
  const fertileEndDeg = dayToDeg(ovulationDay + 1);

  const clampedDay = Math.min(Math.max(currentDay, 1), avgCycleLength);
  const markerDeg = dayToDeg(clampedDay - 0.5);

  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <style>{`
        @keyframes cycleDialPulse {
          0% { transform: scale(0.55); opacity: 0.35; }
          70% { transform: scale(1); opacity: 0; }
          100% { transform: scale(1); opacity: 0; }
        }
        .cycle-dial-pulse {
          transform-origin: center;
          transform-box: fill-box;
          animation: cycleDialPulse 2.6s ease-out infinite;
        }
      `}</style>

      {/* Quang sang mo phia sau vong tron — tao chieu sau kieu "soft glow" thay cho hoa tiet gach cheo cu. */}
      <div
        className="absolute inset-0 rounded-full"
        style={{
          background: `radial-gradient(circle, color-mix(in srgb, ${fertileColor} 18%, transparent) 0%, transparent 70%)`,
          filter: "blur(18px)",
        }}
      />

      <div
        className="absolute overflow-visible"
        style={{ width: canvas, height: canvas, left: (size - canvas) / 2, top: (size - canvas) / 2 }}
      >
        <svg width={canvas} height={canvas} viewBox={`0 0 ${canvas} ${canvas}`} className="absolute overflow-visible">
          {/* Vong nen phang, mong, trung tinh — thay cho vong hoa tiet gach cheo cu. */}
          <circle cx={cx} cy={cy} r={r} fill="none" stroke="var(--ink)" strokeOpacity={0.05} strokeWidth={bandWidth} />

          <DayTicks cx={cx} cy={cy} r={tickR} count={avgCycleLength} tickLength={tickLength} />

          <PhaseArc
            gradientId="cycle-dial-period-grad"
            cx={cx}
            cy={cy}
            r={r}
            bandWidth={bandWidth}
            fromDeg={periodStartDeg}
            toDeg={periodEndDeg}
            colorFrom={periodColor}
            colorTo="color-mix(in srgb, var(--c-period, #FF67B4) 70%, white)"
            glow={periodColor}
          />
          <PhaseArc
            gradientId="cycle-dial-fertile-grad"
            cx={cx}
            cy={cy}
            r={r}
            bandWidth={bandWidth}
            fromDeg={fertileStartDeg}
            toDeg={fertileEndDeg}
            colorFrom={fertileColor}
            colorTo="color-mix(in srgb, var(--c-fertile, #7A6BFF) 70%, white)"
            glow={fertileColor}
          />

          <TodayDot cx={cx} cy={cy} r={r} angleDeg={markerDeg} size={todayDotR} color="var(--ink)" />
        </svg>

        <PhaseChip
          cx={cx}
          cy={cy}
          r={chipR}
          angleDeg={(periodStartDeg + periodEndDeg) / 2}
          color={periodColor}
          label="Kỳ kinh"
        />
        <PhaseChip
          cx={cx}
          cy={cy}
          r={chipR}
          angleDeg={(fertileStartDeg + fertileEndDeg) / 2}
          color={fertileColor}
          label="Cửa sổ thụ thai"
        />
      </div>

      {/* Vung noi dung giua — the mem, do bong nhe, khong con hoa tiet gach cheo. */}
      <div
        className="absolute rounded-full"
        style={{
          width: centerR * 2,
          height: centerR * 2,
          left: size / 2 - centerR,
          top: size / 2 - centerR,
          background: "var(--surface)",
          boxShadow: "0 10px 26px -14px rgba(0,0,0,0.16)",
        }}
      />
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-1 px-9 text-center">
        {children}
      </div>
    </div>
  );
}
