"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Map, FileText } from "lucide-react";
import { cn } from "@/lib/utils";

interface SidebarProps {
  className?: string;
}

export function Sidebar({ className }: SidebarProps) {
  const pathname = usePathname();

  const navItems = [
    { href: "/", label: "Trang chủ", icon: Home },
    { href: "/roadmap", label: "Lộ trình", icon: Map },
    { href: "/articles", label: "Bài viết", icon: FileText },
  ];

  return (
    <aside
      className={cn(
        "w-64 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800",
        "h-screen sticky top-0",
        className
      )}
    >
      <div className="p-4 flex flex-col h-full">
        {/* Navigation Items */}
        <nav className="flex-1 space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-lg transition-colors",
                  "hover:bg-gray-100 dark:hover:bg-gray-800",
                  isActive
                    ? "bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 font-semibold"
                    : "text-gray-700 dark:text-gray-300"
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
