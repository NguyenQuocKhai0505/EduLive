"use client";

import Link from "next/link";
import Image from "next/image";
import { useTheme } from "next-themes";
import { Moon, Sun, Shield, Bell, ShoppingCart, BookOpen } from "lucide-react";
import { useEffect, useState, useRef } from "react";
import { getMyProfile, type UserProfile } from "@/src/services/user.service";

export type NotificationItem = {
  id: string;
  type: "cart_add" | "course_pending";
  title: string;
  message: string;
  createdAt: string;
  read?: boolean;
};

export function Header() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    getMyProfile()
      .then(setUser)
      .catch(() => setUser(null));
  }, []);

  // Placeholder notifications (UI) — real-time sẽ gắn sau
  useEffect(() => {
    setNotifications([
      {
        id: "1",
        type: "cart_add",
        title: "Thêm vào giỏ hàng",
        message: "Student đã thêm khóa học vào giỏ hàng.",
        createdAt: new Date().toISOString(),
        read: false,
      },
      {
        id: "2",
        type: "course_pending",
        title: "Khóa học chờ duyệt",
        message: "Teacher đã thêm khóa học mới, đang chờ admin duyệt.",
        createdAt: new Date().toISOString(),
        read: false,
      },
    ]);
  }, []);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setNotificationsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const unreadCount = notifications.filter((n) => !n.read).length;

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
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Chuông thông báo */}
          <div className="relative" ref={dropdownRef}>
            <button
              type="button"
              className="relative rounded-full p-2 transition hover:bg-slate-100 dark:hover:bg-slate-800"
              aria-label="Thông báo"
              onClick={() => setNotificationsOpen((o) => !o)}
            >
              <Bell className="h-5 w-5 text-slate-600 dark:text-slate-400" />
              {unreadCount > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-amber-500 px-1 text-[10px] font-medium text-white">
                  {unreadCount > 99 ? "99+" : unreadCount}
                </span>
              )}
            </button>
            {notificationsOpen && (
              <div className="absolute right-0 top-full z-50 mt-2 w-80 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg dark:border-slate-700 dark:bg-slate-900">
                <div className="border-b border-slate-200 px-4 py-3 dark:border-slate-700">
                  <h3 className="font-semibold text-slate-800 dark:text-white">
                    Thông báo
                  </h3>
                  <p className="text-xs text-slate-500">
                    Real-time: giỏ hàng & khóa chờ duyệt
                  </p>
                </div>
                <div className="max-h-80 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <div className="px-4 py-6 text-center text-sm text-slate-500">
                      Chưa có thông báo
                    </div>
                  ) : (
                    notifications.map((n) => (
                      <div
                        key={n.id}
                        className={`border-b border-slate-100 px-4 py-3 last:border-0 dark:border-slate-800 ${
                          !n.read ? "bg-amber-50/50 dark:bg-amber-950/20" : ""
                        }`}
                      >
                        <div className="flex gap-3">
                          <span className="mt-0.5 shrink-0 rounded-full bg-slate-200 p-1.5 dark:bg-slate-700">
                            {n.type === "cart_add" ? (
                              <ShoppingCart className="h-4 w-4 text-slate-600 dark:text-slate-400" />
                            ) : (
                              <BookOpen className="h-4 w-4 text-slate-600 dark:text-slate-400" />
                            )}
                          </span>
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium text-slate-800 dark:text-slate-200">
                              {n.title}
                            </p>
                            <p className="text-xs text-slate-500 dark:text-slate-400">
                              {n.message}
                            </p>
                            <p className="mt-1 text-[10px] text-slate-400">
                              {new Date(n.createdAt).toLocaleString("vi-VN")}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Theme toggle */}
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

          {/* Avatar user (đã đăng nhập) */}
          <div className="flex items-center gap-2 pl-1">
            {user ? (
              <div
                className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full border-2 border-amber-500/50 bg-slate-200 dark:bg-slate-700"
                title={user.name}
              >
                {user.avatar ? (
                  <Image
                    src={user.avatar}
                    alt={user.name}
                    width={36}
                    height={36}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <span className="text-sm font-semibold uppercase text-slate-600 dark:text-slate-300">
                    {(user.name || "A").charAt(0)}
                  </span>
                )}
              </div>
            ) : (
              <div
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-slate-300 bg-slate-100 dark:border-slate-600 dark:bg-slate-800"
                title="Đang tải..."
              >
                <span className="text-xs text-slate-400">...</span>
              </div>
            )}
            {user && (
              <span className="hidden max-w-[120px] truncate text-sm font-medium text-slate-700 dark:text-slate-300 sm:inline">
                {user.name}
              </span>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
