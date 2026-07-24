import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Inter } from "next/font/google";
import "./globals.css";
import Providers from "./providers";
import BottomNav from "@/components/layout/BottomNav";
import AuthGate from "@/components/auth/AuthGate";

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
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" className={`${jakarta.variable} ${inter.variable}`}>
      <body className="min-h-full antialiased">
        <Providers>
          <div className="phone-shell">
            <div className="phone-frame">
              <div className="phone-notch" />
              <div className="phone-viewport no-scrollbar">
                <div className="flex min-h-full flex-col pb-24">
                  <AuthGate>{children}</AuthGate>
                </div>
                <BottomNav />
              </div>
            </div>
          </div>
        </Providers>
      </body>
    </html>
  );
}
