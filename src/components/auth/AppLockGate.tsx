"use client";

// Module 11 — App Lock (PIN). Đặt bên trong `AuthGate` (chỉ áp dụng khi đã đăng nhập).
// Mỗi lần mở lại tab/trình duyệt (sessionStorage rỗng) mà user đã bật khoá PIN, màn
// hình nhập PIN sẽ hiện trước khi vào app.

import { ReactNode, useState } from "react";
import { Delete, Lock, LogOut } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { useProfile } from "@/lib/queries";
import { hashPin, isSessionUnlocked, markSessionUnlocked } from "@/lib/app-lock";

export default function AppLockGate({ children }: { children: ReactNode }) {
  const { signOut } = useAuth();
  const { data: profile, isLoading } = useProfile();
  // Đánh dấu true ngay sau khi nhập đúng PIN trong phiên render hiện tại — tránh phải
  // gọi setState trong effect chỉ để đồng bộ lại với sessionStorage (đọc trực tiếp
  // sessionStorage lúc render là đủ, vì nó không đổi ngoài hành động của chính component).
  const [manuallyUnlocked, setManuallyUnlocked] = useState(false);
  const [pin, setPin] = useState("");
  const [error, setError] = useState(false);
  const [verifying, setVerifying] = useState(false);

  const lockActive = !!profile?.app_lock_enabled && !!profile?.app_lock_pin_hash;
  const locked = lockActive && !manuallyUnlocked && !isSessionUnlocked();

  async function handleDigit(d: string) {
    if (verifying) return;
    const next = (pin + d).slice(0, 6);
    setPin(next);
    setError(false);
    if (next.length >= 4 && profile?.app_lock_pin_hash) {
      // Tự động kiểm tra khi đủ 4 số (PIN ngắn nhất hỗ trợ) — nếu sai và user định
      // nhập PIN 5-6 số, họ sẽ tiếp tục gõ và ta kiểm tra lại ở mỗi lần đủ độ dài.
      setVerifying(true);
      const digest = await hashPin(next);
      setVerifying(false);
      if (digest === profile.app_lock_pin_hash) {
        markSessionUnlocked();
        setManuallyUnlocked(true);
        setPin("");
      } else if (next.length === 6) {
        setError(true);
        setPin("");
      }
    }
  }

  function handleBackspace() {
    setPin((p) => p.slice(0, -1));
    setError(false);
  }

  if (isLoading) return null;
  if (!locked) return <>{children}</>;

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-6 px-8 text-center">
      <span
        className="flex h-14 w-14 items-center justify-center rounded-full text-white"
        style={{ background: "linear-gradient(135deg, var(--c-sleep), var(--c-period))" }}
      >
        <Lock size={22} />
      </span>
      <div>
        <p className="font-display text-lg font-bold text-[var(--ink)]">Nhập mã PIN</p>
        <p className="mt-1 text-xs text-[var(--ink-faint)]">
          {error ? "Mã PIN không đúng, thử lại" : "Ứng dụng đang được khoá"}
        </p>
      </div>

      <div className="flex items-center gap-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <span
            key={i}
            className="h-3 w-3 rounded-full"
            style={{
              background:
                i < pin.length
                  ? error
                    ? "var(--c-period)"
                    : "var(--c-sleep)"
                  : "rgba(36,27,47,0.12)",
            }}
          />
        ))}
      </div>

      <div className="grid grid-cols-3 gap-4">
        {["1", "2", "3", "4", "5", "6", "7", "8", "9"].map((d) => (
          <button
            key={d}
            type="button"
            onClick={() => handleDigit(d)}
            className="flex h-14 w-14 items-center justify-center rounded-full text-lg font-semibold text-[var(--ink)]"
            style={{ background: "rgba(36,27,47,0.06)" }}
          >
            {d}
          </button>
        ))}
        <span />
        <button
          type="button"
          onClick={() => handleDigit("0")}
          className="flex h-14 w-14 items-center justify-center rounded-full text-lg font-semibold text-[var(--ink)]"
          style={{ background: "rgba(36,27,47,0.06)" }}
        >
          0
        </button>
        <button
          type="button"
          onClick={handleBackspace}
          className="flex h-14 w-14 items-center justify-center rounded-full text-[var(--ink-soft)]"
        >
          <Delete size={18} />
        </button>
      </div>

      <button
        type="button"
        onClick={signOut}
        className="mt-2 flex items-center gap-1.5 text-xs font-medium text-[var(--ink-faint)]"
      >
        <LogOut size={13} />
        Quên PIN? Đăng xuất
      </button>
    </div>
  );
}
