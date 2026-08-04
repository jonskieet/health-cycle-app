// Module K1 (CONTROLS_REFINEMENT_ROADMAP.md) — component thanh tiến trình
// dùng chung, thay 3 bản tự implement (PhaseOutlook, SymptomAnalysis,
// FatigueQuiz) từng lệch nhau độ cao (h-2/h-1.5) và độ mờ nền track
// (bg-black/[0.06]/[0.05]/rgba trực tiếp) cho cùng 1 khái niệm UI. Chốt
// đúng 1 giá trị mặc định cho cả 2 (khớp PhaseOutlook — chỗ người dùng nhìn
// thấy thường xuyên nhất), fill dùng gradient nhẹ (color-mix có sẵn trong
// codebase) thay vì màu đặc phẳng để "mềm mại hơn" như yêu cầu.

interface ProgressBarProps {
  /** 0-100 */
  value: number;
  color: string;
  /** Hiếm khi cần khác default — vd FatigueQuiz muốn mảnh hơn vì là tiến độ câu hỏi. */
  height?: number;
}

export default function ProgressBar({ value, color, height = 8 }: ProgressBarProps) {
  const clamped = Math.max(0, Math.min(100, value));

  return (
    <div
      className="w-full overflow-hidden rounded-full bg-black/[0.06]"
      style={{ height }}
      role="progressbar"
      aria-valuenow={clamped}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <div
        className="h-full rounded-full transition-all duration-300 ease-out"
        style={{
          width: `${clamped}%`,
          background: `linear-gradient(90deg, color-mix(in srgb, ${color} 80%, black), color-mix(in srgb, ${color} 85%, white))`,
        }}
      />
    </div>
  );
}
