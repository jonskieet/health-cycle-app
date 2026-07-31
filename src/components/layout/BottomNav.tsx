"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutGrid, Droplet, Plus, BookOpen, User } from "lucide-react";
import { useEffect, useRef, useState } from "react";

// Redesign (2026-07-31 #4 — "gợn sóng lõm quanh FAB"): soi kỹ lại ảnh mẫu,
// phần NỀN thanh nav xung quanh FAB không phẳng — nó LÕM VÀO theo dạng
// gợn sóng (2 cung cong đối xứng khum vào tâm nút) trước khi FAB nổi đè lên
// trên, khác với bản #3 (thanh phẳng hoàn toàn, FAB chỉ đặt chồng lên bằng
// -top). Quay lại cách vẽ path SVG đo kích thước thật bằng ResizeObserver
// (như bản gốc), nhưng đổi hình dạng: CHỈ bo 2 góc TRÊN theo bán kính lớn
// (30px, đúng spec "premium floating nav"), 2 góc DƯỚI vuông (chạm mép máy),
// và notch ở giữa cạnh trên là gợn sóng RỘNG + NÔNG hơn kiểu "khoét nửa hình
// tròn" cũ — 2 cung cong nối mượt bằng cubic-bezier để không bị gãy góc,
// đúng tinh thần "wavy dip" trong ảnh thay vì một nửa vòng tròn đơn thuần.
const leftItems = [
  { href: "/", label: "Tổng quan", icon: LayoutGrid },
  { href: "/cycle", label: "Chu kỳ", icon: Droplet },
];
const rightItems = [
  { href: "/library", label: "Thư viện", icon: BookOpen },
  { href: "/profile", label: "Cá nhân", icon: User },
];
const fab = { href: "/log", label: "Ghi nhận", icon: Plus };

// Bán kính "lõm" của gợn sóng quanh FAB — đo theo ảnh mẫu mới nhất: phần lõm
// SÂU gần chạm đáy thanh nav (không phải lõm nông như bản trước), tạo thành
// 1 đường cong mượt dạng sin/chữ U rộng, 2 bên nhô lên phẳng ngay sát viền
// nút. Rộng hơn bán kính FAB thật (32) để 2 mép cong không đâm vào nút.
const NOTCH_RADIUS = 58;
// Đổi lại (2026-07-31 #5 — "hình viên thuốc"): theo yêu cầu, quay về kiểu
// thanh nav nổi lơ lửng có margin 2 bên (không chạm mép màn hình nữa) và bo
// tròn CẢ 4 góc bằng pill-radius = height/2 (thay vì chỉ 2 góc trên như bản
// full-width trước) — đúng dáng "viên thuốc" (pill) như bản gốc ban đầu.
// Gợn sóng lõm quanh FAB vẫn giữ nguyên, chỉ đổi phần khung ngoài.
const TOP_RADIUS = 30;

/**
 * Vẽ path thanh nav dạng VIÊN THUỐC: bo tròn cả 4 góc theo bán kính pill
 * (= nửa chiều cao thanh), cạnh trên lõm SÂU dạng gợn sóng quanh tâm — nơi
 * FAB nổi đè lên. 2 cung cong nối bằng cubic-bezier để tiếp tuyến mượt ở cả
 * điểm nối với cạnh phẳng lẫn tại đáy.
 */
function buildWaveNotchPath(width: number, height: number, notchRadius: number, _topRadius: number) {
  if (width <= 0 || height <= 0) return "";

  const cx = width / 2;
  const r = height / 2; // bo tròn đều cả 4 góc — dáng viên thuốc
  const ext = 14; // đoạn vuốt cong nối cạnh phẳng vào gợn sóng
  const dip = height - 14;
  const notchStart = cx - notchRadius - ext;
  const notchEnd = cx + notchRadius + ext;

  return `
    M0,${r}
    A${r},${r} 0 0 1 ${r},0
    L${notchStart},0
    C${notchStart + ext},0 ${cx - notchRadius},0 ${cx - notchRadius},${dip * 0.32}
    C${cx - notchRadius},${dip * 0.82} ${cx - notchRadius * 0.42},${dip} ${cx},${dip}
    C${cx + notchRadius * 0.42},${dip} ${cx + notchRadius},${dip * 0.82} ${cx + notchRadius},${dip * 0.32}
    C${cx + notchRadius},0 ${notchEnd - ext},0 ${notchEnd},0
    L${width - r},0
    A${r},${r} 0 0 1 ${width},${r}
    L${width},${height - r}
    A${r},${r} 0 0 1 ${width - r},${height}
    L${r},${height}
    A${r},${r} 0 0 1 0,${height - r}
    Z
  `;
}

