"use client";

// J11 — tham khao 2 mau UI nguoi dung gui (1 mau dang Flo-style co so ngay
// cong quanh vien + nut "Log Period" o giua; 1 mau dang gradient tim-hong
// lien mach voi minh hoa trang tri o giua + cham danh dau tron vien trang)
// de phat trien tiep tren nen tang J10:
// - Them SO NGAY quanh vien (khong phai chi vach tick tron) — xoay huong
//   kinh tuyen nhu mau 1, chi hien moi 5 ngay de khong roi.
// - Vong nen gio la 1 dai pha tron mau nhat (tint tu chinh 2 mau period/
//   fertile) thay vi xam trung tinh — cam giac "lien mach" nhu mau 2 thay
//   vi 2 doan mau roi rac tren nen xam.
// - Cham "Hom nay" doi kieu: vien trang day + loi mau dac o trong (giong
//   cham tron trong mau 2) thay vi cham dac full mau — nhin "cao cap" hon.
// - Them 1 hoa tiet hoa/canh hoa trang tri rat mo phia sau noi dung giua,
//   lay cam hung tu minh hoa tu cung o mau 2 nhung don gian hoa thanh hinh
//   hoc truu tuong (tranh ve icon giai phau chi tiet).
// Giu nguyen toan bo nen tang ky thuat cua J10 (chip HTML phang cho nhan,
// khong dung textPath) vi day la phan da on dinh, khong con loi.

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

/** Vach ngay sieu manh giua 2 so — van giu dung "1 vach = 1 ngay" nhung khong noi bat. */
function DayTicks({ cx, cy, r, count, tickLength, majorEvery = 5 }: DayTicksProps) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => {
        const day = i + 1;
        if (day % majorEvery === 0) return null; // ngay tron chuc/5 da co so, khong ve them vach
        const deg = (i / count) * 360;
        const inner = polar(cx, cy, r, deg);
        const outer = polar(cx, cy, r + tickLength, deg);
        return (
          <line
            key={day}
            x1={inner.x}
            y1={inner.y}
            x2={outer.x}
            y2={outer.y}
            stroke="var(--ink)"
            strokeOpacity={0.14}
            strokeWidth={1}
            strokeLinecap="round"
          />
        );
      })}
    </>
  );
}

interface DayNumbersProps {
  cx: number;
  cy: number;
  r: number;
  count: number;
  fontSize: number;
  majorEvery?: number;
}

/**
 * So ngay quanh vien (lay cam hung tu mau tham khao co vong so 18-26...).
 * Moi so tu xoay huong kinh tuyen tai vi tri cua no — an toan hon nhieu so
 * voi chu tren <textPath> vi day chi la 1-2 ky tu, khong bi hieu ung
 * "van ra ngoai" nhu chuoi chu dai.
 */
