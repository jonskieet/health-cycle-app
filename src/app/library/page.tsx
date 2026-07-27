"use client";

// Module 7 — Thư viện nội dung giáo dục (P8). Danh sách công khai cho mọi user (free
// xem được toàn bộ danh sách + đoạn mở đầu mỗi bài); chỉ nội dung đầy đủ của bài
// `isPremium` mới khoá VIP (xử lý ở trang chi tiết `/library/[id]`, không khoá ở đây).

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Clock, Crown, BookOpen } from "lucide-react";
import { useProfile } from "@/lib/queries";
import { isVipProfile } from "@/lib/vip";
import { ARTICLE_CATEGORIES, ARTICLE_CATEGORY_LABELS, ArticleCategory, getArticlesByCategory } from "@/lib/articles";

export default function LibraryPage() {
  const router = useRouter();
  const { data: profile } = useProfile();
  const vip = isVipProfile(profile);
  const [category, setCategory] = useState<ArticleCategory | "all">("all");

  const articles = useMemo(() => getArticlesByCategory(category), [category]);

  return (
    <main className="flex flex-1 flex-col gap-6 px-5 pt-8 pb-6">
      <header className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => router.back()}
          className="flex h-9 w-9 items-center justify-center rounded-full hover:bg-black/5"
        >
          <ArrowLeft size={18} className="text-[var(--ink)]" />
        </button>
        <h1 className="font-display text-2xl font-bold text-[var(--ink)]">Thư viện kiến thức</h1>
      </header>

      <p className="text-xs text-[var(--ink-soft)]">
        Bài viết ngắn gọn về chu kỳ, dinh dưỡng, khả năng sinh sản và sức khoẻ tâm lý.{" "}
        {!vip && "Bài đánh dấu VIP chỉ xem được đoạn mở đầu."}
      </p>

      <div className="flex gap-1.5 overflow-x-auto pb-1">
        <button
          type="button"
          onClick={() => setCategory("all")}
          className="shrink-0 rounded-full px-3 py-1.5 text-xs font-semibold"
          style={{
            background: category === "all" ? "var(--c-period)" : "rgba(36,27,47,0.06)",
            color: category === "all" ? "#fff" : "var(--ink-soft)",
          }}
        >
          Tất cả
        </button>
        {ARTICLE_CATEGORIES.map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => setCategory(c)}
            className="shrink-0 rounded-full px-3 py-1.5 text-xs font-semibold"
            style={{
              background: category === c ? "var(--c-period)" : "rgba(36,27,47,0.06)",
              color: category === c ? "#fff" : "var(--ink-soft)",
            }}
          >
            {ARTICLE_CATEGORY_LABELS[c]}
          </button>
        ))}
      </div>

      <section className="flex flex-col gap-3">
        {articles.map((article) => (
          <Link
            key={article.id}
            href={`/library/${article.id}`}
            className="glass-card flex flex-col gap-2 rounded-[22px] p-4"
          >
            <div className="flex items-start justify-between gap-2">
              <span
                className="rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide"
                style={{ background: "color-mix(in srgb, var(--c-sleep) 16%, white)", color: "var(--c-sleep)" }}
              >
                {ARTICLE_CATEGORY_LABELS[article.category]}
              </span>
              {article.isPremium && (
                <span
                  className="flex shrink-0 items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-semibold text-white"
                  style={{ background: "linear-gradient(135deg, #f6c453, #e85c8a 55%, #7c6ff0)" }}
                >
                  <Crown size={10} fill="currentColor" />
                  VIP
                </span>
              )}
            </div>
            <p className="font-display text-sm font-bold text-[var(--ink)]">{article.title}</p>
            <p className="text-xs text-[var(--ink-soft)]">{article.summary}</p>
            <span className="flex items-center gap-1 text-[11px] text-[var(--ink-faint)]">
              <Clock size={11} />
              {article.readMinutes} phút đọc
            </span>
          </Link>
        ))}

        {articles.length === 0 && (
          <div className="glass-card flex flex-col items-center gap-2 rounded-[22px] p-8 text-center">
            <BookOpen size={20} className="text-[var(--ink-faint)]" />
            <p className="text-xs text-[var(--ink-soft)]">Chưa có bài viết trong nhóm này.</p>
          </div>
        )}
      </section>
    </main>
  );
}
