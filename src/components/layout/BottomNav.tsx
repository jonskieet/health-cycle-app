"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { LayoutGrid, Droplet, Plus, BookOpen, User } from "lucide-react";

// Redesign (2026-08-01 — "Notched Card Navigation", theo tham chiếu ứng dụng
// "Victoria"): thay bản floating-tách-rời (2026-07-31 #3) bằng kiểu NOTCH LÕM
// ôm sát nút "+" — viền trên của thanh nav được khoét cong theo đúng bán kính
// FAB (không còn là đường thẳng), khiến nút trông "lồng" vào thanh thay vì chỉ
// đè chồng lớp. Path notch đo bằng ResizeObserver để luôn khớp pixel thật của
// bar dù width co giãn theo màn hình (không hard-code %).
// Đồng thời đổi mỗi tab từ "1 màu tím dùng chung" sang Ô THẺ (tile) bo góc,
// mỗi tab 1 màu riêng: nhạt (pastel, ~14% alpha) khi thường, ĐẶC màu + icon
// trắng khi active — giống cách "Cycle" nổi bật bằng nền hồng đậm ở ảnh mẫu.
const items = [
  { href: "/", label: "Tổng quan", icon: LayoutGrid, color: "var(--nav-tile-overview)" },
  { href: "/cycle", label: "Chu kỳ", icon: Droplet, color: "var(--nav-tile-cycle)" },
  { href: "/library", label: "Thư viện", icon: BookOpen, color: "var(--nav-tile-library)" },
  { href: "/profile", label: "Cá nhân", icon: User, color: "var(--nav-tile-profile)" },
];
const fab = { href: "/log", label: "Ghi nhận", icon: Plus };

const BAR_H = 84;
const TOP_R = 28; // bo góc trên của bar
const NOTCH_R = 38; // bán kính "miệng" notch — chỉnh theo phản hồi thực tế trên máy (2026-08-01 #4), 34 hơi chật, 38 vừa ôm sát nút vừa đủ thở
const NOTCH_DEPTH = 40; // độ lõm sâu — giữ đủ sâu để nửa dưới FAB chìm vào trong

// Fix (2026-08-01 #3): bản #2 kéo wingSpan quá rộng (NOTCH_R * 2.3) khiến
// vùng lõm loe ra xa 2 bên, nhìn như 1 cái máng rộng chứ không "bo" theo hình
// nút "+" nữa. Thu hẹp wingSpan sát lại gần NOTCH_R (chỉ hơn ~15%) để đường
// cong bám sát đường kính thật của FAB — vẫn giữ control point thoải (nằm
// ngang tại điểm nối) để không bị gãy góc như bản #1, nhưng độ "ôm" rõ hơn.
function buildNotchPath(width: number) {
  const w = Math.max(width, 200);
  const h = BAR_H;
  const cx = w / 2;
  const wingSpan = NOTCH_R * 1.15; // sát viền FAB, chỉ đủ chỗ để đường cong không bị gãy góc
  const nl = cx - wingSpan;
  const nr = cx + wingSpan;

  return `
    M0,${TOP_R}
    Q0,0 ${TOP_R},0
    L${nl},0
    C${cx - wingSpan * 0.6},0 ${cx - NOTCH_R},${NOTCH_DEPTH} ${cx},${NOTCH_DEPTH}
    C${cx + NOTCH_R},${NOTCH_DEPTH} ${cx + wingSpan * 0.6},0 ${nr},0
    L${w - TOP_R},0
    Q${w},0 ${w},${TOP_R}
    L${w},${h}
    L0,${h}
    Z
  `;
}

