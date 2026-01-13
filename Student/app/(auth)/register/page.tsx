"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, User, Mail, Lock } from "lucide-react";

export default function RegisterPage() {
  const [isLoading, setIsLoading] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    // Giả lập API call
    setTimeout(() => {
      setIsLoading(false);
      // Xử lý sau khi đăng ký thành công (ví dụ: chuyển sang login)
    }, 1500);
  };
      return(
        <div className="w-full h-screen lg:grid lg:grid-cols-2">
            {/* COT TRAI: ANH MINH HOA */}
            <div className="hidden lg:flex items-center justify-center bg-slate-50 dark:bg-slate-900 relative">
                <div className="relative w-3/4 h-3/4">
                    <Image 
                        src="https://frontends.udemycdn.com/components/auth/desktop-illustration-step-2-x2.webp" 
                        alt="Login Illustration" 
                        fill
                        className="object-contain" // Giữ nguyên tỉ lệ ảnh
                    />
                </div>
            </div>
            {/* COT PHAI: FORM DANG KI */}
            <div className="flex items-center justify center p-8 bg-white dark:bg-slate-950">
                <div className="w-full max-w-md space-y-8">

                    {/* Header */}
                    <div className="space-y-2">
                        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
                            Sign up and start your learning journey
                        </h1>
                        <p className="text-slate-500">Join our community of many learners today</p>
                    </div>
            {/* Form */}
            <form onSubmit={handleRegister} className="space-y-5">
                {/* Full Name Field */}
                <div className="space-y-2">
                    <div className="relative">
                        <User className="absolute left-3 top-3.5 h-5 w-5 text-slate-400" />
                        <Input 
                            type="text" 
                            placeholder="Full Name" 
                            className="pl-10 h-12 border-slate-300 dark:border-slate-700" 
                            required 
                        />
                    </div>
                </div>

                {/* Email Field */}
                <div className="space-y-2">
                    <div className="relative">
                        <Mail className="absolute left-3 top-3.5 h-5 w-5 text-slate-400" />
                        <Input 
                            type="email" 
                            placeholder="Email" 
                            className="pl-10 h-12 border-slate-300 dark:border-slate-700" 
                            required 
                        />
                    </div>
                </div>
                
                {/* Password Field */}
                <div className="space-y-2">
                    <div className="relative">
                        <Lock className="absolute left-3 top-3.5 h-5 w-5 text-slate-400" />
                        <Input 
                            type="password" 
                            placeholder="Password" 
                            className="pl-10 h-12 border-slate-300 dark:border-slate-700" 
                            required 
                        />
                    </div>
                    <p className="text-xs text-slate-500">
                        Must be at least 8 characters.
                    </p>
                </div>

                <Button 
                    type="submit" 
                    className="w-full bg-purple-600 hover:bg-purple-700 h-12 text-base font-bold"
                    disabled={isLoading}
                >
                    {isLoading ? <Loader2 className="animate-spin" /> : "Sign Up"}
                </Button>
            </form>
            {/* Footer Terms */}
            <div className="text-xs text-slate-500 text-center px-4">
                By signing up, you agree to our <Link href="#" className="underline">Terms of Use</Link> and <Link href="#" className="underline">Privacy Policy</Link>.
            </div>

            <div className="relative">
                <div className="absolute inset-0 flex items-center"><span className="w-full border-t"></span></div>
            </div>
            {/* Footer Link to Login */}
            <div className="text-center text-sm font-medium">
                Already have an account?{" "}
                <Link href="/login" className="text-purple-600 hover:underline font-bold">
                    Log in
                </Link>
            </div>

                </div>
            </div>
        </div>
      )
}