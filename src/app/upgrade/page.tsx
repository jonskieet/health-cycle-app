"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  X,
  Crown,
  FileText,
  LineChart,
  Thermometer,
  Scale,
  BookOpen,
  Loader2,
  Check,
  Clock,
  Copy,
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { useProfile, useLatestVipRequest, useCreateVipRequest } from "@/lib/queries";
import { isVipProfile } from "@/lib/vip";
import { useToast } from "@/components/ui/Toast";

const BENEFITS = [
  { icon: FileText, label: "Báo cáo sức khoẻ cho bác sĩ", desc: "Xuất PDF gửi bác sĩ khi cần" },
  { icon: LineChart, label: "Phân tích chuyên sâu & tương quan", desc: "Tìm mối liên hệ giữa các triệu chứng" },
  { icon: Thermometer, label: "Theo dõi nhiệt độ cơ bản (BBT)", desc: "Tăng độ chính xác dự đoán rụng trứng" },
  { icon: Scale, label: "Theo dõi cân nặng", desc: "Biểu đồ xu hướng theo thời gian" },
  { icon: BookOpen, label: "Thư viện nội dung đầy đủ", desc: "Mở khoá toàn bộ bài viết sức khoẻ" },
];

// Thông tin chuyển khoản demo — thay bằng thông tin ngân hàng thật khi triển khai.
const BANK = {
  bankId: "970436", // Vietcombank (BIN) — ví dụ, thay theo ngân hàng thật
  accountNo: "0000000000",
  accountName: "CONG TY KVCYCLE",
  amount: 99000,
};

function buildVietQrUrl(transferCode: string) {
  const desc = encodeURIComponent(`KVCYCLE VIP ${transferCode}`);
  return `https://img.vietqr.io/image/${BANK.bankId}-${BANK.accountNo}-compact2.png?amount=${BANK.amount}&addInfo=${desc}&accountName=${encodeURIComponent(BANK.accountName)}`;
}

