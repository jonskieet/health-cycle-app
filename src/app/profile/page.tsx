import { User } from "lucide-react";

export default function ProfilePage() {
  return (
    <main className="flex flex-1 flex-col gap-6 px-5 pt-8">
      <h1 className="font-display text-2xl font-bold text-[var(--ink)]">Cá nhân</h1>
      <section className="glass-card-strong flex flex-col items-center gap-3 rounded-[28px] p-8 text-center">
        <span
          className="flex h-16 w-16 items-center justify-center rounded-full text-white"
          style={{ background: "var(--c-sleep)" }}
        >
          <User size={28} />
        </span>
        <p className="font-display text-base font-bold text-[var(--ink)]">Chưa đăng nhập</p>
        <p className="text-sm text-[var(--ink-soft)]">
          Đăng nhập/Đăng ký sẽ được nối ở bước Supabase Auth tiếp theo.
        </p>
      </section>
    </main>
  );
}
