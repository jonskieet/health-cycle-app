import { LucideIcon } from "lucide-react";

// Khôi phục file bị thiếu trong bản đóng gói trước (module F1,
// `VISUAL_POLISH_ROADMAP.md`) — gây lỗi build "Module not found" trên
// Render vì `MetricCard.tsx`, `app/log/page.tsx`, `app/profile/page.tsx` đều
// import component này nhưng file chưa từng được gửi kèm patch. Dựng lại
// đúng API các nơi gọi đang dùng: `icon` (Lucide icon), `bg`/`fg` (màu nền/
// màu icon, thường truyền CSS var hoặc color-mix), `size` ("sm" | "md"),
// `active` (đổi sang nền đặc màu `fg` khi bật, dùng cho badge đang chọn).
//
// Hình dạng "blob" hữu cơ (không phải hình tròn phẳng) — path SVG bất đối
// xứng nhẹ, thay cho khối tròn cứng nhắc trước đây.

const SIZE_MAP = {
  sm: { box: 34, icon: 16 },
  md: { box: 44, icon: 20 },
} as const;

interface BlobIconProps {
  icon: LucideIcon;
  bg: string;
  fg: string;
  size?: keyof typeof SIZE_MAP;
  active?: boolean;
}

export default function BlobIcon({ icon: Icon, bg, fg, size = "sm", active = false }: BlobIconProps) {
  const { box, icon } = SIZE_MAP[size];

  return (
    <span
      className="relative flex shrink-0 items-center justify-center"
      style={{ width: box, height: box }}
    >
      <svg
        viewBox="0 0 100 100"
        width={box}
        height={box}
        className="absolute inset-0"
        aria-hidden="true"
      >
        {/* Path blob hữu cơ — bo không đều, khác hình tròn hoàn hảo. */}
        <path
          d="M50 6c15 0 24 9 32 20 8 11 14 21 10 33-4 12-17 18-29 24-12 6-25 9-35 1-10-8-14-22-14-36S16 20 26 13 35 6 50 6Z"
          fill={active ? fg : bg}
        />
      </svg>
      <Icon size={icon} strokeWidth={2.2} className="relative" style={{ color: active ? "#fff" : fg }} />
    </span>
  );
}
