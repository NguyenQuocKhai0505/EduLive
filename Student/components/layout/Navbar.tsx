"use client"

import { useEffect, useState } from "react";
import Link from "next/link";
import Cookies from 'js-cookie';
import api from "@/lib/axios";
import { 
  User, FileText, BookOpen, LogOut, ChevronDown, 
  ShoppingCart, Moon, Sun, Globe 
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import SearchInput from "@/components/shared/SearchInput";
import { logout } from "@/services/auth.service";
export function NavBar() {
    const [user, setUser] = useState<any>(null);
    const [isDarkMode, setIsDarkMode] = useState(false);

    useEffect(() => {
        // 1. Lấy dữ liệu user an toàn
        const savedUser = localStorage.getItem('user');
        if (savedUser && savedUser !== "undefined") {
            try {
                setUser(JSON.parse(savedUser));
            } catch (e) {
                localStorage.removeItem('user');
            }
        }

        // 2. Khôi phục trạng thái Theme
        const theme = localStorage.getItem('theme');
        if (theme === 'dark' || (!theme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
            document.documentElement.classList.add('dark');
            setIsDarkMode(true);
        }

        // 3. Lắng nghe storage event để cập nhật user khi đăng nhập từ tab khác
        const handleStorageChange = (e: StorageEvent) => {
            if (e.key === 'user' && e.newValue) {
                try {
                    setUser(JSON.parse(e.newValue));
                } catch (e) {
                    console.error('Error parsing user from storage:', e);
                }
            }
        };

        window.addEventListener('storage', handleStorageChange);
        
        // 4. Lắng nghe custom event khi user đăng nhập thành công (từ popup)
        const handleUserUpdate = () => {
            const updatedUser = localStorage.getItem('user');
            if (updatedUser) {
                try {
                    setUser(JSON.parse(updatedUser));
                } catch (e) {
                    console.error('Error parsing user:', e);
                }
            }
        };

        window.addEventListener('userUpdated', handleUserUpdate);

        return () => {
            window.removeEventListener('storage', handleStorageChange);
            window.removeEventListener('userUpdated', handleUserUpdate);
        };
    }, []);

    const toggleTheme = () => {
        if (isDarkMode) {
            document.documentElement.classList.remove('dark');
            localStorage.setItem('theme', 'light');
            setIsDarkMode(false);
        } else {
            document.documentElement.classList.add('dark');
            localStorage.setItem('theme', 'dark');
            setIsDarkMode(true);
        }
    };

    const handleLogout = async () => {
        try {
            const token = Cookies.get('accessToken'); // Lấy token để backend đưa vào blacklist
            await api.post('/auth/logout'); 
        } catch (error) {
            console.error("Logout error", error);
        } finally {
            localStorage.removeItem('user');
            Cookies.remove('accessToken');
            setUser(null);
            window.location.href = "/login";
        }
    };

    return (
        <nav className="border-b bg-background sticky top-0 z-50 h-16 flex items-center transition-colors">
            <div className="container mx-auto flex items-center justify-between px-6">
                
                {/* Logo & Search */}
                <div className="flex items-center gap-6">
                    <Link href="/" className="text-xl font-bold text-purple-600">Keducation</Link>
                    <div className="max-w-xs hidden lg:block">
                        <SearchInput />
                    </div>
                </div>

                {/* Right Actions */}
                <div className="flex items-center gap-2">
                    {/* Theme Toggle */}
                    <Button variant="ghost" size="icon" onClick={toggleTheme}>
                        {isDarkMode ? <Sun size={20} className="text-yellow-400" /> : <Moon size={20} />}
                    </Button>

                    <Button asChild variant="ghost" size="icon">
                        <Link href={"/cart"}>
                          <ShoppingCart size={20} />
                        </Link>
                    </Button>

                    {/* Chuyển đổi ngôn ngữ */}
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="flex items-center gap-1.5 px-2">
                                <Globe size={18} />
                                <span className="text-sm font-medium">English</span>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem className="cursor-pointer">English</DropdownMenuItem>
                            <DropdownMenuItem className="cursor-pointer">Vietnamese</DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>

                    {!user ? (
                        /* CHƯA LOGIN */
                        <div className="flex items-center gap-2 ml-1">
                            <Link href="/login"><Button variant="ghost">Log in</Button></Link>
                            <Link href="/register">
                                <Button className="bg-purple-600 hover:bg-purple-700 text-white">Sign Up</Button>
                            </Link>
                        </div>
                    ) : (
                        /* ĐÃ LOGIN */
                        <div className="flex items-center gap-3 ml-1">
                            <DropdownMenu>
                                <DropdownMenuTrigger className="flex items-center gap-2 outline-none">
                                    <Avatar className="h-9 w-9 border">
                                        <AvatarImage src={user.avatar} />
                                        <AvatarFallback className="bg-purple-100 text-purple-700 font-bold">
                                            {user.email?.[0].toUpperCase()}
                                        </AvatarFallback>
                                    </Avatar>
                                    <ChevronDown size={14} className="text-muted-foreground" />
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-64 p-2 shadow-xl rounded-xl">
                                    <div className="flex items-center gap-3 p-3">
                                        <Avatar className="h-10 w-10">
                                            <AvatarFallback className="bg-purple-600 text-white font-bold">
                                                {user.email?.[0].toUpperCase()}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div className="flex flex-col overflow-hidden">
                                            <span className="font-bold text-sm truncate">{user.name || "User"}</span>
                                            <span className="text-xs text-muted-foreground truncate">@{user.email?.split('@')[0]}</span>
                                        </div>
                                    </div>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem asChild className="cursor-pointer py-2">
                                        <Link href="/profile" className="flex items-center gap-2"><User size={16}/>My profile</Link>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem asChild className="cursor-pointer py-2 text-purple-600">
                                        <Link href="/write" className="flex items-center gap-2"><FileText size={16}/> Write Post</Link>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem asChild className="cursor-pointer py-2">
                                        <Link href="/my-blogs" className="flex items-center gap-2"><BookOpen size={16}/> My posts</Link>
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem onClick={()=>logout()} className="cursor-pointer py-2 text-red-600">
                                        <LogOut size={16} className="mr-2"/> Log out
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    )}
                </div>
            </div>
        </nav>
    );
}