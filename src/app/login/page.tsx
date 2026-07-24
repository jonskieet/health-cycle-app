"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Sparkles, Mail, Lock, Loader2, ArrowLeft, ShieldCheck } from "lucide-react";
import { supabase } from "@/lib/supabase";

type Step = "signin" | "signup" | "otp" | "forgot" | "forgot-sent";

const RESEND_SECONDS = 45;

export default function LoginPage() {
  const router = useRouter();

  const [step, setStep] = useState<Step>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [oauthLoading, setOauthLoading] = useState<"google" | "apple" | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  // OTP
  const [otp, setOtp] = useState<string[]>(["", "", "", "", "", ""]);
  const [resendIn, setResendIn] = useState(0);
  const otpRefs = useRef<Array<HTMLInputElement | null>>([]);

  useEffect(() => {
    if (resendIn <= 0) return;
    const t = setTimeout(() => setResendIn((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [resendIn]);

  function resetMessages() {
    setError(null);
    setInfo(null);
  }

  function goTo(next: Step) {
    resetMessages();
    setStep(next);
  }

  async function handleSignIn(e: React.FormEvent) {
    e.preventDefault();
    resetMessages();
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Có lỗi xảy ra, thử lại nhé.");
    } finally {
      setLoading(false);
    }
  }

  async function handleSignUp(e: React.FormEvent) {
    e.preventDefault();
    resetMessages();
    if (password !== confirmPassword) {
      setError("Mật khẩu nhập lại không khớp.");
      return;
    }
    setLoading(true);
    try {
      const { error } = await supabase.auth.signUp({ email, password });
      if (error) throw error;
      setOtp(["", "", "", "", "", ""]);
      setResendIn(RESEND_SECONDS);
      setStep("otp");
      setInfo(`Mã xác nhận 6 số đã được gửi tới ${email}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không thể đăng ký, thử lại nhé.");
    } finally {
      setLoading(false);
    }
  }

  async function handleVerifyOtp(e: React.FormEvent) {
    e.preventDefault();
    resetMessages();
    const token = otp.join("");
    if (token.length !== 6) {
      setError("Nhập đủ 6 số nhé.");
      return;
    }
    setLoading(true);
    try {
      const { error } = await supabase.auth.verifyOtp({
        email,
        token,
        type: "signup",
      });
      if (error) throw error;
      router.replace("/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Mã không đúng hoặc đã hết hạn.");
    } finally {
      setLoading(false);
    }
  }

  async function handleResend() {
    if (resendIn > 0) return;
    resetMessages();
    try {
      const { error } = await supabase.auth.resend({ type: "signup", email });
      if (error) throw error;
      setResendIn(RESEND_SECONDS);
      setInfo("Đã gửi lại mã xác nhận.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không gửi lại được mã, thử lại sau.");
    }
  }

  async function handleForgotPassword(e: React.FormEvent) {
    e.preventDefault();
    resetMessages();
    setLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (error) throw error;
      setStep("forgot-sent");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không gửi được email, thử lại nhé.");
    } finally {
      setLoading(false);
    }
  }

  async function handleOAuth(provider: "google" | "apple") {
    resetMessages();
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

  function handleOtpChange(index: number, raw: string) {
    const digit = raw.replace(/\D/g, "").slice(-1);
    setOtp((prev) => {
      const next = [...prev];
      next[index] = digit;
      return next;
    });
    if (digit && index < 5) otpRefs.current[index + 1]?.focus();
  }

  function handleOtpKeyDown(index: number, e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  }

  function handleOtpPaste(e: React.ClipboardEvent<HTMLInputElement>) {
    const text = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (!text) return;
    e.preventDefault();
    setOtp((prev) => {
      const next = [...prev];
      for (let i = 0; i < 6; i++) next[i] = text[i] ?? "";
      return next;
    });
    otpRefs.current[Math.min(text.length, 5)]?.focus();
  }

  const isAuthStep = step === "signin" || step === "signup";

  return (
    <main
      className="flex flex-1 flex-col items-center justify-center px-5"
      style={{
        paddingTop: "max(2rem, env(safe-area-inset-top))",
        paddingBottom: "max(2rem, env(safe-area-inset-bottom))",
      }}
    >
      <div className="flex w-full max-w-sm flex-col items-center gap-6">
        {/* Hero / brand */}
        <div className="flex flex-col items-center gap-3 text-center">
          <span
            className="flex h-16 w-16 items-center justify-center rounded-[22px] text-white shadow-lg"
            style={{
              background: "linear-gradient(135deg, var(--c-sleep), var(--c-period))",
              boxShadow: "0 16px 32px -12px rgba(124, 111, 240, 0.45)",
            }}
          >
            <Sparkles size={26} />
          </span>
          <div>
            <h1 className="font-display text-2xl font-bold text-[var(--ink)]">KVCycle</h1>
            <p className="mt-1 text-sm text-[var(--ink-soft)]">
              {step === "signin" && "Chào mừng trở lại"}
              {step === "signup" && "Tạo tài khoản để bắt đầu theo dõi"}
              {step === "otp" && "Xác nhận email của bạn"}
              {step === "forgot" && "Khôi phục mật khẩu"}
              {step === "forgot-sent" && "Kiểm tra hộp thư của bạn"}
            </p>
          </div>
        </div>

        <div className="glass-card-strong w-full rounded-[32px] p-7">
          {/* Tabs — chỉ hiện ở bước đăng nhập/đăng ký */}
          {isAuthStep && (
            <div className="mb-6 flex rounded-2xl bg-black/[0.04] p-1">
              <button
                type="button"
                onClick={() => goTo("signin")}
                className="relative flex-1 rounded-xl py-2.5 text-sm font-semibold transition-colors"
                style={
                  step === "signin"
                    ? { background: "white", color: "var(--ink)", boxShadow: "0 4px 12px rgba(36,27,47,0.08)" }
                    : { color: "var(--ink-soft)" }
                }
              >
                Đăng nhập
              </button>
              <button
                type="button"
                onClick={() => goTo("signup")}
                className="relative flex-1 rounded-xl py-2.5 text-sm font-semibold transition-colors"
                style={
                  step === "signup"
                    ? { background: "white", color: "var(--ink)", boxShadow: "0 4px 12px rgba(36,27,47,0.08)" }
                    : { color: "var(--ink-soft)" }
                }
              >
                Đăng ký
              </button>
            </div>
          )}

          {step === "signin" && (
            <form onSubmit={handleSignIn} className="flex flex-col gap-4">
              <EmailField value={email} onChange={setEmail} />
              <PasswordField
                value={password}
                onChange={setPassword}
                placeholder="Nhập mật khẩu"
                autoComplete="current-password"
              />

              <button
                type="button"
                onClick={() => goTo("forgot")}
                className="-mt-1 self-end text-xs font-medium text-[var(--c-sleep)]"
              >
                Quên mật khẩu?
              </button>

              <Messages error={error} info={info} />

              <SubmitButton loading={loading} label="Đăng nhập" />
              <SocialDivider />
              <SocialButtons oauthLoading={oauthLoading} onOAuth={handleOAuth} />
            </form>
          )}

          {step === "signup" && (
            <form onSubmit={handleSignUp} className="flex flex-col gap-4">
              <EmailField value={email} onChange={setEmail} />
              <PasswordField
                value={password}
                onChange={setPassword}
                placeholder="Tối thiểu 6 ký tự"
                autoComplete="new-password"
              />
              <PasswordField
                value={confirmPassword}
                onChange={setConfirmPassword}
                placeholder="Nhập lại mật khẩu"
                autoComplete="new-password"
                label="Xác nhận mật khẩu"
              />

              <Messages error={error} info={info} />

              <SubmitButton loading={loading} label="Đăng ký" />
              <SocialDivider />
              <SocialButtons oauthLoading={oauthLoading} onOAuth={handleOAuth} />
            </form>
          )}

          {step === "otp" && (
            <form onSubmit={handleVerifyOtp} className="flex flex-col gap-5">
              <button
                type="button"
                onClick={() => goTo("signup")}
                className="flex items-center gap-1 text-xs font-medium text-[var(--ink-soft)]"
              >
                <ArrowLeft size={14} /> Quay lại
              </button>

              <div className="flex flex-col items-center gap-2 text-center">
                <span
                  className="flex h-11 w-11 items-center justify-center rounded-full"
                  style={{ background: "color-mix(in srgb, var(--c-sleep) 15%, white)" }}
                >
                  <ShieldCheck size={20} style={{ color: "var(--c-sleep)" }} />
                </span>
                <p className="text-sm text-[var(--ink-soft)]">
                  Nhập mã 6 số vừa gửi tới
                  <br />
                  <span className="font-semibold text-[var(--ink)]">{email}</span>
                </p>
              </div>

              <div className="flex justify-center gap-2">
                {otp.map((digit, i) => (
                  <input
                    key={i}
                    ref={(el) => {
                      otpRefs.current[i] = el;
                    }}
                    value={digit}
                    onChange={(e) => handleOtpChange(i, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(i, e)}
                    onPaste={handleOtpPaste}
                    inputMode="numeric"
                    maxLength={1}
                    className="h-12 w-11 rounded-2xl bg-black/[0.04] text-center text-lg font-bold text-[var(--ink)] outline-none focus:ring-2"
                    style={{ boxShadow: digit ? "0 0 0 2px var(--c-sleep) inset" : undefined }}
                  />
                ))}
              </div>

              <Messages error={error} info={info} />

              <SubmitButton loading={loading} label="Xác nhận" />

              <button
                type="button"
                onClick={handleResend}
                disabled={resendIn > 0}
                className="text-center text-xs font-medium text-[var(--ink-soft)] disabled:opacity-60"
              >
                {resendIn > 0 ? (
                  <>Gửi lại mã sau {resendIn}s</>
                ) : (
                  <>
                    Chưa nhận được mã?{" "}
                    <span className="font-semibold text-[var(--c-sleep)]">Gửi lại</span>
                  </>
                )}
              </button>
            </form>
          )}

          {step === "forgot" && (
            <form onSubmit={handleForgotPassword} className="flex flex-col gap-4">
              <button
                type="button"
                onClick={() => goTo("signin")}
                className="flex items-center gap-1 text-xs font-medium text-[var(--ink-soft)]"
              >
                <ArrowLeft size={14} /> Quay lại đăng nhập
              </button>
              <p className="text-sm text-[var(--ink-soft)]">
                Nhập email đã đăng ký, chúng tôi sẽ gửi liên kết đặt lại mật khẩu.
              </p>
              <EmailField value={email} onChange={setEmail} />
              <Messages error={error} info={info} />
              <SubmitButton loading={loading} label="Gửi liên kết khôi phục" />
            </form>
          )}

          {step === "forgot-sent" && (
            <div className="flex flex-col items-center gap-4 py-2 text-center">
              <span
                className="flex h-12 w-12 items-center justify-center rounded-full"
                style={{ background: "color-mix(in srgb, var(--c-mood) 15%, white)" }}
              >
                <Mail size={20} style={{ color: "var(--c-mood)" }} />
              </span>
              <p className="text-sm text-[var(--ink-soft)]">
                Đã gửi liên kết đặt lại mật khẩu tới
                <br />
                <span className="font-semibold text-[var(--ink)]">{email}</span>
              </p>
              <button
                type="button"
                onClick={() => goTo("signin")}
                className="mt-1 flex items-center justify-center gap-2 rounded-2xl px-6 py-3 text-sm font-semibold text-white"
                style={{ background: "linear-gradient(135deg, var(--c-sleep), var(--c-period))" }}
              >
                Quay lại đăng nhập
              </button>
            </div>
          )}
        </div>

        {isAuthStep && (
          <button
            type="button"
            onClick={() => goTo(step === "signin" ? "signup" : "signin")}
            className="text-center text-sm text-[var(--ink-soft)]"
          >
            {step === "signin" ? (
              <>Chưa có tài khoản? <span className="font-semibold text-[var(--c-sleep)]">Đăng ký ngay</span></>
            ) : (
              <>Đã có tài khoản? <span className="font-semibold text-[var(--c-sleep)]">Đăng nhập</span></>
            )}
          </button>
        )}
      </div>
    </main>
  );
}

function EmailField({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-xs font-medium text-[var(--ink-soft)]">Email</span>
      <div className="flex items-center gap-2 rounded-2xl bg-black/[0.03] px-4 py-3">
        <Mail size={16} className="text-[var(--ink-faint)]" />
        <input
          type="email"
          required
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="ban@email.com"
          autoComplete="email"
          className="w-full bg-transparent text-sm text-[var(--ink)] outline-none placeholder:text-[var(--ink-faint)]"
        />
      </div>
    </label>
  );
}

function PasswordField({
  value,
  onChange,
  placeholder,
  autoComplete,
  label = "Mật khẩu",
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  autoComplete: string;
  label?: string;
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-xs font-medium text-[var(--ink-soft)]">{label}</span>
      <div className="flex items-center gap-2 rounded-2xl bg-black/[0.03] px-4 py-3">
        <Lock size={16} className="text-[var(--ink-faint)]" />
        <input
          type="password"
          required
          minLength={6}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          autoComplete={autoComplete}
          className="w-full bg-transparent text-sm text-[var(--ink)] outline-none placeholder:text-[var(--ink-faint)]"
        />
      </div>
    </label>
  );
}

function Messages({ error, info }: { error: string | null; info: string | null }) {
  if (!error && !info) return null;
  return (
    <>
      {error && <p className="text-xs text-[var(--c-period)]">{error}</p>}
      {info && <p className="text-xs text-[var(--c-mood)]">{info}</p>}
    </>
  );
}

function SubmitButton({ loading, label }: { loading: boolean; label: string }) {
  return (
    <button
      type="submit"
      disabled={loading}
      className="mt-1 flex items-center justify-center gap-2 rounded-2xl py-3 text-sm font-semibold text-white disabled:opacity-60"
      style={{ background: "linear-gradient(135deg, var(--c-sleep), var(--c-period))" }}
    >
      {loading && <Loader2 size={16} className="animate-spin" />}
      {label}
    </button>
  );
}

function SocialDivider() {
  return (
    <div className="flex items-center gap-3">
      <span className="h-px flex-1 bg-black/10" />
      <span className="text-xs text-[var(--ink-faint)]">hoặc tiếp tục với</span>
      <span className="h-px flex-1 bg-black/10" />
    </div>
  );
}

function SocialButtons({
  oauthLoading,
  onOAuth,
}: {
  oauthLoading: "google" | "apple" | null;
  onOAuth: (provider: "google" | "apple") => void;
}) {
  return (
    <div className="flex gap-3">
      <button
        type="button"
        onClick={() => onOAuth("google")}
        disabled={oauthLoading !== null}
        className="flex flex-1 items-center justify-center gap-2 rounded-2xl border border-black/10 bg-white py-3 text-sm font-semibold text-[var(--ink)] disabled:opacity-60"
      >
        {oauthLoading === "google" ? <Loader2 size={18} className="animate-spin" /> : <GoogleIcon />}
        Google
      </button>
      <button
        type="button"
        onClick={() => onOAuth("apple")}
        disabled={oauthLoading !== null}
        className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-black py-3 text-sm font-semibold text-white disabled:opacity-60"
      >
        {oauthLoading === "apple" ? <Loader2 size={18} className="animate-spin" /> : <AppleIcon />}
        Apple
      </button>
    </div>
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
