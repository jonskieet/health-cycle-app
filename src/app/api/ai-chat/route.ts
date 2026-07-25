import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { predictCycle, phaseLabel, daysUntil, type CycleLog } from "@/lib/cycle-utils";

export const runtime = "nodejs";

// ---------- OpenRouter: đua song song nhiều model free ----------
// Gọi cùng lúc nhiều model AI miễn phí trên OpenRouter, model nào trả lời
// nhanh nhất sẽ được dùng làm câu trả lời (Promise.any). Các request còn lại
// vẫn chạy nền nhưng kết quả bị bỏ qua.
//
// Mặc định dùng "openrouter/free" — một router đặc biệt của OpenRouter tự
// chọn NGẪU NHIÊN một model free đang khả dụng cho mỗi lần gọi. Nhờ vậy
// không bao giờ bị lỗi 404 "model đã ngừng free" như khi hard-code ID cụ
// thể (ID model free hay bị đổi/gỡ mà không báo trước). Gọi 4 lần song song
// vẫn có giá trị: mỗi lần router có thể chọn model khác nhau, và request
// nào xong trước sẽ thắng.
//
// Muốn chỉ định đích danh model cụ thể (ví dụ để tối ưu chất lượng), đặt
// biến môi trường AI_MODELS (phân cách bằng dấu phẩy) — nhớ kiểm tra ID còn
// tồn tại bản free tại https://openrouter.ai/models?max_price=0 trước khi dùng.
const DEFAULT_FREE_MODELS = ["openrouter/free", "openrouter/free", "openrouter/free", "openrouter/free"];
const AI_MODELS =
  process.env.AI_MODELS?.split(",").map((m) => m.trim()).filter(Boolean) || DEFAULT_FREE_MODELS;
const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";
const MAX_TOKENS = 500;
const PER_MODEL_TIMEOUT_MS = 20_000;

type ChatMessage = { role: "user" | "assistant"; content: string };

async function callOpenRouterModel(
  model: string,
  systemPrompt: string,
  messages: ChatMessage[],
  apiKey: string,
  siteUrl: string
): Promise<string> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), PER_MODEL_TIMEOUT_MS);
  try {
    const res = await fetch(OPENROUTER_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
        // OpenRouter khuyến nghị gửi 2 header này để định danh app (không bắt buộc).
        "HTTP-Referer": siteUrl,
        "X-Title": "KVCycle",
      },
      body: JSON.stringify({
        model,
        max_tokens: MAX_TOKENS,
        messages: [{ role: "system", content: systemPrompt }, ...messages],
      }),
      signal: controller.signal,
    });

    if (!res.ok) {
      const errText = await res.text().catch(() => "");
      throw new Error(`OpenRouter ${model} lỗi HTTP ${res.status}: ${errText.slice(0, 200)}`);
    }

    const json = await res.json();
    const reply: string | undefined = json?.choices?.[0]?.message?.content?.trim();
    if (!reply) {
      throw new Error(`OpenRouter ${model} trả về nội dung rỗng`);
    }
    return reply;
  } finally {
    clearTimeout(timeout);
  }
}

/**
 * Gọi song song tất cả model trong danh sách, trả về kết quả của model nào
 * xong TRƯỚC TIÊN. Nếu tất cả đều lỗi/timeout, ném lỗi tổng hợp (AggregateError).
 */
async function raceAiModels(
  systemPrompt: string,
  messages: ChatMessage[],
  apiKey: string,
  siteUrl: string
): Promise<{ reply: string; model: string }> {
  const attempts = AI_MODELS.map((model) =>
    callOpenRouterModel(model, systemPrompt, messages, apiKey, siteUrl).then((reply) => ({
      reply,
      model,
    }))
  );
  return Promise.any(attempts);
}

// ---------- Rate limit tạm thời (MVP) ----------
// Giới hạn theo user.id, lưu in-memory trên tiến trình server. Đây CHỈ phù hợp cho
// môi trường single-instance / dev; khi deploy nhiều instance (serverless, nhiều
// pod...) cần thay bằng bảng đếm request trong Supabase hoặc Redis để đếm đúng
// across instances. Giới hạn: 10 request / phút / user.
const RATE_LIMIT = 10;
const RATE_WINDOW_MS = 60_000;
const requestLog = new Map<string, number[]>();

function isRateLimited(userId: string): boolean {
  const now = Date.now();
  const timestamps = (requestLog.get(userId) ?? []).filter((t) => now - t < RATE_WINDOW_MS);
  timestamps.push(now);
  requestLog.set(userId, timestamps);
  return timestamps.length > RATE_LIMIT;
}

