"use client";

import { ReactNode } from "react";
import { useRouter } from "next/navigation";
import { Crown, Lock } from "lucide-react";

interface LockedFeatureProps {
  locked: boolean;
  title?: string;
  children: ReactNode;
}

export default function LockedFeature({ locked, title = "Tính năng VIP", children }: LockedFeatureProps) {
  const router = useRouter();
  if (!locked) return <>{children}</>;

  return (
    <div className="relative">
      <div
        aria-hidden
        className="pointer-events-none select-none"
        style={{ filter: "blur(6px)", opacity: 0.55 }}
      >
        {children}
      </div>
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-2.5 rounded-[24px] bg-white/40 px-6 text-center backdrop-blur-[1px]">
        <span
          className="flex h-10 w-10 items-center justify-center rounded-full text-white"
          style={{ background: "linear-gradient(135deg, #f6c453, #e85c8a 55%, #7c6ff0)" }}
        >
          <Lock size={17} />
        </span>
        <p className="font-display text-sm font-bold text-[var(--ink)]">{title}</p>
        <p className="text-xs text-[var(--ink-faint)]">Nâng cấp VIP để xem chi tiết</p>
        <button
          type="button"
          onClick={() => router.push("/upgrade")}
          className="mt-1 flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-semibold text-white"
          style={{ background: "linear-gradient(135deg, #f6c453, #e85c8a 55%, #7c6ff0)" }}
        >
          <Crown size={13} fill="currentColor" />
          Mở khoá VIP
        </button>
      </div>
    </div>
  );
}
