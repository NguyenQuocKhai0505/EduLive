"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Map, FileText, MessageCircle, ChevronDown, PanelLeft, PanelLeftClose } from "lucide-react";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";

interface SidebarProps {
  className?: string;
}

export function Sidebar({ className }: SidebarProps) {
  const pathname = usePathname();

  const navItems = [
    { href: "/", label: "HOME", icon: Home },
    { href: "/courses", label: "COURSES", icon: Map },
    { href: "/blog", label: "BLOGS", icon: FileText },
  ];

  // CHAT ROUTE
  const isChatRoute = pathname === "/chat" || pathname.startsWith("/chat/");
  const [isChatOpen, setIsChatOpen] = useState(isChatRoute);
  useEffect(() => {
    if (isChatRoute) {
      setIsChatOpen(true);
    }
  }, [isChatRoute]);

  /** Đóng/mở toàn bộ sidebar: true = rộng 64, false = thu về chỉ còn nút mở */
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <aside
      className={cn(
        "h-screen sticky top-0 shrink-0 transition-[width] duration-200 ease-in-out",
        "bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800",
        "hidden lg:block",
        sidebarOpen ? "w-64" : "w-14",
        className
      )}
    >
      <div className="p-4 flex flex-col h-full">
        {/* Nút đóng/mở sidebar */}
        <div className="flex items-center justify-between mb-3 min-h-10">
          {sidebarOpen && (
            <span className="text-sm font-semibold text-gray-800 dark:text-gray-200 truncate">
              Wellcome,Student !
            </span>
          )}
          <button
            type="button"
            onClick={() => setSidebarOpen((prev) => !prev)}
            className={cn(
              "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg transition-colors",
              "text-gray-500 hover:bg-gray-200 hover:text-gray-800 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white",
              !sidebarOpen && "mx-auto"
            )}
            aria-label={sidebarOpen ? "Thu gọn sidebar" : "Mở rộng sidebar"}
          >
            {sidebarOpen ? (
              <PanelLeftClose className="h-5 w-5" />
            ) : (
              <PanelLeft className="h-5 w-5" />
            )}
          </button>
        </div>
        <nav className={cn("flex-1 space-y-2 min-w-0 overflow-hidden", !sidebarOpen && "hidden")}>
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
          {/* CHAT BUTTON */}
          <button
            type="button"
            className={cn(
              "flex w-full items-center gap-3 px-4 py-3 rounded-lg transition-colors",
              "hover:bg-gray-100 dark:hover:bg-gray-800",
              isChatRoute
                ? "bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 font-semibold"
                : "text-gray-700 dark:text-gray-300"
            )}
            onClick={() => setIsChatOpen((prev) => !prev)}
          >
            <MessageCircle className="h-5 w-5" />
            <span className="font-medium">CHAT</span>
            <ChevronDown
              className={cn(
                "ml-auto h-4 w-4 transition-transform",
                isChatOpen && "rotate-180"
              )}
            />
          </button>

          {isChatOpen && (
            <div className="ml-10 flex flex-col gap-1 border-l border-gray-200 dark:border-gray-800 pl-4">
              <Link
                href="/chat/join"
                className={cn(
                  "block rounded-md px-3 py-2 text-sm transition-colors whitespace-nowrap hover:translate-x-1",
                  pathname === "/chat/join"
                    ? "bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white"
                    : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                )}
              >
                Join Chat
              </Link>
              <Link
                href="/chat"
                className={cn(
                  "block rounded-md px-3 py-2 text-sm transition-colors whitespace-nowrap hover:translate-x-1",
                  pathname === "/chat"
                    ? "bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white"
                    : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                )}
              >
                My Chats
              </Link>
            </div>
          )}
        </nav>
      </div>
    </aside>
  );
}
