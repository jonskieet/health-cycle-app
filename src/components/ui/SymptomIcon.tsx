// SymptomIcon — lớp "minh họa nhẹ" cho mỗi triệu chứng: bọc icon lucide-react
// (nét đơn sắc) trong 1 khối tròn nền màu theo category, để tạo cảm giác
// "icon minh họa" nhất quán như Clover, mà không cần vẽ tay 90+ file SVG riêng
// lẻ (chi phí quá lớn cho 1 patch). Đây là bước đệm hợp lý: giao diện đẹp hơn
// hẳn ngay lập tức, và có thể thay từng icon bằng SVG vẽ tay sau này mà không
// đổi cách gọi ở nơi dùng (props giữ nguyên).

import type { LucideIcon } from "lucide-react";
import type { SymptomCategory } from "@/lib/symptoms";

export const CATEGORY_TINT: Record<SymptomCategory, { bg: string; fg: string }> = {
  physical: { bg: "rgba(232,92,138,0.14)", fg: "var(--c-period)" },
  mood: { bg: "rgba(201,168,245,0.18)", fg: "#8a5fd6" },
  discharge: { bg: "rgba(240,185,62,0.16)", fg: "#c98f1a" },
  sexual: { bg: "rgba(232,92,138,0.16)", fg: "#d6437a" },
  skin: { bg: "rgba(201,168,245,0.14)", fg: "#7a4fc2" },
  contraception: { bg: "rgba(122,168,255,0.16)", fg: "#3f6fd6" },
  test: { bg: "rgba(232,92,138,0.14)", fg: "var(--c-period)" },
  metrics: { bg: "rgba(112,200,180,0.16)", fg: "#2c9a80" },
};

export default function SymptomIcon({
  icon: Icon,
  category,
  size = "md",
  active = false,
}: {
  icon: LucideIcon;
  category: SymptomCategory;
  size?: "sm" | "md" | "lg";
  active?: boolean;
}) {
  const tint = CATEGORY_TINT[category];
  // Kích thước lớn hơn bản cũ + nền dạng "blob" 2 lớp màu (thay vì 1 khối
  // tròn phẳng) để trông giống 1 minh hoạ nhỏ hơn là 1 icon chip UI thông
  // thường. Đây vẫn là bước đệm bằng lucide-react (xem ghi chú đầu file) —
  // nhưng đã đủ khác biệt về cảm giác thị giác so với các nút bấm khác.
  const dims = size === "sm" ? 34 : size === "lg" ? 72 : 48;
  const iconSize = size === "sm" ? 16 : size === "lg" ? 32 : 22;

  return (
    <span
      className="relative flex shrink-0 items-center justify-center transition-transform"
      style={{
        width: dims,
        height: dims,
        borderRadius: "42% 58% 55% 45% / 45% 42% 58% 55%",
        background: active
          ? `linear-gradient(150deg, ${tint.fg}, ${tint.fg}cc)`
          : `linear-gradient(150deg, ${tint.bg}, ${tint.bg})`,
        boxShadow: active
          ? `0 4px 14px -4px ${tint.fg}88`
          : "0 1px 3px rgba(36,27,47,0.06)",
        color: active ? "#fff" : tint.fg,
        transform: active ? "scale(1.08) rotate(-2deg)" : "scale(1)",
      }}
    >
      <Icon size={iconSize} strokeWidth={2} />
    </span>
  );
}
