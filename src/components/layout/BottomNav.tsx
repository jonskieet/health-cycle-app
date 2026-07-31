"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutGrid, Droplet, Plus, BookOpen, User } from "lucide-react";

// Redesign (2026-07-31 #3 — "Premium Floating Bottom Navigation"): thay toàn
// bộ cách vẽ thanh nav cũ (pill + notch bán nguyệt lõm bằng SVG path) bằng
// kiểu iOS-inspired hiện đại: 2 LỚP TÁCH RỜI hoàn toàn — (1) thanh nav chữ
// nhật, chỉ bo 2 góc TRÊN, kính mờ (backdrop-blur) + nền trắng gần trong
// suốt; (2) nút FAB tròn NỔI ĐỘC LẬP phía trên thanh nav ~30px (không nhúng
// vào thanh, không dùng notch khoét nền). Bỏ hẳn logic đo kích thước bằng
// ResizeObserver + buildNotchPath vì không còn path cong nào cần khớp pixel
// theo bề rộng thật nữa — layout dùng CSS Grid 5 cột cố định
// (1fr 1fr 84px 1fr 1fr), cột giữa là spacer trống dành chỗ cho FAB.
const leftItems = [
  { href: "/", label: "Tổng quan", icon: LayoutGrid },
  { href: "/cycle", label: "Chu kỳ", icon: Droplet },
];
const rightItems = [
  { href: "/library", label: "Thư viện", icon: BookOpen },
  { href: "/profile", label: "Cá nhân", icon: User },
];
const fab = { href: "/log", label: "Ghi nhận", icon: Plus };

export default function BottomNav() {
  const pathname = usePathname();

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
      <div className="relative">
        {/* Lớp 1 — Thanh nav: chữ nhật kính mờ, chỉ bo 2 góc trên, bóng đổ
            mềm gần như vô hình ("floating glass" chứ không phải card nổi
            khối). Grid 5 cột cố định giữ đối xứng 2+2 tuyệt đối, cột giữa
            84px chỉ là khoảng trống — không chứa icon. */}
        <div
          className="grid items-center"
          style={{
            gridTemplateColumns: "1fr 1fr 84px 1fr 1fr",
            height: 76,
            padding: "8px 20px 10px",
            background: "var(--nav-bar-bg)",
            backdropFilter: "blur(20px)",
            WebkitBackdropFilter: "blur(20px)",
            borderTopLeftRadius: 30,
            borderTopRightRadius: 30,
            boxShadow: "0 -8px 32px rgba(36, 27, 47, 0.05)",
            borderTop: "1px solid var(--glass-border)",
          }}
        >
          {leftItems.map(({ href, label, icon: Icon }) => {
            const active = href === "/" ? pathname === "/" : pathname.startsWith(href);
            return <NavItem key={href} href={href} label={label} Icon={Icon} active={active} />;
          })}

          {/* Spacer — không icon dưới FAB, chỉ chừa khoảng thở */}
          <div aria-hidden />

          {rightItems.map(({ href, label, icon: Icon }) => {
            const active = pathname.startsWith(href);
            return <NavItem key={href} href={href} label={label} Icon={Icon} active={active} />;
          })}
        </div>

        {/* Lớp 2 — FAB: tròn, nổi độc lập phía trên thanh nav ~30px (một nửa
            nút nằm trên mép thanh), viền trắng dày tách khỏi nền, gradient
            tím→xanh toả tâm thay vì màu phẳng, bóng là GLOW màu (không phải
            bóng đen) để tạo cảm giác phát sáng. */}
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
