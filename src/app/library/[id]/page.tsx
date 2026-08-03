"use client";

// Trang chi tiết bài viết. Bài `isPremium`: đoạn đầu luôn free (preview), phần còn lại
// bọc trong `LockedFeature` — dùng đúng cơ chế khoá VIP có sẵn, không tự chế mới.

import { useRouter, useParams } from "next/navigation";
import { ChevronLeft, Clock } from "lucide-react";
import { useProfile } from "@/lib/queries";
import { isVipProfile } from "@/lib/vip";
import { getArticleById, ARTICLE_CATEGORY_LABELS } from "@/lib/articles";
import LockedFeature from "@/components/profile/LockedFeature";

export default function ArticleDetailPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const { data: profile } = useProfile();
  const vip = isVipProfile(profile);

  const article = getArticleById(params.id);

  if (!article) {
    return (
      <main className="flex flex-1 flex-col gap-6 px-5 pt-8 pb-6">
        <header className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => router.back()}
            className="flex h-9 w-9 items-center justify-center rounded-full hover:bg-black/5"
          >
            <ChevronLeft size={18} className="text-[var(--ink)]" />
          </button>
          <h1 className="font-display text-xl font-semibold tracking-tight text-[var(--ink)]">Không tìm thấy bài viết</h1>
        </header>
      </main>
    );
  }

  const [firstParagraph, ...restParagraphs] = article.paragraphs;
  const locked = article.isPremium && !vip;

  return (
    <main className="flex flex-1 flex-col gap-5 px-5 pt-8 pb-10">
      <header className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => router.back()}
          className="flex h-9 w-9 items-center justify-center rounded-full hover:bg-black/5"
        >
          <ChevronLeft size={18} className="text-[var(--ink)]" />
        </button>
      </header>

      <div className="flex flex-col gap-2">
        <span
          className="w-fit rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide"
          style={{ background: "color-mix(in srgb, var(--c-sleep) 16%, white)", color: "var(--c-sleep)" }}
        >
          {ARTICLE_CATEGORY_LABELS[article.category]}
        </span>
        <h1 className="font-display text-2xl font-bold text-[var(--ink)]">{article.title}</h1>
        <span className="flex items-center gap-1 text-xs text-[var(--ink-faint)]">
          <Clock size={12} />
          {article.readMinutes} phút đọc
        </span>
      </div>

      <article className="glass-card flex flex-col gap-4 rounded-[24px] p-5">
        <p className="text-sm leading-relaxed text-[var(--ink)]">{firstParagraph}</p>

        {restParagraphs.length > 0 && (
          <LockedFeature locked={locked} title="Đọc toàn bộ bài viết">
            <div className="flex flex-col gap-4">
              {restParagraphs.map((p, i) => (
                <p key={i} className="text-sm leading-relaxed text-[var(--ink)]">
                  {p}
                </p>
              ))}
            </div>
          </LockedFeature>
        )}
      </article>
    </main>
  );
}
