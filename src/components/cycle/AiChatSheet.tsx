"use client";

// Module J (đợt bổ sung theo yêu cầu chủ dự án, kèm ảnh tham khảo giao diện
// "New AI Chat" — mascot bong bóng, lời chào theo tên, ô chip gợi ý chủ đề,
// thanh nhập có icon đính kèm/mic). Đổi từ bottom-sheet 85vh sang phủ TOÀN
// MÀN HÌNH (giống 1 trang riêng, dù vẫn là overlay — không đổi routing để
// giữ nguyên mọi điểm gọi cũ `setChatOpen(true)` ở `cycle/page.tsx` không bị
// vỡ). Màn hình chào (chưa có tin nhắn nào) hiện mascot + lời chào + chip chủ
// đề; ngay khi có tin nhắn đầu tiên thì chuyển sang danh sách chat như cũ.

import { useEffect, useRef, useState } from "react";
import { ChevronLeft, MoreVertical, Send, Sparkles, Image as ImageIcon, Mic, Plus, LucideIcon } from "lucide-react";
import { useAiChat, AiChatMessage } from "@/lib/ai-chat";
import { useProfile } from "@/lib/queries";
import { isVipProfile } from "@/lib/vip";
import { useToast } from "@/components/ui/Toast";

const TOPIC_CHIPS: { label: string; prompt: string }[] = [
  { label: "Hướng dẫn chu kỳ", prompt: "Hãy giải thích cho mình về các giai đoạn trong chu kỳ kinh nguyệt." },
  { label: "Huấn luyện sức khỏe", prompt: "Mình nên làm gì để cải thiện sức khỏe tổng thể trong chu kỳ này?" },
  { label: "Chăm sóc bản thân", prompt: "Gợi ý cho mình vài cách chăm sóc bản thân trong những ngày hành kinh." },
  { label: "Sức khỏe tinh thần", prompt: "Làm sao để cân bằng cảm xúc trong giai đoạn tiền kinh nguyệt?" },
];