export default function UpgradePage() {
  const router = useRouter();
  const { user } = useAuth();
  const { data: profile } = useProfile();
  const { data: latestRequest, isLoading: loadingRequest } = useLatestVipRequest();
  const createRequest = useCreateVipRequest();
  const [copied, setCopied] = useState(false);
  const toast = useToast();

  const vip = isVipProfile(profile);

  const transferCode = useMemo(() => {
    if (!user) return "";
    return user.id.slice(0, 8).toUpperCase();
  }, [user]);

  const qrUrl = useMemo(() => buildVietQrUrl(transferCode), [transferCode]);

  async function handleConfirmTransfer() {
    try {
      await createRequest.mutateAsync({ transfer_code: transferCode });
      toast.success("Đã gửi yêu cầu, chờ xác nhận nâng cấp VIP");
    } catch {
      // toast lỗi do MutationCache global xử lý (providers.tsx, Module A1).
    }
  }

  function handleCopy() {
    navigator.clipboard?.writeText(`KVCYCLE VIP ${transferCode}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <main className="flex flex-1 flex-col gap-6 px-5 pt-8 pb-10">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-bold text-[var(--ink)]">Nâng cấp VIP</h1>
        <button
          type="button"
          onClick={() => router.back()}
          className="flex h-9 w-9 items-center justify-center rounded-full text-[var(--ink-soft)]"
          style={{ background: "rgba(36,27,47,0.06)" }}
        >
          <X size={16} />
        </button>
      </div>

      {vip ? (
        <div
          className="flex flex-col items-center gap-3 rounded-[24px] p-6 text-center text-white"
          style={{ background: "linear-gradient(135deg, #f6c453, #e85c8a 55%, #7c6ff0)" }}
        >
          <Crown size={28} fill="currentColor" />
          <p className="font-display text-lg font-bold">Bạn đã là thành viên VIP</p>
          <p className="text-sm text-white/85">Cảm ơn bạn đã ủng hộ KVCycle 💜</p>
        </div>
      ) : (
        <>
          <section
            className="flex flex-col gap-2 rounded-[24px] p-5 text-white"
            style={{ background: "linear-gradient(135deg, #f6c453, #e85c8a 55%, #7c6ff0)" }}
          >
            <div className="flex items-center gap-2">
              <Crown size={20} fill="currentColor" />
              <p className="font-display text-lg font-bold">Mở khoá toàn bộ tính năng</p>
            </div>
            <p className="text-sm text-white/85">
              {BANK.amount.toLocaleString("vi-VN")}đ / tháng — huỷ bất cứ lúc nào.
            </p>
          </section>

          <section className="glass-card flex flex-col divide-y divide-black/[0.05] rounded-[22px] px-4">
            {BENEFITS.map(({ icon: Icon, label, desc }) => (
              <div key={label} className="flex items-center gap-3 py-3">
                <span
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-white"
                  style={{ background: "var(--c-sleep)" }}
                >
                  <Icon size={16} />
                </span>
                <span className="flex-1 text-left">
                  <span className="block text-sm font-semibold text-[var(--ink)]">{label}</span>
                  <span className="block text-xs text-[var(--ink-faint)]">{desc}</span>
                </span>
              </div>
            ))}
          </section>

          {loadingRequest ? (
            <div className="flex justify-center py-6">
              <Loader2 size={20} className="animate-spin text-[var(--ink-faint)]" />
            </div>
          ) : latestRequest?.status === "pending" ? (
            <section className="glass-card-strong flex flex-col items-center gap-2 rounded-[24px] p-6 text-center">
              <Clock size={24} className="text-[var(--c-ovulation)]" />
              <p className="font-display text-base font-bold text-[var(--ink)]">
                Yêu cầu đang chờ duyệt
              </p>
              <p className="text-xs text-[var(--ink-faint)]">
                Sau khi xác nhận đã chuyển khoản, đội ngũ KVCycle sẽ kích hoạt VIP cho bạn trong
                thời gian sớm nhất.
              </p>
            </section>
          ) : latestRequest?.status === "rejected" ? (
            <section className="glass-card-strong flex flex-col gap-1 rounded-[24px] p-5 text-center">
              <p className="text-sm text-[var(--ink-soft)]">
                Yêu cầu trước đó chưa được xác nhận. Vui lòng kiểm tra lại giao dịch và thử lại.
              </p>
            </section>
          ) : (
            <section className="glass-card-strong flex flex-col items-center gap-4 rounded-[24px] p-6">
              <p className="font-display text-base font-bold text-[var(--ink)]">
                Quét mã để chuyển khoản
              </p>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={qrUrl}
                alt="Mã QR chuyển khoản"
                className="h-56 w-56 rounded-2xl border border-black/[0.06] object-contain"
              />
              <div className="flex w-full flex-col gap-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-[var(--ink-faint)]">Số tiền</span>
                  <span className="font-semibold text-[var(--ink)]">
                    {BANK.amount.toLocaleString("vi-VN")}đ
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[var(--ink-faint)]">Chủ tài khoản</span>
                  <span className="font-semibold text-[var(--ink)]">{BANK.accountName}</span>
                </div>
                <button
                  type="button"
                  onClick={handleCopy}
                  className="flex items-center justify-between rounded-2xl bg-black/[0.03] px-3 py-2.5"
                >
                  <span className="text-[var(--ink-faint)]">Nội dung CK</span>
                  <span className="flex items-center gap-1.5 font-semibold text-[var(--ink)]">
                    KVCYCLE VIP {transferCode}
                    {copied ? <Check size={14} /> : <Copy size={14} />}
                  </span>
                </button>
              </div>

              <button
                type="button"
                onClick={handleConfirmTransfer}
                disabled={createRequest.isPending || !transferCode}
                className="flex w-full items-center justify-center gap-2 rounded-2xl py-3 text-sm font-semibold text-white disabled:opacity-60"
                style={{ background: "linear-gradient(135deg, #f6c453, #e85c8a 55%, #7c6ff0)" }}
              >
                {createRequest.isPending && <Loader2 size={16} className="animate-spin" />}
                Tôi đã chuyển khoản
              </button>
              <p className="text-center text-[11px] leading-relaxed text-[var(--ink-faint)]">
                Vui lòng ghi đúng nội dung chuyển khoản để hệ thống xác nhận nhanh hơn. VIP sẽ
                được kích hoạt thủ công sau khi đội ngũ xác nhận giao dịch.
              </p>
            </section>
          )}
        </>
      )}
    </main>
  );
}
