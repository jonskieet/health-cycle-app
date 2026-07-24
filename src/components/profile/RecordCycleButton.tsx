import Link from "next/link";
import { CircleCheckBig } from "lucide-react";

interface RecordCycleButtonProps {
  label: string;
  href?: string;
}

// Nút ghost dạng pill dùng để dẫn người dùng đi ghi thêm kỳ kinh —
// tái dùng ở cả card "Tóm tắt chu kỳ" và "Lịch sử chu kỳ".
export default function RecordCycleButton({
  label,
  href = "/log?type=cycle",
}: RecordCycleButtonProps) {
  return (
    <Link
      href={href}
      className="flex items-center justify-center gap-2 rounded-full bg-black/[0.03] py-3 text-sm font-semibold"
      style={{ color: "var(--c-sleep)" }}
    >
      <CircleCheckBig size={16} style={{ color: "var(--c-sleep)" }} />
      {label}
    </Link>
  );
}
