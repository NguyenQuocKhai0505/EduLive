"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useTheme } from "next-themes";
import { Bell, Moon, Sun, UserCircle2 } from "lucide-react";

export function Header() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <header className="sticky top-0 z-40 border-b border-white/40 bg-white/70 backdrop-blur-lg dark:border-white/10 dark:bg-slate-950/70">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        <Link
          href="/dashboard"
          className="text-lg font-semibold text-slate-900 dark:text-white"
        >
          <span className="bg-gradient-to-r from-sky-600 via-indigo-500 to-emerald-500 bg-clip-text text-transparent">
            EduLive Teacher
          </span>
        </Link>
        <div className="flex items-center gap-3 text-slate-600 dark:text-slate-300">
          <button
            className="rounded-full p-2 transition hover:-translate-y-0.5 hover:bg-slate-100 hover:shadow-sm dark:hover:bg-slate-900"
            aria-label="Toggle theme"
            type="button"
            onClick={() => {
              if (!mounted) return;
              setTheme(theme === "dark" ? "light" : "dark");
            }}
          >
            {mounted && theme === "dark" ? (
              <Sun className="h-5 w-5" />
            ) : (
              <Moon className="h-5 w-5" />
            )}
          </button>
          <button className="rounded-full p-2 transition hover:-translate-y-0.5 hover:bg-slate-100 hover:shadow-sm dark:hover:bg-slate-900">
            <Bell className="h-5 w-5" />
          </button>
          <button className="rounded-full p-2 transition hover:-translate-y-0.5 hover:bg-slate-100 hover:shadow-sm dark:hover:bg-slate-900">
            <UserCircle2 className="h-6 w-6" />
          </button>
        </div>
      </div>
    </header>
  );
}