export default function BottomNav() {
  const pathname = usePathname();
  const barRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ width: 0, height: 0 });

  // Đo kích thước THẬT của thanh nav để vẽ path SVG khớp pixel — tránh dùng
  // viewBox cố định rồi kéo giãn gây méo hình trên các bề rộng màn hình khác nhau.
  useEffect(() => {
    const el = barRef.current;
    if (!el) return;
    const observer = new ResizeObserver((entries) => {
      const { width, height } = entries[0].contentRect;
      setSize({ width, height });
    });
    observer.observe(el);
    return () => observer.disconnect();
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

  const wavePath = buildWaveNotchPath(size.width, size.height, NOTCH_RADIUS, TOP_RADIUS);

  return (
    <nav
      className="app-bottom-nav absolute inset-x-0 bottom-0 z-20 mx-auto flex w-full justify-center px-4"
      style={{ paddingBottom: "max(12px, env(safe-area-inset-bottom, 0px))" }}
    >
      <div className="relative w-full max-w-[400px]">
        {/* Lớp 1 — Thanh nav: nền vẽ bằng <path> (gợn sóng lõm quanh FAB),
            KHÔNG dùng background CSS trên chính div grid — để phần lõm thật
            sự "khoét" khỏi nền chứ không chỉ là ảo giác che phủ. */}
        <div ref={barRef} className="relative">
          {size.width > 0 && (
            <svg
              className="bottom-nav-shape absolute inset-0 -z-10 h-full w-full"
              viewBox={`0 0 ${size.width} ${size.height}`}
              preserveAspectRatio="none"
              aria-hidden
            >
              <path d={wavePath} fill="var(--nav-bar-bg)" stroke="var(--glass-border)" strokeWidth={1} />
            </svg>
          )}
          <div
            className="grid items-center backdrop-blur-xl"
            style={{
              gridTemplateColumns: "1fr 1fr 84px 1fr 1fr",
              height: 76,
              padding: "8px 20px 10px",
            }}
          >
            {leftItems.map(({ href, label, icon: Icon }) => {
              const active = href === "/" ? pathname === "/" : pathname.startsWith(href);
              return <NavItem key={href} href={href} label={label} Icon={Icon} active={active} />;
            })}

            {/* Spacer — không icon dưới FAB, chỉ chừa khoảng thở khớp với gợn sóng lõm */}
            <div aria-hidden />

            {rightItems.map(({ href, label, icon: Icon }) => {
              const active = pathname.startsWith(href);
              return <NavItem key={href} href={href} label={label} Icon={Icon} active={active} />;
            })}
          </div>
        </div>

        {/* Lớp 2 — FAB: tròn, nổi độc lập ngay trên phần gợn sóng lõm, đè
            lên khoảng hở vừa khoét ở lớp 1. Gradient tỏa tâm tím→xanh, viền
            trắng dày tách khỏi nền, bóng là glow màu thay vì bóng đen. */}
        <Link
          href={fab.href}
          aria-label={fab.label}
          className="fab-float absolute left-1/2 z-10 flex h-16 w-16 -translate-x-1/2 items-center justify-center rounded-full text-white transition-transform active:scale-[0.94]"
          style={{
            top: -30,
            background:
              "radial-gradient(circle at 35% 30%, #D18BFF 0%, #B56DFF 45%, #87E0FF 100%)",
            border: "4px solid var(--nav-bar-solid)",
            boxShadow: "0 12px 40px rgba(181, 109, 255, 0.35)",
          }}
        >
          <fab.icon size={20} strokeWidth={2} />
        </Link>
      </div>
    </nav>
  );
}

function NavItem({
  href,
  label,
  Icon,
  active,
}: {
  href: string;
  label: string;
  Icon: typeof LayoutGrid;
  active: boolean;
}) {
  return (
    <Link
      href={href}
      className="nav-item flex flex-col items-center justify-center gap-1 transition-all duration-[250ms] ease-out"
      style={{
        color: active ? "var(--nav-active)" : "var(--nav-inactive)",
      }}
    >
      <Icon
        size={23}
        strokeWidth={active ? 1.75 : 1.5}
        className="transition-transform duration-[250ms] ease-out"
        style={{ transform: active ? "scale(1.06)" : "scale(1)" }}
      />
      <span
        className="text-[11px] leading-none font-medium transition-opacity duration-[250ms] ease-out"
        style={{ opacity: active ? 1 : 0.85, color: active ? "var(--nav-active)" : "var(--ink-soft)" }}
      >
        {label}
      </span>
    </Link>
  );
}

