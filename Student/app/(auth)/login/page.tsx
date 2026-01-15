"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image"; // Import Image
import { useRouter,useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Github, Chrome } from "lucide-react";
import image from "../../../public/assets/logo.png"
import { login } from "@/services/auth.service";
import { toast } from "sonner";
export default function LoginPage(){
    const router = useRouter()
    const searchParams = useSearchParams();
    const [isLoading,setIsLoading] = useState(false)
    const [email,setEmail] = useState("")
    const [password,setPassword] = useState("")
    const [error,setError] = useState("")

    // Lấy giá trị callbackUrl từ URL
    const callbackUrl = searchParams.get("callbackUrl") || "/"
    const handleSubmit = async(e:React.FormEvent) =>{
        e.preventDefault()
        setIsLoading(true)
        const loadingToast = toast.loading("Information is being verified.")
        try{
            await login(email,password)
            toast.success('Login succesfully!',{id:loadingToast});
            router.push(callbackUrl)
            router.refresh()
        }catch(error:any){
            toast.error(error,{id:loadingToast})
        }finally{
            setIsLoading(false)
        }
    }
    
    return(
       <div className="w-full h-screen lg:grid lg:grid-cols-2">
            {/* COT TRAI: ANH MINH HOA) */}
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
            {/* COT PHAI: FORM LOGIN */}
            <div className="flex items-center justify-center p-8 bg-white dark:bg-slate-950">
                <div className="w-full max-w-md space-y-8">
                    {/* Header */}
                    <div className="space-y-2">
                        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
                            Login to continue your learning journey
                        </h1>
                    </div>
                    {/* FORM */}
                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div className="space-y-2">
                            <Input 
                             type="email"
                             name="email"
                             placeholder="Email" 
                             onChange={(e)=>setEmail(e.target.value)}
                             className="h-12 border-slate-300 dark:slate-700"
                             required/>
                        
                        <div className="space-y-2">
                            <Input 
                            type="password" 
                            placeholder="Password"
                            name="password"
                            onChange={(e) => setPassword(e.target.value)} 
                            required
                            className="h-12 border-slate-300 dark:border-slate-700"/>
                        </div>
                        <Button type="submit" className="w-full bg-purple-600 hover:bg-purple-700 h-12 text-base font-bold"
                            disabled={isLoading}
                        >
                            {isLoading ? <Loader2 className="animate-spin"/> : "Continue"}
                        </Button>
                        </div>
                    </form>
                {/* SEPARATOR */}
                <div className="relative">
                    <div className="absolute inset-0 flex items-center"><span className="w-full border-t"></span></div>
                    <div className="relative flex justify-center text-xs uppercase"><span className="bg-white dark:bg-slate-950 px-2 text-slate-500">Other log in options</span></div>
               </div>
               {/* SOCIAL ICONS */}
               <div className="flex justify-center gap-4">
                 <Button variant="outline" className="h-12 w-12 rounded-full p-0 border-slate-300">
                    <Chrome className="h-5 w-5 text-red-500" /> {/* Giả lập Google */}
                 </Button>
                 <Button variant="outline" className="h-12 w-12 rounded-full p-0 border-slate-300">
                    <div className="h-5 w-5 bg-blue-600 text-white font-bold rounded flex items-center justify-center text-xs">f</div> {/* Giả lập Facebook */}
                 </Button>
                 <Button variant="outline" className="h-12 w-12 rounded-full p-0 border-slate-300">
                    <Github className="h-5 w-5" /> {/* Giả lập Apple/Github */}
                 </Button>
               </div>
                {/* FOOTER */}
                <div className="text-center text-sm font-medium">
                    Don't have an account?{" "}
                    <Link href="/register" className="text-purple-600 hover:underline font-bold">
                        Sign up
                    </Link>
                </div>
                </div>
            </div>
       </div>
    )
}