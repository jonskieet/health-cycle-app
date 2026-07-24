This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Trợ lý AI "Hỏi trợ lý" (trang Chu kỳ)

Tính năng chat AI trong trang Chu kỳ gọi Anthropic API từ server (`src/app/api/ai-chat/route.ts`),
không lộ API key ra client. Copy `.env.local.example` thành `.env.local` và điền:

- `ANTHROPIC_API_KEY`: API key Anthropic, chỉ dùng phía server.
- `AI_MODEL` (tuỳ chọn): model dùng cho trợ lý, mặc định `claude-sonnet-4-6`.

Route có rate-limit tạm thời (in-memory, 10 request/phút/user) — chỉ phù hợp cho MVP single-instance,
cần thay bằng giải pháp bền hơn (Supabase/Redis) khi scale nhiều instance.

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
