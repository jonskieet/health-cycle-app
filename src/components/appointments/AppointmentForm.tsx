"use client";

import { useState } from "react";
import { X, Loader2, Trash2 } from "lucide-react";
import {
  Appointment,
  useAddAppointment,
  useUpdateAppointment,
  useDeleteAppointment,
} from "@/lib/queries";
import { useToast } from "@/components/ui/Toast";
import ConfirmDialog from "@/components/ui/ConfirmDialog";

function toLocalInputValue(iso: string) {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(
    d.getMinutes()
  )}`;
}

export default function AppointmentForm({
  onClose,
  editAppointment,
}: {
  onClose: () => void;
  editAppointment?: Appointment;
}) {
  const addAppointment = useAddAppointment();
  const updateAppointment = useUpdateAppointment();
  const deleteAppointment = useDeleteAppointment();
  const toast = useToast();

  const defaultWhen = () => {
    const d = new Date();
    d.setMinutes(0, 0, 0);
    d.setHours(d.getHours() + 1);
    const pad = (n: number) => String(n).padStart(2, "0");
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:00`;
  };

  const [title, setTitle] = useState(editAppointment?.title ?? "");
  const [doctorName, setDoctorName] = useState(editAppointment?.doctor_name ?? "");
  const [when, setWhen] = useState(
    editAppointment ? toLocalInputValue(editAppointment.appointment_at) : defaultWhen()
  );
  const [note, setNote] = useState(editAppointment?.note ?? "");
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  const isEdit = !!editAppointment;
  const saving = addAppointment.isPending || updateAppointment.isPending;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const appointment_at = new Date(when).toISOString();
    try {
      // Module A1: bọc try/catch — trước đây không có, nếu lưu lỗi thì
      // không có gì báo cho người dùng biết (chỉ im lặng không đóng modal,
      // dễ hiểu lầm là app bị treo). Lỗi giờ tự hiện qua toast toàn cục.
      if (isEdit) {
        await updateAppointment.mutateAsync({
          id: editAppointment.id,
          title,
          doctor_name: doctorName || null,
          appointment_at,
          note: note || null,
        });
      } else {
        await addAppointment.mutateAsync({
          title,
          doctor_name: doctorName || null,
          appointment_at,
          note: note || null,
        });
      }
      toast.success(isEdit ? "Đã cập nhật lịch hẹn" : "Đã thêm lịch hẹn");
      onClose();
    } catch {
      // toast lỗi do MutationCache global xử lý (providers.tsx).
    }
  }

  async function handleDelete() {
    if (!editAppointment) return;
    try {
      await deleteAppointment.mutateAsync(editAppointment.id);
      toast.success("Đã xoá lịch hẹn");
      onClose();
    } catch {
      // toast lỗi do MutationCache global xử lý.
    }
  }

  return (
    <div className="fixed inset-0 z-30 flex items-end justify-center bg-black/30 px-0" onClick={onClose}>
      <form
        onSubmit={handleSubmit}
        onClick={(e) => e.stopPropagation()}
        className="glass-card-strong flex w-full max-w-md flex-col gap-4 rounded-t-[28px] px-6 pt-6"
        style={{ paddingBottom: "max(1.5rem, env(safe-area-inset-bottom, 0px))" }}
      >
        <div className="flex items-center justify-between">
          <h2 className="font-display text-lg font-bold text-[var(--ink)]">
            {isEdit ? "Sửa lịch hẹn" : "Thêm lịch hẹn"}
          </h2>
          <button type="button" onClick={onClose} className="rounded-full p-1.5 hover:bg-black/5">
            <X size={18} />
          </button>
        </div>

        <label className="flex flex-col gap-1.5">
          <span className="text-xs font-medium text-[var(--ink-soft)]">Tiêu đề</span>
          <input
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Vd: Khám phụ khoa định kỳ"
            className="rounded-2xl bg-black/[0.03] px-4 py-3 text-sm text-[var(--ink)] outline-none placeholder:text-[var(--ink-faint)]"
          />
        </label>

        <label className="flex flex-col gap-1.5">
          <span className="text-xs font-medium text-[var(--ink-soft)]">Bác sĩ / Phòng khám (tuỳ chọn)</span>
          <input
            value={doctorName}
            onChange={(e) => setDoctorName(e.target.value)}
            placeholder="Vd: BS. Nguyễn Thị A"
            className="rounded-2xl bg-black/[0.03] px-4 py-3 text-sm text-[var(--ink)] outline-none placeholder:text-[var(--ink-faint)]"
          />
        </label>

        <label className="flex flex-col gap-1.5">
          <span className="text-xs font-medium text-[var(--ink-soft)]">Thời gian</span>
          <input
            type="datetime-local"
            required
            value={when}
            onChange={(e) => setWhen(e.target.value)}
            className="rounded-2xl bg-black/[0.03] px-4 py-3 text-sm text-[var(--ink)] outline-none"
          />
        </label>

        <label className="flex flex-col gap-1.5">
          <span className="text-xs font-medium text-[var(--ink-soft)]">Ghi chú (tuỳ chọn)</span>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={2}
            placeholder="Vd: Nhớ mang theo kết quả xét nghiệm trước"
            className="resize-none rounded-2xl bg-black/[0.03] px-4 py-3 text-sm text-[var(--ink)] outline-none placeholder:text-[var(--ink-faint)]"
          />
        </label>

        <button
          type="submit"
          disabled={saving}
          className="mt-1 flex items-center justify-center gap-2 rounded-2xl py-3 text-sm font-semibold text-white disabled:opacity-60"
          style={{ background: "linear-gradient(135deg, var(--c-sleep), var(--c-fertile))" }}
        >
          {saving && <Loader2 size={16} className="animate-spin" />}
          Lưu
        </button>

        {isEdit && (
          <button
            type="button"
            onClick={() => setConfirmingDelete(true)}
            className="flex items-center justify-center gap-2 rounded-2xl py-3 text-sm font-semibold"
            style={{ color: "var(--c-heart)" }}
          >
            <Trash2 size={16} />
            Xoá lịch hẹn này
          </button>
        )}
      </form>

      <ConfirmDialog
        open={confirmingDelete}
        title="Xoá lịch hẹn này?"
        description="Dữ liệu đã xoá sẽ không thể khôi phục lại."
        isLoading={deleteAppointment.isPending}
        onConfirm={handleDelete}
        onCancel={() => setConfirmingDelete(false)}
      />
    </div>
  );
}
