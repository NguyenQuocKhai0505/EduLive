"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        await api.get("/auth/me");
        if (!cancelled) router.replace("/dashboard");
      } catch {
        if (!cancelled) router.replace("/auth/login");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 text-slate-600">
      Đang tải...
    </div>
  );
}
