"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLayoutEffect, useRef, useState } from "react";
import { LayoutGrid, Droplet, Plus, BookOpen, User } from "lucide-react";

// Redesign (2026-08-01 — "Notched Card Navigation", theo tham chiếu ứng dụng
// "Victoria"): thay bản floating-tách-rời (2026-07-31 #3) bằng kiểu NOTCH LÕM
// ôm sát nút "+" — viền trên của thanh nav được khoét cong theo đúng bán kính
// FAB (không còn là đường thẳng), khiến nút trông "lồng" vào thanh thay vì chỉ
// đè chồng lớp. Path notch đo bằng ResizeObserver để luôn khớp pixel thật của
// bar dù width co giãn theo màn hình (không hard-code %).
// Redesign (2026-08-01 #6 — "Rose Unified Palette"): app là ứng dụng theo dõi
// chu kỳ dành cho phái nữ, việc mỗi tab 1 màu riêng (tím/hồng/xanh dương/xanh
// lá — bản #Notched Card) không ăn nhập với định vị thương hiệu và trông rời
// rạc. Bỏ hẳn nền ô thẻ (tile) theo màu riêng, quay về 1 TÔNG HỒNG DUY NHẤT
// cho toàn bộ tab: active = hồng đậm (--c-period), inactive = xám nhạt trung
// tính. FAB cũng đổi từ tím sang gradient hồng cùng họ để đồng bộ toàn thanh.
const items = [
  { href: "/", label: "Tổng quan", icon: LayoutGrid },
  { href: "/cycle", label: "Chu kỳ", icon: Droplet },
  { href: "/library", label: "Thư viện", icon: BookOpen },
  { href: "/profile", label: "Cá nhân", icon: User },
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
  const wingSpan = NOTCH_R * 1.3; // nới theo NOTCH_R=38 (2026-08-01 #5) để tỉ lệ đường cong 2 bên vẫn đều, không bị gấp gáp so với miệng notch rộng hơn
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
  const [barWidth, setBarWidth] = useState<number | null>(null);

  // Fix (2026-08-01 #7): bản trước dùng useEffect + chỉ tin vào callback đầu
  // tiên của ResizeObserver, nhưng callback đó chạy SAU khung hình đầu tiên
  // đã paint xong với barWidth mặc định (390) — nếu màn hình thật khác 390px,
  // path notch bị méo (wingSpan trông hẹp) đúng 1 nhịp cho tới khi state cập
  // nhật. Dùng useLayoutEffect + đo ngay bằng getBoundingClientRect() TRƯỚC
  // khi trình duyệt paint, để lần render đầu tiên đã có width chính xác luôn.
  useLayoutEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    setBarWidth(el.getBoundingClientRect().width);
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

  const w = barWidth ?? 390; // fallback chỉ dùng cho khung hình rất đầu (thực tế useLayoutEffect luôn ghi đè trước khi mắt người kịp thấy)

  return (
    <nav
      className="app-bottom-nav absolute inset-x-0 bottom-0 z-20 mx-auto w-full"
      style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
    >
      <div ref={wrapRef} className="relative" style={{ height: BAR_H }}>
        {/* Fix (2026-08-01 #7): bỏ hẳn lớp "kính mờ" backdrop-blur + clip-path
            — dù đã thêm tiền tố -webkit-, clip-path dạng path() vẫn không cắt
            đúng theo notch trên nhiều môi trường/WebView thực tế, khiến blur
            tràn ra vùng trống quanh FAB thay vì chỉ áp trong thân bar. Quay về
            1 lớp SVG duy nhất, tô màu đặc (nav-bar-bg đã là bán trong suốt sẵn
            trong CSS) — đơn giản, chắc chắn hiển thị đúng mọi nơi. */}
        <svg
          className="absolute inset-0"
          width="100%"
          height={BAR_H}
          viewBox={`0 0 ${w} ${BAR_H}`}
          preserveAspectRatio="none"
          style={{ filter: "drop-shadow(0 -10px 30px rgba(36, 27, 47, 0.10))" }}
        >
          <path
            d={buildNotchPath(w)}
            fill="var(--nav-bar-bg)"
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

        {/* FAB — đổi từ gradient TÍM sang gradient HỒNG cùng họ với --c-period,
            đồng bộ với tông màu chủ đạo "chu kỳ" của toàn app thay vì lạc tông
            như bản trước (tím đứng một mình, không liên hệ gì tới các màu
            khác trong app). */}
        <Link
          href={fab.href}
          aria-label={fab.label}
          className="fab-float absolute left-1/2 z-10 flex h-16 w-16 -translate-x-1/2 items-center justify-center rounded-full text-white transition-transform active:scale-[0.94]"
          style={{
            top: -30,
            background: "linear-gradient(155deg, #F291B0 0%, #E85C8A 55%, #D6437A 100%)",
            boxShadow: "0 10px 28px -4px rgba(232, 92, 138, 0.5)",
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
  active,
}: {
  href: string;
  label: string;
  icon: typeof LayoutGrid;
  active: boolean;
}) {
  return (
    <Link
      href={href}
      className="nav-item flex flex-col items-center justify-center gap-1"
    >
      {/* Bỏ hẳn nền ô thẻ — chỉ icon đổi màu/độ đậm theo trạng thái, dùng
          chung 1 tông hồng (--c-period) cho mọi tab thay vì mỗi tab 1 màu
          riêng, đúng tinh thần "1 bộ nhận diện" của app theo dõi chu kỳ. */}
      <Icon
        size={active ? 24 : 22}
        strokeWidth={active ? 2.1 : 1.6}
        color={active ? "var(--c-period)" : "var(--nav-inactive)"}
        className="transition-all duration-[220ms] ease-out"
      />
      <span
        className="text-[10.5px] leading-none transition-all duration-[220ms] ease-out"
        style={{
          opacity: active ? 1 : 0.75,
          color: active ? "var(--c-period)" : "var(--ink-soft)",
          fontWeight: active ? 700 : 500,
        }}
      >
        {label}
      </span>
    </Link>
  );
}