function isValidMessages(value: unknown): value is ChatMessage[] {
  return (
    Array.isArray(value) &&
    value.length > 0 &&
    value.every(
      (m) =>
        m &&
        typeof m === "object" &&
        (m.role === "user" || m.role === "assistant") &&
        typeof m.content === "string" &&
        m.content.trim().length > 0
    )
  );
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null);
    if (!body || !isValidMessages(body.messages)) {
      return NextResponse.json({ error: "Yêu cầu không hợp lệ." }, { status: 400 });
    }
    const messages: ChatMessage[] = body.messages.slice(-20); // giới hạn lịch sử gửi đi

    // ---------- Xác thực người dùng qua access token từ client ----------
    const authHeader = req.headers.get("authorization");
    const accessToken = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null;
    if (!accessToken) {
      return NextResponse.json({ error: "Chưa đăng nhập." }, { status: 401 });
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!supabaseUrl || !supabaseAnonKey) {
      return NextResponse.json({ error: "Thiếu cấu hình máy chủ." }, { status: 500 });
    }

    // Client Supabase riêng cho request này, xác thực bằng access token của user
    // (không dùng service role — chỉ đọc dữ liệu mà chính user đó được RLS cho phép).
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: `Bearer ${accessToken}` } },
      auth: { persistSession: false },
    });

    const { data: userData, error: userError } = await supabase.auth.getUser(accessToken);
    if (userError || !userData?.user) {
      return NextResponse.json({ error: "Phiên đăng nhập không hợp lệ." }, { status: 401 });
    }
    const user = userData.user;

    if (isRateLimited(user.id)) {
      return NextResponse.json(
        { error: "Bạn đã gửi quá nhiều câu hỏi. Vui lòng thử lại sau ít phút." },
        { status: 429 }
      );
    }

    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "Trợ lý AI hiện chưa khả dụng." }, { status: 500 });
    }
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || req.headers.get("origin") || "https://kvcycle.app";

    // ---------- Lấy ngữ cảnh chu kỳ của user ----------
    const [{ data: profile }, { data: cycleLogs }, { data: healthMetrics }] = await Promise.all([
      supabase
        .from("profiles")
        .select("avg_cycle_length, avg_period_length")
        .eq("id", user.id)
        .maybeSingle(),
      supabase
        .from("cycle_logs")
        .select("id, start_date, end_date, symptoms")
        .eq("user_id", user.id)
        .order("start_date", { ascending: false })
        .limit(6),
      supabase
        .from("health_metrics")
        .select("metric_type, value, logged_at")
        .eq("user_id", user.id)
        .order("logged_at", { ascending: false })
        .limit(10),
    ]);

    const logs: CycleLog[] = (cycleLogs ?? []).map((l) => ({
      id: l.id,
      start_date: l.start_date,
      end_date: l.end_date,
    }));

    const systemPrompt = buildSystemPrompt({
      logs,
      avgCycleLength: profile?.avg_cycle_length,
      avgPeriodLength: profile?.avg_period_length,
      recentSymptoms: (cycleLogs ?? []).flatMap((l) => l.symptoms ?? []).slice(0, 10),
      healthMetrics: healthMetrics ?? [],
    });

    try {
      const { reply } = await raceAiModels(systemPrompt, messages, apiKey, siteUrl);
      return NextResponse.json({ reply });
    } catch (err) {
      // Tất cả model đều lỗi/timeout (Promise.any -> AggregateError).
      if (err instanceof AggregateError) {
        console.error(
          "Tất cả model OpenRouter đều thất bại:",
          err.errors.map((e) => (e instanceof Error ? e.message : String(e)))
        );
      } else {
        console.error("Lỗi gọi OpenRouter:", err);
      }
      return NextResponse.json(
        { error: "Trợ lý chưa thể trả lời câu hỏi này, hãy thử lại nhé." },
        { status: 502 }
      );
    }
  } catch {
    // Không lộ chi tiết lỗi nội bộ (network, API key sai, timeout...) ra client.
    return NextResponse.json(
      { error: "Có lỗi xảy ra, vui lòng thử lại sau." },
      { status: 500 }
    );
  }
}

function buildSystemPrompt(ctx: {
  logs: CycleLog[];
  avgCycleLength?: number | null;
  avgPeriodLength?: number | null;
  recentSymptoms: string[];
  healthMetrics: { metric_type: string; value: number; logged_at: string }[];
}) {
  const prediction = predictCycle(ctx.logs, {
    avgCycleLength: ctx.avgCycleLength ?? 28,
    avgPeriodLength: ctx.avgPeriodLength ?? 5,
  });
  const daysToNextPeriod = daysUntil(prediction.nextPeriodDate);
  const daysToOvulation = daysUntil(prediction.ovulationDate);

  const symptomsLine =
    ctx.recentSymptoms.length > 0
      ? `Triệu chứng gần đây người dùng ghi nhận: ${ctx.recentSymptoms.join(", ")}.`
      : "Người dùng chưa ghi nhận triệu chứng gần đây.";

  const metricsLine =
    ctx.healthMetrics.length > 0
      ? `Một số chỉ số sức khỏe gần đây: ${ctx.healthMetrics
          .map((m) => `${m.metric_type}=${m.value} (${m.logged_at})`)
          .join("; ")}.`
      : "";

  return `Bạn là trợ lý sức khỏe chu kỳ kinh nguyệt thân thiện trong app KVCycle.

Ngữ cảnh người dùng hiện tại:
- Đang ở ngày thứ ${prediction.currentDay} của chu kỳ (chu kỳ trung bình ${prediction.avgCycleLength} ngày).
- Giai đoạn hiện tại: ${phaseLabel[prediction.phase]}.
- Kỳ kinh tiếp theo dự kiến trong ${daysToNextPeriod} ngày nữa.
- Ngày rụng trứng dự kiến trong ${daysToOvulation} ngày nữa.
- ${symptomsLine}
${metricsLine ? `- ${metricsLine}` : ""}

Ràng buộc an toàn bắt buộc:
- Không chẩn đoán bệnh, không kê đơn hoặc liều thuốc cụ thể.
- Luôn khuyên người dùng gặp bác sĩ nếu có triệu chứng nghiêm trọng hoặc bất thường (chảy máu nhiều bất thường, đau dữ dội, chậm kinh nghi ngờ mang thai, v.v.).
- Trả lời ngắn gọn, khoảng 3-6 câu.
- Giọng điệu ấm áp, đồng cảm, gần gũi.
- Luôn trả lời bằng tiếng Việt.
- Câu trả lời nên tham chiếu đến ngữ cảnh chu kỳ hiện tại của người dùng khi phù hợp, thay vì chỉ trả lời chung chung.`;
}
