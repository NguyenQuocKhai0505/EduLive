"use client"

import Link from "next/link";
import { useEffect, useState } from "react";
import { ShoppingCart, Moon, Sun } from "lucide-react"; // Bỏ import Search, Input vì đã dùng trong SearchInput
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { LanguageModal } from "../shared/LanguageModal";
import SearchInput from "@/components/shared/SearchInput"; // <--- Import Component mới
import { useCart } from "@/context/CartContext";
export function NavBar(){
    const {cartItems} = useCart() //Lay danh sach gio hang tu kho chung
    // ... (Giữ nguyên phần logic Theme)
    const [theme,setTheme] = useState("light")
    useEffect(()=>{
        if(theme === "dark"){
            document.documentElement.classList.add("dark")
        }else{
            document.documentElement.classList.remove("dark")
        }
    },[theme])
    
    const toggleTheme = () =>{
        setTheme((prev) => (prev === "light" ? "dark" : "light"))
    }
    
    return(
        <nav className="border-b bg-background relative z-50"> 
            <div className="container mx-auto flex h-16 items-center justify-between px-8"> 
                
                {/* --- LOGO --- (Giữ nguyên) */}
                <Link href="/" className="flex items-center gap-4">
                    <div className="flex h-20 w-20 items-center justify-center rounded-2xl border border-gray-200 bg-white shadow-lg -mb-6 transition-transform hover:scale-105">
                        <Image
                            src="/assets/logo.png"
                            alt="Keducation logo"
                            width={80}
                            height={80}
                            className="h-16 w-16 object-contain"
                            priority
                        />
                    </div>
                    <span className="hidden lg:inline text-xl font-bold text-foreground tracking-tight">
                        Explore
                    </span>
                </Link>

                {/* --- SEARCH --- */}
                {/* Thay thế cả cụm Form cũ bằng thẻ này */}
                <div className="flex-1 max-w-2xl mx-auto px-8 hidden md:block">
                    <SearchInput />
                </div>

                {/* --- RIGHT ACTIONS --- (Giữ nguyên) */}
                <div className="flex items-center gap-5">
                    {/* Cart... */}
                    <Link href="/cart"> 
                        <Button variant="ghost" size="icon" className="relative hover:bg-slate-100 dark:hover:bg-slate-800">
                            <ShoppingCart className="h-5 w-5"/>
                            
                            {/* Chỉ hiện số nếu giỏ hàng có đồ (lớn hơn 0) */}
                            {cartItems.length > 0 && (
                                <span className="absolute top-1 -right-0.5 inline-flex h-4 w-4 items-center justify-center rounded-full bg-purple-600 text-[10px] font-bold text-white ring-2 ring-white">
                                    {cartItems.length} {/* 👈 3. Hiển thị số lượng thật */}
                                </span>
                            )}
                        </Button>
                    </Link>
                    
                    {/* Buttons... */}
                    <div className="flex items-center gap-3">
                        <Button variant="ghost" className="hidden sm:inline-flex h-11 px-4 text-sm font-semibold hover:bg-slate-100">
                            Log in
                        </Button>
                        <Button className="h-11 bg-purple-600 px-6 text-sm font-bold text-white shadow-md hover:bg-purple-700 transition-all hover:shadow-lg">
                            Sign Up
                        </Button>
                    </div>

                    {/* Dark Mode... */}
                    <div className="border-l pl-3 ml-1 border-gray-200">
                        <Button variant="ghost" size="icon" onClick={toggleTheme} className="rounded-full">
                            {theme === "light" ? <Moon className="h-5 w-5 text-slate-600" /> : <Sun className="h-5 w-5 text-yellow-500" />}
                        </Button>
                    </div>

                    <LanguageModal />
                </div>
            </div>
        </nav>
    )
}