import Link from "next/link";
import { LucideIcon, Sparkles } from "lucide-react";

interface EmptyStateProps {
  title: string;
  description: string;
  actionLabel?: string;
  actionHref?: string;
  icon?: LucideIcon;
}

export default function EmptyState({
  title,
  description,
  actionLabel,
  actionHref,
  icon: Icon = Sparkles,
}: EmptyStateProps) {
  return (
    <div className="glass-card flex flex-col items-center gap-3 rounded-[24px] p-8 text-center">
      <span
        className="flex h-11 w-11 items-center justify-center rounded-full"
        style={{ background: "color-mix(in srgb, var(--c-sleep) 16%, white)" }}
      >
        <Icon size={20} style={{ color: "var(--c-sleep)" }} />
      </span>
      <p className="font-display text-sm font-bold text-[var(--ink)]">{title}</p>
      <p className="text-xs text-[var(--ink-soft)]">{description}</p>
      {actionLabel && actionHref && (
        <Link
          href={actionHref}
          className="mt-1 rounded-full px-5 py-2 text-xs font-semibold text-white"
          style={{ background: "linear-gradient(135deg, var(--c-sleep), var(--c-period))" }}
        >
          {actionLabel}
        </Link>
      )}
    </div>
  );
}
