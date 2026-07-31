"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutGrid, Droplet, Plus, BookOpen, User } from "lucide-react";

// Fix (2026-07-31): sau khi đưa "Ghi nhận" lên thành FAB (J8), thanh nav chỉ
// còn 3 mục phẳng (Tổng quan, Chu kỳ, Cá nhân) — chia 2 bên trái/2 phải
// không đều (2 mục trái, 1 mục phải) khiến layout LỆCH thật sự: `flex-1`
// đều nhau về ĐỘ RỘNG từng ô, nhưng điểm giữa thật của cả thanh (nơi FAB neo
// `left-1/2`) rơi vào ranh giới giữa mục trái thứ 2 và ô đệm — không phải
// giữa ô đệm — vì tổng số ô 2 bên lệch nhau (2 vs 1). Ảnh tham khảo Moontide
// dùng đúng bố cục 2 mục trái + 2 mục phải + FAB giữa (Home, Calendar, rồi
// FAB, rồi Symptoms, Report, Settings — soi kỹ ảnh xác nhận đối xứng thật).
// Sửa bằng cách thêm 1 mục thứ 4: "Thư viện" (`app/library/page.tsx` đã có
// sẵn từ trước, hiện chỉ vào được qua menu trang Cá nhân — không phải trang
// mới) lên làm mục thứ 2 bên phải, khôi phục đúng 2+2 đối xứng thật.
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
      className="app-bottom-nav absolute inset-x-0 bottom-0 z-20 mx-auto flex w-full justify-center px-4"
      style={{ paddingBottom: "max(1rem, env(safe-area-inset-bottom, 0px))" }}
    >
      <div className="bottom-nav-bar relative flex w-full items-center justify-between rounded-full px-3 py-2">
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
