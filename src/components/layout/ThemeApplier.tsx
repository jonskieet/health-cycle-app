"use client";

// Module — Chủ đề giao diện (Theme, P9). Đặt `data-theme` trên thẻ <html> dựa trên
// `profiles.theme`, để CSS trong `globals.css` ([data-theme="dark"]) áp dụng.
//
// Quyết định: lưu thêm bản sao vào `localStorage` (không phải nguồn sự thật — chỉ để
// áp ngay khi vừa tải trang, trước khi `useProfile()` load xong từ Supabase) nhằm
// giảm hiện tượng "chớp sáng" khi user đã chọn theme tối. Không hoàn hảo 100% (lần
// đầu đăng nhập trên thiết bị mới vẫn có thể chớp sáng vì chưa có localStorage) —
// đây là giới hạn hợp lý cho quy mô 1 module, không cần SSR cookie-based theme.

import { useEffect } from "react";
import { useProfile } from "@/lib/queries";

const STORAGE_KEY = "kv_theme";

export default function ThemeApplier() {
  const { data: profile } = useProfile();

  useEffect(() => {
    if (!profile?.theme) return;
    document.documentElement.dataset.theme = profile.theme;
    try {
      localStorage.setItem(STORAGE_KEY, profile.theme);
    } catch {
      // localStorage không khả dụng — bỏ qua, không chặn app hoạt động
    }
  }, [profile?.theme]);

  return null;
}