export default function BottomNav() {
  const pathname = usePathname();
  const wrapRef = useRef<HTMLDivElement>(null);
  const [barWidth, setBarWidth] = useState(390);

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const ro = new ResizeObserver((entries) => {
      const w = entries[0]?.contentRect.width;
      if (w) setBarWidth(w);
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  if (
    pathname === "/login" ||
    pathname === "/onboarding" ||
    pathname === "/profile/report" ||
    pathname === "/settings" ||
    pathname === "/upgrade" ||
    pathname === "/kegel" ||
    pathname === "/fatigue-test" ||
    pathname.startsWith("/library/")
  )
    return null;

  return (
    <nav
      className="app-bottom-nav absolute inset-x-0 bottom-0 z-20 mx-auto w-full"
      style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
    >
      <div ref={wrapRef} className="relative" style={{ height: BAR_H }}>
        {/* Lớp nền — "kính mờ" thật thay vì chỉ tô màu trắng gần đặc: giảm
            alpha nền xuống để backdrop-blur lộ rõ màu/ánh sáng từ nội dung
            phía sau xuyên qua (nhìn thấy có "chất liệu" hơn), viền trên là 1
            đường sáng mảnh riêng (không dùng chung màu với stroke path) mô
            phỏng ánh phản chiếu trên mép kính thật, tách biệt với bóng đổ mềm
            lan toả rộng phía dưới để tạo cảm giác thanh nav lơ lửng. */}
        <div
          className="absolute inset-0"
          style={{
            backdropFilter: "blur(22px) saturate(1.3)",
            WebkitBackdropFilter: "blur(22px) saturate(1.3)",
            clipPath: `path('${buildNotchPath(barWidth)}')`,
            filter: "drop-shadow(0 -10px 30px rgba(36, 27, 47, 0.10))",
          }}
        >
          <svg
            className="absolute inset-0"
            width="100%"
            height={BAR_H}
            viewBox={`0 0 ${barWidth} ${BAR_H}`}
            preserveAspectRatio="none"
          >
            <path d={buildNotchPath(barWidth)} fill="var(--nav-bar-bg)" />
          </svg>
        </div>
        {/* Viền sáng mảnh ôm theo đúng path notch — vẽ riêng, KHÔNG có fill,
            chỉ stroke, để nổi rõ như ánh sáng viền mép kính chứ không bị lẫn
            vào nền mờ phía dưới. */}
        <svg
          className="absolute inset-0 pointer-events-none"
          width="100%"
          height={BAR_H}
          viewBox={`0 0 ${barWidth} ${BAR_H}`}
          preserveAspectRatio="none"
        >
          <path
            d={buildNotchPath(barWidth)}
            fill="none"
            stroke="var(--glass-border)"
            strokeWidth={1.5}
          />
        </svg>

        {/* Lớp nội dung — 4 tab dàn 2 bên khoảng trống trung tâm (nơi notch
            khoét), grid 5 cột giữ đối xứng tuyệt đối như bản trước. */}
        <div
          className="relative grid h-full items-center"
          style={{ gridTemplateColumns: "1fr 1fr 84px 1fr 1fr", padding: "0 14px" }}
        >
          {items.slice(0, 2).map((item) => (
            <NavItem key={item.href} {...item} active={isActive(pathname, item.href)} />
          ))}
          <div aria-hidden />
          {items.slice(2).map((item) => (
            <NavItem key={item.href} {...item} active={isActive(pathname, item.href)} />
          ))}
        </div>

        {/* FAB — lồng hẳn vào lòng notch (không viền trắng bọc ngoài như bản
            trước — ảnh mẫu "Victoria" không có viền tách lớp, nút hoà thẳng
            vào phần lõm). Đổi từ gradient tím→xanh cyan sang tím ĐẶC 1 tông
            (đậm nhạt nhẹ trên-dưới để có chiều sâu) đúng phối màu ảnh mẫu. */}
        <Link
          href={fab.href}
          aria-label={fab.label}
          className="fab-float absolute left-1/2 z-10 flex h-16 w-16 -translate-x-1/2 items-center justify-center rounded-full text-white transition-transform active:scale-[0.94]"
          style={{
            top: -30,
            background: "linear-gradient(180deg, #A66BFF 0%, #8B4FE8 100%)",
            boxShadow: "0 10px 28px -4px rgba(139, 79, 232, 0.55)",
          }}
        >
          <fab.icon size={22} strokeWidth={2.25} />
        </Link>
      </div>
    </nav>
  );
}

function isActive(pathname: string, href: string) {
  return href === "/" ? pathname === "/" : pathname.startsWith(href);
}

function NavItem({
  href,
  label,
  icon: Icon,
  color,
  active,
}: {
  href: string;
  label: string;
  icon: typeof LayoutGrid;
  color: string;
  active: boolean;
}) {
  return (
    <Link
      href={href}
      className="nav-item flex flex-col items-center justify-center gap-1"
    >
      {/* Ô thẻ (tile) bo góc — pastel nhạt khi thường, đặc màu + icon trắng
          khi active. Đây là điểm khác biệt chính so với bản cũ (chỉ đổi màu
          icon/label, không có nền khối riêng cho từng tab). */}
      <div
        className="flex items-center justify-center rounded-2xl transition-all duration-[250ms] ease-out"
        style={{
          width: active ? 44 : 38,
          height: active ? 44 : 38,
          background: active ? color : `color-mix(in srgb, ${color} 14%, transparent)`,
          boxShadow: active ? `0 6px 16px -4px color-mix(in srgb, ${color} 55%, transparent)` : "none",
        }}
      >
        <Icon
          size={active ? 21 : 19}
          strokeWidth={active ? 2 : 1.6}
          color={active ? "#ffffff" : color}
        />
      </div>
      <span
        className="text-[10.5px] leading-none font-medium transition-opacity duration-[250ms] ease-out"
        style={{
          opacity: active ? 1 : 0.75,
          color: active ? "var(--ink)" : "var(--ink-soft)",
          fontWeight: active ? 700 : 500,
        }}
      >
        {label}
      </span>
    </Link>
  );
}
