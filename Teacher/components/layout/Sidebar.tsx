"use client";
 
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
  LayoutDashboard,
  BookOpen,
  MessageCircle,
  ChevronDown,
  FileText,
  PanelLeftClose,
  PanelLeft,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface SidebarProps {
  className?: string;
}

export function Sidebar({ className }: SidebarProps) {
  const pathname = usePathname();

  //COURSES ROUTE
  const isCoursesRoute =
    pathname === "/courses" ||
    pathname.startsWith("/courses/");
  const [isCoursesOpen, setIsCoursesOpen] = useState(isCoursesRoute);

  useEffect(() => {
    if (isCoursesRoute) {
      setIsCoursesOpen(true);
    }
  }, [isCoursesRoute]);
  
  //SECTION ROUTE
  const isSectionRoute = 
  pathname === "/section" ||
  pathname.startsWith("/section/");
  const [isSectionOpen,setIsSectionOpen] = useState(isSectionRoute);
  useEffect(()=>{
    if(isSectionRoute){
      setIsSectionOpen(true);
    }
  },[isSectionRoute]);
  
  //LESSONS ROUTE
  const isLessonRoute = 
  pathname === "/lessons" ||
  pathname.startsWith("/lessons/");
  const [isLessonOpen,setIsLessonOpen] = useState(isLessonRoute);
  useEffect(()=>{
    if(isLessonRoute){
      setIsLessonOpen(true);
    }
  },[isLessonRoute]);


  //CHAT ROUTE
  const isChatRoute = pathname === "/chat" || pathname.startsWith("/chat/");
  const [isChatOpen,setIsChatOpen] = useState(isChatRoute);
  useEffect(()=>{
    if(isChatRoute){
      setIsChatOpen(true);
    }
  },[isChatRoute]);

  /** Đóng/mở toàn bộ sidebar: true = rộng 64, false = thu về chỉ còn nút mở */
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <aside
      className={cn(
        "hidden h-screen lg:block sticky top-0 shrink-0 transition-[width] duration-200 ease-in-out",
        "border-r border-white/40 dark:border-white/10",
        "bg-white/80 dark:bg-slate-950/80 backdrop-blur-lg",
        sidebarOpen ? "w-64" : "w-14",
        className
      )}
    >
      <div className="flex h-full flex-col p-4">
        {/* Nút đóng/mở sidebar */}
        <div className="flex items-center justify-between mb-3 min-h-10">
          {sidebarOpen && (
            <span className="text-sm font-semibold text-slate-700 dark:text-slate-200 truncate">
              Wellcome,Teacher !
            </span>
          )}
          <button
            type="button"
            onClick={() => setSidebarOpen((prev) => !prev)}
            className={cn(
              "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg transition-colors",
              "text-slate-500 hover:bg-slate-200/80 hover:text-slate-800 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white",
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
          <Link
            href="/dashboard"
            className={cn(
              "flex items-center gap-3 px-4 py-3 rounded-xl transition-all",
              "hover:-translate-y-0.5 hover:bg-white/90 hover:shadow-sm dark:hover:bg-slate-900/80",
              pathname === "/dashboard"
                ? "bg-gradient-to-r from-sky-500/15 to-indigo-500/10 text-sky-700 dark:text-sky-300 font-semibold"
                : "text-slate-700 dark:text-slate-300"
            )}
          >
            <LayoutDashboard className="h-5 w-5" />
            <span className="font-medium">DASHBOARD</span>
          </Link>

          {/* COURSES BUTTON */}
          <button
            type="button"
            className={cn(
              "flex w-full items-center gap-3 px-4 py-3 rounded-xl transition-all",
              "hover:-translate-y-0.5 hover:bg-white/90 hover:shadow-sm dark:hover:bg-slate-900/80",
              isCoursesRoute
                ? "bg-gradient-to-r from-sky-500/15 to-indigo-500/10 text-sky-700 dark:text-sky-300 font-semibold"
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
            <div className="ml-10 flex flex-col gap-1 border-l border-slate-200/70 pl-4 dark:border-slate-800/70">
              <Link
                href="/courses"
                className={cn(
                  "block rounded-md px-3 py-2 text-sm transition-colors whitespace-nowrap hover:translate-x-1",
                  pathname === "/courses"
                    ? "bg-white/80 dark:bg-slate-900 text-slate-900 dark:text-white"
                    : "text-slate-600 dark:text-slate-300 hover:bg-white/80 dark:hover:bg-slate-900"
                )}
              >
                View All Courses
              </Link>
              <Link
                href="/courses/create"
                className={cn(
                  "block rounded-md px-3 py-2 text-sm transition-colors whitespace-nowrap hover:translate-x-1",
                  pathname === "/courses/create"
                    ? "bg-white/80 dark:bg-slate-900 text-slate-900 dark:text-white"
                    : "text-slate-600 dark:text-slate-300 hover:bg-white/80 dark:hover:bg-slate-900"
                )}
              >
                Create Course
              </Link>
              <Link
                href="/courses/publish"
                className={cn(
                  "block rounded-md px-3 py-2 text-sm transition-colors whitespace-nowrap hover:translate-x-1",
                  pathname === "/courses/publish"
                    ? "bg-white/80 dark:bg-slate-900 text-slate-900 dark:text-white"
                    : "text-slate-600 dark:text-slate-300 hover:bg-white/80 dark:hover:bg-slate-900"
                )}
              >
                Publish/Unpublish
              </Link>
            </div>
          )}

          {/* SECTIONS BUTTON */}
            <button
            type="button"
            className={cn(
              "flex w-full items-center gap-3 px-4 py-3 rounded-xl transition-all",
              "hover:-translate-y-0.5 hover:bg-white/90 hover:shadow-sm dark:hover:bg-slate-900/80",
              isSectionRoute
                ? "bg-gradient-to-r from-sky-500/15 to-indigo-500/10 text-sky-700 dark:text-sky-300 font-semibold"
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
            <div className="ml-10 flex flex-col gap-1 border-l border-slate-200/70 pl-4 dark:border-slate-800/70">
              <Link
                href="/section/create"
                className={cn(
                  "block rounded-md px-3 py-2 text-sm transition-colors whitespace-nowrap hover:translate-x-1",
                  pathname === "/courses/create"
                    ? "bg-white/80 dark:bg-slate-900 text-slate-900 dark:text-white"
                    : "text-slate-600 dark:text-slate-300 hover:bg-white/80 dark:hover:bg-slate-900"
                )}
              >
                Create Course
              </Link>
            </div>
          )}

        {/* LESSONS BUTTON */}
        <button
            type="button"
            className={cn(
              "flex w-full items-center gap-3 px-4 py-3 rounded-xl transition-all",
              "hover:-translate-y-0.5 hover:bg-white/90 hover:shadow-sm dark:hover:bg-slate-900/80",
              isLessonRoute
                ? "bg-gradient-to-r from-sky-500/15 to-indigo-500/10 text-sky-700 dark:text-sky-300 font-semibold"
                : "text-slate-700 dark:text-slate-300"
            )}
            onClick={() => setIsLessonOpen((prev) => !prev)}
          >
            <BookOpen className="h-5 w-5" />
            <span className="font-medium">LESSONS</span>
            <ChevronDown
              className={cn(
                "ml-auto h-4 w-4 transition-transform",
                isLessonOpen && "rotate-180"
              )}
            />
          </button>

          {isLessonOpen && (
            <div className="ml-10 flex flex-col gap-1 border-l border-slate-200/70 pl-4 dark:border-slate-800/70">
              <Link
                href="/lesson/create"
                className={cn(
                  "block rounded-md px-3 py-2 text-sm transition-colors whitespace-nowrap hover:translate-x-1",
                  pathname === "/lesson/create"
                    ? "bg-white/80 dark:bg-slate-900 text-slate-900 dark:text-white"
                    : "text-slate-600 dark:text-slate-300 hover:bg-white/80 dark:hover:bg-slate-900"
                )}
              >
                Create Lesson
              </Link>
              <Link
                href="/lesson"
                className={cn(
                  "block rounded-md px-3 py-2 text-sm transition-colors whitespace-nowrap hover:translate-x-1",
                  pathname === "/lesson/edit"
                    ? "bg-white/80 dark:bg-slate-900 text-slate-900 dark:text-white"
                    : "text-slate-600 dark:text-slate-300 hover:bg-white/80 dark:hover:bg-slate-900"
                )}
              >
                Edit Lesson
              </Link>
            </div>
          )}

        {/* BLOG */}
        <Link
          href="/blog"
          className={cn(
            "flex items-center gap-3 px-4 py-3 rounded-xl transition-all",
            "hover:-translate-y-0.5 hover:bg-white/90 hover:shadow-sm dark:hover:bg-slate-900/80",
            pathname === "/blog" || pathname.startsWith("/blog/")
              ? "bg-gradient-to-r from-sky-500/15 to-indigo-500/10 text-sky-700 dark:text-sky-300 font-semibold"
              : "text-slate-700 dark:text-slate-300"
          )}
        >
          <FileText className="h-5 w-5" />
          <span className="font-medium">BLOG</span>
        </Link>

        {/* CHAT BUTTON */}
        <button
            type="button"
            className={cn(
              "flex w-full items-center gap-3 px-4 py-3 rounded-xl transition-all",
              "hover:-translate-y-0.5 hover:bg-white/90 hover:shadow-sm dark:hover:bg-slate-900/80",
              isChatRoute
                ? "bg-gradient-to-r from-sky-500/15 to-indigo-500/10 text-sky-700 dark:text-sky-300 font-semibold"
                : "text-slate-700 dark:text-slate-300"
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
            <div className="ml-10 flex flex-col gap-1 border-l border-slate-200/70 pl-4 dark:border-slate-800/70">
              <Link
                href="/chat/create"
                className={cn(
                  "block rounded-md px-3 py-2 text-sm transition-colors whitespace-nowrap hover:translate-x-1",
                  pathname === "/chat/create"
                    ? "bg-white/80 dark:bg-slate-900 text-slate-900 dark:text-white"
                    : "text-slate-600 dark:text-slate-300 hover:bg-white/80 dark:hover:bg-slate-900"
                )}
              >
                Create Chat
              </Link>
              <Link
                href="/chat"
                className={cn(
                  "block rounded-md px-3 py-2 text-sm transition-colors whitespace-nowrap hover:translate-x-1",
                  pathname === "/chat"
                    ? "bg-white/80 dark:bg-slate-900 text-slate-900 dark:text-white"
                    : "text-slate-600 dark:text-slate-300 hover:bg-white/80 dark:hover:bg-slate-900"
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