export default function AiChatSheet({
  initialMessage,
  onClose,
}: {
  initialMessage?: string;
  onClose: () => void;
}) {
  const [messages, setMessages] = useState<AiChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const chat = useAiChat();
  const scrollRef = useRef<HTMLDivElement>(null);
  const sentInitial = useRef(false);
  const { data: profile } = useProfile();
  const toast = useToast();
  const vip = isVipProfile(profile);
  const firstName = (profile?.display_name || "").trim().split(/\s+/).pop();

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, chat.isPending]);

  async function send(text: string) {
    const content = text.trim();
    if (!content || chat.isPending) return;
    const next: AiChatMessage[] = [...messages, { role: "user", content }];
    setMessages(next);
    setInput("");
    try {
      const reply = await chat.mutateAsync(next);
      setMessages((prev) => [...prev, { role: "assistant", content: reply }]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            err instanceof Error && err.message
              ? `Xin lỗi, ${err.message.toLowerCase()} Bạn thử gửi lại câu hỏi giúp mình nhé.`
              : "Xin lỗi, mình chưa trả lời được ngay lúc này. Bạn thử gửi lại câu hỏi giúp mình nhé.",
        },
      ]);
    }
  }

  useEffect(() => {
    if (initialMessage && !sentInitial.current) {
      sentInitial.current = true;
      send(initialMessage);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialMessage]);

  const hasMessages = messages.length > 0;

  return (
    <div className="fixed inset-0 z-40 flex flex-col bg-[var(--surface)]">
      <div className="flex items-center justify-between gap-3 border-b border-black/5 px-4 py-3">
        <button
          type="button"
          onClick={onClose}
          className="flex h-9 w-9 items-center justify-center rounded-full text-[var(--ink-soft)] transition active:scale-90"
          aria-label="Quay lại"
        >
          <ChevronLeft size={20} />
        </button>
        <p className="font-display text-sm font-bold text-[var(--ink)]">Trò chuyện AI</p>
        <div className="relative">
          <button
            type="button"
            onClick={() => setMenuOpen((v) => !v)}
            disabled={!hasMessages}
            className="flex h-9 w-9 items-center justify-center rounded-full text-[var(--ink-soft)] transition active:scale-90 disabled:opacity-0"
            aria-label="Tuỳ chọn"
          >
            <MoreVertical size={18} />
          </button>
          {menuOpen && (
            <div className="glass-card-strong absolute right-0 top-10 z-10 min-w-[9.5rem] rounded-2xl p-1.5">
              <button
                type="button"
                onClick={() => {
                  setMessages([]);
                  setMenuOpen(false);
                }}
                className="w-full rounded-xl px-3 py-2 text-left text-xs font-medium text-[var(--c-period)] hover:bg-black/5"
              >
                Xoá đoạn chat
              </button>
            </div>
          )}
        </div>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto px-5 py-4">
        {!hasMessages && !chat.isPending ? (
          <div className="flex flex-col items-center gap-5 pt-8 text-center">
            <AiMascot />
            <div className="flex flex-col gap-1.5">
              <p className="text-sm font-medium text-[var(--ink-soft)]">
                {firstName ? `Xin chào, ${firstName}` : "Xin chào"}
              </p>
              <h1 className="font-display text-2xl font-extrabold leading-snug text-[var(--ink)]">
                Hôm nay mình có thể
                <br />
                giúp gì cho bạn?
              </h1>
            </div>
            <div
              className="flex w-full gap-2 overflow-x-auto pb-1"
              style={{
                WebkitMaskImage: "linear-gradient(to right, black calc(100% - 24px), transparent 100%)",
                maskImage: "linear-gradient(to right, black calc(100% - 24px), transparent 100%)",
              }}
            >
              {TOPIC_CHIPS.map((chip) => (
                <button
                  key={chip.label}
                  type="button"
                  onClick={() => send(chip.prompt)}
                  className="glass-card shrink-0 whitespace-nowrap rounded-full px-4 py-2.5 text-xs font-semibold text-[var(--ink-soft)] transition active:scale-95"
                >
                  {chip.label}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[80%] rounded-[18px] px-4 py-2.5 text-sm leading-relaxed ${
                    m.role === "user" ? "text-white" : "glass-card text-[var(--ink)]"
                  }`}
                  style={
                    m.role === "user"
                      ? { background: "linear-gradient(135deg, var(--c-sleep), var(--c-period))" }
                      : undefined
                  }
                >
                  {m.content}
                </div>
              </div>
            ))}
            {chat.isPending && (
              <div className="flex justify-start">
                <div className="glass-card flex items-center gap-1 rounded-[18px] px-4 py-3">
                  <TypingDot delay="0ms" />
                  <TypingDot delay="150ms" />
                  <TypingDot delay="300ms" />
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="border-t border-black/5 px-4 pt-3">
        <div className="glass-card flex flex-col gap-2.5 rounded-[22px] p-3">
          <div className="flex items-center justify-between px-1">
            <span className="flex items-center gap-1.5 text-[11px] font-semibold text-[var(--ink-soft)]">
              <Sparkles size={12} style={{ color: "var(--c-ovulation)" }} />
              Trợ lý AI KVCycle
            </span>
            {!vip && (
              <a href="/profile" className="text-[11px] font-bold" style={{ color: "var(--c-period)" }}>
                Nâng cấp
              </a>
            )}
          </div>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              send(input);
            }}
            className="flex items-center gap-1.5"
          >
            <IconGhostButton
              icon={Plus}
              label="Đính kèm"
              onClick={() => toast.info("Tính năng đính kèm sắp ra mắt")}
            />
            <IconGhostButton
              icon={ImageIcon}
              label="Gửi ảnh"
              onClick={() => toast.info("Tính năng gửi ảnh sắp ra mắt")}
            />
            <IconGhostButton
              icon={Mic}
              label="Nói"
              onClick={() => toast.info("Tính năng nói sắp ra mắt")}
            />
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Hỏi mình bất cứ điều gì..."
              className="min-w-0 flex-1 bg-transparent px-1 text-sm text-[var(--ink)] outline-none placeholder:text-[var(--ink-faint)]"
            />
            <button
              type="submit"
              disabled={!input.trim() || chat.isPending}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-white transition active:scale-90 disabled:opacity-40"
              style={{ background: "linear-gradient(135deg, var(--c-sleep), var(--c-period))" }}
            >
              <Send size={15} />
            </button>
          </form>
        </div>
        <p
          className="pb-2 pt-2 text-center text-[10px] leading-relaxed text-[var(--ink-faint)]"
          style={{ paddingBottom: "max(0.5rem, env(safe-area-inset-bottom, 0px))" }}
        >
          Đây không phải tư vấn y tế. Nếu có triệu chứng bất thường, hãy gặp bác sĩ.
        </p>
      </div>
    </div>
  );
}

function IconGhostButton({
  icon: Icon,
  label,
  onClick,
}: {
  icon: LucideIcon;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[var(--ink-faint)] transition hover:bg-black/5 active:scale-90"
    >
      <Icon size={16} />
    </button>
  );
}

// Mascot bong bóng nguyên bản (không sao chép nhân vật/hình vẽ có sẵn nào) —
// khối tròn gradient pastel dùng lại đúng bộ màu token của app
// (--c-sleep/--c-period/--c-ovulation), 2 chấm mắt đơn giản + bong bóng thoại
// nhỏ 3 chấm phía trên, gợi nhắc "AI đang lắng nghe" mà không vẽ chi tiết
// phức tạp (giữ nhẹ, không cần ảnh ngoài).
function AiMascot() {
  return (
    <div className="relative flex h-28 w-28 items-center justify-center">
      <span
        className="absolute -top-3 left-1/2 flex h-6 items-center gap-0.5 rounded-full px-2.5 shadow-sm"
        style={{ background: "color-mix(in srgb, var(--c-sleep) 22%, white)", transform: "translateX(-50%)" }}
      >
        <span className="h-1 w-1 rounded-full" style={{ background: "var(--c-sleep)" }} />
        <span className="h-1 w-1 rounded-full" style={{ background: "var(--c-sleep)" }} />
        <span className="h-1 w-1 rounded-full" style={{ background: "var(--c-sleep)" }} />
      </span>
      <div
        className="h-24 w-24 rounded-full shadow-[0_10px_30px_rgba(124,111,240,0.28)]"
        style={{
          background:
            "radial-gradient(circle at 34% 30%, #ffffff 0%, color-mix(in srgb, var(--c-sleep) 55%, white) 35%, color-mix(in srgb, var(--c-period) 55%, white) 75%, color-mix(in srgb, var(--c-ovulation) 45%, white) 100%)",
        }}
      >
        <div className="flex h-full items-center justify-center gap-3.5">
          <span className="h-2 w-2 rounded-full bg-[#241b2f]" />
          <span className="h-2 w-2 rounded-full bg-[#241b2f]" />
        </div>
      </div>
    </div>
  );
}

function TypingDot({ delay }: { delay: string }) {
  return (
    <span
      className="h-2 w-2 animate-bounce rounded-full"
      style={{ background: "var(--ink-faint)", animationDelay: delay }}
    />
  );
}
