"use client";

import { ReactNode, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { useProfile } from "@/lib/queries";

const PUBLIC_ROUTES = ["/login"];

export default function AuthGate({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const isPublic = PUBLIC_ROUTES.includes(pathname);

  const { data: profile, isLoading: profileLoading } = useProfile();

  useEffect(() => {
    if (loading) return;
    if (!user && !isPublic) {
      router.replace("/login");
      return;
    }
    if (user && isPublic) {
      router.replace("/");
      return;
    }
    if (
      user &&
      !profileLoading &&
      profile &&
      !profile.onboarded &&
      pathname !== "/onboarding"
    ) {
      router.replace("/onboarding");
    }
  }, [loading, user, isPublic, pathname, profile, profileLoading, router]);

  if (isPublic) return <>{children}</>;

  if (loading || !user || (user && profileLoading)) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <div
          className="h-8 w-8 animate-spin rounded-full border-2 border-[var(--c-sleep)] border-t-transparent"
          aria-label="Đang tải"
        />
      </div>
    );
  }

  if (profile && !profile.onboarded && pathname !== "/onboarding") {
    return null; // đang chuyển hướng sang /onboarding
  }

  return <>{children}</>;
}
