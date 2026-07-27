import { ChevronRight, LucideIcon } from "lucide-react";

interface SettingsRowProps {
  icon: LucideIcon;
  label: string;
  subtitle?: string;
  color?: string; // token màu cho icon, mặc định --c-sleep
  onClick?: () => void;
  href?: string;
  right?: React.ReactNode; // vd Switch, hoặc để trống dùng ChevronRight mặc định
  tone?: "default" | "danger";
}

export default function SettingsRow({
  icon: Icon,
  label,
  subtitle,
  color = "var(--c-sleep)",
  onClick,
  href,
  right,
  tone = "default",
}: SettingsRowProps) {
  const content = (
    <>
      <span
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-white"
        style={{ background: tone === "danger" ? "var(--c-period)" : color }}
      >
        <Icon size={16} />
      </span>
      <span className="min-w-0 flex-1 text-left">
        <span
          className="block text-sm font-semibold"
          style={{ color: tone === "danger" ? "var(--c-period)" : "var(--ink)" }}
        >
          {label}
        </span>
        {subtitle && <span className="block text-xs text-[var(--ink-faint)]">{subtitle}</span>}
      </span>
      {right ?? (onClick || href) ? (
        right ?? <ChevronRight size={16} className="text-[var(--ink-faint)]" />
      ) : null}
    </>
  );

  const className = "flex w-full items-center gap-3 px-1 py-3 text-left";

  if (href) {
    return (
      <a href={href} target={href.startsWith("http") ? "_blank" : undefined} rel="noreferrer" className={className}>
        {content}
      </a>
    );
  }

  return (
    <button type="button" onClick={onClick} className={className}>
      {content}
    </button>
  );
}