function DayNumbers({ cx, cy, r, count, fontSize, majorEvery = 5 }: DayNumbersProps) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => {
        const day = i + 1;
        if (day % majorEvery !== 0) return null;
        const deg = (i / count) * 360;
        const pos = polar(cx, cy, r, deg);
        return (
          <text
            key={day}
            x={pos.x}
            y={pos.y}
            fontSize={fontSize}
            fontWeight={600}
            fill="var(--ink-faint)"
            textAnchor="middle"
            dominantBaseline="middle"
            transform={`rotate(${deg}, ${pos.x}, ${pos.y})`}
          >
            {day}
          </text>
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

/** Cung mau gradient + glow mem phia duoi, bo tron 2 dau — nhan pha nam o ngoai duoi dang chip HTML rieng. */
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
      <path d={d} fill="none" stroke={glow} strokeWidth={bandWidth + 8} strokeLinecap="round" opacity={0.2} />
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

/** Chip HTML phang cho nhan pha — khong dung chu cong SVG (da on dinh tu J10, khong doi lai). */
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

/**
 * Cham "Hom nay" — doi kieu theo mau tham khao (mau 2): vien trang day +
 * loi mau dac ben trong, kem vong sang lan toa (pulse). Van la phan tu
 * DUY NHAT di chuyen theo currentDay quanh vong.
 */
function TodayDot({ cx, cy, r, angleDeg, size, color }: TodayDotProps) {
  const pos = polar(cx, cy, r, angleDeg);
  return (
    <g transform={`translate(${pos.x}, ${pos.y})`}>
      <circle cx={0} cy={0} r={size * 2.1} fill={color} opacity={0.22} className="cycle-dial-pulse" />
      <circle cx={0} cy={0} r={size + 4} fill="#ffffff" />
      <circle cx={0} cy={0} r={size} fill={color} />
    </g>
  );
}

/** Hoa tiet trang tri rat mo trong long vung noi dung giua — lay cam hung tu minh hoa o mau 2, don gian hoa thanh hinh hoc truu tuong. */
function CenterBlossom({ size, color1, color2 }: { size: number; color1: string; color2: string }) {
  const c = size / 2;
  const petals = 6;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="absolute" style={{ left: 0, top: 0 }}>
      <defs>
        <radialGradient id="cycle-dial-blossom-grad" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor={color1} />
          <stop offset="100%" stopColor={color2} />
        </radialGradient>
      </defs>
      <g opacity={0.14}>
        {Array.from({ length: petals }).map((_, i) => {
          const angle = (i / petals) * 360;
          const pos = polar(c, c, size * 0.21, angle);
          return (
            <ellipse
              key={i}
              cx={pos.x}
              cy={pos.y}
              rx={size * 0.17}
              ry={size * 0.11}
              fill="url(#cycle-dial-blossom-grad)"
              transform={`rotate(${angle}, ${pos.x}, ${pos.y})`}
            />
          );
        })}
        <circle cx={c} cy={c} r={size * 0.08} fill="url(#cycle-dial-blossom-grad)" opacity={0.8} />
      </g>
    </svg>
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

const RING_R_RATIO = 0.4;
const BAND_WIDTH_RATIO = 0.095;
const CENTER_D_RATIO = 0.6;
const TICK_R_RATIO = 0.47;
const NUMBER_R_RATIO = 0.5;
const TODAY_DOT_R_RATIO = 5.5 / 260;
const CANVAS_RATIO = 1.34;

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
  const tickLength = bandWidth * 0.45;
  const numberR = size * NUMBER_R_RATIO;
  const numberFontSize = Math.max(8, size * 0.032);
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

  // Mau vong nen: tron nhe 2 mau pha chinh de vong tron nhin "lien mach"
  // giong mau tham khao thay vi 1 mau xam trung tinh khong lien quan.
  const baseRingColor = `color-mix(in srgb, ${periodColor} 50%, ${fertileColor})`;

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

      {/* Quang sang mo phia sau vong tron. */}
      <div
        className="absolute inset-0 rounded-full"
        style={{
          background: `radial-gradient(circle, color-mix(in srgb, ${fertileColor} 16%, transparent) 0%, transparent 70%)`,
          filter: "blur(18px)",
        }}
      />

      <div
        className="absolute overflow-visible"
        style={{ width: canvas, height: canvas, left: (size - canvas) / 2, top: (size - canvas) / 2 }}
      >
        <svg width={canvas} height={canvas} viewBox={`0 0 ${canvas} ${canvas}`} className="absolute overflow-visible">
          {/* Vong nen tinh mau tu 2 pha chinh, thay cho xam trung tinh — cam giac "lien mach" giong mau tham khao. */}
          <circle cx={cx} cy={cy} r={r} fill="none" stroke={baseRingColor} strokeOpacity={0.1} strokeWidth={bandWidth} />

          <DayTicks cx={cx} cy={cy} r={tickR} count={avgCycleLength} tickLength={tickLength} />
          <DayNumbers cx={cx} cy={cy} r={numberR} count={avgCycleLength} fontSize={numberFontSize} />

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

          <TodayDot cx={cx} cy={cy} r={r} angleDeg={markerDeg} size={todayDotR} color={fertileColor} />
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

      {/* Vung noi dung giua — the mem, do bong nhe. */}
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
      <div className="absolute" style={{ left: size / 2 - centerR, top: size / 2 - centerR }}>
        <CenterBlossom size={centerR * 2} color1={periodColor} color2={fertileColor} />
      </div>
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-1 px-9 text-center">
        {children}
      </div>
    </div>
  );
}
