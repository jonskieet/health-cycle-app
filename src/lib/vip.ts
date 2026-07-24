import { Profile } from "@/lib/queries";

export type MembershipTier = "vip" | "free";

/**
 * Hạng thành viên được xác định hoàn toàn từ cột `profiles.is_vip` trong Supabase —
 * không dựa vào email ở phía client. Cột này được bảo vệ bởi trigger
 * `protect_vip_columns` (xem supabase/schema.sql), chỉ service_role mới đổi được,
 * nên user không thể tự mở khoá VIP qua API.
 *
 * Để cấp VIP thủ công cho một tài khoản, chạy:
 *   supabase/sql/grant-vip-tempmail-orc.sql
 * (hoặc UPDATE public.profiles set is_vip = true ... bằng service_role).
 */
export function getMembershipTier(profile: Profile | null | undefined): MembershipTier {
  return profile?.is_vip ? "vip" : "free";
}

export function isVipProfile(profile: Profile | null | undefined): boolean {
  return getMembershipTier(profile) === "vip";
}
