import type { Metadata } from "next";
import "./globals.css";
import { Header } from "@/components/layout/Header";
import { Sidebar } from "@/components/layout/Sidebar";
import { Footer } from "@/components/layout/Footer";
import { CartProvider } from "@/context/CartContext";
export const metadata: Metadata = {
  title: "EduLive - Course Market",
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
        <CartProvider>
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
          <Footer/>
        </CartProvider>
      </body>
    </html>
  );
}
