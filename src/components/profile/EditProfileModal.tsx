"use client";

import { useRef, useState } from "react";
import { Camera, Loader2, X } from "lucide-react";
import { Profile, useUpdateProfile, useUploadAvatar } from "@/lib/queries";
import { AVATAR_PRESETS } from "@/lib/avatar-presets";
import { useToast } from "@/components/ui/Toast";
import ProfileAvatar from "@/components/profile/ProfileAvatar";
import { isVipProfile } from "@/lib/vip";

interface EditProfileModalProps {
  profile: Profile | null | undefined;
  fallbackName?: string | null;
  onClose: () => void;
}

// Giới hạn dung lượng ảnh upload — tránh user chọn nhầm ảnh gốc từ máy ảnh
// (có thể vài chục MB), vừa tốn băng thông vừa lâu tải trên mobile.
const MAX_AVATAR_SIZE_MB = 5;

export default function EditProfileModal({
  profile,
  fallbackName,
  onClose,
}: EditProfileModalProps) {
  const updateProfile = useUpdateProfile();
  const uploadAvatar = useUploadAvatar();
  const toast = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const vip = isVipProfile(profile);

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

  function handlePickFile() {
    fileInputRef.current?.click();
  }

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = ""; // cho phép chọn lại cùng 1 file lần sau
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Vui lòng chọn một tệp hình ảnh.");
      return;
    }
    if (file.size > MAX_AVATAR_SIZE_MB * 1024 * 1024) {
      toast.error(`Ảnh vượt quá ${MAX_AVATAR_SIZE_MB}MB. Vui lòng chọn ảnh nhỏ hơn.`);
      return;
    }

    try {
      await uploadAvatar.mutateAsync(file);
      setAvatarDraft(null); // ảnh thật thay thế preset đang chọn (nếu có)
      toast.success("Đã cập nhật ảnh đại diện");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Tải ảnh lên thất bại. Vui lòng thử lại.");
    }
  }

  async function handleSave() {
    const trimmedName = nameDraft.trim();
    const trimmedYear = birthYearDraft.trim();

    // B4: `type="number"` + `min`/`max` trên <input> chỉ là gợi ý thị giác
    // của trình duyệt (mũi tên tăng/giảm), KHÔNG chặn submit thật vì nút "Lưu
    // lại" là `type="button"` gọi thẳng `handleSave` qua onClick, không phải
    // native form submit — nên constraint validation của HTML không bao giờ
    // chạy. DB cũng không có CHECK constraint cho `birth_year` (chỉ khai báo
    // kiểu `int`), nên trước đây user có thể lưu năm sinh âm/0/99999... mà
    // không bị chặn ở đâu cả. Validate thật ở đây trước khi gọi mutation.
    if (trimmedYear) {
      const parsedYear = Number(trimmedYear);
      const currentYear = new Date().getFullYear();
      if (!Number.isInteger(parsedYear) || parsedYear < 1930 || parsedYear > currentYear) {
        toast.error(`Năm sinh không hợp lệ. Vui lòng nhập từ 1930 đến ${currentYear}.`);
        return;
      }
    }
    const parsedYear = trimmedYear ? Number(trimmedYear) : null;

    try {
      await updateProfile.mutateAsync({
        display_name: trimmedName || null,
        birth_year: parsedYear,
        avatar_key: avatarDraft,
        // Chọn biểu tượng preset nghĩa là không còn muốn dùng ảnh đã tải
        // lên trước đó — avatarUrl vẫn được ProfileAvatar ưu tiên hiển thị
        // trước preset, nên phải xoá avatar_url ở đây thì preset mới thật
        // sự hiện ra.
        avatar_url: avatarDraft ? null : (profile?.avatar_url ?? null),
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

        <div className="flex flex-col items-center gap-2">
          <button
            type="button"
            onClick={handlePickFile}
            disabled={uploadAvatar.isPending}
            className="relative disabled:opacity-70"
          >
            <ProfileAvatar
              name={nameDraft || fallbackName}
              isVip={vip}
              size={84}
              avatarKey={avatarDraft}
              avatarUrl={profile?.avatar_url}
            />
            <span
              className="absolute -bottom-0.5 -right-0.5 flex h-7 w-7 items-center justify-center rounded-full text-white"
              style={{ background: "var(--c-sleep)", boxShadow: "0 0 0 2px #fff" }}
            >
              {uploadAvatar.isPending ? (
                <Loader2 size={13} className="animate-spin" />
              ) : (
                <Camera size={13} />
              )}
            </span>
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileChange}
          />
          <button
            type="button"
            onClick={handlePickFile}
            disabled={uploadAvatar.isPending}
            className="text-xs font-semibold text-[var(--c-sleep)] disabled:opacity-60"
          >
            Đổi ảnh đại diện
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
          <span className="text-xs font-medium text-[var(--ink-soft)]">
            {profile?.avatar_url ? "Hoặc chọn biểu tượng thay ảnh đã tải lên" : "Hoặc chọn biểu tượng"}
          </span>
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
