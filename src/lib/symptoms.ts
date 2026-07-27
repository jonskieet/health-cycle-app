// Taxonomy triệu chứng chuẩn hoá — Module 1 (Clover gap F3).
//
// V2 (Sprint 1 — mở rộng dữ liệu): từ 5 nhóm/28 mục lên 8 nhóm/~95 mục, đối chiếu
// trực tiếp bộ icon của Clover. QUAN TRỌNG: toàn bộ id cũ được GIỮ NGUYÊN (đúng
// nhãn tiếng Việt hiện có trong dữ liệu người dùng) — chỉ *thêm* id mới, không
// đổi/xoá id cũ, để không cần migration dữ liệu đã ghi.
//
// Mỗi triệu chứng có `id` (khoá lưu trong `cycle_logs.symptoms`), `label` hiển
// thị, `category` (dùng cho UI + SymptomAnalysis), và `icon` (lucide-react,
// được bọc màu theo category qua component `SymptomIcon` để tạo cảm giác minh
// hoạ nhất quán — xem src/components/ui/SymptomIcon.tsx).
//
// Khi thêm triệu chứng mới, chỉ cần thêm vào mảng SYMPTOM_TAXONOMY — không cần
// đổi schema DB vì `symptoms` vẫn là `text[]` tự do.

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
  ThumbsUp,
  AlertCircle,
  CloudRain,
  Lock,
  Unlock,
  Pill,
  PillBottle,
  Bell,
  TestTube,
  TestTube2,
  Scale,
  Circle,
  CircleSlash,
  Spline,
  Annoyed,
  Laugh,
  ThermometerSun,
  Wifi,
} from "lucide-react";

export type SymptomCategory =
  | "physical"
  | "mood"
  | "discharge"
  | "sexual"
  | "skin"
  | "contraception"
  | "test"
  | "metrics";

export const SYMPTOM_CATEGORY_LABELS: Record<SymptomCategory, string> = {
  physical: "Thể chất",
  mood: "Tâm trạng",
  discharge: "Dịch tiết",
  sexual: "Hoạt động tình dục",
  skin: "Da & tóc",
  contraception: "Tránh thai",
  test: "Xét nghiệm",
  metrics: "Đo lường",
};

export interface SymptomDef {
  id: string;
  label: string;
  category: SymptomCategory;
  icon: LucideIcon;
}

