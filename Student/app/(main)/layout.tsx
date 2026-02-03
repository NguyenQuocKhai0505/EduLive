import { Header } from "@/components/layout/Header";
import { Sidebar } from "@/components/layout/Sidebar";
import { Footer } from "@/components/layout/Footer";
import { AiChatBox } from "@/components/chatbox/AiChatBox";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
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
  );
}