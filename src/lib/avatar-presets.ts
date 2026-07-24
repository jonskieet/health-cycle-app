import {
  Cat,
  Flower2,
  Sparkles,
  Star,
  Heart,
  Moon,
  Sun,
  Leaf,
  LucideIcon,
} from "lucide-react";

export interface AvatarPreset {
  key: string;
  gradientFrom: string;
  gradientTo: string;
  icon: LucideIcon;
}

// Bộ hình đại diện dạng gradient phẳng + icon lucide, dùng lại các biến
// màu --c-* đã có trong toàn app (không phải minh hoạ nhân vật).
export const AVATAR_PRESETS: AvatarPreset[] = [
  { key: "sleep-period", gradientFrom: "var(--c-sleep)", gradientTo: "var(--c-period)", icon: Sparkles },
  { key: "fertile-ovulation", gradientFrom: "var(--c-fertile)", gradientTo: "var(--c-ovulation)", icon: Flower2 },
  { key: "mood-hydration", gradientFrom: "var(--c-mood)", gradientTo: "var(--c-hydration)", icon: Cat },
  { key: "period-ovulation", gradientFrom: "var(--c-period)", gradientTo: "var(--c-ovulation)", icon: Heart },
  { key: "hydration-sleep", gradientFrom: "var(--c-hydration)", gradientTo: "var(--c-sleep)", icon: Moon },
  { key: "stress-heart", gradientFrom: "var(--c-stress)", gradientTo: "var(--c-heart)", icon: Sun },
  { key: "sleep-fertile", gradientFrom: "var(--c-sleep)", gradientTo: "var(--c-fertile)", icon: Star },
  { key: "mood-period", gradientFrom: "var(--c-mood)", gradientTo: "var(--c-period)", icon: Leaf },
];

export function getAvatarPreset(key?: string | null): AvatarPreset | null {
  if (!key) return null;
  return AVATAR_PRESETS.find((p) => p.key === key) ?? null;
}
