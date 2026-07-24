"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { KeyRound, Loader2, CheckCircle2 } from "lucide-react";
import { supabase } from "@/lib/supabase";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (password.length < 6) {
      setError("Mật khẩu cần tối thiểu 6 ký tự.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Mật khẩu nhập lại không khớp.");
      return;
    }
    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      setDone(true);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Không đặt lại được mật khẩu. Liên kết có thể đã hết hạn, hãy thử lại từ đầu."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main
      className="flex flex-1 flex-col items-center justify-center px-5"
      style={{
        paddingTop: "max(2rem, env(safe-area-inset-top))",
        paddingBottom: "max(2rem, env(safe-area-inset-bottom))",
      }}
    >
      <div className="flex w-full max-w-sm flex-col items-center gap-6">
        <div className="flex flex-col items-center gap-3 text-center">
          <span
            className="flex h-16 w-16 items-center justify-center rounded-[22px] text-white"
            style={{
              background: "linear-gradient(135deg, var(--c-sleep), var(--c-period))",
              boxShadow: "0 16px 32px -12px rgba(124, 111, 240, 0.45)",
            }}
          >
            <KeyRound size={26} />
          </span>
          <div>
            <h1 className="font-display text-2xl font-bold text-[var(--ink)]">KVCycle</h1>
            <p className="mt-1 text-sm text-[var(--ink-soft)]">
              {done ? "Mật khẩu đã được cập nhật" : "Đặt mật khẩu mới"}
            </p>
          </div>
        </div>

        <div className="glass-card-strong w-full rounded-[32px] p-7">
          {done ? (
            <div className="flex flex-col items-center gap-4 py-2 text-center">
              <span
                className="flex h-12 w-12 items-center justify-center rounded-full"
                style={{ background: "color-mix(in srgb, var(--c-mood) 15%, white)" }}
              >
                <CheckCircle2 size={22} style={{ color: "var(--c-mood)" }} />
              </span>
              <p className="text-sm text-[var(--ink-soft)]">
                Mật khẩu của bạn đã được đổi thành công. Hãy đăng nhập lại với mật khẩu mới.
              </p>
              <button
                type="button"
                onClick={async () => {
                  await supabase.auth.signOut();
                  router.replace("/login");
                }}
                className="mt-1 flex items-center justify-center gap-2 rounded-2xl px-6 py-3 text-sm font-semibold text-white"
                style={{ background: "linear-gradient(135deg, var(--c-sleep), var(--c-period))" }}
              >
                Đến trang đăng nhập
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <label className="flex flex-col gap-1.5">
                <span className="text-xs font-medium text-[var(--ink-soft)]">Mật khẩu mới</span>
                <div className="flex items-center gap-2 rounded-2xl bg-black/[0.03] px-4 py-3">
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Tối thiểu 6 ký tự"
                    autoComplete="new-password"
                    className="w-full bg-transparent text-sm text-[var(--ink)] outline-none placeholder:text-[var(--ink-faint)]"
                  />
                </div>
              </label>

              <label className="flex flex-col gap-1.5">
                <span className="text-xs font-medium text-[var(--ink-soft)]">Nhập lại mật khẩu</span>
                <div className="flex items-center gap-2 rounded-2xl bg-black/[0.03] px-4 py-3">
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Nhập lại mật khẩu mới"
                    autoComplete="new-password"
                    className="w-full bg-transparent text-sm text-[var(--ink)] outline-none placeholder:text-[var(--ink-faint)]"
                  />
                </div>
              </label>

              {error && <p className="text-xs text-[var(--c-period)]">{error}</p>}

              <button
                type="submit"
                disabled={loading}
                className="mt-1 flex items-center justify-center gap-2 rounded-2xl py-3 text-sm font-semibold text-white disabled:opacity-60"
                style={{ background: "linear-gradient(135deg, var(--c-sleep), var(--c-period))" }}
              >
                {loading && <Loader2 size={16} className="animate-spin" />}
                Cập nhật mật khẩu
              </button>
            </form>
          )}
        </div>
      </div>
    </main>
  );
}
