"use client";

// Module A5 (QUALITY_UX_ROADMAP.md) — ConfirmDialog dùng chung cho mọi hành
// động Xoá trong app. Trước đây `CycleLogForm.tsx` và `AppointmentForm.tsx`
// mỗi nơi tự vẽ 1 thanh xác nhận inline gần giống hệt nhau (copy-paste, lệch
// nhau nhỏ ở màu nền) — nay gộp thành 1 component modal dùng chung, style
// đồng bộ `glass-card-strong`, để mọi hành động Xoá trong tương lai (metric,
// reminder...) chỉ cần gọi lại component này thay vì tự vẽ UI riêng.

import { Loader2, TriangleAlert } from "lucide-react";

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  isLoading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = "Xoá",
  cancelLabel = "Huỷ",
  isLoading = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 px-6"
      onClick={(e) => {
        e.stopPropagation();
        if (!isLoading) onCancel();
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="glass-card-strong flex w-full max-w-sm flex-col items-center gap-3 rounded-[28px] p-6 text-center"
      >
        <span
          className="flex h-11 w-11 items-center justify-center rounded-full"
          style={{ background: "color-mix(in srgb, var(--c-heart) 16%, white)" }}
        >
          <TriangleAlert size={20} style={{ color: "var(--c-heart)" }} />
        </span>
        <p className="font-display text-base font-bold text-[var(--ink)]">{title}</p>
        {description && <p className="text-xs text-[var(--ink-soft)]">{description}</p>}

        <div className="mt-2 flex w-full items-center gap-2">
          <button
            type="button"
            onClick={onCancel}
            disabled={isLoading}
            className="press-feedback flex-1 rounded-2xl py-2.5 text-sm font-semibold text-[var(--ink-soft)] disabled:opacity-60"
            style={{ background: "rgba(36,27,47,0.06)" }}
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
            className="press-feedback flex flex-1 items-center justify-center gap-1.5 rounded-2xl py-2.5 text-sm font-semibold text-white disabled:opacity-60"
            style={{ background: "var(--c-heart)" }}
          >
            {isLoading && <Loader2 size={14} className="animate-spin" />}
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
