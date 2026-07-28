"use client";

// Module A1 (QUALITY_UX_ROADMAP.md) — Hệ thống thông báo (Toast) TOÀN CỤC.
//
// Trước module này: mỗi form tự xử lý phản hồi lưu/lỗi theo kiểu riêng — có nơi
// im lặng không báo gì (đa số), có nơi tự vẽ banner đỏ riêng bên trong modal
// (VD MetricLogForm cũ). Hệ quả: bug "Lưu thất bại" thật sự tồn tại âm thầm rất
// lâu vì phần lớn nơi khác trong app không có cách nào để lộ lỗi ra cho người
// dùng thấy. Toast này là điểm phản hồi DUY NHẤT dùng chung cho mọi hành động
// lưu/xoá/cập nhật trong toàn app từ nay về sau.
//
// Cách dùng ở bất kỳ client component nào (phải nằm trong <ToastProvider>, đã
// gắn sẵn ở providers.tsx nên mọi trang đều dùng được ngay):
//   const toast = useToast();
//   toast.success("Đã lưu nhịp tim");
//   toast.error("Lưu thất bại, thử lại nhé");
//   toast.error(err); // nhận thẳng Error/unknown, tự rút message an toàn
//
// Thiết kế:
// - Render qua nhiều toast xếp chồng góc trên (mobile) — không đặt dưới cùng vì
//   dễ bị BottomNav (4 tab cố định) che mất, đã có ở hầu hết các trang.
// - Tự ẩn sau 3.2s (error 4.5s vì cần đọc kỹ hơn), có nút đóng tay.
// - Tôn trọng an toàn vùng (safe-area-inset-top) cho notch/tai thỏ.
// - Animation vào/ra bằng CSS thuần (không thêm dependency), tôn trọng
//   prefers-reduced-motion đã khai báo sẵn trong globals.css.

import {
  createContext,
  useCallback,
  useContext,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { CheckCircle2, XCircle, Info, X } from "lucide-react";

type ToastVariant = "success" | "error" | "info";

interface ToastItem {
  id: number;
  variant: ToastVariant;
  message: string;
}

interface ToastApi {
  success: (message: string) => void;
  error: (messageOrError: unknown) => void;
  info: (message: string) => void;
}

const ToastContext = createContext<ToastApi | null>(null);

/** Rút message an toàn từ unknown error (catch block thường có kiểu unknown). */
function errorMessage(messageOrError: unknown): string {
  if (typeof messageOrError === "string") return messageOrError;
  if (messageOrError instanceof Error && messageOrError.message) {
    return messageOrError.message;
  }
  return "Có lỗi xảy ra, vui lòng thử lại.";
}

const VARIANT_DURATION: Record<ToastVariant, number> = {
  success: 3200,
  info: 3200,
  error: 4500,
};

const VARIANT_STYLE: Record<ToastVariant, { bg: string; fg: string; Icon: typeof CheckCircle2 }> = {
  success: { bg: "var(--c-mood)", fg: "#fff", Icon: CheckCircle2 },
  error: { bg: "var(--c-heart)", fg: "#fff", Icon: XCircle },
  info: { bg: "var(--ink)", fg: "#fff", Icon: Info },
};

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const idRef = useRef(0);

  const remove = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const push = useCallback(
    (variant: ToastVariant, message: string) => {
      const id = ++idRef.current;
      setToasts((prev) => [...prev, { id, variant, message }]);
      window.setTimeout(() => remove(id), VARIANT_DURATION[variant]);
    },
    [remove]
  );

  const api: ToastApi = {
    success: (message) => push("success", message),
    error: (messageOrError) => push("error", errorMessage(messageOrError)),
    info: (message) => push("info", message),
  };

  return (
    <ToastContext.Provider value={api}>
      {children}
      {/* Portal thủ công không cần thiết vì z-index cao + fixed đã đủ nổi lên
          trên mọi modal hiện có (modal cao nhất trong app đang dùng z-30). */}
      <div
        className="pointer-events-none fixed inset-x-0 top-0 z-[60] flex flex-col items-center gap-2 px-4"
        style={{ paddingTop: "max(env(safe-area-inset-top), 14px)" }}
        aria-live="polite"
        aria-atomic="true"
      >
        {toasts.map((t) => {
          const { bg, fg, Icon } = VARIANT_STYLE[t.variant];
          return (
            <div
              key={t.id}
              role={t.variant === "error" ? "alert" : "status"}
              className="toast-item pointer-events-auto flex w-full max-w-sm items-start gap-2 rounded-2xl px-4 py-3 text-sm font-medium shadow-lg"
              style={{ background: bg, color: fg }}
            >
              <Icon size={18} className="mt-0.5 shrink-0" />
              <span className="flex-1 leading-snug">{t.message}</span>
              <button
                type="button"
                onClick={() => remove(t.id)}
                className="shrink-0 rounded-full p-0.5 opacity-80 transition active:scale-90 hover:opacity-100"
                aria-label="Đóng thông báo"
              >
                <X size={15} />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast(): ToastApi {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    // Không throw cứng để tránh crash toàn app nếu 1 component lỡ dùng ngoài
    // provider (vd trong test) — fallback console để vẫn còn dấu vết debug.
    return {
      success: (m) => console.warn("[toast:success outside provider]", m),
      error: (m) => console.warn("[toast:error outside provider]", errorMessage(m)),
      info: (m) => console.warn("[toast:info outside provider]", m),
    };
  }
  return ctx;
}
