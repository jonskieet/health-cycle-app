"use client";

// Sprint 3 — redesign: form ghi nhận dạng "card cuộn dọc" (giống cấu trúc app
// Clover trong ảnh tham khảo) thay vì 1 form dài đơn điệu. Mỗi nhóm dữ liệu là
// 1 card riêng (Ngày & lượng máu, Que thử thai, Que thử rụng trứng, Triệu
// chứng, Ghi chú), có thanh chip sticky để nhảy nhanh giữa các card.

import { useMemo, useRef, useState } from "react";
import { X, Loader2, Trash2 } from "lucide-react";
import { useAddCycleLog, useUpdateCycleLog, useDeleteCycleLog, CycleLogFull } from "@/lib/queries";
import {
  SYMPTOM_CATEGORIES,
  SYMPTOM_CATEGORY_LABELS,
  getSymptomsByCategory,
  SymptomCategory,
} from "@/lib/symptoms";
import AppDatePicker from "@/components/ui/AppDatePicker";
import SymptomIcon from "@/components/ui/SymptomIcon";

const PREGNANCY_TEST_IDS = [
  "Que thử thai: Dương tính",
  "Que thử thai: Âm tính",
  "Que thử thai: Không chắc chắn",
];
const OVULATION_TEST_IDS = [
  "Que thử rụng trứng: Dương tính",
  "Que thử rụng trứng: Âm tính",
  "Que thử rụng trứng: Không chắc chắn",
];
const PILL_IDS = ["Thuốc đã uống", "Thuốc hôm qua"];

// Các category hiển thị trong card "Triệu chứng" — test/contraception có card
// riêng bên trên nên không lặp lại ở đây; metrics đã có luồng ghi số liệu
// riêng qua MetricLogForm (cân nặng, BBT) nên cũng bỏ khỏi danh sách chip.
const SYMPTOM_CARD_CATEGORIES: SymptomCategory[] = SYMPTOM_CATEGORIES.filter(
  (c) => c !== "test" && c !== "contraception" && c !== "metrics"
);

