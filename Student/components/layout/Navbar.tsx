"use client"

import Link from "next/link";
import { useEffect, useState } from "react";
import { ShoppingCart, Moon, Sun, User, BookOpen, FileText, Settings, LogOut, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { LanguageModal } from "../shared/LanguageModal";
import SearchInput from "@/components/shared/SearchInput";
import { useCart } from "@/context/CartContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useRouter } from "next/navigation";

export function NavBar() {
    const { items } = useCart();
    const router = useRouter();
    const [theme, setTheme] = useState("light");
    const [user, setUser] = useState<{ name?: string, email: string } | null>(null);

    useEffect(() => {
        // Lấy thông tin user từ localStorage sau khi đăng nhập thành công
        const savedUser = localStorage.getItem('user');
        if (savedUser) {
            setUser(JSON.parse(savedUser));
        }

        // Logic Theme
        if (theme === "dark") {
            document.documentElement.classList.add("dark");
        } else {
            document.documentElement.classList.remove("dark");
        }
    }, [theme]);

    const toggleTheme = () => {
        setTheme((prev) => (prev === "light" ? "dark" : "light"));
    };

    const handleLogout = () => {
        // 1. Xóa dữ liệu ở LocalStorage để cập nhật UI
        localStorage.removeItem('user');
        
        // 2. Xóa Cookie để Middleware không chặn truy cập
        document.cookie = "accessToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
        
        // 3. Cập nhật state và điều hướng
        setUser(null);
        router.push("/login");
        router.refresh(); // Làm mới để xóa trạng thái cũ của server
    };

    return (
        <nav className="border-b bg-background relative z-50">
            <div className="container mx-auto flex h-16 items-center justify-between px-8">

                {/* --- LOGO --- */}
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
                <div className="flex-1 max-w-2xl mx-auto px-8 hidden md:block">
                    <SearchInput />
                </div>

                {/* --- RIGHT ACTIONS --- */}
                <div className="flex items-center gap-5">
                    {/* Cart */}
                    <Link href="/cart">
                        <Button variant="ghost" size="icon" className="relative hover:bg-slate-100 dark:hover:bg-slate-800">
                            <ShoppingCart className="h-5 w-5" />
                            {items.length > 0 && (
                                <span className="absolute top-1 -right-0.5 inline-flex h-4 w-4 items-center justify-center rounded-full bg-purple-600 text-[10px] font-bold text-white ring-2 ring-white">
                                    {items.length}
                                </span>
                            )}
                        </Button>
                    </Link>

                    {/* Authentication Logic */}
                    {!user ? (
                        <div className="flex items-center gap-3">
                            {/* Link đến trang Login */}
                            <Link href="/login">
                                <Button variant="ghost" className="hidden sm:inline-flex h-11 px-4 text-sm font-semibold hover:bg-slate-100">
                                    Log in
                                </Button>
                            </Link>
                            {/* Link đến trang Register */}
                            <Link href="/register">
                                <Button className="h-11 bg-purple-600 px-6 text-sm font-bold text-white shadow-md hover:bg-purple-700 transition-all hover:shadow-lg">
                                    Sign Up
                                </Button>
                            </Link>
                        </div>
                    ) : (
                        <div className="flex items-center gap-4">
                            <Link href="/my-courses" className="text-sm font-medium hover:text-purple-600 hidden lg:block">
                                Khóa học của tôi
                            </Link>

                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <button className="flex items-center gap-2 outline-none group">
                                        <Avatar className="h-9 w-9 border border-gray-200">
                                            <AvatarImage src="" />
                                            <AvatarFallback className="bg-slate-100 text-slate-600">
                                                <User className="h-5 w-5" />
                                            </AvatarFallback>
                                        </Avatar>
                                        <ChevronDown className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                                    </button>
                                </DropdownMenuTrigger>

                                <DropdownMenuContent align="end" className="w-64 p-2 mt-2 shadow-xl rounded-xl border-gray-100">
                                    {/* User Info Section */}
                                    <div className="flex items-center gap-3 p-3">
                                        <Avatar className="h-12 w-12">
                                            <AvatarFallback className="bg-purple-100 text-purple-700 font-bold text-lg">
                                                {user.email[0].toUpperCase()}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div className="flex flex-col overflow-hidden">
                                            <span className="font-bold text-sm truncate">{user.name || "Nguyễn Khải"}</span>
                                            <span className="text-xs text-muted-foreground truncate">@{user.email.split('@')[0]}</span>
                                        </div>
                                    </div>

                                    <DropdownMenuSeparator />

                                    {/* Menu Items */}
                                    <DropdownMenuItem asChild className="cursor-pointer py-2.5 rounded-lg">
                                        <Link href="/profile" className="flex items-center gap-2 w-full">
                                            <User className="h-4 w-4 text-slate-500" /> Trang cá nhân
                                        </Link>
                                    </DropdownMenuItem>

                                    <DropdownMenuItem asChild className="cursor-pointer py-2.5 rounded-lg text-purple-600 font-medium focus:text-purple-600">
                                        <Link href="/write-blog" className="flex items-center gap-2 w-full">
                                            <FileText className="h-4 w-4" /> Viết blog
                                        </Link>
                                    </DropdownMenuItem>

                                    <DropdownMenuItem asChild className="cursor-pointer py-2.5 rounded-lg">
                                        <Link href="/my-blogs" className="flex items-center gap-2 w-full">
                                            <BookOpen className="h-4 w-4 text-slate-500" /> Bài viết của tôi
                                        </Link>
                                    </DropdownMenuItem>

                                    <DropdownMenuSeparator />

                                    <DropdownMenuItem asChild className="cursor-pointer py-2.5 rounded-lg">
                                        <Link href="/settings" className="flex items-center gap-2 w-full">
                                            <Settings className="h-4 w-4 text-slate-500" /> Cài đặt
                                        </Link>
                                    </DropdownMenuItem>

                                    <DropdownMenuItem
                                        onClick={handleLogout}
                                        className="cursor-pointer py-2.5 rounded-lg text-red-600 focus:text-red-600 focus:bg-red-50"
                                    >
                                        <LogOut className="h-4 w-4 mr-2" /> Đăng xuất
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    )}

                    {/* Dark Mode & Language */}
                    <div className="flex items-center border-l pl-3 ml-1 border-gray-200 gap-1">
                        <Button variant="ghost" size="icon" onClick={toggleTheme} className="rounded-full">
                            {theme === "light" ? <Moon className="h-5 w-5 text-slate-600" /> : <Sun className="h-5 w-5 text-yellow-500" />}
                        </Button>
                        <LanguageModal />
                    </div>
                </div>
            </div>
        </nav>
    )
}