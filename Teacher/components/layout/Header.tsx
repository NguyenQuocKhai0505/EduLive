"use client";

import Link from "next/link";
import { Bell, UserCircle2 } from "lucide-react";

export function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/80 backdrop-blur dark:border-slate-800 dark:bg-slate-950/80">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        <Link href="/dashboard" className="text-lg font-semibold text-slate-900 dark:text-white">
          EduLive Teacher
        </Link>
        <div className="flex items-center gap-3 text-slate-600 dark:text-slate-300">
          <button className="rounded-full p-2 hover:bg-slate-100 dark:hover:bg-slate-900">
            <Bell className="h-5 w-5" />
          </button>
          <button className="rounded-full p-2 hover:bg-slate-100 dark:hover:bg-slate-900">
            <UserCircle2 className="h-6 w-6" />
          </button>
        </div>
      </div>
    </header>
  );
}
