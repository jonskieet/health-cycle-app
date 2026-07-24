"use client";

import { Crown, User } from "lucide-react";

interface ProfileAvatarProps {
  name?: string | null;
  email?: string | null;
  isVip: boolean;
  size?: number;
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

export default function ProfileAvatar({ name, email, isVip, size = 72 }: ProfileAvatarProps) {
  const initials = getInitials(name, email);

  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <span
        className="flex h-full w-full items-center justify-center rounded-full font-display text-2xl font-bold text-white"
        style={{
          background: isVip
            ? "linear-gradient(135deg, #f6c453, #e85c8a 55%, #7c6ff0)"
            : "linear-gradient(135deg, var(--c-sleep), var(--c-period))",
          boxShadow: isVip
            ? "0 0 0 3px #fff, 0 0 0 5px #f6c453"
            : "0 0 0 3px #fff, 0 0 0 4px rgba(124,111,240,0.25)",
        }}
      >
        {initials ?? <User size={size * 0.4} />}
      </span>

      {isVip && (
        <span
          className="absolute -right-1 -top-1 flex h-6 w-6 items-center justify-center rounded-full text-white"
          style={{
            background: "linear-gradient(135deg, #f6c453, #e8973e)",
            boxShadow: "0 2px 6px rgba(232, 151, 62, 0.5), 0 0 0 2px #fff",
          }}
        >
          <Crown size={13} fill="currentColor" />
        </span>
      )}
    </div>
  );
}
