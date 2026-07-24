// Danh sách email được mở khoá gói VIP theo cách thủ công.
// (Chưa có cổng thanh toán — đây là allowlist tạm thời.)
const VIP_EMAILS = new Set(["tempmail.orc@gmail.com"]);

export type MembershipTier = "vip" | "free";

export function getMembershipTier(email: string | null | undefined): MembershipTier {
  if (!email) return "free";
  return VIP_EMAILS.has(email.trim().toLowerCase()) ? "vip" : "free";
}

export function isVip(email: string | null | undefined): boolean {
  return getMembershipTier(email) === "vip";
}
