"use client";

import { useState } from "react";
import { Loader2, X } from "lucide-react";
import { Profile, useUpdateProfile } from "@/lib/queries";
import { AVATAR_PRESETS } from "@/lib/avatar-presets";
import { useToast } from "@/components/ui/Toast";

interface EditProfileModalProps {
  profile: Profile | null | undefined;
  fallbackName?: string | null;
  onClose: () => void;
}

export default function EditProfileModal({
  profile,
  fallbackName,
  onClose,
}: EditProfileModalProps) {
  const updateProfile = useUpdateProfile();
  const toast = useToast();

  // Khởi tạo state cục bộ từ profile ngay khi modal được mount (parent chỉ
  // render component này khi mở, nên không cần đồng bộ lại bằng effect).
  const [nameDraft, setNameDraft] = useState(
    () => profile?.display_name ?? fallbackName ?? ""
  );
  const [birthYearDraft, setBirthYearDraft] = useState(() =>
    profile?.birth_year ? String(profile.birth_year) : ""
  );
  const [avatarDraft, setAvatarDraft] = useState<string | null>(
    () => profile?.avatar_key ?? null
  );

  async function handleSave() {
    const trimmedName = nameDraft.trim();
    const parsedYear = birthYearDraft.trim() ? Number(birthYearDraft.trim()) : null;

    try {
      await updateProfile.mutateAsync({
        display_name: trimmedName || null,
        birth_year: parsedYear,
        avatar_key: avatarDraft,
      });
      toast.success("Đã cập nhật hồ sơ");
      onClose();
    } catch {
      // toast lỗi do MutationCache global xử lý (providers.tsx, Module A1).
    }
  }

  return (
    <div className="absolute inset-0 z-50 flex items-end justify-center bg-black/40 backdrop-blur-sm">
      <div className="glass-card-strong flex max-h-[85%] w-full flex-col gap-5 overflow-y-auto rounded-t-[28px] p-6">
        <div className="flex items-center justify-between">
          <p className="font-display text-lg font-bold text-[var(--ink)]">Chỉnh sửa hồ sơ</p>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full text-[var(--ink-soft)]"
            style={{ background: "rgba(36,27,47,0.06)" }}
          >
            <X size={15} />
          </button>
        </div>

        <label className="flex flex-col gap-1.5">
          <span className="text-xs font-medium text-[var(--ink-soft)]">Tên</span>
          <input
            value={nameDraft}
            onChange={(e) => setNameDraft(e.target.value)}
            placeholder="Tên hiển thị"
            maxLength={40}
            className="rounded-2xl bg-black/[0.05] px-4 py-3 text-sm text-[var(--ink)] outline-none"
          />
        </label>

        <label className="flex flex-col gap-1.5">
          <span className="text-xs font-medium text-[var(--ink-soft)]">Năm sinh</span>
          <input
            type="number"
            value={birthYearDraft}
            onChange={(e) => setBirthYearDraft(e.target.value)}
            placeholder="VD: 2000"
            min={1930}
            max={new Date().getFullYear()}
            className="rounded-2xl bg-black/[0.05] px-4 py-3 text-sm text-[var(--ink)] outline-none"
          />
        </label>

        <div className="flex flex-col gap-2">
          <span className="text-xs font-medium text-[var(--ink-soft)]">Hình đại diện</span>
          <div className="grid grid-cols-4 gap-3">
            {AVATAR_PRESETS.map((preset) => {
              const Icon = preset.icon;
              const active = avatarDraft === preset.key;
              return (
                <button
                  key={preset.key}
                  type="button"
                  onClick={() => setAvatarDraft(preset.key)}
                  className="flex aspect-square items-center justify-center rounded-2xl text-white transition"
                  style={{
                    background: `linear-gradient(135deg, ${preset.gradientFrom}, ${preset.gradientTo})`,
                    boxShadow: active
                      ? "0 0 0 2px #fff, 0 0 0 4px var(--c-sleep)"
                      : "0 0 0 1px var(--glass-border)",
                  }}
                >
                  <Icon size={22} />
                </button>
              );
            })}
          </div>
        </div>

        <button
          type="button"
          onClick={handleSave}
          disabled={updateProfile.isPending}
          className="mt-1 flex items-center justify-center gap-2 rounded-2xl py-3.5 text-sm font-semibold text-white disabled:opacity-60"
          style={{ background: "linear-gradient(135deg, var(--c-sleep), var(--c-period))" }}
        >
          {updateProfile.isPending && <Loader2 size={16} className="animate-spin" />}
          Lưu lại
        </button>
      </div>
    </div>
  );
}
