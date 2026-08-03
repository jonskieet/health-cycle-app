"use client";

import { ReactNode } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronLeft } from "lucide-react";

interface PageHeaderProps {
  title: string;
  /** Href tĩnh cho nút back (dùng Link, ví dụ khi cần back luôn về 1 trang cố định). Bỏ qua nếu dùng onBack. */
  backHref?: string;
  /** Handler tuỳ chỉnh cho nút back. Mặc định: router.back(). */
  onBack?: () => void;
  /** Nút hành động phụ bên phải (vd: nút thống kê, thêm mới...). Nếu không truyền, giữ khoảng trống để tiêu đề vẫn canh giữa đúng. */
  action?: ReactNode;
  className?: string;
}

// Bố cục 3 vùng cân đối dùng chung cho mọi trang con: nút back (trái) –
// tiêu đề (giữa, canh giữa tuyệt đối theo chiều ngang bất kể back/action
// có hay không) – nút action phụ (phải). Trước đây mỗi trang tự dựng
// header riêng nên tiêu đề bị lệch trái theo độ rộng nút back thay vì
// canh giữa thật sự.
export default function PageHeader({ title, backHref, onBack, action, className }: PageHeaderProps) {
  const router = useRouter();

  const backButtonClass =
    "flex h-9 w-9 shrink-0 items-center justify-center rounded-full hover:bg-black/5";

  return (
    <header className={`relative flex h-9 items-center justify-center ${className ?? ""}`}>
      <div className="absolute left-0 top-0">
        {backHref ? (
          <Link href={backHref} className={backButtonClass}>
            <ChevronLeft size={18} className="text-[var(--ink)]" />
          </Link>
        ) : (
          <button type="button" onClick={onBack ?? (() => router.back())} className={backButtonClass}>
            <ChevronLeft size={18} className="text-[var(--ink)]" />
          </button>
        )}
      </div>

      <h1 className="font-display truncate px-12 text-xl font-semibold tracking-tight text-[var(--ink)]">
        {title}
      </h1>

      {/* Giữ chỗ h-9 w-9 kể cả khi không có action, để tiêu đề không bị
          lệch giữa theo lệch của mỗi bên. */}
      <div className="absolute right-0 top-0 flex h-9 w-9 shrink-0 items-center justify-center">
        {action}
      </div>
    </header>
  );
}
