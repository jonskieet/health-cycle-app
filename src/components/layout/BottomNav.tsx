"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutGrid, Droplet, Plus, User } from "lucide-react";

// J8 (MAJOR_REDESIGN_BRIEF.md): "Ghi nhận" đổi từ 1 mục ngang hàng sang 1 nút
// tròn NỔI, LỚN hơn, đè lên mép trên thanh nav — giống thanh nav dưới trong
// `ref-01-cycle-bar-history.png` và màn 2 của
// `ref-06-radial-dial-mascot-mockup.webp`. Tách riêng khỏi mảng `items` 2 bên
// (giờ chỉ còn 2 mục mỗi bên) để rộng chỗ đặt FAB ở giữa.
const leftItems = [
  { href: "/", label: "Tổng quan", icon: LayoutGrid },
  { href: "/cycle", label: "Chu kỳ", icon: Droplet },
];
const rightItems = [{ href: "/profile", label: "Cá nhân", icon: User }];
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
      className="app-bottom-nav absolute inset-x-0 bottom-0 z-20 mx-auto flex w-full justify-center px-4"
      style={{ paddingBottom: "max(1rem, env(safe-area-inset-bottom, 0px))" }}
    >
      <div className="glass-card-strong relative flex w-full items-center justify-between rounded-full px-3 py-2">
        {leftItems.map(({ href, label, icon: Icon }) => {
          const active = href === "/" ? pathname === "/" : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className="flex flex-1 flex-col items-center gap-0.5 rounded-full py-1.5 text-[10px] transition-colors"
              style={{ color: active ? "var(--c-period)" : "var(--ink-faint)" }}
            >
              <Icon size={20} strokeWidth={active ? 2.4 : 2} />
              {label}
            </Link>
          );
        })}

        {/* Chỗ trống giữa để nhường không gian cho FAB nổi đè lên — cùng
            flex-1 như các mục khác để 2 bên vẫn cân đối. */}
        <div className="flex-1" aria-hidden />

        {rightItems.map(({ href, label, icon: Icon }) => {
          const active = pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className="flex flex-1 flex-col items-center gap-0.5 rounded-full py-1.5 text-[10px] transition-colors"
              style={{ color: active ? "var(--c-period)" : "var(--ink-faint)" }}
            >
              <Icon size={20} strokeWidth={active ? 2.4 : 2} />
              {label}
            </Link>
          );
        })}

        {/* FAB "Ghi nhận" — nổi giữa, đè lên mép trên thanh nav (`-top-5`
            đẩy tâm nút lên trên viền thanh nav, `shadow-lg` + viền `--surface`
            tạo cảm giác "nổi lên khỏi" thanh kính bên dưới thay vì chìm
            trong). Không gắn label chữ dưới nút như 2 bên — icon đủ lớn để tự
            nói lên chức năng, giữ đúng tinh thần "điểm nhấn hành động chính"
            của ảnh tham khảo. */}
        <Link
          href={fab.href}
          aria-label={fab.label}
          className="absolute left-1/2 -top-5 flex h-14 w-14 -translate-x-1/2 items-center justify-center rounded-full text-white shadow-lg transition-transform active:scale-95"
          style={{
            background: "var(--c-period)",
            border: "3px solid var(--surface)",
          }}
        >
          <fab.icon size={26} strokeWidth={2.4} />
        </Link>
      </div>
    </nav>
  );
}
