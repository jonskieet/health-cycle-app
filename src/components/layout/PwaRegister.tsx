"use client";

// Module F7 — PWA cơ bản ("widget màn hình chính" của Clover là native, web thay
// bằng: (a) đăng ký service worker cho offline app-shell + khả năng "Add to Home
// Screen", (b) App Badging API để hiện SỐ NGÀY CÒN LẠI ĐẾN KỲ KINH ngay trên icon
// app khi đã cài lên màn hình chính — gần nhất với "quick glance" mà không cần
// mở app, trên các trình duyệt hỗ trợ (Chrome/Edge Android, một số trên iOS 16.4+
// khi đã "Add to Home Screen"). Trình duyệt không hỗ trợ sẽ tự bỏ qua, không lỗi.

import { useEffect } from "react";
import { useCycleLogs, useProfile } from "@/lib/queries";
import { predictCycle, daysUntil } from "@/lib/cycle-utils";

export default function PwaRegister() {
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {
        // Bỏ qua lỗi đăng ký (vd chạy trên http không phải localhost) — không chặn app.
      });
    }
  }, []);

  const { data: cycleLogs } = useCycleLogs();
  const { data: profile } = useProfile();

  useEffect(() => {
    if (!("setAppBadge" in navigator)) return;
    if (!cycleLogs) return;
    try {
      const prediction = predictCycle(cycleLogs, {
        avgCycleLength: profile?.avg_cycle_length ?? 28,
        avgPeriodLength: profile?.avg_period_length ?? 5,
      });
      const days = daysUntil(prediction.nextPeriodDate);
      if (days > 0 && days <= 99) {
        (navigator as Navigator & { setAppBadge: (n: number) => Promise<void> })
          .setAppBadge(days)
          .catch(() => {});
      } else {
        (navigator as Navigator & { clearAppBadge: () => Promise<void> }).clearAppBadge?.().catch(() => {});
      }
    } catch {
      // Badging API không ổn định trên mọi trình duyệt — im lặng bỏ qua.
    }
  }, [cycleLogs, profile]);

  return null;
}
