interface SwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
}

// Toggle dạng pill dùng token màu --c-sleep, thay cho input[type=checkbox] mặc định.
export default function Switch({ checked, onChange, label }: SwitchProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className="relative h-7 w-12 shrink-0 rounded-full transition-colors"
      style={{ background: checked ? "var(--c-sleep)" : "rgba(36,27,47,0.14)" }}
    >
      <span
        className="absolute top-0.5 h-6 w-6 rounded-full bg-white shadow-sm transition-transform"
        style={{ transform: checked ? "translateX(21px)" : "translateX(2px)" }}
      />
    </button>
  );
}
