"use client";

import { useMutation } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";

export interface AiChatMessage {
  role: "user" | "assistant";
  content: string;
}

// TODO: nếu muốn lưu lịch sử chat vĩnh viễn, tạo bảng `ai_chat_messages` trong Supabase
// và ghi lại tin nhắn ở đây — hiện tại lịch sử chỉ tồn tại trong state của phiên chat.
export function useAiChat() {
  return useMutation({
    mutationFn: async (messages: AiChatMessage[]): Promise<string> => {
      const { data: sessionData } = await supabase.auth.getSession();
      const accessToken = sessionData.session?.access_token;
      if (!accessToken) throw new Error("Chưa đăng nhập.");

      const res = await fetch("/api/ai-chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ messages }),
      });

      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(json.error || "Có lỗi xảy ra, vui lòng thử lại sau.");
      }
      return json.reply as string;
    },
  });
}
