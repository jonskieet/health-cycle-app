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
const NOTCH_R = 52; // bán kính "miệng" notch — rộng hơn hẳn đường kính FAB (64) để đường cong thoải, không ôm sát/dính vào nút
const NOTCH_DEPTH = 46; // độ lõm sâu — đủ sâu để nửa dưới FAB chìm hẳn vào trong, tránh nút đè lên mép bar

// Fix (2026-08-01 #2): bản trước dùng 2 cung Bezier nối trực tiếp vào 2 đoạn
// thẳng ở 2 bên → điểm nối bị "gãy" (đổi độ cong đột ngột), nhìn như đường cong
// chưa đủ mượt và FAB như dính chặt vào mép notch. Sửa bằng cách kéo dài đoạn
// cong sang 2 bên (rộng hơn NOTCH_R nhiều — wingSpan) và dùng control point
// thoải hơn (nằm ngang với điểm bắt đầu) để độ dốc bằng 0 tại điểm nối với
// đoạn thẳng, tạo 1 đường cong liền mạch (C1-continuous) giống rãnh "sóng"
// mềm thay vì hình chữ V bo tròn.
function buildNotchPath(width: number) {
  const w = Math.max(width, 200);
  const h = BAR_H;
  const cx = w / 2;
  const wingSpan = NOTCH_R * 2.3; // bề rộng toàn bộ đoạn cong (2 bên + đáy), rộng rãi để độ dốc vào/ra thoải
  const nl = cx - wingSpan;
  const nr = cx + wingSpan;

  return `
    M0,${TOP_R}
    Q0,0 ${TOP_R},0
    L${nl},0
    C${cx - wingSpan * 0.55},0 ${cx - NOTCH_R * 1.05},${NOTCH_DEPTH} ${cx},${NOTCH_DEPTH}
    C${cx + NOTCH_R * 1.05},${NOTCH_DEPTH} ${cx + wingSpan * 0.55},0 ${nr},0
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
        {/* Lớp nền — 1 khối SVG duy nhất: viền trên khoét lõm cong ôm theo FAB,
            thay vì bar chữ nhật phẳng. drop-shadow áp lên toàn path nên đường
            viền notch cũng có bóng đổ mềm giống mép ngoài, tạo cảm giác liền
            khối chứ không phải 2 lớp chồng nhau. */}
        <svg
          className="absolute inset-0"
          width="100%"
          height={BAR_H}
          viewBox={`0 0 ${barWidth} ${BAR_H}`}
          preserveAspectRatio="none"
          style={{ filter: "drop-shadow(0 -6px 24px rgba(36, 27, 47, 0.08))" }}
        >
          <path
            d={buildNotchPath(barWidth)}
            fill="var(--nav-bar-bg)"
            stroke="var(--glass-border)"
            strokeWidth={1}
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