export const SYMPTOM_TAXONOMY: SymptomDef[] = [
  // ---------- Thể chất (giữ nguyên 12 mục cũ) ----------
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
  // -- mới, đối chiếu ảnh Clover --
  { id: "Co thắt", label: "Co thắt", category: "physical", icon: Zap },
  { id: "Kéo bụng dưới", label: "Kéo bụng dưới", category: "physical", icon: Activity },
  { id: "Đau lưng dưới", label: "Đau lưng dưới", category: "physical", icon: Zap },
  { id: "Đau rụng trứng bên trái", label: "Đau rụng trứng bên trái", category: "physical", icon: AlertCircle },
  { id: "Đau rụng trứng bên phải", label: "Đau rụng trứng bên phải", category: "physical", icon: AlertCircle },
  { id: "Cảm lạnh", label: "Cảm lạnh", category: "physical", icon: CloudRain },
  { id: "Chứng đau nửa đầu", label: "Chứng đau nửa đầu", category: "physical", icon: Brain },
  { id: "Tiêu chảy", label: "Tiêu chảy", category: "physical", icon: Wind },
  { id: "Táo bón", label: "Táo bón", category: "physical", icon: Lock },
  { id: "Mọi thứ đều ổn", label: "Mọi thứ đều ổn", category: "physical", icon: ThumbsUp },

  // ---------- Tâm trạng (giữ nguyên 6 mục cũ) ----------
  { id: "Thay đổi tâm trạng", label: "Thay đổi tâm trạng", category: "mood", icon: Meh },
  { id: "Lo âu", label: "Lo âu", category: "mood", icon: Frown },
  { id: "Cáu gắt", label: "Cáu gắt", category: "mood", icon: Angry },
  { id: "Vui vẻ", label: "Vui vẻ", category: "mood", icon: Smile },
  { id: "Nhạy cảm", label: "Nhạy cảm", category: "mood", icon: Heart },
  { id: "Khó tập trung", label: "Khó tập trung", category: "mood", icon: Brain },
  // -- mới --
  { id: "Thờ ơ", label: "Thờ ơ", category: "mood", icon: Meh },
  { id: "Hạnh phúc", label: "Hạnh phúc", category: "mood", icon: Laugh },
  { id: "Buồn", label: "Buồn", category: "mood", icon: Frown },
  { id: "Tức giận", label: "Tức giận", category: "mood", icon: Angry },
  { id: "Phấn khích", label: "Phấn khích", category: "mood", icon: Sparkles },
  { id: "Sợ hãi", label: "Sợ hãi", category: "mood", icon: AlertCircle },
  { id: "Hứng khởi", label: "Hứng khởi", category: "mood", icon: Sparkles },
  { id: "U sầu", label: "U sầu", category: "mood", icon: CloudRain },
  { id: "Bình thường", label: "Bình thường", category: "mood", icon: Circle },
  { id: "Dễ thay đổi", label: "Dễ thay đổi", category: "mood", icon: Spline },
  { id: "Căng thẳng", label: "Căng thẳng", category: "mood", icon: Annoyed },

  // ---------- Dịch tiết (giữ nguyên 4 mục cũ) ----------
  { id: "Dịch trong, dai", label: "Dịch trong, dai", category: "discharge", icon: Droplets },
  { id: "Dịch trắng đục", label: "Dịch trắng đục", category: "discharge", icon: Droplets },
  { id: "Dịch có mùi", label: "Dịch có mùi", category: "discharge", icon: ShieldOff },
  { id: "Không có dịch", label: "Không có dịch", category: "discharge", icon: Shield },
  // -- mới --
  { id: "Đốm", label: "Đốm", category: "discharge", icon: CircleDot },
  { id: "Nhớt", label: "Nhớt", category: "discharge", icon: Droplets },
  { id: "Keo", label: "Keo", category: "discharge", icon: Droplets },
  { id: "Lòng trắng trứng", label: "Lòng trắng trứng", category: "discharge", icon: Circle },
  { id: "Nước", label: "Nước", category: "discharge", icon: Droplets },
  { id: "Khác thường", label: "Khác thường", category: "discharge", icon: AlertCircle },
  { id: "Mùi hôi", label: "Mùi hôi", category: "discharge", icon: Wind },

  // ---------- Hoạt động tình dục (giữ nguyên 3 mục cũ) ----------
  { id: "Quan hệ không bảo vệ", label: "Quan hệ không bảo vệ", category: "sexual", icon: ShieldOff },
  { id: "Quan hệ có bảo vệ", label: "Quan hệ có bảo vệ", category: "sexual", icon: Shield },
  { id: "Ham muốn tăng", label: "Ham muốn tăng", category: "sexual", icon: Sparkles },
  // -- mới --
  { id: "Tình dục", label: "Tình dục", category: "sexual", icon: Heart },
  { id: "Tình dục có bảo vệ", label: "Tình dục có bảo vệ", category: "sexual", icon: Lock },
  { id: "Tình dục không có biện pháp bảo vệ", label: "Tình dục không có biện pháp bảo vệ", category: "sexual", icon: Unlock },
  { id: "Nhu cầu tình dục cao", label: "Nhu cầu tình dục cao", category: "sexual", icon: Flame },
  { id: "Thủ dâm", label: "Thủ dâm", category: "sexual", icon: Wifi },
  { id: "Cực khoái", label: "Cực khoái", category: "sexual", icon: Sparkles },

  // ---------- Da & tóc (giữ nguyên 3 mục cũ) ----------
  { id: "Nổi mụn", label: "Nổi mụn", category: "skin", icon: CircleDot },
  { id: "Da dầu", label: "Da dầu", category: "skin", icon: Droplets },
  { id: "Rụng tóc", label: "Rụng tóc", category: "skin", icon: Wind },

  // ---------- Tránh thai (nhóm mới) ----------
  { id: "Thuốc đã uống", label: "Thuốc đã uống", category: "contraception", icon: Pill },
  { id: "Thuốc hôm qua", label: "Thuốc hôm qua", category: "contraception", icon: PillBottle },
  { id: "Nhắc uống thuốc", label: "Nhắc uống thuốc", category: "contraception", icon: Bell },

  // ---------- Xét nghiệm (nhóm mới) ----------
  { id: "Que thử thai: Dương tính", label: "Thử thai — Dương tính", category: "test", icon: TestTube2 },
  { id: "Que thử thai: Âm tính", label: "Thử thai — Âm tính", category: "test", icon: TestTube },
  { id: "Que thử thai: Không chắc chắn", label: "Thử thai — Không chắc chắn", category: "test", icon: CircleSlash },
  { id: "Que thử rụng trứng: Dương tính", label: "Rụng trứng — Dương tính", category: "test", icon: TestTube2 },
  { id: "Que thử rụng trứng: Âm tính", label: "Rụng trứng — Âm tính", category: "test", icon: TestTube },
  { id: "Que thử rụng trứng: Không chắc chắn", label: "Rụng trứng — Không chắc chắn", category: "test", icon: CircleSlash },

  // ---------- Đo lường (nhóm mới) ----------
  { id: "Đã đo nhiệt độ cơ sở", label: "Đã đo nhiệt độ cơ sở", category: "metrics", icon: ThermometerSun },
  { id: "Đã ghi cân nặng", label: "Đã ghi cân nặng", category: "metrics", icon: Scale },
];

export const SYMPTOM_CATEGORIES: SymptomCategory[] = [
  "physical",
  "mood",
  "discharge",
  "sexual",
  "skin",
  "contraception",
  "test",
  "metrics",
];

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
    contraception: [],
    test: [],
    metrics: [],
  };
  for (const id of ids) {
    const def = getSymptomDef(id);
    if (def) result[def.category].push(id);
    else result.physical.push(id); // triệu chứng cũ/không xác định -> mặc định "Thể chất"
  }
  return result;
}
