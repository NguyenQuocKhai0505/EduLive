"use client"

import qs from "query-string"; // Cài thêm thư viện này: npm i query-string
import { Search } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

export default function SearchInput(){
    const router = useRouter()
    const searchParams = useSearchParams()

    //Lay gia tri hien tai tren url 
    const currentTitle = searchParams.get("title")
    const [value,setValue] = useState(currentTitle || "")
    const onSearch=()=>{
        const url = qs.stringifyUrl({
            url:"/search",
            query:{
                title: value, 
            }
        },{skipEmptyString:true,skipNull:true})

        router.push(url)
    }
    return(
        <div className="relative w-full max-w-[400px]">
            <Search className="h-4 w-4 absolute top-3 left-3 text-slate-600 dark:text-slate-400"/>
            <input
            value={value}
            onChange={(e)=>setValue(e.target.value)}
            onKeyDown={(e)=> e.key ==="Enter" && onSearch()}
            placeholder="Search for a course..."
            className="w-full pl-9 pr-4 py-2 bg-slate-100 dark:bg-slate-800 rounded-full focus:outline-none focus:ring-2 focus:ring-slate-200 dark:focus:ring-slate-700 border-none text-sm text-slate-600 dark:text-slate-300 placeholder:text-slate-400 dark:placeholder:text-slate-500"
            />
        </div>
    )
}