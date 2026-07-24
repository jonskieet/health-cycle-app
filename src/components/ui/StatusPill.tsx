import { AlertTriangle, CheckCircle2 } from "lucide-react";

interface StatusPillProps {
  ok: boolean;
  okLabel: string;
  warnLabel: string;
}

// Pill nhỏ dùng trong các thẻ phân tích chu kỳ ở trang Cá nhân —
// xanh + dấu tick khi bình thường, cam + dấu cảnh báo khi bất thường/không đều đặn.
export default function StatusPill({ ok, okLabel, warnLabel }: StatusPillProps) {
  const color = ok ? "var(--c-mood)" : "var(--c-stress)";
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] font-bold uppercase tracking-wide text-white"
      style={{ background: color }}
    >
      {ok ? <CheckCircle2 size={13} /> : <AlertTriangle size={13} />}
      {ok ? okLabel : warnLabel}
    </span>
  );
}
