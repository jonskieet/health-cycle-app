"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/auth-context";
import { CycleLog } from "@/lib/cycle-utils";
import { computeHealthScore } from "@/lib/health-score";

// ---------- Profile ----------

export type UsageGoal = "track" | "conceive" | "avoid";

export interface Profile {
  id: string;
  display_name: string | null;
  birth_date: string | null;
  birth_year: number | null;
  avatar_key: string | null;
  avg_cycle_length: number;
  avg_period_length: number;
  onboarded: boolean;
  is_vip: boolean;
  vip_activated_at: string | null;
  usage_goal: UsageGoal | null;
  notifications_enabled: boolean;
  metric_units: boolean;
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
    mutationFn: async (patch: Partial<Omit<Profile, "id" | "is_vip" | "vip_activated_at">>) => {
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

export interface CycleLogFull extends CycleLog {
  flow: "light" | "medium" | "heavy" | null;
  symptoms: string[];
  note: string | null;
}

export function useCycleLogs() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["cycle_logs", user?.id],
    enabled: !!user,
    queryFn: async (): Promise<CycleLogFull[]> => {
      const { data, error } = await supabase
        .from("cycle_logs")
        .select("id, start_date, end_date, flow, symptoms, note")
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

export function useUpdateCycleLog() {
  const { user } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      ...patch
    }: {
      id: string;
      start_date: string;
      end_date?: string | null;
      symptoms?: string[];
      flow?: "light" | "medium" | "heavy";
      note?: string;
    }) => {
      const { error } = await supabase
        .from("cycle_logs")
        .update(patch)
        .eq("id", id)
        .eq("user_id", user!.id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["cycle_logs", user?.id] }),
  });
}

export function useDeleteCycleLog() {
  const { user } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("cycle_logs")
        .delete()
        .eq("id", id)
        .eq("user_id", user!.id);
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

export function useDeleteHealthMetric() {
  const { user } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("health_metrics")
        .delete()
        .eq("id", id)
        .eq("user_id", user!.id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["health_metrics", user?.id] }),
  });
}

// ---------- Appointments ----------

export interface Appointment {
  id: string;
  title: string;
  doctor_name: string | null;
  appointment_at: string; // ISO timestamptz
  note: string | null;
}

export function useAppointments() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["appointments", user?.id],
    enabled: !!user,
    queryFn: async (): Promise<Appointment[]> => {
      const { data, error } = await supabase
        .from("appointments")
        .select("id, title, doctor_name, appointment_at, note")
        .eq("user_id", user!.id)
        .order("appointment_at", { ascending: true });
      if (error) throw error;
      return data ?? [];
    },
  });
}

// Lịch hẹn sắp tới trong 7 ngày tới — dùng cho card trên Dashboard.
export function useUpcomingAppointments(days = 7) {
  const { data: appointments = [], isLoading } = useAppointments();
  const now = new Date().getTime();
  const until = now + days * 24 * 60 * 60 * 1000;
  const upcoming = appointments.filter((a) => {
    const t = new Date(a.appointment_at).getTime();
    return t >= now && t <= until;
  });
  return { data: upcoming, isLoading };
}

export function useAddAppointment() {
  const { user } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: {
      title: string;
      doctor_name?: string | null;
      appointment_at: string;
      note?: string | null;
    }) => {
      const { error } = await supabase
        .from("appointments")
        .insert({ ...input, user_id: user!.id });
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["appointments", user?.id] }),
  });
}

export function useUpdateAppointment() {
  const { user } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      ...patch
    }: {
      id: string;
      title: string;
      doctor_name?: string | null;
      appointment_at: string;
      note?: string | null;
    }) => {
      const { error } = await supabase
        .from("appointments")
        .update(patch)
        .eq("id", id)
        .eq("user_id", user!.id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["appointments", user?.id] }),
  });
}

export function useDeleteAppointment() {
  const { user } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("appointments")
        .delete()
        .eq("id", id)
        .eq("user_id", user!.id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["appointments", user?.id] }),
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

// ---------- VIP requests (Module 0 — luồng nâng cấp VIP) ----------

export type VipRequestStatus = "pending" | "approved" | "rejected";

export interface VipRequest {
  id: string;
  status: VipRequestStatus;
  note: string | null;
  transfer_code: string | null;
  created_at: string;
  reviewed_at: string | null;
}

/** Yêu cầu VIP gần nhất của user hiện tại (null nếu chưa từng gửi). */
export function useLatestVipRequest() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["vip_request_latest", user?.id],
    enabled: !!user,
    queryFn: async (): Promise<VipRequest | null> => {
      const { data, error } = await supabase
        .from("vip_requests")
        .select("id, status, note, transfer_code, created_at, reviewed_at")
        .eq("user_id", user!.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });
}

export function useCreateVipRequest() {
  const { user } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: { note?: string; transfer_code: string }) => {
      const { error } = await supabase
        .from("vip_requests")
        .insert({ user_id: user!.id, note: input.note ?? null, transfer_code: input.transfer_code });
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["vip_request_latest", user?.id] }),
  });
}
