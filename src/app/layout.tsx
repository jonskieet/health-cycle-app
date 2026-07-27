import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans, Inter } from "next/font/google";
import "./globals.css";
import Providers from "./providers";
import BottomNav from "@/components/layout/BottomNav";
import AuthGate from "@/components/auth/AuthGate";
import AppLockGate from "@/components/auth/AppLockGate";
import ThemeApplier from "@/components/layout/ThemeApplier";
import PwaRegister from "@/components/layout/PwaRegister";

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
  weight: ["500", "600", "700", "800"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "KVCycle — Sức khỏe & Chu kỳ",
  description: "Theo dõi sức khỏe tổng quát và chu kỳ kinh nguyệt",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "KVCycle",
  },
};

export const viewport: Viewport = {
  themeColor: "#e85c8a",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" className={`${jakarta.variable} ${inter.variable}`}>
      <head>
        <script
          // Chạy trước khi React hydrate để tránh "chớp sáng" nếu user đã chọn theme tối
          // ở lần dùng trước (đọc từ localStorage, ThemeApplier sẽ đồng bộ lại với
          // profile thật ngay sau khi load xong).
          dangerouslySetInnerHTML={{
            __html: `try{var t=localStorage.getItem('kv_theme');if(t==='dark')document.documentElement.dataset.theme='dark';}catch(e){}`,
          }}
        />
      </head>
      <body className="min-h-full antialiased">
        <Providers>
          <div className="phone-shell">
            <div className="phone-frame">
              <div className="phone-notch" />
              <div className="phone-viewport no-scrollbar">
                <div className="flex min-h-full flex-col pb-32">
                  <ThemeApplier />
                  <PwaRegister />
                  <AuthGate>
                    <AppLockGate>{children}</AppLockGate>
                  </AuthGate>
                </div>
              </div>
              <BottomNav />
            </div>
          </div>
        </Providers>
      </body>
    </html>
  );
}
