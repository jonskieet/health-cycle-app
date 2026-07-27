// Module 7 — Kegel Trainer (P4, VIP).
// Business logic thuần (không phụ thuộc React), theo convention `cycle-utils.ts`/
// `health-score.ts`/`correlation.ts`: tách domain logic ra khỏi component để dễ
// test và tái sử dụng.
//
// 3 preset cố định (không cho tự tạo bài tập riêng ở bản đầu tiên — đủ dùng cho
// đa số người mới bắt đầu, giữ phạm vi module gọn). Mỗi preset là 1 chuỗi "phase"
// xen kẽ Co (contract) / Thả lỏng (relax), lặp lại theo `reps`.

export type KegelPresetId = "beginner" | "intermediate" | "advanced";
export type KegelPhaseKind = "contract" | "relax" | "rest";

export interface KegelPreset {
  id: KegelPresetId;
  label: string;
  description: string;
  contractSeconds: number;
  relaxSeconds: number;
  reps: number;
  /** Nghỉ giữa các hiệp (set) — chia reps thành các set nhỏ hơn dễ tập hơn. */
  repsPerSet: number;
  restBetweenSetsSeconds: number;
}

export const KEGEL_PRESETS: KegelPreset[] = [
  {
    id: "beginner",
    label: "Người mới bắt đầu",
    description: "Co 3s — thả lỏng 3s, 8 lần, phù hợp cho buổi tập đầu tiên",
    contractSeconds: 3,
    relaxSeconds: 3,
    reps: 8,
    repsPerSet: 4,
    restBetweenSetsSeconds: 10,
  },
  {
    id: "intermediate",
    label: "Trung cấp",
    description: "Co 5s — thả lỏng 5s, 12 lần, khi đã quen với nhịp cơ bản",
    contractSeconds: 5,
    relaxSeconds: 5,
    reps: 12,
    repsPerSet: 6,
    restBetweenSetsSeconds: 15,
  },
  {
    id: "advanced",
    label: "Nâng cao",
    description: "Co 8s — thả lỏng 4s, 16 lần, cho người đã tập đều đặn",
    contractSeconds: 8,
    relaxSeconds: 4,
    reps: 16,
    repsPerSet: 8,
    restBetweenSetsSeconds: 15,
  },
];

export function getKegelPreset(id: KegelPresetId): KegelPreset {
  return KEGEL_PRESETS.find((p) => p.id === id) ?? KEGEL_PRESETS[0];
}

export interface KegelPhase {
  kind: KegelPhaseKind;
  seconds: number;
  repIndex: number; // 1-based, lần co hiện tại (0 cho phase "rest" giữa set)
}

/**
 * Sinh ra toàn bộ chuỗi phase (contract/relax/rest) cho 1 preset, dùng để
 * driver timer trong `KegelTimer.tsx`. Tách riêng khỏi component để có thể
 * tính tổng thời lượng trước (hiển thị ước tính) mà không cần chạy timer thật.
 */
export function buildKegelSequence(preset: KegelPreset): KegelPhase[] {
  const sequence: KegelPhase[] = [];
  for (let rep = 1; rep <= preset.reps; rep++) {
    sequence.push({ kind: "contract", seconds: preset.contractSeconds, repIndex: rep });
    sequence.push({ kind: "relax", seconds: preset.relaxSeconds, repIndex: rep });
    const isEndOfSet = rep % preset.repsPerSet === 0;
    const isLastRep = rep === preset.reps;
    if (isEndOfSet && !isLastRep) {
      sequence.push({ kind: "rest", seconds: preset.restBetweenSetsSeconds, repIndex: 0 });
    }
  }
  return sequence;
}

export function totalSequenceSeconds(sequence: KegelPhase[]): number {
  return sequence.reduce((sum, phase) => sum + phase.seconds, 0);
}

export function formatSecondsShort(totalSeconds: number): string {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  if (minutes === 0) return `${seconds}s`;
  return `${minutes} phút ${seconds > 0 ? `${seconds}s` : ""}`.trim();
}
