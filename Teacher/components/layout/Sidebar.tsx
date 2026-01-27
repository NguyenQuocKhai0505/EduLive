"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
  LayoutDashboard,
  BookOpen,
  Layers,
  GraduationCap,
  MessageCircle,
  ChevronDown,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface SidebarProps {
  className?: string;
}

export function Sidebar({ className }: SidebarProps) {
  const pathname = usePathname();

  const isCoursesRoute =
    pathname === "/courses" ||
    pathname.startsWith("/courses/");
  const [isCoursesOpen, setIsCoursesOpen] = useState(isCoursesRoute);

  useEffect(() => {
    if (isCoursesRoute) {
      setIsCoursesOpen(true);
    }
  }, [isCoursesRoute]);

  const isSectionRoute = 
  pathname === "/section" ||
  pathname.startsWith("/section/");
  const [isSectionOpen,setIsSectionOpen] = useState(isSectionRoute);
  useEffect(()=>{
    if(isSectionRoute){
      setIsSectionOpen(true);
    }
  },[isSectionRoute]);
  return (
    <aside
      className={cn(
        "w-64 bg-white dark:bg-slate-950 border-r border-slate-200 dark:border-slate-800",
        "h-screen sticky top-0",
        "hidden lg:block",
        className
      )}
    >
      <div className="p-4 flex flex-col h-full">
        <nav className="flex-1 space-y-2">
          <Link
            href="/dashboard"
            className={cn(
              "flex items-center gap-3 px-4 py-3 rounded-lg transition-colors",
              "hover:bg-slate-100 dark:hover:bg-slate-900",
              pathname === "/dashboard"
                ? "bg-sky-50 dark:bg-slate-900 text-sky-600 dark:text-sky-400 font-semibold"
                : "text-slate-700 dark:text-slate-300"
            )}
          >
            <LayoutDashboard className="h-5 w-5" />
            <span className="font-medium">DASHBOARD</span>
          </Link>

          <button
            type="button"
            className={cn(
              "flex w-full items-center gap-3 px-4 py-3 rounded-lg transition-colors",
              "hover:bg-slate-100 dark:hover:bg-slate-900",
              isCoursesRoute
                ? "bg-sky-50 dark:bg-slate-900 text-sky-600 dark:text-sky-400 font-semibold"
                : "text-slate-700 dark:text-slate-300"
            )}
            onClick={() => setIsCoursesOpen((prev) => !prev)}
          >
            <BookOpen className="h-5 w-5" />
            <span className="font-medium">COURSES</span>
            <ChevronDown
              className={cn(
                "ml-auto h-4 w-4 transition-transform",
                isCoursesOpen && "rotate-180"
              )}
            />
          </button>

          {isCoursesOpen && (
            <div className="ml-10 flex flex-col gap-1 border-l border-slate-200 pl-4 dark:border-slate-800">
              <Link
                href="/courses"
                className={cn(
                  "block rounded-md px-3 py-2 text-sm transition-colors whitespace-nowrap",
                  pathname === "/courses"
                    ? "bg-slate-100 dark:bg-slate-900 text-slate-900 dark:text-white"
                    : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-900"
                )}
              >
                View All Courses
              </Link>
              <Link
                href="/courses/create"
                className={cn(
                  "block rounded-md px-3 py-2 text-sm transition-colors whitespace-nowrap",
                  pathname === "/courses/create"
                    ? "bg-slate-100 dark:bg-slate-900 text-slate-900 dark:text-white"
                    : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-900"
                )}
              >
                Create Course
              </Link>
              <Link
                href="/courses/publish"
                className={cn(
                  "block rounded-md px-3 py-2 text-sm transition-colors whitespace-nowrap",
                  pathname === "/courses/publish"
                    ? "bg-slate-100 dark:bg-slate-900 text-slate-900 dark:text-white"
                    : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-900"
                )}
              >
                Publish/Unpublish
              </Link>
            </div>
          )}

            <button
            type="button"
            className={cn(
              "flex w-full items-center gap-3 px-4 py-3 rounded-lg transition-colors",
              "hover:bg-slate-100 dark:hover:bg-slate-900",
              isSectionRoute
                ? "bg-sky-50 dark:bg-slate-900 text-sky-600 dark:text-sky-400 font-semibold"
                : "text-slate-700 dark:text-slate-300"
            )}
            onClick={() => setIsSectionOpen((prev) => !prev)}
          >
            <BookOpen className="h-5 w-5" />
            <span className="font-medium">SECTIONS</span>
            <ChevronDown
              className={cn(
                "ml-auto h-4 w-4 transition-transform",
                isSectionOpen && "rotate-180"
              )}
            />
          </button>

          {isSectionOpen && (
            <div className="ml-10 flex flex-col gap-1 border-l border-slate-200 pl-4 dark:border-slate-800">
              <Link
                href="/section/create"
                className={cn(
                  "block rounded-md px-3 py-2 text-sm transition-colors whitespace-nowrap",
                  pathname === "/courses/create"
                    ? "bg-slate-100 dark:bg-slate-900 text-slate-900 dark:text-white"
                    : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-900"
                )}
              >
                Create Course
              </Link>
            </div>
          )}

          <Link
            href="/lessons"
            className={cn(
              "flex items-center gap-3 px-4 py-3 rounded-lg transition-colors",
              "hover:bg-slate-100 dark:hover:bg-slate-900",
              pathname === "/lessons"
                ? "bg-sky-50 dark:bg-slate-900 text-sky-600 dark:text-sky-400 font-semibold"
                : "text-slate-700 dark:text-slate-300"
            )}
          >
            <GraduationCap className="h-5 w-5" />
            <span className="font-medium">LESSONS</span>
          </Link>

          <Link
            href="/chat"
            className={cn(
              "flex items-center gap-3 px-4 py-3 rounded-lg transition-colors",
              "hover:bg-slate-100 dark:hover:bg-slate-900",
              pathname === "/chat"
                ? "bg-sky-50 dark:bg-slate-900 text-sky-600 dark:text-sky-400 font-semibold"
                : "text-slate-700 dark:text-slate-300"
            )}
          >
            <MessageCircle className="h-5 w-5" />
            <span className="font-medium">CHAT</span>
          </Link>
        </nav>
      </div>
    </aside>
  );
}
