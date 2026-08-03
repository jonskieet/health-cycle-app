"use client";

import { Crown, User } from "lucide-react";
import { getAvatarPreset } from "@/lib/avatar-presets";

interface ProfileAvatarProps {
  name?: string | null;
  email?: string | null;
  isVip: boolean;
  size?: number;
  avatarKey?: string | null;
  avatarUrl?: string | null;
}

function getInitials(name?: string | null, email?: string | null) {
  const source = name?.trim() || email?.trim() || "";
  if (!source) return null;

  if (name?.trim()) {
    const parts = name.trim().split(/\s+/);
    const first = parts[0]?.[0] ?? "";
    const last = parts.length > 1 ? parts[parts.length - 1][0] : "";
    return (first + last).toUpperCase();
  }

  return source[0]?.toUpperCase() ?? null;
}

export default function ProfileAvatar({
  name,
  email,
  isVip,
  size = 72,
  avatarKey,
  avatarUrl,
}: ProfileAvatarProps) {
  const initials = getInitials(name, email);
  const preset = getAvatarPreset(avatarKey);
  const PresetIcon = preset?.icon;

  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <span
        className="flex h-full w-full items-center justify-center overflow-hidden rounded-full font-display text-2xl font-bold text-white"
        style={{
          background: avatarUrl
            ? "var(--ink-faint)"
            : preset
              ? `linear-gradient(135deg, ${preset.gradientFrom}, ${preset.gradientTo})`
              : isVip
                ? "linear-gradient(135deg, #f6c453, #e85c8a 55%, #7c6ff0)"
                : "linear-gradient(135deg, var(--c-sleep), var(--c-period))",
          boxShadow: isVip
            ? "0 0 0 3px #fff, 0 0 0 5px #f6c453"
            : "0 0 0 3px #fff, 0 0 0 4px rgba(124,111,240,0.25)",
        }}
      >
        {avatarUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={avatarUrl} alt={name || "Avatar"} className="h-full w-full object-cover" />
        ) : PresetIcon ? (
          <PresetIcon size={size * 0.42} />
        ) : (
          (initials ?? <User size={size * 0.4} />)
        )}
      </span>

      {isVip && (
        <span
          className="absolute flex items-center justify-center rounded-full text-white"
          style={{
            width: Math.max(size * 0.32, 16),
            height: Math.max(size * 0.32, 16),
            right: -size * 0.04,
            top: -size * 0.04,
            background: "linear-gradient(135deg, #f6c453, #e8973e)",
            boxShadow: `0 2px 6px rgba(232, 151, 62, 0.5), 0 0 0 ${Math.max(size * 0.03, 1.5)}px #fff`,
          }}
        >
          <Crown size={Math.max(size * 0.17, 9)} fill="currentColor" />
        </span>
      )}
    </div>
  );
}
