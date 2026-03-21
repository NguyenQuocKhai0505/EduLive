import { Suspense } from "react";
import { Header } from "@/components/layout/Header";
import { Sidebar } from "@/components/layout/Sidebar";
import { Footer } from "@/components/layout/Footer";
import { AiChatBox } from "@/components/chatbox/AiChatBox";

/** One boundary for Header (SearchInput) + pages that use useSearchParams — avoids root Suspense/CSS quirks */
function MainShellFallback() {
  return (
    <div className="flex flex-col min-h-screen bg-slate-50 dark:bg-slate-950">
      <div className="h-14 shrink-0 border-b border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950" />
      <div className="flex flex-1 min-h-0">
        <aside className="hidden w-64 shrink-0 border-r border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 lg:block" />
        <main className="flex-1 overflow-x-hidden p-4">
          <div className="mx-auto max-w-4xl space-y-3">
            <div className="h-8 w-40 animate-pulse rounded bg-slate-200 dark:bg-slate-800" />
            <div className="h-24 animate-pulse rounded-lg bg-slate-200 dark:bg-slate-800" />
          </div>
        </main>
      </div>
    </div>
  );
}

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Suspense fallback={<MainShellFallback />}>
      <div className="flex flex-col min-h-screen">
        <Header />
        <div className="flex flex-1">
          <Sidebar />
          <main className="flex-1 bg-slate-50 dark:bg-slate-950 transition-colors duration-300 overflow-x-hidden">
            {children}
          </main>
        </div>
        <Footer />
        <AiChatBox />
      </div>
    </Suspense>
  );
}