"use client";

import { MutationCache, QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";
import { AuthProvider } from "@/lib/auth-context";
import { ToastProvider, useToast } from "@/components/ui/Toast";

// Module A1 (QUALITY_UX_ROADMAP.md) — điểm chặn lỗi TOÀN CỤC.
// Rất nhiều nơi trong app (đặc biệt `settings/page.tsx`) gọi `.mutate(...)`
// kiểu "bắn rồi quên" (fire-and-forget), KHÔNG có onError riêng — nếu mutation
// lỗi (mất mạng, RLS chặn, constraint DB...) người dùng không hề biết, y hệt
// bug gốc "Lưu thất bại" ban đầu nhưng lặp lại ở hàng chục chỗ khác. Thay vì
// sửa từng dòng .mutate(), gắn `onError` mặc định ở cấp MutationCache: bất kỳ
// mutation nào KHÔNG tự cung cấp onError riêng sẽ tự động hiện toast lỗi ở
// đây. Mutation nào tự làm onError riêng (hiếm, ưu tiên logic đặc thù) thì
// React Query vẫn gọi callback riêng đó SAU global này — không xung đột.
function QueryProviderWithGlobalErrorToast({ children }: { children: React.ReactNode }) {
  const toast = useToast();
  const [queryClient] = useState(
    () =>
      new QueryClient({
        mutationCache: new MutationCache({
          onError: (error) => toast.error(error),
        }),
        // Module C1 (QUALITY_UX_ROADMAP.md) — mặc định của React Query là
        // staleTime: 0, nghĩa là MỌI query bị coi là "cũ" ngay khi vừa fetch
        // xong → refetch lại mỗi khi component mount lại (chuyển tab qua lại
        // trong app) hoặc cửa sổ được focus lại, dù dữ liệu vừa lấy 1 giây
        // trước. Đặt mặc định 30s cho toàn app (an toàn cho phần lớn dữ liệu
        // dạng "hồ sơ cá nhân" ít đổi trong 1 phiên dùng) — các query có dữ
        // liệu đổi nhanh hơn (vd health_metrics "hôm nay") tự override
        // staleTime ngắn hơn ngay tại hook của nó trong queries.ts.
        defaultOptions: {
          queries: {
            staleTime: 30_000,
          },
        },
      })
  );
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    // ToastProvider bọc NGOÀI CÙNG để useToast() dùng được ở mọi nơi, kể cả
    // trong chính QueryClient (global onError) lẫn màn hình đăng nhập.
    <ToastProvider>
      <QueryProviderWithGlobalErrorToast>
        <AuthProvider>{children}</AuthProvider>
      </QueryProviderWithGlobalErrorToast>
    </ToastProvider>
  );
}
