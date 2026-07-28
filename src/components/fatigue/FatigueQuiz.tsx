"use client";

import { useState } from "react";
import { RotateCcw } from "lucide-react";
import { FATIGUE_QUESTIONS, scoreFatigueTest, FatigueResult } from "@/lib/fatigue-test";
import { useSaveFatigueTest } from "@/lib/queries";

const LEVEL_COLOR: Record<FatigueResult["level"], string> = {
  low: "var(--c-mood)",
  moderate: "var(--c-stress)",
  high: "var(--c-heart)",
};

export default function FatigueQuiz() {
  const [answers, setAnswers] = useState<number[]>([]);
  const [step, setStep] = useState(0);
  const [result, setResult] = useState<FatigueResult | null>(null);
  const saveTest = useSaveFatigueTest();

  const question = FATIGUE_QUESTIONS[step];
  const progress = Math.round((step / FATIGUE_QUESTIONS.length) * 100);

  function handleAnswer(optionIndex: number) {
    const next = [...answers, optionIndex];
    setAnswers(next);
    if (step + 1 < FATIGUE_QUESTIONS.length) {
      setStep(step + 1);
    } else {
      const scored = scoreFatigueTest(next);
      setResult(scored);
      saveTest.mutate({ score: scored.score, level: scored.level, answers: next });
    }
  }

  function handleRestart() {
    setAnswers([]);
    setStep(0);
    setResult(null);
  }

  if (result) {
    return (
      <div className="flex flex-col items-center gap-5 py-2 text-center">
        <div
          className="flex h-28 w-28 items-center justify-center rounded-full"
          style={{ background: `color-mix(in srgb, ${LEVEL_COLOR[result.level]} 16%, white)` }}
        >
          <span className="font-display text-4xl font-extrabold" style={{ color: LEVEL_COLOR[result.level] }}>
            {result.score}
          </span>
        </div>
        <div>
          <p className="font-display text-lg font-bold text-[var(--ink)]">{result.label}</p>
          <p className="mx-auto mt-1 max-w-sm text-sm text-[var(--ink-soft)]">{result.summary}</p>
        </div>

        <div className="w-full rounded-[20px] p-4 text-left" style={{ background: "rgba(36,27,47,0.04)" }}>
          <p className="mb-2 text-xs font-medium uppercase tracking-wide text-[var(--ink-faint)]">Gợi ý cho bạn</p>
          <ul className="flex flex-col gap-1.5">
            {result.tips.map((tip, i) => (
              <li key={i} className="text-sm text-[var(--ink)]">
                • {tip}
              </li>
            ))}
          </ul>
        </div>

        <p className="text-[11px] text-[var(--ink-faint)]">
          Đây là bài tự đánh giá tham khảo, không thay thế chẩn đoán y khoa.
        </p>

        {saveTest.isPending && (
          <p className="text-xs font-medium text-[var(--ink-faint)]">Đang lưu kết quả...</p>
        )}

        <button
          type="button"
          disabled={saveTest.isPending}
          onClick={handleRestart}
          className="flex items-center gap-1.5 rounded-full px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-60"
          style={{ background: "var(--c-sleep)" }}
        >
          <RotateCcw size={14} />
          Làm lại bài test
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between text-xs text-[var(--ink-faint)]">
        <span>
          Câu {step + 1}/{FATIGUE_QUESTIONS.length}
        </span>
        <span>{progress}%</span>
      </div>
      <div className="h-1.5 w-full overflow-hidden rounded-full" style={{ background: "rgba(36,27,47,0.08)" }}>
        <div
          className="h-full rounded-full transition-all"
          style={{ width: `${progress}%`, background: "var(--c-sleep)" }}
        />
      </div>

      <p className="font-display text-base font-bold text-[var(--ink)]">{question.text}</p>

      <div className="flex flex-col gap-2.5">
        {question.options.map((option, index) => (
          <button
            key={option}
            type="button"
            onClick={() => handleAnswer(index)}
            className="glass-card rounded-2xl p-4 text-left text-sm font-medium text-[var(--ink)] transition-transform active:scale-[0.98]"
          >
            {option}
          </button>
        ))}
      </div>
    </div>
  );
}
