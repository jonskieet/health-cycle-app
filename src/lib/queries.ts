"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/auth-context";
import { CycleLog } from "@/lib/cycle-utils";
import { computeHealthScore } from "@/lib/health-score";

// ---------- Profile ----------

export interface Profile {
  id: string;
  display_name: string | null;
  birth_date: string | null;
  avg_cycle_length: number;
  avg_period_length: number;
  onboarded: boolean;
}

export function useProfile() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["profile", user?.id],
    enabled: !!user,
    queryFn: async (): Promise<Profile | null> => {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user!.id)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });
}

export function useUpdateProfile() {
  const { user } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (patch: Partial<Profile>) => {
      const { error } = await supabase
        .from("profiles")
        .update(patch)
        .eq("id", user!.id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["profile", user?.id] }),
  });
}

// ---------- Cycle logs ----------

export function useCycleLogs() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["cycle_logs", user?.id],
    enabled: !!user,
    queryFn: async (): Promise<CycleLog[]> => {
      const { data, error } = await supabase
        .from("cycle_logs")
        .select("id, start_date, end_date")
        .eq("user_id", user!.id)
        .order("start_date", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });
}

export function useAddCycleLog() {
  const { user } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (log: {
      start_date: string;
      end_date?: string | null;
      symptoms?: string[];
      flow?: "light" | "medium" | "heavy";
      note?: string;
    }) => {
      const { error } = await supabase
        .from("cycle_logs")
        .insert({ ...log, user_id: user!.id });
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["cycle_logs", user?.id] }),
  });
}

// ---------- Health metrics ----------

export type MetricType = "stress" | "heart_rate" | "sleep" | "hydration" | "mood";

export interface HealthMetricRow {
  id: string;
  metric_type: MetricType;
  value: number;
  logged_at: string;
}

// 7 ngày gần nhất cho mỗi loại metric
export function useHealthMetrics() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["health_metrics", user?.id],
    enabled: !!user,
    queryFn: async (): Promise<HealthMetricRow[]> => {
      const since = new Date();
      since.setDate(since.getDate() - 6);
      const { data, error } = await supabase
        .from("health_metrics")
        .select("id, metric_type, value, logged_at")
        .eq("user_id", user!.id)
        .gte("logged_at", since.toISOString().slice(0, 10))
        .order("logged_at", { ascending: true });
      if (error) throw error;
      return data ?? [];
    },
  });
}

export function useLogMetric() {
  const { user } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: {
      metric_type: MetricType;
      value: number;
      logged_at?: string;
      note?: string;
    }) => {
      const logged_at = input.logged_at ?? new Date().toISOString().slice(0, 10);
      const { error } = await supabase.from("health_metrics").upsert(
        {
          user_id: user!.id,
          metric_type: input.metric_type,
          value: input.value,
          logged_at,
          note: input.note,
        },
        { onConflict: "user_id,metric_type,logged_at" }
      );
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["health_metrics", user?.id] }),
  });
}

// ---------- Derived helpers ----------

const DAY_LABELS = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];

export function buildWeekSeries(rows: HealthMetricRow[], type: MetricType) {
  const byDate = new Map<string, number>();
  rows.filter((r) => r.metric_type === type).forEach((r) => byDate.set(r.logged_at, r.value));

  const days: { date: string; label: string; value: number | null }[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const iso = d.toISOString().slice(0, 10);
    days.push({ date: iso, label: DAY_LABELS[d.getDay()], value: byDate.get(iso) ?? null });
  }
  return days;
}

export function latestValue(rows: HealthMetricRow[], type: MetricType) {
  const filtered = rows.filter((r) => r.metric_type === type);
  if (filtered.length === 0) return null;
  return filtered[filtered.length - 1].value;
}

export function computeTodayHealthScore(rows: HealthMetricRow[]) {
  return computeHealthScore({
    heart_rate: latestValue(rows, "heart_rate") ?? undefined,
    sleep: latestValue(rows, "sleep") ?? undefined,
    stress: latestValue(rows, "stress") ?? undefined,
    hydration: latestValue(rows, "hydration") ?? undefined,
    mood: latestValue(rows, "mood") ?? undefined,
  });
}
