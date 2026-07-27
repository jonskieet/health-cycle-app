// Taxonomy triệu chứng chuẩn hoá — Module 1 (Clover gap F3).
//
// Thiết kế: mỗi triệu chứng có `id` (dùng làm khoá lưu trong `cycle_logs.symptoms`,
// giữ NGUYÊN các nhãn tiếng Việt cũ đã tồn tại trong dữ liệu người dùng hiện có để
// không cần migration dữ liệu), `label` hiển thị, `category` để nhóm UI + phục vụ
// Module 6 (Symptom Analysis chuyên sâu) sau này, và `icon` (tên icon lucide-react).
//
// Khi thêm triệu chứng mới, chỉ cần thêm vào mảng SYMPTOM_TAXONOMY — không cần đổi
// schema DB vì `symptoms` vẫn là `text[]` tự do.

import type { LucideIcon } from "lucide-react";
import {
  Activity,
  Brain,
  Frown,
  Meh,
  Smile,
  Angry,
  Zap,
  Droplets,
  Thermometer,
  Wind,
  HeartPulse,
  Moon,
  Sparkles,
  CircleDot,
  Heart,
  ShieldOff,
  Shield,
  Waves,
  Flame,
} from "lucide-react";

export type SymptomCategory = "physical" | "mood" | "discharge" | "sexual" | "skin";

export const SYMPTOM_CATEGORY_LABELS: Record<SymptomCategory, string> = {
  physical: "Thể chất",
  mood: "Tâm trạng",
  discharge: "Dịch tiết",
  sexual: "Hoạt động tình dục",
  skin: "Da & tóc",
};

export interface SymptomDef {
  id: string;
  label: string;
  category: SymptomCategory;
  icon: LucideIcon;
}

export const SYMPTOM_TAXONOMY: SymptomDef[] = [
  // ---------- Thể chất ----------
  { id: "Đau bụng", label: "Đau bụng", category: "physical", icon: Activity },
  { id: "Đau đầu", label: "Đau đầu", category: "physical", icon: Brain },
  { id: "Đau lưng", label: "Đau lưng", category: "physical", icon: Zap },
  { id: "Mệt mỏi", label: "Mệt mỏi", category: "physical", icon: Moon },
  { id: "Đầy hơi", label: "Đầy hơi", category: "physical", icon: Wind },
  { id: "Căng ngực", label: "Căng ngực", category: "physical", icon: HeartPulse },
  { id: "Chuột rút", label: "Chuột rút", category: "physical", icon: Zap },
  { id: "Buồn nôn", label: "Buồn nôn", category: "physical", icon: Waves },
  { id: "Chóng mặt", label: "Chóng mặt", category: "physical", icon: CircleDot },
  { id: "Thèm ăn", label: "Thèm ăn", category: "physical", icon: Flame },
  { id: "Mất ngủ", label: "Mất ngủ", category: "physical", icon: Moon },
  { id: "Sốt nhẹ", label: "Sốt nhẹ", category: "physical", icon: Thermometer },

  // ---------- Tâm trạng ----------
  { id: "Thay đổi tâm trạng", label: "Thay đổi tâm trạng", category: "mood", icon: Meh },
  { id: "Lo âu", label: "Lo âu", category: "mood", icon: Frown },
  { id: "Cáu gắt", label: "Cáu gắt", category: "mood", icon: Angry },
  { id: "Vui vẻ", label: "Vui vẻ", category: "mood", icon: Smile },
  { id: "Nhạy cảm", label: "Nhạy cảm", category: "mood", icon: Heart },
  { id: "Khó tập trung", label: "Khó tập trung", category: "mood", icon: Brain },

  // ---------- Dịch tiết ----------
  { id: "Dịch trong, dai", label: "Dịch trong, dai", category: "discharge", icon: Droplets },
  { id: "Dịch trắng đục", label: "Dịch trắng đục", category: "discharge", icon: Droplets },
  { id: "Dịch có mùi", label: "Dịch có mùi", category: "discharge", icon: ShieldOff },
  { id: "Không có dịch", label: "Không có dịch", category: "discharge", icon: Shield },

  // ---------- Hoạt động tình dục ----------
  { id: "Quan hệ không bảo vệ", label: "Quan hệ không bảo vệ", category: "sexual", icon: ShieldOff },
  { id: "Quan hệ có bảo vệ", label: "Quan hệ có bảo vệ", category: "sexual", icon: Shield },
  { id: "Ham muốn tăng", label: "Ham muốn tăng", category: "sexual", icon: Sparkles },

  // ---------- Da & tóc ----------
  { id: "Nổi mụn", label: "Nổi mụn", category: "skin", icon: CircleDot },
  { id: "Da dầu", label: "Da dầu", category: "skin", icon: Droplets },
  { id: "Rụng tóc", label: "Rụng tóc", category: "skin", icon: Wind },
];

export const SYMPTOM_CATEGORIES: SymptomCategory[] = ["physical", "mood", "discharge", "sexual", "skin"];

export function getSymptomsByCategory(category: SymptomCategory): SymptomDef[] {
  return SYMPTOM_TAXONOMY.filter((s) => s.category === category);
}

export function getSymptomDef(id: string): SymptomDef | undefined {
  return SYMPTOM_TAXONOMY.find((s) => s.id === id);
}

/** Gom một mảng id triệu chứng (như lưu trong `cycle_logs.symptoms`) theo category. */
export function groupSymptomIdsByCategory(ids: string[]): Record<SymptomCategory, string[]> {
  const result: Record<SymptomCategory, string[]> = {
    physical: [],
    mood: [],
    discharge: [],
    sexual: [],
    skin: [],
  };
  for (const id of ids) {
    const def = getSymptomDef(id);
    if (def) result[def.category].push(id);
    else result.physical.push(id); // triệu chứng cũ/không xác định -> mặc định "Thể chất"
  }
  return result;
}
