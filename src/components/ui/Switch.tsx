interface SwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  disabled?: boolean;
}

// Toggle dạng pill dùng token màu --c-sleep, thay cho input[type=checkbox] mặc định.
// Module A3: hỗ trợ `disabled` để khoá công tắc trong lúc mutation liên quan đang
// `isPending` — tránh user gạt liên tục nhiều lần trước khi request trước kịp xong.
export default function Switch({ checked, onChange, label, disabled }: SwitchProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      aria-disabled={disabled}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className="relative h-7 w-12 shrink-0 rounded-full transition-colors disabled:opacity-50"
      style={{ background: checked ? "var(--c-sleep)" : "rgba(36,27,47,0.14)" }}
    >
      <span
        className="absolute top-0.5 h-6 w-6 rounded-full bg-white shadow-sm transition-[left]"
        style={{ left: checked ? "21px" : "2px" }}
      />
    </button>
  );
}
