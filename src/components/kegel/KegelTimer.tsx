"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Pause, Play, RotateCcw } from "lucide-react";
import AuroraRing from "@/components/ui/AuroraRing";
import {
  KegelPreset,
  KegelPhase,
  buildKegelSequence,
  formatSecondsShort,
} from "@/lib/kegel";
import { useLogKegelSession } from "@/lib/queries";

interface KegelTimerProps {
  preset: KegelPreset;
  onFinished: () => void;
}

const PHASE_COLOR: Record<KegelPhase["kind"], string> = {
  contract: "var(--c-period)",
  relax: "var(--c-sleep)",
  rest: "var(--c-mood)",
};

const PHASE_LABEL: Record<KegelPhase["kind"], string> = {
  contract: "Co cơ",
  relax: "Thả lỏng",
  rest: "Nghỉ giữa hiệp",
};

export default function KegelTimer({ preset, onFinished }: KegelTimerProps) {
  const sequence = useMemo(() => buildKegelSequence(preset), [preset]);
  const [phaseIndex, setPhaseIndex] = useState(0);
  const [secondsLeft, setSecondsLeft] = useState(sequence[0]?.seconds ?? 0);
  const [running, setRunning] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const logSession = useLogKegelSession();
  const savedRef = useRef(false);

  const currentPhase = sequence[phaseIndex];
  const reps = preset.reps;
  const completedReps = currentPhase
    ? currentPhase.kind === "rest"
      ? currentPhase.repIndex // rest phases carry repIndex 0, but by then previous rep finished
      : currentPhase.kind === "relax"
        ? currentPhase.repIndex
        : currentPhase.repIndex - 1
    : reps;

  useEffect(() => {
    if (!running) return;
    const timer = setInterval(() => {
      setElapsed((e) => e + 1);
      setSecondsLeft((s) => {
        if (s > 1) return s - 1;
        // Hết phase hiện tại — chuyển sang phase kế tiếp, hoặc kết thúc bài tập.
        setPhaseIndex((i) => {
          const nextIndex = i + 1;
          if (nextIndex < sequence.length) return nextIndex;
          return i;
        });
        if (phaseIndex + 1 < sequence.length) {
          return sequence[phaseIndex + 1].seconds;
        }
        setRunning(false);
        if (!savedRef.current) {
          savedRef.current = true;
          logSession.mutate({
            preset_id: preset.id,
            reps_completed: reps,
            total_reps: reps,
            duration_seconds: elapsed + 1,
            completed: true,
          });
        }
        return 0;
      });
    }, 1000);
    return () => clearInterval(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [running, phaseIndex]);

  function handleToggle() {
    setRunning((r) => !r);
  }

  function handleReset() {
    setRunning(false);
    setPhaseIndex(0);
    setSecondsLeft(sequence[0]?.seconds ?? 0);
    setElapsed(0);
    savedRef.current = false;
  }

  function handleStopEarly() {
    setRunning(false);
    if (!savedRef.current && elapsed > 0) {
      savedRef.current = true;
      logSession.mutate({
        preset_id: preset.id,
        reps_completed: Math.max(0, completedReps),
        total_reps: reps,
        duration_seconds: elapsed,
        completed: false,
      });
    }
    onFinished();
  }

  const isDone = phaseIndex + 1 >= sequence.length && secondsLeft <= 0;
  const color = currentPhase ? PHASE_COLOR[currentPhase.kind] : "var(--c-mood)";
  const percent = currentPhase ? Math.round(((currentPhase.seconds - secondsLeft) / currentPhase.seconds) * 100) : 100;

  return (
    <div className="flex flex-col items-center gap-6 py-4">
      <AuroraRing percent={isDone ? 100 : percent} size={220} stroke={14} colorFrom={color} colorTo="var(--c-fertile)">
        <span className="text-xs font-medium uppercase tracking-wide text-[var(--ink-faint)]">
          {isDone ? "Hoàn thành" : PHASE_LABEL[currentPhase.kind]}
        </span>
        <span className="font-display text-5xl font-extrabold text-[var(--ink)]">
          {isDone ? "🎉" : secondsLeft}
        </span>
        {!isDone && (
          <span className="mt-1 text-xs text-[var(--ink-soft)]">
            Lần {Math.min(reps, Math.max(1, currentPhase.repIndex || reps))}/{reps}
          </span>
        )}
      </AuroraRing>

      {isDone ? (
        <div className="flex flex-col items-center gap-3 text-center">
          <p className="text-sm font-semibold text-[var(--ink)]">
            Bạn đã hoàn thành {reps} lần co-thả lỏng 🎉
          </p>
          <p className="text-xs text-[var(--ink-faint)]">
            Tổng thời gian: {formatSecondsShort(elapsed)}
          </p>
          <button
            type="button"
            disabled={logSession.isPending}
            onClick={onFinished}
            className="rounded-full px-6 py-2.5 text-sm font-semibold text-white disabled:opacity-60"
            style={{ background: "var(--c-mood)" }}
          >
            {logSession.isPending ? "Đang lưu..." : "Xong"}
          </button>
        </div>
      ) : (
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={handleReset}
            className="flex h-11 w-11 items-center justify-center rounded-full"
            style={{ background: "rgba(36,27,47,0.06)" }}
            aria-label="Bắt đầu lại"
          >
            <RotateCcw size={17} className="text-[var(--ink-soft)]" />
          </button>
          <button
            type="button"
            onClick={handleToggle}
            className="flex h-16 w-16 items-center justify-center rounded-full text-white"
            style={{ background: `linear-gradient(135deg, ${color}, var(--c-fertile))` }}
            aria-label={running ? "Tạm dừng" : "Bắt đầu"}
          >
            {running ? <Pause size={24} fill="currentColor" /> : <Play size={24} fill="currentColor" />}
          </button>
          <button
            type="button"
            onClick={handleStopEarly}
            className="flex h-11 w-11 items-center justify-center rounded-full text-xs font-semibold"
            style={{ background: "rgba(36,27,47,0.06)", color: "var(--ink-soft)" }}
            aria-label="Dừng buổi tập"
          >
            Dừng
          </button>
        </div>
      )}
    </div>
  );
}
