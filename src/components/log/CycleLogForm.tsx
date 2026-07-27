"use client";

// Sprint 4 — redesign v2: chuyển từ "1 sheet cuộn dọc chứa mọi thứ" (dễ rối,
// che khuất date picker khi mở modal chọn ngày) sang "wizard 4 bước", mỗi
// bước chỉ hiện 1 card, có thanh tiến trình + nút Tiếp/Quay lại. Sheet dùng
// nền đặc (var(--surface)) thay vì glass-card-strong để không bao giờ bị
// "trong suốt khó nhìn" khi có date picker hoặc nội dung khác đè lên.

import { useMemo, useState } from "react";
import { X, Loader2, Trash2, ChevronLeft, ChevronRight, Check } from "lucide-react";
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

const SYMPTOM_CARD_CATEGORIES: SymptomCategory[] = SYMPTOM_CATEGORIES.filter(
  (c) => c !== "test" && c !== "contraception" && c !== "metrics"
);

const STEPS = [
  { key: "date", label: "Ngày" },
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
  const [step, setStep] = useState(0);

  const isEdit = !!editLog;
  const saving = addCycleLog.isPending || updateCycleLog.isPending;
  const isLastStep = step === STEPS.length - 1;

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

  async function handleSubmit() {
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
    <div className="fixed inset-0 z-30 flex items-end justify-center bg-black/55 backdrop-blur-[2px] px-0" onClick={onClose}>
      <div
        onClick={(e) => e.stopPropagation()}
        className="flex w-full max-w-md flex-col gap-0 rounded-t-[28px] overflow-hidden"
        style={{ maxHeight: "90vh", background: "var(--surface)", boxShadow: "0 -8px 40px -8px rgba(36,27,47,0.35)" }}
      >
        <div className="mx-auto mt-2.5 h-1 w-10 shrink-0 rounded-full" style={{ background: "var(--ink-faint)", opacity: 0.4 }} />

        <div className="flex items-center justify-between px-6 pt-3">
          <h2 className="font-display text-lg font-bold text-[var(--ink)]">
            {isEdit ? "Sửa kỳ kinh" : "Ghi nhận kỳ kinh"}
          </h2>
          <button type="button" onClick={onClose} className="rounded-full p-1.5 hover:bg-black/5">
            <X size={18} />
          </button>
        </div>

        {/* Thanh tiến trình 4 bước — chỉ 1 bước hiện ở 1 thời điểm, không còn
            chồng chéo nội dung khiến date picker bị che. */}
        <div className="flex items-center gap-2 px-6 pb-4 pt-4">
          {STEPS.map((s, i) => (
            <button
              key={s.key}
              type="button"
              onClick={() => setStep(i)}
              className="flex flex-1 flex-col items-center gap-1.5"
            >
              <span
                className="h-1.5 w-full rounded-full transition-colors"
                style={{ background: i <= step ? "var(--c-period)" : "rgba(0,0,0,0.06)" }}
              />
              <span
                className="text-[10px] font-semibold transition-colors"
                style={{ color: i === step ? "var(--c-period)" : "var(--ink-faint)" }}
              >
                {s.label}
              </span>
            </button>
          ))}
        </div>

        <div className="flex flex-col gap-4 overflow-y-auto px-6 pb-4" style={{ minHeight: "42vh" }}>
          {/* Bước 1: Ngày & lượng máu */}
          {step === 0 && (
            <section className="flex flex-col gap-4">
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
                      className="flex-1 rounded-full py-2.5 text-xs font-semibold transition active:scale-95"
                      style={{
                        background: flow === f ? "var(--c-period)" : "var(--surface-soft)",
                        color: flow === f ? "#fff" : "var(--ink-soft)",
                      }}
                    >
                      {f === "light" ? "Nhẹ" : f === "medium" ? "Vừa" : "Nhiều"}
                    </button>
                  ))}
                </div>
              </div>
            </section>
          )}

          {/* Bước 2: Que thử + thuốc tránh thai */}
          {step === 1 && (
            <section className="flex flex-col gap-4">
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
                      className="flex-1 rounded-full py-2.5 text-xs font-semibold transition active:scale-95"
                      style={{
                        background: symptoms.includes(id) ? "var(--c-fertile)" : "var(--surface-soft)",
                        color: symptoms.includes(id) ? "#fff" : "var(--ink-soft)",
                      }}
                    >
                      {id}
                    </button>
                  ))}
                </div>
              </div>
            </section>
          )}

          {/* Bước 3: Triệu chứng — grid thẻ dọc (icon minh hoạ lớn + nhãn dưới)
              thay vì pill ngang, để mỗi mục trông như 1 "sticker" chứ không
              phải icon nhỏ chen trong hàng chữ. */}
          {step === 2 && (
            <section className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-[var(--ink-soft)]">Chọn nhóm</span>
                {symptomCount > 0 && (
                  <span className="text-xs font-semibold" style={{ color: "var(--c-period)" }}>
                    Đã chọn {symptomCount}
                  </span>
                )}
              </div>

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
                        background: activeCategory === cat ? "var(--c-sleep)" : "var(--surface-soft)",
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

              <div className="grid grid-cols-4 gap-x-2 gap-y-4">
                {getSymptomsByCategory(activeCategory).map(({ id, label, icon: Icon, category }) => {
                  const active = symptoms.includes(id);
                  return (
                    <button
                      key={id}
                      type="button"
                      onClick={() => toggleSymptom(id)}
                      className="relative flex flex-col items-center gap-1.5 text-center"
                    >
                      <SymptomIcon icon={Icon} category={category} size="lg" active={active} />
                      <span
                        className="text-[10.5px] font-medium leading-tight"
                        style={{ color: active ? "var(--ink)" : "var(--ink-soft)" }}
                      >
                        {label}
                      </span>
                      {active && (
                        <span
                          className="absolute right-2 top-0 flex h-4 w-4 items-center justify-center rounded-full text-white"
                          style={{ background: "var(--c-period)" }}
                        >
                          <Check size={11} strokeWidth={3} />
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </section>
          )}

          {/* Bước 4: Ghi chú */}
          {step === 3 && (
            <section className="flex flex-col gap-2">
              <span className="text-xs font-medium text-[var(--ink-soft)]">Ghi chú</span>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Thêm ghi chú cho ngày này..."
                rows={5}
                autoFocus
                className="resize-none rounded-2xl px-3 py-2.5 text-sm text-[var(--ink)] outline-none placeholder:text-[var(--ink-faint)]"
                style={{ background: "var(--surface-soft)" }}
              />

              {symptomCount > 0 && (
                <div className="mt-1 flex flex-wrap gap-1.5">
                  {symptoms
                    .filter((s) => !PREGNANCY_TEST_IDS.includes(s) && !OVULATION_TEST_IDS.includes(s) && !PILL_IDS.includes(s))
                    .map((s) => (
                      <span
                        key={s}
                        className="rounded-full px-2.5 py-1 text-[11px] font-medium"
                        style={{ background: "var(--surface-soft)", color: "var(--ink-soft)" }}
                      >
                        {s}
                      </span>
                    ))}
                </div>
              )}
            </section>
          )}
        </div>

        <div className="flex flex-col gap-2 px-6 pb-6 pt-3" style={{ borderTop: "1px solid rgba(0,0,0,0.05)" }}>
          <div className="flex gap-2">
            {step > 0 && (
              <button
                type="button"
                onClick={() => setStep((s) => s - 1)}
                className="flex items-center justify-center gap-1 rounded-2xl px-4 py-3 text-sm font-semibold"
                style={{ background: "var(--surface-soft)", color: "var(--ink-soft)" }}
              >
                <ChevronLeft size={16} />
                Quay lại
              </button>
            )}
            <button
              type="button"
              disabled={saving}
              onClick={() => (isLastStep ? handleSubmit() : setStep((s) => s + 1))}
              className="flex flex-1 items-center justify-center gap-2 rounded-2xl py-3 text-sm font-semibold text-white disabled:opacity-60"
              style={{ background: "var(--c-period)" }}
            >
              {saving && <Loader2 size={16} className="animate-spin" />}
              {isLastStep ? "Lưu" : "Tiếp tục"}
              {!isLastStep && <ChevronRight size={16} />}
            </button>
          </div>

          {isEdit && isLastStep && (
            <>
              {!confirmingDelete ? (
                <button
                  type="button"
                  onClick={() => setConfirmingDelete(true)}
                  className="flex items-center justify-center gap-2 rounded-2xl py-2.5 text-sm font-semibold"
                  style={{ color: "var(--c-heart)" }}
                >
                  <Trash2 size={16} />
                  Xoá kỳ kinh này
                </button>
              ) : (
                <div className="flex items-center gap-2 rounded-2xl p-3" style={{ background: "var(--surface-soft)" }}>
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
      </div>
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
            className="flex-1 rounded-full py-2.5 text-xs font-semibold transition active:scale-95"
            style={{
              background: selected.includes(id) ? "var(--c-period)" : "var(--surface-soft)",
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
