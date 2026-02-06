"use client";

import Link from "next/link";
import { useTheme } from "next-themes";
import { Moon, Sun, Shield } from "lucide-react";
import { useEffect, useState } from "react";

export function Header() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  return (
    <header className="sticky top-0 z-40 border-b border-white/40 bg-white/70 backdrop-blur-lg dark:border-white/10 dark:bg-slate-950/70">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        <Link
          href="/dashboard"
          className="flex items-center gap-2 text-lg font-semibold text-slate-900 dark:text-white"
        >
          <Shield className="h-5 w-5 text-amber-500" />
          <span className="bg-gradient-to-r from-amber-600 to-orange-500 bg-clip-text text-transparent">
            EduLive Admin
          </span>
        </Link>
        <div className="flex items-center gap-3">
          <button
            type="button"
            className="rounded-full p-2 transition hover:bg-slate-100 dark:hover:bg-slate-900"
            aria-label="Đổi theme"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          >
            {mounted && theme === "dark" ? (
              <Sun className="h-5 w-5" />
            ) : (
              <Moon className="h-5 w-5" />
            )}
          </button>
        </div>
      </div>
    </header>
  );
}
