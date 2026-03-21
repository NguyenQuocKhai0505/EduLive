"use client"

import { Search } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { searchCourses, type CourseResponse } from "@/services/course.service";
import { useI18n } from "@/context/I18nContext";

export default function SearchInput(){
    const { t } = useI18n();
    const searchParams = useSearchParams()

    //Lay gia tri hien tai tren url 
    const currentTitle = searchParams.get("title")
    const [value,setValue] = useState(currentTitle || "")
    const [suggestions, setSuggestions] = useState<CourseResponse[]>([])
    const [loading, setLoading] = useState(false)
    const [open, setOpen] = useState(false)

    const normalizedQuery = useMemo(() => value.trim(), [value])

    useEffect(() => {
        let timeoutId: NodeJS.Timeout | null = null
        const fetchSuggestions = async () => {
            if (!normalizedQuery) {
                setSuggestions([])
                setOpen(false)
                return
            }
            try {
                setLoading(true)
                const results = await searchCourses({ title: normalizedQuery })
                setSuggestions(results.filter(c => c.isPublished).slice(0, 8))
                setOpen(true)
            } catch (error) {
                console.error("Error fetching suggestions:", error)
                setSuggestions([])
                setOpen(false)
            } finally {
                setLoading(false)
            }
        }

        timeoutId = setTimeout(fetchSuggestions, 350)
        return () => {
            if (timeoutId) clearTimeout(timeoutId)
        }
    }, [normalizedQuery])

    const highlightMatch = (text: string, query: string) => {
        if (!query) return text
        const lowerText = text.toLowerCase()
        const lowerQuery = query.toLowerCase()
        const index = lowerText.indexOf(lowerQuery)
        if (index === -1) return text
        return (
            <>
                {text.slice(0, index)}
                <span className="text-blue-600 dark:text-blue-400 font-semibold">
                    {text.slice(index, index + query.length)}
                </span>
                {text.slice(index + query.length)}
            </>
        )
    }

    return(
        <div className="relative w-full max-w-[400px]">
            <Search className="h-4 w-4 absolute top-3 left-3 text-slate-600 dark:text-slate-400"/>
            <input
            value={value}
            onChange={(e)=>setValue(e.target.value)}
            onFocus={() => {
                if (normalizedQuery && suggestions.length > 0) setOpen(true)
            }}
            onBlur={() => {
                setTimeout(() => setOpen(false), 150)
            }}
            placeholder={t("nav.searchPlaceholder")}
            className="w-full pl-9 pr-4 py-2 bg-slate-100 dark:bg-slate-800 rounded-full focus:outline-none focus:ring-2 focus:ring-slate-200 dark:focus:ring-slate-700 border-none text-sm text-slate-600 dark:text-slate-300 placeholder:text-slate-400 dark:placeholder:text-slate-500"
            />

            {open && (
                <div className="absolute top-full left-0 mt-2 w-full rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-lg z-50 overflow-hidden">
                    {loading && (
                        <div className="px-4 py-3 text-sm text-slate-500 dark:text-slate-400">
                            {t("search.loading")}
                        </div>
                    )}
                    {!loading && suggestions.length === 0 && (
                        <div className="px-4 py-3 text-sm text-slate-500 dark:text-slate-400">
                            {t("search.noResults")}
                        </div>
                    )}
                    {!loading && suggestions.map((course) => (
                        <Link
                            key={course.id}
                            href={`/courses/${course.id}`}
                            className="block px-4 py-2 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        >
                            <div className="text-sm font-semibold text-slate-900 dark:text-white line-clamp-1">
                                {highlightMatch(course.title, normalizedQuery)}
                            </div>
                            <div className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1">
                                {course.instructor?.name || t("search.unknown")} • {course.category?.name || t("search.uncategorized")}
                            </div>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    )
}