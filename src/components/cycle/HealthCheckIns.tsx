"use client";

import { useState } from "react";
import { X, ChevronRight, ClipboardList } from "lucide-react";
import { CHECK_IN_QUIZZES, CheckInQuiz } from "@/lib/cycle-insights";

export default function HealthCheckIns() {
  const [activeQuiz, setActiveQuiz] = useState<CheckInQuiz | null>(null);

  return (
    <section className="flex flex-col gap-3">
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full" style={{ background: "var(--c-mood)" }} />
          <p className="font-display text-sm font-bold text-[var(--ink)]">Đã đến lúc kiểm tra!</p>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        {CHECK_IN_QUIZZES.map((q) => (
          <button
            key={q.id}
            type="button"
            onClick={() => setActiveQuiz(q)}
            className="glass-card flex items-center gap-4 rounded-[24px] p-5 text-left active:scale-[0.99]"
          >
            <span
              className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-white"
              style={{ background: q.gradient }}
            >
              <ClipboardList size={20} />
            </span>
            <div className="flex-1">
              <p className="font-display text-sm font-bold text-[var(--ink)]">{q.title}</p>
              <p className="mt-0.5 text-xs leading-relaxed text-[var(--ink-soft)]">{q.subtitle}</p>
              <span className="mt-2 inline-block text-xs font-semibold" style={{ color: "var(--c-sleep)" }}>
                Bắt đầu kiểm tra
              </span>
            </div>
            <ChevronRight size={16} className="shrink-0 text-[var(--ink-faint)]" />
          </button>
        ))}
      </div>

      <p className="px-2 text-[10px] leading-relaxed text-[var(--ink-faint)]">
        Đây không phải công cụ chẩn đoán y tế. Kết quả chỉ mang tính tham khảo — hãy trao đổi với bác sĩ nếu bạn lo lắng.
      </p>

      {activeQuiz && <QuizModal quiz={activeQuiz} onClose={() => setActiveQuiz(null)} />}
    </section>
  );
}

function QuizModal({ quiz, onClose }: { quiz: CheckInQuiz; onClose: () => void }) {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);

  const isResult = step >= quiz.questions.length;
  const question = quiz.questions[step];

  function choose(optionIndex: number) {
    const next = [...answers, optionIndex];
    setAnswers(next);
    setStep(step + 1);
  }

  const avgScore = answers.length ? answers.reduce((a, b) => a + b, 0) / answers.length : 0;
  const result = isResult ? quiz.resultForScore(avgScore) : null;

  return (
    <div className="fixed inset-0 z-30 flex items-end justify-center bg-black/30" onClick={onClose}>
      <div
        className="glass-card-strong w-full max-w-md rounded-t-[28px] p-6"
        style={{ paddingBottom: "max(2rem, env(safe-area-inset-bottom, 0px))" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-5 flex items-center justify-between">
          <p className="font-display text-base font-bold text-[var(--ink)]">{quiz.title}</p>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-black/[0.05] text-[var(--ink-soft)]"
          >
            <X size={16} />
          </button>
        </div>

        {!isResult && (
          <>
            <div className="mb-5 flex gap-1.5">
              {quiz.questions.map((_, i) => (
                <div
                  key={i}
                  className="h-1.5 flex-1 rounded-full"
                  style={{ background: i <= step ? "var(--c-sleep)" : "rgba(0,0,0,0.06)" }}
                />
              ))}
            </div>
            <p className="mb-4 font-display text-sm font-bold leading-snug text-[var(--ink)]">
              {question.question}
            </p>
            <div className="flex flex-col gap-2">
              {question.options.map((opt, i) => (
                <button
                  key={opt}
                  type="button"
                  onClick={() => choose(i)}
                  className="rounded-2xl border border-black/[0.06] bg-white/60 px-4 py-3 text-left text-sm text-[var(--ink)] transition-colors hover:bg-white active:scale-[0.99]"
                >
                  {opt}
                </button>
              ))}
            </div>
          </>
        )}

        {isResult && result && (
          <div className="flex flex-col items-center gap-3 py-2 text-center">
            <span
              className="flex h-14 w-14 items-center justify-center rounded-full text-white"
              style={{ background: quiz.gradient }}
            >
              <ClipboardList size={22} />
            </span>
            <p className="font-display text-lg font-bold text-[var(--ink)]">{result.title}</p>
            <p className="text-sm leading-relaxed text-[var(--ink-soft)]">{result.body}</p>
            <button
              type="button"
              onClick={onClose}
              className="mt-2 w-full rounded-full py-3 text-sm font-semibold text-white"
              style={{ background: "linear-gradient(135deg, var(--c-sleep), var(--c-period))" }}
            >
              Đóng
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
