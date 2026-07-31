"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutGrid, Droplet, Plus, BookOpen, User } from "lucide-react";
import { useEffect, useRef, useState } from "react";

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

// Bán kính phần "lõm" quanh FAB — phải khớp với kích thước nút thật (h-14
// w-14 = 56px → bán kính 28) cộng thêm khoảng hở nhỏ để nút không chạm sát
// viền notch.
const NOTCH_RADIUS = 34;

/**
 * Fix (2026-07-31 #2 — "góc nhọn ở 2 đầu bán nguyệt"): path SVG vẽ thanh nav
 * dạng pill với 1 notch bán nguyệt lõm ở giữa cạnh trên, nối MƯỢT vào 2 bên
 * bằng cubic-bezier thay vì để cạnh thẳng cắt thẳng vào cung tròn.
 *
 * Lý do cần bezier: nếu chỉ khoét đúng 1 nửa hình tròn (như cách làm cũ dùng
 * CSS mask-image radial-gradient), tại 2 điểm nối giữa cạnh ngang (tiếp
 * tuyến nằm ngang) và cung tròn (tiếp tuyến thẳng đứng ngay tại điểm nối) sẽ
 * luôn tạo góc gãy 90° — nhìn "nhọn" dù bán kính notch to hay nhỏ, đây là
 * bản chất hình học chứ không phải do độ phân giải. Đoạn cubic-bezier ở 2
 * đầu (dài `ext`, độ cong `curve`) được dựng sao cho control point đầu tiên
 * nằm CÙNG PHƯƠNG với cạnh thẳng đến (tiếp tuyến nằm ngang được giữ nguyên
 * qua điểm nối) — nhờ vậy đường cong bẻ hướng dần dần, không gãy góc.
 */
function buildNotchPath(width: number, height: number, notchRadius: number) {
  if (width <= 0 || height <= 0) return "";

  const cx = width / 2;
  const r = Math.min(height / 2, width / 2); // bo góc 2 đầu thanh (pill)
  const ext = 18; // độ dài đoạn vuốt cong 2 bên notch
  const curve = 6; // độ lệch control point thứ 2, quyết định độ "mềm" khi vào cung tròn
  const notchStart = cx - notchRadius - ext;
  const notchEnd = cx + notchRadius + ext;

  return `
    M0,${r}
    Q0,0 ${r},0
    L${notchStart},0
    C${notchStart + ext},0 ${cx - notchRadius - curve},${notchRadius - curve} ${cx - notchRadius},${notchRadius}
    A${notchRadius},${notchRadius} 0 0 0 ${cx + notchRadius},${notchRadius}
    C${cx + notchRadius + curve},${notchRadius - curve} ${notchEnd - ext},0 ${notchEnd},0
    L${width - r},0
    Q${width},0 ${width},${r}
    L${width},${height - r}
    Q${width},${height} ${width - r},${height}
    L${r},${height}
    Q0,${height} 0,${height - r}
    Z
  `;
}

export default function BottomNav() {
  const pathname = usePathname();
  const barRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ width: 0, height: 0 });

  // Đo kích thước THẬT của thanh nav (co giãn theo mọi màn hình) để vẽ path
  // SVG khớp pixel — tránh dùng viewBox cố định rồi kéo giãn gây méo hình.
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

  const notchPath = buildNotchPath(size.width, size.height, NOTCH_RADIUS);

  return (
    <nav
      className="app-bottom-nav absolute inset-x-0 bottom-0 z-20 mx-auto flex w-full justify-center px-4"
      style={{ paddingBottom: "max(1rem, env(safe-area-inset-bottom, 0px))" }}
    >
      <div ref={barRef} className="relative flex w-full items-center justify-between px-3 py-2">
        {size.width > 0 && (
          <svg
            className="bottom-nav-shape absolute inset-0 -z-10 h-full w-full"
            viewBox={`0 0 ${size.width} ${size.height}`}
            preserveAspectRatio="none"
            aria-hidden
          >
            <path d={notchPath} fill="var(--surface)" stroke="var(--glass-border)" strokeWidth={1} />
          </svg>
        )}

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
      </div>

      {/* FAB "Ghi nhận" — ĐẶT NGOÀI div chứa svg notch (không phải con của
          nó) để không bị ảnh hưởng bởi bất kỳ hiệu ứng cắt/mask nào của
          phần nền. Absolute theo <nav> ngoài cùng, nổi giữa, đè lên đúng
          phần lõm. `-top-5` đẩy tâm nút lên trên viền thanh nav; `shadow-lg`
          + viền `--surface` tạo cảm giác "nổi lên khỏi" thanh nav bên dưới.
          Không gắn label chữ dưới nút như 2 bên — icon đủ lớn để tự nói lên
          chức năng. */}
      <Link
        href={fab.href}
        aria-label={fab.label}
        className="absolute left-1/2 -top-5 z-10 flex h-14 w-14 -translate-x-1/2 items-center justify-center rounded-full text-white shadow-lg transition-transform active:scale-95"
        style={{
          background: "var(--c-period)",
          border: "3px solid var(--surface)",
        }}
      >
        <fab.icon size={26} strokeWidth={2.4} />
      </Link>
    </nav>
  );
}
