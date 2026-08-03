"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, Plus, Stethoscope, ChevronRight } from "lucide-react";
import EmptyState from "@/components/ui/EmptyState";
import { SkeletonRows } from "@/components/ui/Skeleton";
import AppointmentForm from "@/components/appointments/AppointmentForm";
import { Appointment, useAppointments } from "@/lib/queries";

function formatWhen(iso: string) {
  const d = new Date(iso);
  const date = d.toLocaleDateString("vi-VN", { weekday: "short", day: "2-digit", month: "2-digit" });
  const time = d.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" });
  return `${date} · ${time}`;
}

export default function AppointmentsPage() {
  const router = useRouter();
  const { data: appointments = [], isLoading } = useAppointments();
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Appointment | null>(null);

  const now = new Date().getTime();
  const upcoming = appointments.filter((a) => new Date(a.appointment_at).getTime() >= now);
  const past = appointments
    .filter((a) => new Date(a.appointment_at).getTime() < now)
    .sort((a, b) => new Date(b.appointment_at).getTime() - new Date(a.appointment_at).getTime());

  return (
    <main className="flex flex-1 flex-col gap-6 px-5 pt-8">
      <header className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => router.back()}
            className="flex h-9 w-9 items-center justify-center rounded-full hover:bg-black/5"
          >
            <ChevronLeft size={18} className="text-[var(--ink)]" />
          </button>
          <h1 className="font-display text-2xl font-bold text-[var(--ink)]">Lịch hẹn</h1>
        </div>
        <button
          type="button"
          onClick={() => {
            setEditing(null);
            setFormOpen(true);
          }}
          className="flex h-9 w-9 items-center justify-center rounded-full text-white"
          style={{ background: "var(--c-fertile)" }}
        >
          <Plus size={18} />
        </button>
      </header>

      {isLoading ? (
        <SkeletonRows rows={3} />
      ) : appointments.length === 0 ? (
        <div className="flex flex-col gap-4">
          <EmptyState
            icon={Stethoscope}
            title="Chưa có lịch hẹn nào"
            description="Thêm lịch khám sắp tới để KVCycle nhắc bạn đúng ngày."
          />
          <button
            type="button"
            onClick={() => {
              setEditing(null);
              setFormOpen(true);
            }}
            className="rounded-2xl py-3 text-sm font-semibold text-white"
            style={{ background: "linear-gradient(135deg, var(--c-sleep), var(--c-fertile))" }}
          >
            Thêm lịch hẹn
          </button>
        </div>
      ) : (
        <>
          {upcoming.length > 0 && (
            <section className="glass-card rounded-[24px] p-5">
              <p className="mb-3 text-xs font-medium uppercase tracking-wide text-[var(--ink-faint)]">
                Sắp tới
              </p>
              <ul className="flex flex-col gap-1">
                {upcoming.map((a) => (
                  <AppointmentRow
                    key={a.id}
                    appointment={a}
                    onClick={() => {
                      setEditing(a);
                      setFormOpen(true);
                    }}
                  />
                ))}
              </ul>
            </section>
          )}

          {past.length > 0 && (
            <section className="glass-card rounded-[24px] p-5 opacity-80">
              <p className="mb-3 text-xs font-medium uppercase tracking-wide text-[var(--ink-faint)]">
                Đã qua
              </p>
              <ul className="flex flex-col gap-1">
                {past.map((a) => (
                  <AppointmentRow
                    key={a.id}
                    appointment={a}
                    onClick={() => {
                      setEditing(a);
                      setFormOpen(true);
                    }}
                  />
                ))}
              </ul>
            </section>
          )}
        </>
      )}

      {formOpen && (
        <AppointmentForm
          editAppointment={editing ?? undefined}
          onClose={() => {
            setFormOpen(false);
            setEditing(null);
          }}
        />
      )}
    </main>
  );
}

function AppointmentRow({ appointment, onClick }: { appointment: Appointment; onClick: () => void }) {
  return (
    <li>
      <button
        type="button"
        onClick={onClick}
        className="flex w-full items-center gap-3 rounded-2xl px-2 py-2.5 text-left transition-colors hover:bg-black/[0.03]"
      >
        <span
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-white"
          style={{ background: "var(--c-fertile)" }}
        >
          <Stethoscope size={15} />
        </span>
        <span className="flex-1">
          <span className="block text-sm font-semibold text-[var(--ink)]">{appointment.title}</span>
          <span className="block text-xs text-[var(--ink-faint)]">
            {formatWhen(appointment.appointment_at)}
            {appointment.doctor_name ? ` · ${appointment.doctor_name}` : ""}
          </span>
        </span>
        <ChevronRight size={16} className="text-[var(--ink-faint)]" />
      </button>
    </li>
  );
}
