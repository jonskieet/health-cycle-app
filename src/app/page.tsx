import { HeartPulse, Flame, Moon, Droplets, Smile } from "lucide-react";
import MetricCard from "@/components/ui/MetricCard";
import AuroraRing from "@/components/ui/AuroraRing";
import { mockHealthMetrics, mockHealthScore, mockCycleLogs } from "@/lib/mock-data";
import { predictCycle, phaseLabel, phaseColor, daysUntil } from "@/lib/cycle-utils";
import Link from "next/link";

export default function DashboardPage() {
  const prediction = predictCycle(mockCycleLogs);
  const daysToNext = daysUntil(prediction.nextPeriodDate);

  return (
    <main className="flex flex-1 flex-col gap-6 px-5 pt-8">
      <header className="flex items-center justify-between">
        <div>
          <p className="text-sm text-[var(--ink-soft)]">Chào buổi sáng,</p>
          <h1 className="font-display text-2xl font-bold text-[var(--ink)]">Kai 👋</h1>
        </div>
      </header>

      {/* Signature element: Health Score ring */}
      <section className="glass-card-strong flex items-center gap-5 rounded-[28px] p-6">
        <AuroraRing percent={mockHealthScore} colorFrom="#7c6ff0" colorTo="#e85c8a">
          <span className="font-display text-3xl font-extrabold text-[var(--ink)]">
            {mockHealthScore}
          </span>
          <span className="text-[10px] text-[var(--ink-faint)]">/ 100</span>
        </AuroraRing>
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-[var(--ink-faint)]">
            Điểm sức khỏe
          </p>
          <p className="mt-1 font-display text-base font-bold text-[var(--ink)]">
            Trên mức trung bình
          </p>
          <p className="mt-1 text-xs text-[var(--ink-soft)]">
            Dựa trên nhịp tim, giấc ngủ, stress &amp; hydration hôm nay
          </p>
        </div>
      </section>

      {/* Cycle teaser card */}
      <Link
        href="/cycle"
        className="glass-card flex items-center justify-between rounded-[24px] p-5"
      >
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-[var(--ink-faint)]">
            Chu kỳ kinh nguyệt
          </p>
          <p className="mt-1 font-display text-base font-bold" style={{ color: phaseColor[prediction.phase] }}>
            {phaseLabel[prediction.phase]}
          </p>
          <p className="mt-1 text-xs text-[var(--ink-soft)]">
            Ngày {prediction.currentDay} · Kỳ tới sau {daysToNext} ngày
          </p>
        </div>
        <span
          className="flex h-11 w-11 items-center justify-center rounded-full text-white"
          style={{ background: phaseColor[prediction.phase] }}
        >
          <Droplets size={20} />
        </span>
      </Link>

      {/* Metric cards grid */}
      <section className="grid grid-cols-2 gap-4">
        <MetricCard
          icon={Flame}
          title="Stress"
          value={mockHealthMetrics.stress.value}
          unit={mockHealthMetrics.stress.unit}
          status={mockHealthMetrics.stress.status}
          color="var(--c-stress)"
          chart={mockHealthMetrics.stress.chart}
        />
        <MetricCard
          icon={HeartPulse}
          title="Nhịp tim"
          value={mockHealthMetrics.heartRate.value}
          unit={mockHealthMetrics.heartRate.unit}
          status={mockHealthMetrics.heartRate.status}
          color="var(--c-heart)"
          chart={mockHealthMetrics.heartRate.chart}
        />
        <MetricCard
          icon={Moon}
          title="Giấc ngủ"
          value={mockHealthMetrics.sleep.value}
          unit={mockHealthMetrics.sleep.unit}
          status={mockHealthMetrics.sleep.status}
          color="var(--c-sleep)"
          chart={mockHealthMetrics.sleep.chart}
        />
        <MetricCard
          icon={Droplets}
          title="Hydration"
          value={mockHealthMetrics.hydration.value}
          unit={mockHealthMetrics.hydration.unit}
          status={mockHealthMetrics.hydration.status}
          color="var(--c-hydration)"
          chart={mockHealthMetrics.hydration.chart}
        />
        <div className="col-span-2">
          <MetricCard
            icon={Smile}
            title="Tâm trạng"
            value={mockHealthMetrics.mood.value}
            status={mockHealthMetrics.mood.status}
            color="var(--c-mood)"
            chart={mockHealthMetrics.mood.chart}
          />
        </div>
      </section>
    </main>
  );
}
