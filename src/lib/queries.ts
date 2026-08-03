"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/auth-context";
import { CycleLog } from "@/lib/cycle-utils";
import { computeHealthScore } from "@/lib/health-score";
import { toLocalDateKey, todayLocalKey } from "@/lib/date-key";

// ---------- Lỗi Supabase ----------

// Trước đây mọi hook đều `throw error` với `error` là object PostgrestError
// thô ({message, details, hint, code}), KHÔNG phải `instanceof Error`. Các
// form (CycleLogForm, MetricLogForm) bắt lỗi bằng `err instanceof Error` để
// hiện thông báo cụ thể — nên với lỗi Supabase thật, điều kiện đó luôn false
// và người dùng chỉ thấy "Lưu thất bại. Vui lòng thử lại." chung chung,
// không biết nguyên nhân (VD thiếu unique constraint, RLS chặn...). Hàm này
// bọc lại thành `Error` thật, giữ nguyên message + code để hiện ra UI và dễ
// debug qua console.
function throwSupabaseError(error: { message?: string; code?: string; hint?: string } | null): never {
  const code = error?.code ? ` (mã: ${error.code})` : "";
  const hint = error?.hint ? ` — ${error.hint}` : "";
  const err = new Error(`${error?.message ?? "Lỗi không xác định từ Supabase"}${code}${hint}`);
  console.error("[Supabase]", error);
  throw err;
}

// ---------- Profile ----------

export type UsageGoal = "track" | "conceive" | "avoid";

export type ThemeMode = "light" | "dark";

export interface Profile {
  id: string;
  display_name: string | null;
  birth_date: string | null;
  birth_year: number | null;
  avatar_key: string | null;
  avatar_url: string | null;
  avg_cycle_length: number;
  avg_period_length: number;
  onboarded: boolean;
  is_vip: boolean;
  vip_activated_at: string | null;
  usage_goal: UsageGoal | null;
  notifications_enabled: boolean;
  metric_units: boolean;
  app_lock_pin_hash: string | null;
  app_lock_enabled: boolean;
  theme: ThemeMode;
}

export function useProfile() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["profile", user?.id],
    enabled: !!user,
    // Module C1: hồ sơ (tên, ngày sinh, độ dài chu kỳ mặc định, theme...)
    // hiếm khi đổi trong 1 phiên sử dụng — 5 phút là đủ an toàn, giảm hẳn
    // số lần gọi lại Supabase mỗi khi user chuyển qua lại giữa các tab.
    staleTime: 5 * 60_000,
    queryFn: async (): Promise<Profile | null> => {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user!.id)
        .maybeSingle();
      if (error) throwSupabaseError(error);
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
      if (error) throwSupabaseError(error);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["profile", user?.id] }),
  });
}

