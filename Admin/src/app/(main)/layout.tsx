"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { Sidebar } from "@/components/layout/Sidebar";
import { Footer } from "@/components/layout/Footer";
import api from "@/lib/api";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [authorized, setAuthorized] = useState<boolean | null>(null);

  // `accessToken` is `httpOnly` cookie set by the backend on a different domain.
  // Next.js server components can't reliably read it here, so validate on the client.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const me = await api.get("/auth/me");
        if (me.data?.role !== "admin") {
          router.replace("/auth/login");
          return;
        }
        if (!cancelled) setAuthorized(true);
      } catch {
        router.replace("/auth/login");
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [router]);

  if (authorized === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        Đang kiểm tra quyền...
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-slate-50 dark:bg-slate-950">
      <Header />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 overflow-x-hidden px-3 pb-10 pt-6 sm:px-6">
          {children}
        </main>
      </div>
      <Footer />
    </div>
  );
}
