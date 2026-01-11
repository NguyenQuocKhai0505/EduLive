"use client"

import Link from "next/link";
import { useEffect, useState } from "react";
import { ShoppingCart, Moon, Sun, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { LanguageModal } from "../shared/LanguageModal";

export function NavBar(){
    //Light mode/ dark mode toggle
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
        <nav className="border-b bg-background relative z-50"> {/* Thêm z-50 để đảm bảo logo nổi lên trên */}
            {/* Thay đổi 1: Dùng justify-between để đẩy 2 bên ra xa, tăng px-8 để lề rộng hơn */}
            <div className="container mx-auto flex h-16 items-center justify-between px-8"> 
                
                {/* --- KHU VỰC LOGO --- */}
                <Link href="/" className="flex items-center gap-4">
                    {/* Thay đổi 2: Phóng to Logo (h-20 w-20) và tăng margin âm (-mb-6) để treo xuống đẹp hơn */}
                    <div className="flex h-20 w-20 items-center justify-center rounded-2xl border border-gray-200 bg-white shadow-lg -mb-6 transition-transform hover:scale-105">
                        <Image
                            src="/assets/logo.png"
                            alt="Keducation logo"
                            width={80} // Tăng độ phân giải ảnh
                            height={80}
                            className="h-16 w-16 object-contain" // Tăng kích thước hiển thị
                            priority
                        />
                    </div>

                    <span className="hidden lg:inline text-xl font-bold text-foreground tracking-tight">
                        Explore
                    </span>
                </Link>

                {/* --- KHU VỰC SEARCH --- */}
                {/* Thay đổi 3: Thêm mx-auto để căn giữa và px-12 để tạo khoảng cách thoáng với 2 bên */}
                <form className="flex-1 max-w-2xl mx-auto px-8 hidden md:block">
                    <div className="relative group">
                        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground group-focus-within:text-purple-600 transition-colors" />
                        <Input 
                            type="text"
                            placeholder="Search for course..."
                            className={cn(
                                "h-11 w-full rounded-full border-muted bg-slate-50 pl-10 transition-all",
                                "focus-visible:ring-2 focus-visible:ring-purple-600 focus-visible:bg-white focus-visible:shadow-sm"
                            )}    
                        />
                    </div>
                </form>
                <div className="flex items-center gap-5">
                    {/* Cart Icon */}
                    <Button
                        variant="ghost"
                        size="icon"
                        className="relative hover:bg-slate-100 dark:hover:bg-slate-800"
                    >
                        <ShoppingCart className="h-5 w-5"/>
                        <span className="absolute top-1 -right-0.5 inline-flex h-4 w-4 items-center justify-center rounded-full bg-purple-600 text-[10px] font-bold text-white ring-2 ring-white">
                         0
                        </span>
                    </Button>
                    
                    {/* Các nút bấm */}
                    <div className="flex items-center gap-3">
                        <Button variant="ghost" className="hidden sm:inline-flex h-11 px-4 text-sm font-semibold hover:bg-slate-100">
                            Log in
                        </Button>
                        <Button className="h-11 bg-purple-600 px-6 text-sm font-bold text-white shadow-md hover:bg-purple-700 transition-all hover:shadow-lg">
                            Sign Up
                        </Button>
                    </div>

                    {/* Dark Mode Toggle */}
                    <div className="border-l pl-3 ml-1 border-gray-200"> {/* Thêm gạch ngăn cách nhỏ */}
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={toggleTheme}
                            aria-label="Toggle theme"
                            className="rounded-full"
                        >
                            {theme === "light" ? (
                            <Moon className="h-5 w-5 text-slate-600" />
                            ) : (
                            <Sun className="h-5 w-5 text-yellow-500" />
                            )}
                        </Button>
                    </div>

                    {/* Language Selector */}
                    <LanguageModal />
                </div>
            </div>
        </nav>
    )
}