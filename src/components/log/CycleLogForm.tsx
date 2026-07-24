"use client";

import { useState } from "react";
import { X, Loader2, Trash2 } from "lucide-react";
import { useAddCycleLog, useUpdateCycleLog, useDeleteCycleLog, CycleLogFull } from "@/lib/queries";

const SYMPTOM_OPTIONS = [
  "Đau bụng",
  "Đau đầu",
  "Nổi mụn",
  "Đau lưng",
  "Mệt mỏi",
  "Đầy hơi",
  "Căng ngực",
  "Thay đổi tâm trạng",
];

export default function CycleLogForm({
  onClose,
  editLog,
}: {
  onClose: () => void;
  editLog?: CycleLogFull;
}) {
  const addCycleLog = useAddCycleLog();
  const updateCycleLog = useUpdateCycleLog();
  const deleteCycleLog = useDeleteCycleLog();
  const today = new Date().toISOString().slice(0, 10);

  const [startDate, setStartDate] = useState(editLog?.start_date ?? today);
  const [endDate, setEndDate] = useState(editLog?.end_date ?? "");
  const [flow, setFlow] = useState<"light" | "medium" | "heavy">(editLog?.flow ?? "medium");
  const [symptoms, setSymptoms] = useState<string[]>(editLog?.symptoms ?? []);
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  const isEdit = !!editLog;
  const saving = addCycleLog.isPending || updateCycleLog.isPending;

  function toggleSymptom(s: string) {
    setSymptoms((prev) => (prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (isEdit) {
      await updateCycleLog.mutateAsync({
        id: editLog.id,
        start_date: startDate,
        end_date: endDate || null,
        flow,
        symptoms,
      });
    } else {
      await addCycleLog.mutateAsync({
        start_date: startDate,
        end_date: endDate || null,
        flow,
        symptoms,
      });
    }
    onClose();
  }

  async function handleDelete() {
    if (!editLog) return;
    await deleteCycleLog.mutateAsync(editLog.id);
    onClose();
  }

  return (
    <div className="fixed inset-0 z-30 flex items-end justify-center bg-black/30 px-0" onClick={onClose}>
      <form
        onSubmit={handleSubmit}
        onClick={(e) => e.stopPropagation()}
        className="glass-card-strong flex w-full max-w-md flex-col gap-4 rounded-t-[28px] p-6"
      >
        <div className="flex items-center justify-between">
          <h2 className="font-display text-lg font-bold text-[var(--ink)]">
            {isEdit ? "Sửa kỳ kinh" : "Ghi nhận kỳ kinh"}
          </h2>
          <button type="button" onClick={onClose} className="rounded-full p-1.5 hover:bg-black/5">
            <X size={18} />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <label className="flex flex-col gap-1.5">
            <span className="text-xs font-medium text-[var(--ink-soft)]">Ngày bắt đầu</span>
            <input
              type="date"
              required
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="rounded-2xl bg-black/[0.03] px-3 py-2.5 text-sm text-[var(--ink)] outline-none"
            />
          </label>
          <label className="flex flex-col gap-1.5">
            <span className="text-xs font-medium text-[var(--ink-soft)]">Ngày kết thúc (nếu có)</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="rounded-2xl bg-black/[0.03] px-3 py-2.5 text-sm text-[var(--ink)] outline-none"
            />
          </label>
        </div>

        <div>
          <span className="text-xs font-medium text-[var(--ink-soft)]">Lượng máu</span>
          <div className="mt-1.5 flex gap-2">
            {(["light", "medium", "heavy"] as const).map((f) => (
              <button
                key={f}
                type="button"
                onClick={() => setFlow(f)}
                className="flex-1 rounded-full py-2 text-xs font-semibold"
                style={{
                  background: flow === f ? "var(--c-period)" : "rgba(0,0,0,0.03)",
                  color: flow === f ? "#fff" : "var(--ink-soft)",
                }}
              >
                {f === "light" ? "Nhẹ" : f === "medium" ? "Vừa" : "Nhiều"}
              </button>
            ))}
          </div>
        </div>

        <div>
          <span className="text-xs font-medium text-[var(--ink-soft)]">Triệu chứng</span>
          <div className="mt-1.5 flex flex-wrap gap-2">
            {SYMPTOM_OPTIONS.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => toggleSymptom(s)}
                className="rounded-full px-3 py-1.5 text-xs font-medium"
                style={{
                  background: symptoms.includes(s) ? "var(--c-fertile)" : "rgba(0,0,0,0.03)",
                  color: symptoms.includes(s) ? "#fff" : "var(--ink-soft)",
                }}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="mt-2 flex items-center justify-center gap-2 rounded-2xl py-3 text-sm font-semibold text-white disabled:opacity-60"
          style={{ background: "var(--c-period)" }}
        >
          {saving && <Loader2 size={16} className="animate-spin" />}
          Lưu
        </button>

        {isEdit && (
          <>
            {!confirmingDelete ? (
              <button
                type="button"
                onClick={() => setConfirmingDelete(true)}
                className="flex items-center justify-center gap-2 rounded-2xl py-3 text-sm font-semibold"
                style={{ color: "var(--c-heart)" }}
              >
                <Trash2 size={16} />
                Xoá kỳ kinh này
              </button>
            ) : (
              <div className="flex items-center gap-2 rounded-2xl bg-black/[0.03] p-3">
                <span className="flex-1 text-xs text-[var(--ink-soft)]">Xoá vĩnh viễn mục này?</span>
                <button
                  type="button"
                  onClick={() => setConfirmingDelete(false)}
                  className="rounded-full px-3 py-1.5 text-xs font-semibold text-[var(--ink-soft)]"
                >
                  Huỷ
                </button>
                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={deleteCycleLog.isPending}
                  className="flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-semibold text-white disabled:opacity-60"
                  style={{ background: "var(--c-heart)" }}
                >
                  {deleteCycleLog.isPending && <Loader2 size={12} className="animate-spin" />}
                  Xoá
                </button>
              </div>
            )}
          </>
        )}
      </form>
    </div>
  );
}