// Module 12: upload ảnh đại diện thật lên Supabase Storage (bucket
// "avatars"), sau đó lưu public URL vào profiles.avatar_url. Đặt tên file
// cố định theo user id (không theo tên file gốc) + `upsert: true` để mỗi
// lần đổi ảnh chỉ ghi đè, không tích luỹ rác trong bucket; thêm query-string
// timestamp vào URL lưu ở DB để buộc trình duyệt tải lại ảnh mới (CDN/cache
// theo URL, cùng path thì ảnh cũ có thể vẫn được cache).
export function useUploadAvatar() {
  const { user } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (file: File) => {
      if (!user) throw new Error("Chưa đăng nhập");
      const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
      const path = `${user.id}/avatar.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(path, file, { upsert: true, cacheControl: "3600" });
      if (uploadError) throw new Error(`Tải ảnh lên thất bại: ${uploadError.message}`);

      const { data: publicUrlData } = supabase.storage.from("avatars").getPublicUrl(path);
      const avatarUrl = `${publicUrlData.publicUrl}?v=${Date.now()}`;

      const { error: updateError } = await supabase
        .from("profiles")
        .update({ avatar_url: avatarUrl, avatar_key: null })
        .eq("id", user.id);
      if (updateError) throwSupabaseError(updateError);

      return avatarUrl;
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
      if (error) throwSupabaseError(error);
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
      if (error) throwSupabaseError(error);
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
      if (error) throwSupabaseError(error);
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
      if (error) throwSupabaseError(error);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["cycle_logs", user?.id] }),
  });
}

// ---------- Health metrics ----------

// Module 3: thêm 'weight' (cân nặng, kg) và 'bbt' (nhiệt độ cơ bản, °C).
export type MetricType = "stress" | "heart_rate" | "sleep" | "hydration" | "mood" | "weight" | "bbt";

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
    // Module C1: đây là dữ liệu "hôm nay" — user có thể ghi nhận chỉ số ở
    // 1 tab/thiết bị rồi quay lại Dashboard ở nơi khác gần như ngay lập
    // tức, nên giữ staleTime ngắn hơn mặc định toàn app thay vì 30s.
    staleTime: 10_000,
    queryFn: async (): Promise<HealthMetricRow[]> => {
      const since = new Date();
      since.setDate(since.getDate() - 6);
      const { data, error } = await supabase
        .from("health_metrics")
        .select("id, metric_type, value, logged_at:recorded_date")
        .eq("user_id", user!.id)
        .gte("recorded_date", toLocalDateKey(since))
        .order("recorded_date", { ascending: true });
      if (error) throwSupabaseError(error);
      return data ?? [];
    },
  });
}

// Module 3: cân nặng/BBT cần xem xu hướng dài hơn 7 ngày (vd 90 ngày) để thấy
// được biểu đồ có ý nghĩa, khác với useHealthMetrics() vốn chỉ lấy tuần gần nhất
// cho các chỉ số hàng ngày (stress/heart_rate/sleep/hydration/mood).
export function useMetricTrend(type: MetricType, days: number = 90) {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["health_metrics_trend", user?.id, type, days],
    enabled: !!user,
    queryFn: async (): Promise<HealthMetricRow[]> => {
      const since = new Date();
      since.setDate(since.getDate() - (days - 1));
      const { data, error } = await supabase
        .from("health_metrics")
        .select("id, metric_type, value, logged_at:recorded_date")
        .eq("user_id", user!.id)
        .eq("metric_type", type)
        .gte("recorded_date", toLocalDateKey(since))
        .order("recorded_date", { ascending: true });
      if (error) throwSupabaseError(error);
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
      const logged_at = input.logged_at ?? todayLocalKey();
      const { error } = await supabase.from("health_metrics").upsert(
        {
          user_id: user!.id,
          metric_type: input.metric_type,
          value: input.value,
          recorded_date: logged_at,
          note: input.note,
        },
        { onConflict: "user_id,metric_type,recorded_date" }
      );
      if (error) throwSupabaseError(error);
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
      if (error) throwSupabaseError(error);
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
      if (error) throwSupabaseError(error);
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
      if (error) throwSupabaseError(error);
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
      if (error) throwSupabaseError(error);
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
      if (error) throwSupabaseError(error);
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
    const iso = toLocalDateKey(d);
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
      if (error) throwSupabaseError(error);
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
      if (error) throwSupabaseError(error);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["vip_request_latest", user?.id] }),
  });
}

// ---------- Reminders (Module 2) ----------

export type ReminderType = "period_upcoming" | "log_daily" | "medication" | "custom";

export interface Reminder {
  id: string;
  type: ReminderType;
  enabled: boolean;
  lead_days: number;
  time_of_day: string; // "HH:MM:SS"
}

export function useReminders() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["reminders", user?.id],
    enabled: !!user,
    queryFn: async (): Promise<Reminder[]> => {
      const { data, error } = await supabase
        .from("reminders")
        .select("id, type, enabled, lead_days, time_of_day")
        .eq("user_id", user!.id);
      if (error) throwSupabaseError(error);
      return data ?? [];
    },
  });
}

// Bật/tắt hoặc chỉnh 1 loại reminder. Dùng upsert theo (user_id, type) vì mỗi
// user chỉ có tối đa 1 reminder mỗi loại (trừ 'custom', chưa hỗ trợ ở bản UI đầu tiên).
export function useUpsertReminder() {
  const { user } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: {
      type: ReminderType;
      enabled: boolean;
      lead_days?: number;
      time_of_day?: string;
    }) => {
      const { error } = await supabase.from("reminders").upsert(
        {
          user_id: user!.id,
          type: input.type,
          enabled: input.enabled,
          ...(input.lead_days != null ? { lead_days: input.lead_days } : {}),
          ...(input.time_of_day != null ? { time_of_day: input.time_of_day } : {}),
        },
        { onConflict: "user_id,type" }
      );
      if (error) throwSupabaseError(error);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["reminders", user?.id] }),
  });
}

// ---------- Kegel Trainer (Module 7, VIP) ----------

export type KegelPresetId = "beginner" | "intermediate" | "advanced";

export interface KegelSession {
  id: string;
  preset_id: KegelPresetId;
  reps_completed: number;
  total_reps: number;
  duration_seconds: number;
  completed: boolean;
  created_at: string;
}

export function useKegelSessions(limit = 20) {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["kegel_sessions", user?.id, limit],
    enabled: !!user,
    queryFn: async (): Promise<KegelSession[]> => {
      const { data, error } = await supabase
        .from("kegel_sessions")
        .select("id, preset_id, reps_completed, total_reps, duration_seconds, completed, created_at")
        .eq("user_id", user!.id)
        .order("created_at", { ascending: false })
        .limit(limit);
      if (error) throwSupabaseError(error);
      return data ?? [];
    },
  });
}

export function useLogKegelSession() {
  const { user } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: {
      preset_id: KegelPresetId;
      reps_completed: number;
      total_reps: number;
      duration_seconds: number;
      completed: boolean;
    }) => {
      const { error } = await supabase.from("kegel_sessions").insert({ user_id: user!.id, ...input });
      if (error) throwSupabaseError(error);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["kegel_sessions", user?.id] }),
  });
}

// ---------- Fatigue Test (Module 9, VIP) ----------

export type FatigueLevel = "low" | "moderate" | "high";

export interface FatigueTestResult {
  id: string;
  score: number;
  level: FatigueLevel;
  answers: number[];
  created_at: string;
}

export function useFatigueTests(limit = 10) {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["fatigue_tests", user?.id, limit],
    enabled: !!user,
    queryFn: async (): Promise<FatigueTestResult[]> => {
      const { data, error } = await supabase
        .from("fatigue_tests")
        .select("id, score, level, answers, created_at")
        .eq("user_id", user!.id)
        .order("created_at", { ascending: false })
        .limit(limit);
      if (error) throwSupabaseError(error);
      return data ?? [];
    },
  });
}

export function useSaveFatigueTest() {
  const { user } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: { score: number; level: FatigueLevel; answers: number[] }) => {
      const { error } = await supabase.from("fatigue_tests").insert({ user_id: user!.id, ...input });
      if (error) throwSupabaseError(error);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["fatigue_tests", user?.id] }),
  });
}

// ---------- Module 12: Xuất/Sao lưu dữ liệu (P12) ----------
//
// Đây là hàm thuần (không phải hook) vì export chỉ chạy 1 lần khi user bấm nút,
// không cần giữ state/cache như các query hiển thị UI ở trên. `useHealthMetrics()`
// phía trên chỉ lấy 7 ngày gần nhất nên không đủ cho backup — hàm này lấy TOÀN BỘ
// lịch sử từng bảng.
export async function fetchAllUserDataForExport(userId: string) {
  const [profileRes, cycleLogsRes, metricsRes, appointmentsRes, remindersRes, kegelRes, fatigueRes] =
    await Promise.all([
      supabase.from("profiles").select("*").eq("id", userId).maybeSingle(),
      supabase
        .from("cycle_logs")
        .select("id, start_date, end_date, flow, symptoms, note")
        .eq("user_id", userId)
        .order("start_date", { ascending: false }),
      supabase
        .from("health_metrics")
        .select("id, metric_type, value, logged_at:recorded_date")
        .eq("user_id", userId)
        .order("recorded_date", { ascending: false }),
      supabase
        .from("appointments")
        .select("id, title, doctor_name, appointment_at, note")
        .eq("user_id", userId)
        .order("appointment_at", { ascending: false }),
      supabase.from("reminders").select("*").eq("user_id", userId),
      supabase
        .from("kegel_sessions")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false }),
      supabase
        .from("fatigue_tests")
        .select("id, score, level, answers, created_at")
        .eq("user_id", userId)
        .order("created_at", { ascending: false }),
    ]);

  if (profileRes.error) throw profileRes.error;
  if (cycleLogsRes.error) throw cycleLogsRes.error;
  if (metricsRes.error) throw metricsRes.error;
  if (appointmentsRes.error) throw appointmentsRes.error;
  if (remindersRes.error) throw remindersRes.error;
  if (kegelRes.error) throw kegelRes.error;
  if (fatigueRes.error) throw fatigueRes.error;

  return {
    profile: (profileRes.data as Profile | null) ?? null,
    cycleLogs: (cycleLogsRes.data as CycleLogFull[]) ?? [],
    healthMetrics: (metricsRes.data as HealthMetricRow[]) ?? [],
    appointments: (appointmentsRes.data as Appointment[]) ?? [],
    reminders: (remindersRes.data as Reminder[]) ?? [],
    kegelSessions: (kegelRes.data as KegelSession[]) ?? [],
    fatigueTests: (fatigueRes.data as FatigueTestResult[]) ?? [],
  };
}
