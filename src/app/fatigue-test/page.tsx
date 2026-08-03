"use client";

import { useRouter } from "next/navigation";
import { ChevronLeft, Battery } from "lucide-react";
import FatigueQuiz from "@/components/fatigue/FatigueQuiz";
import EmptyState from "@/components/ui/EmptyState";
import { SkeletonRows } from "@/components/ui/Skeleton";
import { useFatigueTests } from "@/lib/queries";

const LEVEL_LABEL: Record<string, string> = {
  low: "Tốt",
  moderate: "Trung bình",
  high: "Cao",
};

function formatWhen(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" });
}

export default function FatigueTestPage() {
  const router = useRouter();
  const { data: history = [], isLoading } = useFatigueTests();

  return (
    <main className="flex flex-1 flex-col gap-6 px-5 pt-8 pb-6">
      <header className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => router.back()}
          className="flex h-9 w-9 items-center justify-center rounded-full hover:bg-black/5"
        >
          <ChevronLeft size={18} className="text-[var(--ink)]" />
        </button>
        <h1 className="font-display text-2xl font-bold text-[var(--ink)]">Trắc nghiệm năng lượng</h1>
      </header>

      <section className="glass-card-strong rounded-[28px] p-6">
        <FatigueQuiz />
      </section>

      <section>
        <p className="mb-2 text-xs font-medium uppercase tracking-wide text-[var(--ink-faint)]">
          Lịch sử kết quả
        </p>
        {isLoading && <SkeletonRows rows={3} />}
        {!isLoading && history.length === 0 && (
          <EmptyState
            icon={Battery}
            title="Chưa có kết quả nào"
            description="Hoàn thành bài test ở trên để bắt đầu theo dõi mức năng lượng theo thời gian."
          />
        )}
        {history.length > 0 && (
          <div className="glass-card flex flex-col divide-y divide-black/5 rounded-[22px] px-4">
            {history.map((h) => (
              <div key={h.id} className="flex items-center gap-3 py-3">
                <span className="font-display text-lg font-bold text-[var(--ink)]">{h.score}</span>
                <span className="flex-1">
                  <span className="block text-sm font-medium text-[var(--ink)]">
                    Mệt mỏi {LEVEL_LABEL[h.level] ?? h.level}
                  </span>
                  <span className="block text-xs text-[var(--ink-faint)]">{formatWhen(h.created_at)}</span>
                </span>
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
