import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/context/CartContext"; // <--- 1. Import cái này
import { Toaster } from "@/components/ui/sonner";
const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "EduLive - Online Learning Platform",
  description: "Learn from the best instructors",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {/* 2. Bọc CartProvider quanh children */}
        <CartProvider>
            {children}
            <Toaster position="top-center" richColors />
        </CartProvider>
      </body>
    </html>
  );
}