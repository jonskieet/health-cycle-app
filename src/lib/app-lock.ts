// Module 11 — App Lock (PIN). Business logic thuần (không phụ thuộc React).
//
// Thiết kế bảo mật (ghi rõ vì đây là web app, không phải native app):
// - PIN không bao giờ được gửi lên server dạng plaintext — chỉ hash SHA-256 (hex)
//   qua Web Crypto API (`crypto.subtle`, có sẵn trong mọi trình duyệt hiện đại,
//   không cần thêm dependency) được lưu vào `profiles.app_lock_pin_hash`.
// - Đây là khoá "chặn xem lướt qua" (deterrent), không phải bảo mật mã hoá dữ liệu
//   thật — mục tiêu là ngăn người khác cầm điện thoại/máy mở khoá xem lướt qua khi
//   session trình duyệt vẫn còn đăng nhập, giống cách các app khoá màn hình đơn giản
//   hoạt động. Không thay thế cho bảo mật tài khoản (mật khẩu Supabase Auth).
// - Trạng thái "đã mở khoá" lưu trong `sessionStorage` (mất khi đóng tab/trình duyệt)
//   để mỗi lần mở lại app đều phải nhập PIN.

const SESSION_UNLOCK_KEY = "kv_app_unlocked";

export async function hashPin(pin: string): Promise<string> {
  const data = new TextEncoder().encode(pin);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export function isValidPinFormat(pin: string): boolean {
  return /^\d{4,6}$/.test(pin);
}

export function isSessionUnlocked(): boolean {
  if (typeof window === "undefined") return true;
  try {
    return sessionStorage.getItem(SESSION_UNLOCK_KEY) === "1";
  } catch {
    return true; // môi trường không hỗ trợ sessionStorage (rất hiếm) — không chặn user
  }
}

export function markSessionUnlocked(): void {
  try {
    sessionStorage.setItem(SESSION_UNLOCK_KEY, "1");
  } catch {
    // bỏ qua — không có sessionStorage thì coi như luôn mở khoá, không chặn user
  }
}

export function clearSessionUnlock(): void {
  try {
    sessionStorage.removeItem(SESSION_UNLOCK_KEY);
  } catch {
    // no-op
  }
}