const SECTIONS = [
  { key: "date", label: "Ngày & lượng máu" },
  { key: "tests", label: "Que thử" },
  { key: "symptoms", label: "Triệu chứng" },
  { key: "notes", label: "Ghi chú" },
] as const;

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
  const [note, setNote] = useState(editLog?.note ?? "");
  const [activeCategory, setActiveCategory] = useState(SYMPTOM_CARD_CATEGORIES[0]);
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  const scrollRef = useRef<HTMLDivElement>(null);
  const sectionRefs = useRef<Record<string, HTMLElement | null>>({});
  const [activeSection, setActiveSection] = useState<string>(SECTIONS[0].key);

  const isEdit = !!editLog;
  const saving = addCycleLog.isPending || updateCycleLog.isPending;

  function toggleSymptom(s: string) {
    setSymptoms((prev) => (prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]));
  }

  /** Chọn 1-trong-nhóm (VD 3 kết quả que thử) — bấm lại mục đang chọn để bỏ chọn. */
  function pickExclusive(groupIds: string[], id: string) {
    setSymptoms((prev) => {
      const withoutGroup = prev.filter((s) => !groupIds.includes(s));
      return prev.includes(id) ? withoutGroup : [...withoutGroup, id];
    });
  }

  function scrollToSection(key: string) {
    setActiveSection(key);
    sectionRefs.current[key]?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const payload = { start_date: startDate, end_date: endDate || null, flow, symptoms, note };
    if (isEdit) {
      await updateCycleLog.mutateAsync({ id: editLog.id, ...payload });
    } else {
      await addCycleLog.mutateAsync(payload);
    }
    onClose();
  }

  async function handleDelete() {
    if (!editLog) return;
    await deleteCycleLog.mutateAsync(editLog.id);
    onClose();
  }

  const symptomCount = useMemo(
    () => symptoms.filter((s) => !PREGNANCY_TEST_IDS.includes(s) && !OVULATION_TEST_IDS.includes(s) && !PILL_IDS.includes(s)).length,
    [symptoms]
  );

  return (
    <div className="fixed inset-0 z-30 flex items-end justify-center bg-black/30 px-0" onClick={onClose}>
      <form
        onSubmit={handleSubmit}
        onClick={(e) => e.stopPropagation()}
        className="glass-card-strong flex w-full max-w-md flex-col gap-0 rounded-t-[28px] overflow-hidden"
        style={{ maxHeight: "88vh" }}
      >
        <div className="flex items-center justify-between px-6 pt-6">
          <h2 className="font-display text-lg font-bold text-[var(--ink)]">
            {isEdit ? "Sửa kỳ kinh" : "Ghi nhận kỳ kinh"}
          </h2>
          <button type="button" onClick={onClose} className="rounded-full p-1.5 hover:bg-black/5">
            <X size={18} />
          </button>
        </div>

        {/* Thanh chip sticky để nhảy nhanh giữa các card */}
        <div className="mt-3 flex gap-1.5 overflow-x-auto no-scrollbar border-b border-black/[0.05] px-6 pb-3">
          {SECTIONS.map((s) => (
            <button
              key={s.key}
              type="button"
              onClick={() => scrollToSection(s.key)}
              className="shrink-0 rounded-full px-3 py-1.5 text-xs font-semibold transition"
              style={{
                background: activeSection === s.key ? "var(--c-period)" : "rgba(0,0,0,0.03)",
                color: activeSection === s.key ? "#fff" : "var(--ink-soft)",
              }}
            >
              {s.label}
            </button>
          ))}
        </div>

        <div ref={scrollRef} className="flex flex-col gap-4 overflow-y-auto px-6 py-4">
          {/* Card 1: Ngày & lượng máu */}
          <section
            ref={(el) => { sectionRefs.current.date = el; }}
            className="flex flex-col gap-3 rounded-2xl bg-black/[0.02] p-4"
          >
            <AppDatePicker
              mode="range"
              startValue={startDate}
              endValue={endDate}
              onChangeStart={setStartDate}
              onChangeEnd={setEndDate}
              startLabel="Ngày bắt đầu"
              endLabel="Ngày kết thúc (nếu có)"
            />
            <div>
              <span className="text-xs font-medium text-[var(--ink-soft)]">Lượng máu</span>
              <div className="mt-1.5 flex gap-2">
                {(["light", "medium", "heavy"] as const).map((f) => (
                  <button
                    key={f}
                    type="button"
                    onClick={() => setFlow(f)}
                    className="flex-1 rounded-full py-2 text-xs font-semibold transition active:scale-95"
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
          </section>

          {/* Card 2: Que thử + thuốc tránh thai */}
          <section
            ref={(el) => { sectionRefs.current.tests = el; }}
            className="flex flex-col gap-4 rounded-2xl bg-black/[0.02] p-4"
          >
            <TestGroup title="Que thử thai" groupIds={PREGNANCY_TEST_IDS} selected={symptoms} onPick={pickExclusive} />
            <TestGroup title="Que thử rụng trứng" groupIds={OVULATION_TEST_IDS} selected={symptoms} onPick={pickExclusive} />
            <div>
              <span className="text-xs font-medium text-[var(--ink-soft)]">Thuốc tránh thai</span>
              <div className="mt-1.5 flex gap-2">
                {PILL_IDS.map((id) => (
                  <button
                    key={id}
                    type="button"
                    onClick={() => toggleSymptom(id)}
                    className="flex-1 rounded-full py-2 text-xs font-semibold transition active:scale-95"
                    style={{
                      background: symptoms.includes(id) ? "var(--c-fertile)" : "rgba(0,0,0,0.03)",
                      color: symptoms.includes(id) ? "#fff" : "var(--ink-soft)",
                    }}
                  >
                    {id}
                  </button>
                ))}
              </div>
            </div>
          </section>

          {/* Card 3: Triệu chứng */}
          <section
            ref={(el) => { sectionRefs.current.symptoms = el; }}
            className="flex flex-col gap-2 rounded-2xl bg-black/[0.02] p-4"
          >
            <span className="text-xs font-medium text-[var(--ink-soft)]">
              Triệu chứng {symptomCount > 0 && `(${symptomCount})`}
            </span>

            <div className="flex gap-1.5 overflow-x-auto no-scrollbar pb-1">
              {SYMPTOM_CARD_CATEGORIES.map((cat) => {
                const count = symptoms.filter((s) => getSymptomsByCategory(cat).some((d) => d.id === s)).length;
                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setActiveCategory(cat)}
                    className="flex shrink-0 items-center gap-1 rounded-full px-3 py-1.5 text-xs font-semibold transition"
                    style={{
                      background: activeCategory === cat ? "var(--c-sleep)" : "rgba(0,0,0,0.03)",
                      color: activeCategory === cat ? "#fff" : "var(--ink-soft)",
                    }}
                  >
                    {SYMPTOM_CATEGORY_LABELS[cat]}
                    {count > 0 && (
                      <span
                        className="flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[10px]"
                        style={{
                          background: activeCategory === cat ? "rgba(255,255,255,0.3)" : "var(--c-sleep)",
                          color: "#fff",
                        }}
                      >
                        {count}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            <div className="flex flex-wrap gap-2">
              {getSymptomsByCategory(activeCategory).map(({ id, label, icon: Icon, category }) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => toggleSymptom(id)}
                  className="flex items-center gap-1.5 rounded-full py-1 pl-1 pr-3 text-xs font-medium transition active:scale-95"
                  style={{
                    background: symptoms.includes(id) ? "var(--c-fertile)" : "rgba(0,0,0,0.03)",
                    color: symptoms.includes(id) ? "#fff" : "var(--ink-soft)",
                  }}
                >
                  <SymptomIcon icon={Icon} category={category} size="sm" active={symptoms.includes(id)} />
                  {label}
                </button>
              ))}
            </div>
          </section>

          {/* Card 4: Ghi chú */}
          <section
            ref={(el) => { sectionRefs.current.notes = el; }}
            className="flex flex-col gap-2 rounded-2xl bg-black/[0.02] p-4"
          >
            <span className="text-xs font-medium text-[var(--ink-soft)]">Ghi chú</span>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Thêm ghi chú cho ngày này..."
              rows={3}
              className="resize-none rounded-2xl bg-black/[0.03] px-3 py-2.5 text-sm text-[var(--ink)] outline-none placeholder:text-[var(--ink-faint)]"
            />
          </section>
        </div>

        <div className="flex flex-col gap-2 px-6 pb-6 pt-3">
          <button
            type="submit"
            disabled={saving}
            className="flex items-center justify-center gap-2 rounded-2xl py-3 text-sm font-semibold text-white disabled:opacity-60"
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
        </div>
      </form>
    </div>
  );
}

function TestGroup({
  title,
  groupIds,
  selected,
  onPick,
}: {
  title: string;
  groupIds: string[];
  selected: string[];
  onPick: (groupIds: string[], id: string) => void;
}) {
  const shortLabels = ["Dương tính", "Âm tính", "Không chắc"];
  return (
    <div>
      <span className="text-xs font-medium text-[var(--ink-soft)]">{title}</span>
      <div className="mt-1.5 flex gap-2">
        {groupIds.map((id, i) => (
          <button
            key={id}
            type="button"
            onClick={() => onPick(groupIds, id)}
            className="flex-1 rounded-full py-2 text-xs font-semibold transition active:scale-95"
            style={{
              background: selected.includes(id) ? "var(--c-period)" : "rgba(0,0,0,0.03)",
              color: selected.includes(id) ? "#fff" : "var(--ink-soft)",
            }}
          >
            {shortLabels[i]}
          </button>
        ))}
      </div>
    </div>
  );
}
