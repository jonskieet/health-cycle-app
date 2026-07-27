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
  const dims = size === "sm" ? 28 : size === "lg" ? 56 : 40;
  const iconSize = size === "sm" ? 14 : size === "lg" ? 26 : 18;

  return (
    <span
      className="flex shrink-0 items-center justify-center rounded-full transition-transform"
      style={{
        width: dims,
        height: dims,
        background: active ? tint.fg : tint.bg,
        color: active ? "#fff" : tint.fg,
        transform: active ? "scale(1.06)" : "scale(1)",
      }}
    >
      <Icon size={iconSize} strokeWidth={2.1} />
    </span>
  );
}
