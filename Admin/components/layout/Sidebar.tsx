"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  BookOpen,
  FileText,
  MessageCircle,
  PanelLeft,
  PanelLeftClose,
  ListTodo,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";

export function Sidebar() {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const navItems = [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/accounts", label: "Manage Account", icon: Users },
    { href: "/courses", label: "Toggle Course", icon: BookOpen },
    { href: "/blogs", label: "Manage Blog", icon: FileText },
    { href: "/categories", label: "Category", icon: ListTodo },
    { href: "/chat", label: "Chat Monitor", icon: MessageCircle },
  ];
  
  return (
    <aside
      className={cn(
        "hidden h-screen lg:block sticky top-0 shrink-0 transition-[width] duration-200",
        "border-r border-white/40 dark:border-white/10 bg-white/80 dark:bg-slate-950/80 backdrop-blur-lg",
        sidebarOpen ? "w-64" : "w-14",
        "overflow-hidden"
      )}
    >
      <div className="flex h-full flex-col p-4">
        <div className="flex items-center justify-between mb-3 min-h-10">
          {sidebarOpen && (
            <span className="text-sm font-semibold text-slate-700 dark:text-slate-200 truncate">
              Admin
            </span>
          )}
          <button
            type="button"
            onClick={() => setSidebarOpen((p) => !p)}
            className={cn(
              "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-200/80 dark:hover:bg-slate-800",
              !sidebarOpen && "mx-auto"
            )}
            aria-label={sidebarOpen ? "Thu gọn" : "Mở rộng"}
          >
            {sidebarOpen ? <PanelLeftClose className="h-5 w-5" /> : <PanelLeft className="h-5 w-5" />}
          </button>
        </div>
        <nav className={cn("flex-1 space-y-1", !sidebarOpen && "hidden")}>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-xl transition-all",
                  "hover:bg-white/90 dark:hover:bg-slate-900/80",
                  isActive
                    ? "bg-amber-500/15 text-amber-700 dark:text-amber-400 font-semibold"
                    : "text-slate-700 dark:text-slate-300"
                )}
              >
                <Icon className="h-5 w-5" />
                <span className="font-medium">{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}
