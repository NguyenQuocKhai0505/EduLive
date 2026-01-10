import type { Metadata } from "next";
import "./globals.css";
import { Header } from "@/components/Header";
import { Sidebar } from "@/components/Sidebar";

export const metadata: Metadata = {
  title: "EduLive - Student Portal",
  description: "Learn from the best courses online",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="flex flex-col min-h-screen">
        <Header />
        
        <div className="flex flex-1">
          {/* Sidebar bên trái */}
          <Sidebar />
          
          {/* Main content bên phải */}
          <main className="flex-1">
            {children}
          </main>
        </div>
        
        {/* Footer placeholder - will be implemented in next step */}
        <footer className="border-t mt-auto">
          <div className="container mx-auto px-4 py-4">
            <p className="text-sm text-gray-500">Footer - Coming soon</p>
          </div>
        </footer>
      </body>
    </html>
  );
}
