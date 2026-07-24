"use client";

import { useState } from "react";
import { Sparkles, Mail, Lock, Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase";

type Mode = "signin" | "signup";

export default function LoginPage() {
  const [mode, setMode] = useState<Mode>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [oauthLoading, setOauthLoading] = useState<"google" | "apple" | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setInfo(null);
    setLoading(true);
    try {
      if (mode === "signin") {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      } else {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        setInfo("Đăng ký thành công! Kiểm tra email để xác nhận (nếu project bật xác nhận email), sau đó đăng nhập.");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Có lỗi xảy ra, thử lại nhé.");
    } finally {
      setLoading(false);
    }
  }

  async function handleOAuth(provider: "google" | "apple") {
    setError(null);
    setOauthLoading(provider);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: { redirectTo: `${window.location.origin}/` },
      });
      if (error) throw error;
      // Trình duyệt sẽ chuyển hướng sang provider, không cần setOauthLoading(null) ở đây.
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không thể đăng nhập, thử lại nhé.");
      setOauthLoading(null);
    }
  }

  return (
    <main className="flex flex-1 flex-col justify-center gap-8 px-6">
      <div className="flex flex-col items-center gap-3 text-center">
        <span
          className="flex h-14 w-14 items-center justify-center rounded-full text-white"
          style={{ background: "linear-gradient(135deg, var(--c-sleep), var(--c-period))" }}
        >
          <Sparkles size={24} />
        </span>
        <h1 className="font-display text-2xl font-bold text-[var(--ink)]">Aura</h1>
        <p className="text-sm text-[var(--ink-soft)]">
          {mode === "signin" ? "Đăng nhập để tiếp tục" : "Tạo tài khoản mới"}
        </p>
      </div>

      <div className="flex flex-col gap-3">
        <button
          type="button"
          onClick={() => handleOAuth("google")}
          disabled={oauthLoading !== null}
          className="glass-card flex items-center justify-center gap-3 rounded-2xl py-3 text-sm font-semibold text-[var(--ink)] disabled:opacity-60"
        >
          {oauthLoading === "google" ? (
            <Loader2 size={18} className="animate-spin" />
          ) : (
            <GoogleIcon />
          )}
          Tiếp tục với Google
        </button>
        <button
          type="button"
          onClick={() => handleOAuth("apple")}
          disabled={oauthLoading !== null}
          className="flex items-center justify-center gap-3 rounded-2xl bg-black py-3 text-sm font-semibold text-white disabled:opacity-60"
        >
          {oauthLoading === "apple" ? (
            <Loader2 size={18} className="animate-spin" />
          ) : (
            <AppleIcon />
          )}
          Tiếp tục với Apple
        </button>
      </div>

      <div className="flex items-center gap-3">
        <span className="h-px flex-1 bg-black/10" />
        <span className="text-xs text-[var(--ink-faint)]">hoặc dùng email</span>
        <span className="h-px flex-1 bg-black/10" />
      </div>

      <form onSubmit={handleSubmit} className="glass-card-strong flex flex-col gap-4 rounded-[28px] p-6">
        <label className="flex flex-col gap-1.5">
          <span className="text-xs font-medium text-[var(--ink-soft)]">Email</span>
          <div className="flex items-center gap-2 rounded-2xl bg-black/[0.03] px-4 py-3">
            <Mail size={16} className="text-[var(--ink-faint)]" />
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="ban@email.com"
              className="w-full bg-transparent text-sm text-[var(--ink)] outline-none placeholder:text-[var(--ink-faint)]"
            />
          </div>
        </label>

        <label className="flex flex-col gap-1.5">
          <span className="text-xs font-medium text-[var(--ink-soft)]">Mật khẩu</span>
          <div className="flex items-center gap-2 rounded-2xl bg-black/[0.03] px-4 py-3">
            <Lock size={16} className="text-[var(--ink-faint)]" />
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Tối thiểu 6 ký tự"
              className="w-full bg-transparent text-sm text-[var(--ink)] outline-none placeholder:text-[var(--ink-faint)]"
            />
          </div>
        </label>

        {error && <p className="text-xs text-[var(--c-period)]">{error}</p>}
        {info && <p className="text-xs text-[var(--c-mood)]">{info}</p>}

        <button
          type="submit"
          disabled={loading}
          className="mt-2 flex items-center justify-center gap-2 rounded-2xl py-3 text-sm font-semibold text-white disabled:opacity-60"
          style={{ background: "linear-gradient(135deg, var(--c-sleep), var(--c-period))" }}
        >
          {loading && <Loader2 size={16} className="animate-spin" />}
          {mode === "signin" ? "Đăng nhập" : "Đăng ký"}
        </button>
      </form>

      <button
        onClick={() => {
          setMode(mode === "signin" ? "signup" : "signin");
          setError(null);
          setInfo(null);
        }}
        className="text-center text-sm text-[var(--ink-soft)]"
      >
        {mode === "signin" ? (
          <>Chưa có tài khoản? <span className="font-semibold text-[var(--c-sleep)]">Đăng ký</span></>
        ) : (
          <>Đã có tài khoản? <span className="font-semibold text-[var(--c-sleep)]">Đăng nhập</span></>
        )}
      </button>
    </main>
  );
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.72v2.26h2.9c1.7-1.57 2.7-3.88 2.7-6.62z"
      />
      <path
        fill="#34A853"
        d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.9-2.26c-.81.54-1.85.86-3.06.86-2.35 0-4.34-1.59-5.05-3.72H.94v2.33A9 9 0 0 0 9 18z"
      />
      <path
        fill="#FBBC05"
        d="M3.95 10.7A5.4 5.4 0 0 1 3.67 9c0-.59.1-1.17.28-1.7V4.97H.94A9 9 0 0 0 0 9c0 1.45.35 2.83.94 4.03l3.01-2.33z"
      />
      <path
        fill="#EA4335"
        d="M9 3.58c1.32 0 2.5.45 3.44 1.35l2.58-2.58C13.46.89 11.43 0 9 0A9 9 0 0 0 .94 4.97l3.01 2.33C4.66 5.17 6.65 3.58 9 3.58z"
      />
    </svg>
  );
}

function AppleIcon() {
  return (
    <svg width="16" height="18" viewBox="0 0 16 18" fill="white" aria-hidden="true">
      <path d="M13.09 9.5c-.02-1.86 1.52-2.76 1.59-2.8-.87-1.27-2.22-1.44-2.7-1.46-1.15-.12-2.24.68-2.83.68-.58 0-1.48-.66-2.43-.64-1.25.02-2.4.73-3.04 1.85-1.3 2.25-.33 5.57.93 7.4.62.89 1.35 1.89 2.32 1.86.93-.04 1.28-.6 2.4-.6 1.12 0 1.44.6 2.43.58 1-.02 1.63-.9 2.24-1.8.71-1.03.99-2.03 1-2.08-.02-.01-1.91-.73-1.93-2.99z" />
      <path d="M11.3 3.66c.51-.62.86-1.48.76-2.34-.74.03-1.63.49-2.16 1.11-.47.55-.89 1.44-.78 2.28.82.06 1.66-.42 2.18-1.05z" />
    </svg>
  );
}
