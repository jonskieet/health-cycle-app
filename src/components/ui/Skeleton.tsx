// Module A4 (QUALITY_UX_ROADMAP.md) — skeleton loading dùng chung.
// Trước đây nhiều trang xử lý `isLoading ? null : ...` — khoảng trắng im lặng
// khiến người dùng không biết app đang tải hay đã hết dữ liệu. Các component
// dưới đây thay khoảng trắng đó bằng khối shimmer, dùng class `.skeleton`
// (globals.css) và tôn trọng `prefers-reduced-motion` sẵn có toàn app.

/** Một khối skeleton đơn — dùng khi cần ghép layout tuỳ biến. */
export function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`skeleton ${className}`} />;
}

/**
 * Skeleton cho danh sách dạng hàng chia divider trong `glass-card` — khớp
 * layout của lịch sử metric/kegel/fatigue-test/lịch hẹn (icon tròn + 2 dòng
 * text bên phải).
 */
export function SkeletonRows({ rows = 3 }: { rows?: number }) {
  return (
    <div className="glass-card flex flex-col divide-y divide-black/5 rounded-[22px] px-4">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center gap-3 py-3">
          <Skeleton className="h-9 w-9 shrink-0 rounded-full" />
          <div className="flex flex-1 flex-col gap-2">
            <Skeleton className="h-3.5 w-2/3" />
            <Skeleton className="h-3 w-1/3" />
          </div>
        </div>
      ))}
    </div>
  );
}

/** Skeleton cho khối card lớn (VD dashboard chu kỳ, hồ sơ) — vài dòng + 1 khối tròn. */
export function SkeletonCard({ withRing = false }: { withRing?: boolean }) {
  return (
    <div className="glass-card-strong flex flex-col items-center gap-4 rounded-[28px] p-6">
      {withRing && <Skeleton className="h-40 w-40 rounded-full" />}
      <Skeleton className="h-4 w-1/2" />
      <div className="grid w-full grid-cols-2 gap-3">
        <Skeleton className="h-14 w-full rounded-2xl" />
        <Skeleton className="h-14 w-full rounded-2xl" />
      </div>
    </div>
  );
}
