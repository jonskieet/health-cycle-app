"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutGrid, Droplet, PlusCircle, User } from "lucide-react";

const items = [
  { href: "/", label: "Tổng quan", icon: LayoutGrid },
  { href: "/cycle", label: "Chu kỳ", icon: Droplet },
  { href: "/log", label: "Ghi nhận", icon: PlusCircle },
  { href: "/profile", label: "Cá nhân", icon: User },
];

export default function BottomNav() {
  const pathname = usePathname();

  if (pathname === "/login" || pathname === "/onboarding" || pathname === "/profile/report") return null;

  return (
    <nav className="absolute inset-x-0 bottom-0 z-20 mx-auto flex w-full justify-center px-4 pb-4">
      <div className="glass-card-strong flex w-full items-center justify-between rounded-full px-3 py-2">
        {items.map(({ href, label, icon: Icon }) => {
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
      </div>
    </nav>
  );
}
