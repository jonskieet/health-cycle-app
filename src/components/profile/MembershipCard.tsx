"use client";

import { Crown, Lock, Sparkles } from "lucide-react";

interface MembershipCardProps {
  isVip: boolean;
}

export default function MembershipCard({ isVip }: MembershipCardProps) {
  if (isVip) {
    return (
      <div
        className="flex items-center gap-3 rounded-[22px] p-4 text-white"
        style={{ background: "linear-gradient(135deg, #f6c453, #e85c8a 55%, #7c6ff0)" }}
      >
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/20">
          <Crown size={16} fill="currentColor" />
        </span>
        <span className="flex-1 text-left">
          <span className="block text-sm font-semibold">Thành viên VIP</span>
          <span className="block text-xs text-white/85">
            Đã mở khoá toàn bộ tính năng cao cấp
          </span>
        </span>
      </div>
    );
  }

  return (
    <div className="glass-card flex flex-col gap-3 rounded-[22px] p-4">
      <div className="flex items-center gap-3">
        <span
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[var(--ink-soft)]"
          style={{ background: "rgba(36,27,47,0.06)" }}
        >
          <Lock size={16} />
        </span>
        <span className="flex-1 text-left">
          <span className="block text-sm font-semibold text-[var(--ink)]">Thành viên Thường</span>
          <span className="block text-xs text-[var(--ink-faint)]">
            Nâng cấp VIP để mở khoá phân tích chuyên sâu
          </span>
        </span>
      </div>
      <button
        type="button"
        className="flex items-center justify-center gap-2 rounded-2xl py-2.5 text-sm font-semibold text-white"
        style={{ background: "linear-gradient(135deg, #f6c453, #e85c8a 55%, #7c6ff0)" }}
      >
        <Sparkles size={15} />
        Nâng cấp VIP
      </button>
    </div>
  );
}
