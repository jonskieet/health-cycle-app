"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, Check, Clock, HeartPulse } from "lucide-react";
import { KEGEL_PRESETS, KegelPreset, buildKegelSequence, totalSequenceSeconds, formatSecondsShort } from "@/lib/kegel";
import { useKegelSessions } from "@/lib/queries";
import KegelTimer from "@/components/kegel/KegelTimer";
import EmptyState from "@/components/ui/EmptyState";
import { SkeletonRows } from "@/components/ui/Skeleton";

function formatWhen(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" });
}

const PRESET_LABEL: Record<string, string> = {
  beginner: "Người mới",
  intermediate: "Trung cấp",
  advanced: "Nâng cao",
};

export default function KegelPage() {
  const router = useRouter();
  const [selected, setSelected] = useState<KegelPreset | null>(null);
  const { data: sessions = [], isLoading } = useKegelSessions();

  return (
    <main className="flex flex-1 flex-col gap-6 px-5 pt-8 pb-6">
      <header className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => (selected ? setSelected(null) : router.back())}
          className="flex h-9 w-9 items-center justify-center rounded-full hover:bg-black/5"
        >
          <ChevronLeft size={18} className="text-[var(--ink)]" />
        </button>
        <h1 className="font-display text-2xl font-bold text-[var(--ink)]">Bài tập Kegel</h1>
      </header>

      {selected ? (
        <section className="glass-card-strong rounded-[28px] p-6">
          <p className="text-center text-sm font-semibold text-[var(--ink)]">{selected.label}</p>
          <p className="mb-2 text-center text-xs text-[var(--ink-faint)]">{selected.description}</p>
          <KegelTimer preset={selected} onFinished={() => setSelected(null)} />
        </section>
      ) : (
        <>
          <p className="text-xs text-[var(--ink-soft)]">
            Bài tập cơ sàn chậu giúp tăng cường sức khoẻ vùng chậu. Chọn một bài phù hợp với bạn — timer sẽ hướng
            dẫn nhịp co / thả lỏng theo từng lần.
          </p>

          <section className="flex flex-col gap-3">
            {KEGEL_PRESETS.map((preset) => {
              const totalSeconds = totalSequenceSeconds(buildKegelSequence(preset));
              return (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => setSelected(preset)}
                  className="glass-card flex items-center gap-3 rounded-[22px] p-4 text-left transition-transform active:scale-[0.98]"
                >
                  <span
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-white"
                    style={{ background: "linear-gradient(135deg, var(--c-period), var(--c-sleep))" }}
                  >
                    <HeartPulse size={17} />
                  </span>
                  <span className="flex-1">
                    <span className="block text-sm font-semibold text-[var(--ink)]">{preset.label}</span>
                    <span className="block text-xs text-[var(--ink-faint)]">{preset.description}</span>
                  </span>
                  <span className="flex shrink-0 items-center gap-1 text-xs font-medium text-[var(--ink-soft)]">
                    <Clock size={12} />
                    {formatSecondsShort(totalSeconds)}
                  </span>
                </button>
              );
            })}
          </section>

          <section>
            <p className="mb-2 text-xs font-medium uppercase tracking-wide text-[var(--ink-faint)]">
              Lịch sử tập luyện
            </p>
            {isLoading && <SkeletonRows rows={3} />}
            {!isLoading && sessions.length === 0 && (
              <EmptyState
                icon={HeartPulse}
                title="Chưa có buổi tập nào"
                description="Hoàn thành bài tập đầu tiên để bắt đầu theo dõi tiến độ."
              />
            )}
            {sessions.length > 0 && (
              <div className="glass-card flex flex-col divide-y divide-black/5 rounded-[22px] px-4">
                {sessions.map((s) => (
                  <div key={s.id} className="flex items-center gap-3 py-3">
                    <span
                      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full"
                      style={{
                        background: s.completed
                          ? "color-mix(in srgb, var(--c-mood) 18%, white)"
                          : "color-mix(in srgb, var(--c-stress) 18%, white)",
                      }}
                    >
                      {s.completed ? (
                        <Check size={14} style={{ color: "var(--c-mood)" }} />
                      ) : (
                        <Clock size={14} style={{ color: "var(--c-stress)" }} />
                      )}
                    </span>
                    <span className="flex-1">
                      <span className="block text-sm font-medium text-[var(--ink)]">
                        {PRESET_LABEL[s.preset_id] ?? s.preset_id}
                      </span>
                      <span className="block text-xs text-[var(--ink-faint)]">
                        {formatWhen(s.created_at)} · {s.reps_completed}/{s.total_reps} lần ·{" "}
                        {formatSecondsShort(s.duration_seconds)}
                      </span>
                    </span>
                    {!s.completed && (
                      <span className="text-[10px] font-semibold uppercase text-[var(--c-stress)]">Dở dang</span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </section>
        </>
      )}
    </main>
  );
}
