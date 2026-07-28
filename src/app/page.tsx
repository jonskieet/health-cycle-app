"use client";

import { HeartPulse, Flame, Moon, Droplets, Smile, Stethoscope, ChevronRight, LucideIcon } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import MetricCard from "@/components/ui/MetricCard";
import AuroraRing from "@/components/ui/AuroraRing";
import EmptyState from "@/components/ui/EmptyState";
import { Skeleton } from "@/components/ui/Skeleton";
import AbnormalCycleBanner from "@/components/cycle/AbnormalCycleBanner";
import ReminderBanner from "@/components/cycle/ReminderBanner";
import {
  useHealthMetrics,
  useCycleLogs,
  useProfile,
  useUpcomingAppointments,
  buildWeekSeries,
  latestValue,
  computeTodayHealthScore,
  HealthMetricRow,
  MetricType,
} from "@/lib/queries";
import { useMemo } from "react";
import { predictCycle, phaseLabel, phaseColor, daysUntil } from "@/lib/cycle-utils";

export default function DashboardPage() {
  const router = useRouter();
  const { data: profile } = useProfile();
  const { data: cycleLogs = [], isLoading: cycleLoading } = useCycleLogs();
  const { data: metrics = [], isLoading: metricsLoading } = useHealthMetrics();
  const { data: upcomingAppointments } = useUpcomingAppointments();

  const avgCycleLength = profile?.avg_cycle_length ?? 28;
  const avgPeriodLength = profile?.avg_period_length ?? 5;
  // Module C4: predictCycle() sort + lặp qua toàn bộ cycleLogs — tính lại
  // useMemo theo đúng các giá trị đầu vào thật sự ảnh hưởng kết quả, tránh
  // tính lại mỗi khi Dashboard re-render vì lý do không liên quan (vd Toast
  // tự ẩn, focus lại tab khiến query khác cập nhật).
  const prediction = useMemo(
    () => predictCycle(cycleLogs, { avgCycleLength, avgPeriodLength }),
    [cycleLogs, avgCycleLength, avgPeriodLength]
  );
  const daysToNext = daysUntil(prediction.nextPeriodDate);
  const healthScore = useMemo(() => computeTodayHealthScore(metrics), [metrics]);
  const hasAnyMetrics = metrics.length > 0;
  const loading = cycleLoading || metricsLoading;

  return (
    <main className="flex flex-1 flex-col gap-6 px-5 pt-6">
      {/* Signature element: Health Score ring */}
      <section className="glass-card-strong flex items-center gap-5 rounded-[28px] p-6">
        <AuroraRing percent={healthScore ?? 0} colorFrom="#7c6ff0" colorTo="#e85c8a">
          {healthScore != null ? (
            <>
              <span className="font-display text-3xl font-extrabold text-[var(--ink)]">
                {healthScore}
              </span>
              <span className="text-[10px] text-[var(--ink-faint)]">/ 100</span>
            </>
          ) : (
            <span className="text-xs text-[var(--ink-faint)]">Chưa có dữ liệu</span>
          )}
        </AuroraRing>
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-[var(--ink-faint)]">
            Điểm sức khỏe
          </p>
          <p className="mt-1 font-display text-base font-bold text-[var(--ink)]">
            {healthScore == null
              ? "Ghi nhận chỉ số để bắt đầu"
              : healthScore >= 80
              ? "Trên mức trung bình"
              : healthScore >= 60
              ? "Ở mức trung bình"
              : "Cần chú ý hơn"}
          </p>
          <p className="mt-1 text-xs text-[var(--ink-soft)]">
            {healthScore == null ? (
              <Link href="/log" className="font-semibold text-[var(--c-sleep)]">
                Ghi nhận chỉ số đầu tiên →
              </Link>
            ) : (
              "Dựa trên nhịp tim, giấc ngủ, stress & hydration hôm nay"
            )}
          </p>
        </div>
      </section>

      {cycleLogs.length > 0 && <AbnormalCycleBanner cycleLogs={cycleLogs} />}
      <ReminderBanner daysToNextPeriod={daysToNext} metrics={metrics} />

      {/* Cycle teaser card */}
      <Link href="/cycle" className="glass-card flex items-center justify-between rounded-[24px] p-5">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-[var(--ink-faint)]">
            Chu kỳ kinh nguyệt
          </p>
          {cycleLogs.length === 0 ? (
            <p className="mt-1 font-display text-base font-bold text-[var(--ink)]">
              Chưa có dữ liệu chu kỳ
            </p>
          ) : (
            <p
              className="mt-1 font-display text-base font-bold"
              style={{ color: phaseColor[prediction.phase] }}
            >
              {phaseLabel[prediction.phase]}
            </p>
          )}
          <p className="mt-1 text-xs text-[var(--ink-soft)]">
            {cycleLogs.length === 0
              ? "Chạm để ghi nhận kỳ kinh gần nhất"
              : `Ngày ${prediction.currentDay} · Kỳ tới sau ${daysToNext} ngày`}
          </p>
        </div>
        <span
          className="flex h-11 w-11 items-center justify-center rounded-full text-white"
          style={{ background: cycleLogs.length === 0 ? "var(--ink-faint)" : phaseColor[prediction.phase] }}
        >
          <Droplets size={20} />
        </span>
      </Link>

      {/* Nearest appointments — chỉ hiện khi có lịch hẹn trong 7 ngày tới */}
      {upcomingAppointments && upcomingAppointments.length > 0 && (
        <Link href="/appointments" className="glass-card flex flex-col gap-3 rounded-[24px] p-5">
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium uppercase tracking-wide text-[var(--ink-faint)]">
              Lịch hẹn sắp tới
            </p>
            <ChevronRight size={16} className="text-[var(--ink-faint)]" />
          </div>
          <div className="flex flex-col gap-3">
            {upcomingAppointments.slice(0, 2).map((a) => (
              <div key={a.id} className="flex items-center gap-3">
                <span
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-white"
                  style={{ background: "var(--c-fertile)" }}
                >
                  <Stethoscope size={15} />
                </span>
                <div>
                  <p className="text-sm font-semibold text-[var(--ink)]">{a.title}</p>
                  <p className="text-xs text-[var(--ink-faint)]">
                    {new Date(a.appointment_at).toLocaleDateString("vi-VN", {
                      weekday: "short",
                      day: "2-digit",
                      month: "2-digit",
                    })}{" "}
                    ·{" "}
                    {new Date(a.appointment_at).toLocaleTimeString("vi-VN", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </Link>
      )}

      {/* Metric cards grid */}
      {loading ? (
        <section className="grid grid-cols-2 gap-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className={`h-24 w-full rounded-[22px] ${i === 4 ? "col-span-2" : ""}`} />
          ))}
        </section>
      ) : !hasAnyMetrics ? (
        <EmptyState
          title="Chưa có chỉ số nào hôm nay"
          description="Ghi nhận nhịp tim, giấc ngủ, stress, nước uống hoặc tâm trạng để KVCycle bắt đầu theo dõi sức khỏe của bạn."
          actionLabel="Ghi nhận ngay"
          actionHref="/log"
        />
      ) : (
        <section className="grid grid-cols-2 gap-4">
          <MetricLink type="stress" metrics={metrics} icon={Flame} title="Stress" unit="pts" color="var(--c-stress)" onClick={() => router.push("/log")} />
          <MetricLink type="heart_rate" metrics={metrics} icon={HeartPulse} title="Nhịp tim" unit="bpm" color="var(--c-heart)" onClick={() => router.push("/log")} />
          <MetricLink type="sleep" metrics={metrics} icon={Moon} title="Giấc ngủ" unit="giờ" color="var(--c-sleep)" onClick={() => router.push("/log")} />
          <MetricLink type="hydration" metrics={metrics} icon={Droplets} title="Hydration" unit="ml" color="var(--c-hydration)" onClick={() => router.push("/log")} />
          <div className="col-span-2">
            <MetricLink type="mood" metrics={metrics} icon={Smile} title="Tâm trạng" color="var(--c-mood)" onClick={() => router.push("/log")} />
          </div>
        </section>
      )}
    </main>
  );
}

function MetricLink({
  type,
  metrics,
  icon,
  title,
  unit,
  color,
  onClick,
}: {
  type: MetricType;
  metrics: HealthMetricRow[];
  icon: LucideIcon;
  title: string;
  unit?: string;
  color: string;
  onClick: () => void;
}) {
  const value = useMemo(() => latestValue(metrics, type), [metrics, type]);
  const series = useMemo(
    () => buildWeekSeries(metrics, type).map((d) => d.value ?? 0),
    [metrics, type]
  );

  return (
    <MetricCard
      icon={icon}
      title={title}
      value={value ?? "—"}
      unit={value != null ? unit : undefined}
      status={value != null ? "Hôm nay" : "Chưa ghi nhận"}
      color={color}
      chart={series}
      onClick={onClick}
    />
  );
}
