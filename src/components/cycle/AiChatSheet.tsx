"use client";

import { useEffect, useRef, useState } from "react";
import { Send, Sparkles, X } from "lucide-react";
import { useAiChat, AiChatMessage } from "@/lib/ai-chat";

export default function AiChatSheet({
  initialMessage,
  onClose,
}: {
  initialMessage?: string;
  onClose: () => void;
}) {
  const [messages, setMessages] = useState<AiChatMessage[]>([]);
  const [input, setInput] = useState("");
  const chat = useAiChat();
  const scrollRef = useRef<HTMLDivElement>(null);
  const sentInitial = useRef(false);

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

  return (
    <div className="fixed inset-0 z-40 flex items-end justify-center bg-black/30" onClick={onClose}>
      <div
        className="glass-card-strong flex w-full max-w-md flex-col rounded-t-[28px]"
        style={{ height: "85vh" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between gap-3 border-b border-black/5 px-5 py-4">
          <div className="flex items-center gap-2">
            <span
              className="flex h-9 w-9 items-center justify-center rounded-full text-white"
              style={{ background: "linear-gradient(135deg, var(--c-sleep), var(--c-period))" }}
            >
              <Sparkles size={16} />
            </span>
            <p className="font-display text-base font-bold text-[var(--ink)]">Trợ lý KVCycle</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-black/[0.05] text-[var(--ink-soft)]"
          >
            <X size={16} />
          </button>
        </div>

        <div ref={scrollRef} className="flex-1 overflow-y-auto px-5 py-4">
          {messages.length === 0 && !chat.isPending && (
            <p className="mt-6 text-center text-sm text-[var(--ink-faint)]">
              Hỏi mình bất cứ điều gì về chu kỳ của bạn nhé 🌸
            </p>
          )}
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
        </div>

        <div className="border-t border-black/5 px-5 pt-3">
          <p className="pb-2 text-center text-[10px] leading-relaxed text-[var(--ink-faint)]">
            Đây không phải tư vấn y tế. Nếu có triệu chứng bất thường, hãy gặp bác sĩ.
          </p>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              send(input);
            }}
            className="flex items-center gap-2 pb-2"
            style={{ paddingBottom: "max(0.75rem, env(safe-area-inset-bottom, 0px))" }}
          >
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Nhập câu hỏi của bạn..."
              className="flex-1 rounded-full border border-black/[0.06] bg-[color-mix(in_srgb,var(--surface)_60%,transparent)] px-4 py-2.5 text-sm text-[var(--ink)] outline-none placeholder:text-[var(--ink-faint)]"
            />
            <button
              type="submit"
              disabled={!input.trim() || chat.isPending}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-white disabled:opacity-40"
              style={{ background: "linear-gradient(135deg, var(--c-sleep), var(--c-period))" }}
            >
              <Send size={16} />
            </button>
          </form>
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
