import { LucideIcon } from "lucide-react";
import MiniBars from "./MiniBars";
import BlobIcon from "./BlobIcon";

interface MetricCardProps {
  icon: LucideIcon;
  title: string;
  value: string | number;
  unit?: string;
  status: string;
  color: string; // giá trị CSS var, vd 'var(--c-heart)'
  chart: number[];
  onClick?: () => void;
}

export default function MetricCard({
  icon: Icon,
  title,
  value,
  unit,
  status,
  color,
  chart,
  onClick,
}: MetricCardProps) {
  return (
    <button
      onClick={onClick}
      className="glass-card flex w-full flex-col gap-4 rounded-[26px] p-5 text-left transition-transform active:scale-[0.98]"
    >
      {/* Bỏ nhãn "Hôm nay" thừa ở góc phải header — đã hiển thị lại ngay dưới
          value (biến `status`) rồi, để cả 2 chỗ vừa dư thừa vừa khiến chữ
          "Hôm nay" dính sát tên hoạt động do không đủ chỗ trong hàng header
          hẹp (đặc biệt các tên dài như "Nhịp tim" bị xuống dòng đúng ngay chỗ
          nhãn thừa này). */}
      {/* F1: BlobIcon thay cho khối tròn phẳng — thống nhất icon minh hoạ
          toàn app. */}
      <div className="flex items-center gap-2">
        <BlobIcon icon={Icon} bg={`color-mix(in srgb, ${color} 18%, white)`} fg={color} size="sm" />
        <span className="text-sm font-semibold text-[var(--ink)]">{title}</span>
      </div>

      {/* E1: trước đây value + MiniBars nằm chung 1 hàng `justify-between`,
          tranh chỗ nhau trong bề ngang hẹp của card 2 cột trên điện thoại —
          nguyên nhân chính khiến biểu đồ tràn ra ngoài (xem ghi chú trong
          MiniBars.tsx). Tách MiniBars xuống hàng riêng, full-width — luôn có
          đúng phần không gian của card, không phải tranh chỗ với text. */}
      <div>
        <div className="font-display text-[26px] font-bold leading-none text-[var(--ink)]">
          {value}
          {unit && (
            <span className="ml-1 font-sans text-sm font-normal text-[var(--ink-faint)]">
              {unit}
            </span>
          )}
        </div>
        <div className="mt-1.5 text-xs text-[var(--ink-soft)]">{status}</div>
      </div>
      <MiniBars data={chart} color={color} />
    </button>
  );
}
